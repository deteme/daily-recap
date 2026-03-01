from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_user, require_manager
from ..models.user import User
from ..models.project import Project, ProjectStatus
from ..models.project_member import ProjectMember
from ..schemas.member import MemberAdd, MemberResponse, MemberSimple

router = APIRouter(prefix="/projects/{project_id}/members", tags=["Members"])

def check_project_manager(project_id: int, user: User, db: Session):
    """Vérifie si l'utilisateur est admin ou créateur du projet"""
    if user.role == "admin":
        return True
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    
    if project.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à gérer les membres de ce projet"
        )
    
    return True

@router.get("/", response_model=List[MemberSimple])
def list_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Liste les membres d'un projet.
    Accessible à tous les membres du projet.
    """
    # Vérifier que le projet existe
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    
    # Vérifier que l'utilisateur est membre du projet (ou admin)
    if current_user.role != "admin":
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member and current_user.id != project.created_by:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas membre de ce projet"
            )
    
    # Récupérer les membres avec leurs infos
    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()
    
    result = []
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        if user and user.is_active:  # Ne montrer que les utilisateurs actifs
            result.append({
                "user_id": user.id,
                "display_name": user.display_name,
                "email": user.email
            })
    
    return result

@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(
    project_id: int,
    member: MemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ajoute un membre au projet (admin ou créateur du projet uniquement).
    """
    # Vérifier les droits
    check_project_manager(project_id, current_user, db)
    
    # Vérifier que l'utilisateur à ajouter existe et est actif
    user_to_add = db.query(User).filter(User.id == member.user_id).first()
    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    if not user_to_add.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible d'ajouter un utilisateur inactif"
        )
    
    # Vérifier que l'utilisateur n'est pas déjà membre
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member.user_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet utilisateur est déjà membre du projet"
        )
    
    # Ajouter le membre
    db_member = ProjectMember(
        project_id=project_id,
        user_id=member.user_id
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    # Retourner avec les infos utilisateur
    return {
        "id": db_member.id,
        "project_id": db_member.project_id,
        "user_id": db_member.user_id,
        "joined_at": db_member.joined_at,
        "user_display_name": user_to_add.display_name,
        "user_email": user_to_add.email,
        "user_username": user_to_add.username
    }

@router.delete("/{user_id}")
def remove_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retire un membre du projet (admin ou créateur du projet uniquement).
    """
    # Vérifier les droits
    check_project_manager(project_id, current_user, db)
    
    # Empêcher de retirer le créateur du projet
    project = db.query(Project).filter(Project.id == project_id).first()
    if project.created_by == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de retirer le créateur du projet"
        )
    
    # Trouver le membre
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ce membre n'est pas dans le projet"
        )
    
    # Supprimer
    db.delete(member)
    db.commit()
    
    return {"message": "Membre retiré avec succès"}

@router.get("/available", response_model=List[MemberSimple])
def list_available_users(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Liste les utilisateurs disponibles à ajouter au projet (non encore membres).
    """
    # Vérifier les droits
    check_project_manager(project_id, current_user, db)
    
    # Récupérer tous les utilisateurs actifs
    all_users = db.query(User).filter(User.is_active == True).all()
    
    # Récupérer les IDs des membres actuels
    current_members = db.query(ProjectMember.user_id).filter(
        ProjectMember.project_id == project_id
    ).all()
    current_member_ids = [m[0] for m in current_members]
    
    # Filtrer
    available = [
        {
            "user_id": u.id,
            "display_name": u.display_name,
            "email": u.email
        }
        for u in all_users if u.id not in current_member_ids
    ]
    
    return available