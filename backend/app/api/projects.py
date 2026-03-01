from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from ..core.database import get_db
from ..core.security import get_current_user, require_manager
from ..models.user import User
from ..models.project import Project, ProjectStatus
from ..models.project_member import ProjectMember
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectSimple

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/", response_model=List[ProjectSimple])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    status: Optional[ProjectStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Liste les projets accessibles à l'utilisateur connecté.
    - Admin : tous les projets
    - Manager : ses projets (créés par lui)
    - User : projets dont il est membre
    """
    query = db.query(Project)
    
    # Filtrage selon le rôle
    if current_user.role == "admin":
        # Admin voit tout
        pass
    elif current_user.role == "manager":
        # Manager voit ses projets + ceux où il est membre
        query = query.filter(
            (Project.created_by == current_user.id) | 
            (Project.members.any(ProjectMember.user_id == current_user.id))
        )
    else:
        # User voit seulement ses projets
        query = query.filter(Project.members.any(ProjectMember.user_id == current_user.id))
    
    # Filtre par statut
    if status:
        query = query.filter(Project.status == status)
    
    # Pagination
    projects = query.offset(skip).limit(limit).all()
    
    # Ajouter le nombre de membres pour chaque projet
    result = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "created_by": project.created_by,
            "member_count": len(project.members)  # Nombre de membres
        }
        result.append(project_dict)
    
    return result

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)  # Seulement managers et admins
):
    """
    Crée un nouveau projet (manager ou admin uniquement).
    """
    # Vérifier si un projet avec ce nom existe déjà (optionnel)
    existing = db.query(Project).filter(
        Project.name == project.name,
        Project.status == ProjectStatus.ACTIVE
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un projet avec ce nom existe déjà"
        )
    
    # Créer le projet
    db_project = Project(
        name=project.name,
        description=project.description,
        created_by=current_user.id,
        status=ProjectStatus.ACTIVE
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Le créateur est automatiquement membre du projet
    member = ProjectMember(
        project_id=db_project.id,
        user_id=current_user.id
    )
    db.add(member)
    db.commit()
    
    return db_project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère les détails d'un projet.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    
    # Vérifier les droits d'accès
    if current_user.role != "admin" and current_user.id != project.created_by:
        # Vérifier si l'utilisateur est membre
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas accès à ce projet"
            )
    
    # Ajouter le nombre de membres
    project_dict = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created_by": project.created_by,
        "created_at": project.created_at,
        "member_count": len(project.members)
    }
    
    return project_dict

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Met à jour un projet (admin ou créateur du projet uniquement).
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    
    # Vérifier les droits (admin ou créateur)
    if current_user.role != "admin" and current_user.id != project.created_by:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à modifier ce projet"
        )
    
    # Mise à jour des champs fournis
    update_data = project_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    
    return project

@router.delete("/{project_id}")
def archive_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Archive un projet (soft delete). Ne supprime pas physiquement.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    
    # Vérifier les droits (admin ou créateur)
    if current_user.role != "admin" and current_user.id != project.created_by:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à archiver ce projet"
        )
    
    project.status = ProjectStatus.ARCHIVED
    db.commit()
    
    return {"message": f"Projet {project.name} archivé avec succès"}

@router.post("/{project_id}/reactivate")
def reactivate_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Réactive un projet archivé.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    
    # Vérifier les droits (admin ou créateur)
    if current_user.role != "admin" and current_user.id != project.created_by:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à réactiver ce projet"
        )
    
    project.status = ProjectStatus.ACTIVE
    db.commit()
    
    return {"message": f"Projet {project.name} réactivé avec succès"}

@router.get("/{project_id}/can-manage")
def can_manage_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Vérifie si l'utilisateur courant peut gérer ce projet.
    Utile pour le frontend pour afficher/cacher les boutons.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    
    can_manage = (current_user.role == "admin" or current_user.id == project.created_by)
    
    return {"can_manage": can_manage}