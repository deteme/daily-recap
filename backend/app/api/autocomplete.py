from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.project import Project, ProjectStatus
from ..models.project_member import ProjectMember
from ..schemas.report import AutocompleteItem

router = APIRouter(prefix="/autocomplete", tags=["Autocomplete"])

@router.get("/", response_model=List[AutocompleteItem])
def autocomplete(
    q: str = Query(..., min_length=1, max_length=50),
    project_context: Optional[int] = Query(None, description="ID du projet pour filtrer les personnes"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint d'autocomplétion pour les tags.
    - Tape @project:xxx → recherche dans les projets accessibles
    - Tape @user:xxx → recherche dans les utilisateurs
    - Si project_context est fourni, filtre les personnes sur ce projet
    """
    results = []
    
    # Déterminer le type de recherche basé sur le préfixe
    if q.startswith("project:") or q.startswith("p:"):
        # Recherche de projets
        search_term = q.split(":", 1)[1] if ":" in q else ""
        
        # Quels projets l'utilisateur peut-il voir ?
        if current_user.role == "admin":
            projects = db.query(Project).filter(
                Project.name.ilike(f"%{search_term}%"),
                Project.status == ProjectStatus.ACTIVE
            ).limit(10).all()
        elif current_user.role == "manager":
            projects = db.query(Project).filter(
                or_(
                    Project.created_by == current_user.id,
                    Project.members.any(ProjectMember.user_id == current_user.id)
                ),
                Project.name.ilike(f"%{search_term}%"),
                Project.status == ProjectStatus.ACTIVE
            ).limit(10).all()
        else:
            projects = db.query(Project).filter(
                Project.members.any(ProjectMember.user_id == current_user.id),
                Project.name.ilike(f"%{search_term}%"),
                Project.status == ProjectStatus.ACTIVE
            ).limit(10).all()
        
        for p in projects:
            results.append({
                "id": p.id,
                "type": "project",
                "name": p.name,
                "display_text": f"📁 {p.name}"
            })
    
    elif q.startswith("user:") or q.startswith("u:") or q.startswith("user:"):
        # Recherche de personnes
        search_term = q.split(":", 1)[1] if ":" in q else ""
        
        # Base query : utilisateurs actifs
        user_query = db.query(User).filter(
            or_(
                User.display_name.ilike(f"%{search_term}%"),
                User.username.ilike(f"%{search_term}%"),
                User.email.ilike(f"%{search_term}%")
            ),
            User.is_active == True
        )
        
        # Si on a un contexte de projet, filtrer sur les membres
        if project_context:
            user_query = user_query.join(
                ProjectMember,
                and_(
                    ProjectMember.user_id == User.id,
                    ProjectMember.project_id == project_context
                )
            )
        
        users = user_query.limit(10).all()
        
        for u in users:
            results.append({
                "id": u.id,
                "type": "user",
                "name": u.display_name,
                "display_text": f"👤 {u.display_name} ({u.email})"
            })
    
    else:
        # Mode "recherche globale" (si l'utilisateur tape juste @)
        # On cherche les 5 premiers de chaque catégorie
        
        # Projets (accessibles)
        if current_user.role == "admin":
            projects = db.query(Project).filter(
                Project.name.ilike(f"%{q}%"),
                Project.status == ProjectStatus.ACTIVE
            ).limit(5).all()
        else:
            projects = db.query(Project).filter(
                Project.members.any(ProjectMember.user_id == current_user.id),
                Project.name.ilike(f"%{q}%"),
                Project.status == ProjectStatus.ACTIVE
            ).limit(5).all()
        
        for p in projects:
            results.append({
                "id": p.id,
                "type": "project",
                "name": p.name,
                "display_text": f"📁 {p.name}"
            })
        
        # Personnes (si pas de contexte, on limite aux collègues)
        users = db.query(User).filter(
            or_(
                User.display_name.ilike(f"%{q}%"),
                User.username.ilike(f"%{q}%")
            ),
            User.is_active == True,
            User.id != current_user.id  # Pas soi-même
        ).limit(5).all()
        
        for u in users:
            results.append({
                "id": u.id,
                "type": "user",
                "name": u.display_name,
                "display_text": f"👤 {u.display_name}"
            })
    
    return results

@router.get("/projects", response_model=List[AutocompleteItem])
def autocomplete_projects(
    q: str = Query("", min_length=0, max_length=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Version simplifiée : autocomplétion uniquement pour les projets.
    """
    search_term = f"%{q}%"
    
    if current_user.role == "admin":
        projects = db.query(Project).filter(
            Project.name.ilike(search_term),
            Project.status == ProjectStatus.ACTIVE
        ).limit(10).all()
    else:
        projects = db.query(Project).filter(
            Project.members.any(ProjectMember.user_id == current_user.id),
            Project.name.ilike(search_term),
            Project.status == ProjectStatus.ACTIVE
        ).limit(10).all()
    
    results = []
    for p in projects:
        results.append({
            "id": p.id,
            "type": "project",
            "name": p.name,
            "display_text": f"📁 {p.name}"
        })
    
    return results

@router.get("/users", response_model=List[AutocompleteItem])
def autocomplete_users(
    q: str = Query("", min_length=0, max_length=50),
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Version simplifiée : autocomplétion pour les utilisateurs.
    Si project_id est fourni, ne retourne que les membres de ce projet.
    """
    search_term = f"%{q}%"
    
    user_query = db.query(User).filter(
        or_(
            User.display_name.ilike(search_term),
            User.username.ilike(search_term)
        ),
        User.is_active == True,
        User.id != current_user.id
    )
    
    if project_id:
        user_query = user_query.join(
            ProjectMember,
            and_(
                ProjectMember.user_id == User.id,
                ProjectMember.project_id == project_id
            )
        )
    
    users = user_query.limit(10).all()
    
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "type": "user",
            "name": u.display_name,
            "display_text": f"👤 {u.display_name}"
        })
    
    return results