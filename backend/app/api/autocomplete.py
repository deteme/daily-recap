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
    project_context: Optional[str] = Query(None, description="Nom ou ID du projet pour filtrer"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint d'autocomplétion intelligent.
    Résout le nom du projet en ID pour filtrer les membres du projet uniquement.
    """
    results = []

    # 1. RÉSOLUTION DU CONTEXTE (Nom du projet -> ID)
    resolved_project_id = None
    if project_context:
        # Si c'est déjà un chiffre
        if project_context.isdigit():
            resolved_project_id = int(project_context)
        else:
            # On cherche le projet par son nom exact pour trouver l'ID
            project = db.query(Project).filter(Project.name == project_context).first()
            if project:
                resolved_project_id = project.id

    # 2. LOGIQUE DE RECHERCHE
    search_term = q.lower()
    
    # CAS A : Recherche de projets (@project:...)
    if search_term.startswith("project:") or search_term.startswith("p:"):
        actual_query = search_term.split(":", 1)[1] if ":" in search_term else ""
        
        # Filtre selon les droits
        proj_query = db.query(Project).filter(Project.status == ProjectStatus.ACTIVE)
        if current_user.role != "admin":
            proj_query = proj_query.filter(
                or_(
                    Project.created_by == current_user.id,
                    Project.members.any(ProjectMember.user_id == current_user.id)
                )
            )
        
        projects = proj_query.filter(Project.name.ilike(f"%{actual_query}%")).limit(10).all()
        for p in projects:
            results.append({
                "id": p.id,
                "type": "project",
                "name": p.name,
                "display_text": f"📁 {p.name}"
            })

    # CAS B : Recherche d'utilisateurs (@user:...)
    elif search_term.startswith("user:") or search_term.startswith("u:"):
        actual_query = search_term.split(":", 1)[1] if ":" in search_term else ""
        
        user_query = db.query(User).filter(User.is_active == True)
        
        # FILTRE CRUCIAL : Uniquement les membres du projet en contexte
        if resolved_project_id:
            user_query = user_query.join(ProjectMember).filter(ProjectMember.project_id == resolved_project_id)
        
        users = user_query.filter(
            or_(
                User.display_name.ilike(f"%{actual_query}%"),
                User.username.ilike(f"%{actual_query}%")
            )
        ).limit(10).all()
        
        for u in users:
            results.append({
                "id": u.id,
                "type": "user",
                "name": u.display_name,
                "display_text": f"👤 {u.display_name}"
            })

    # CAS C : Recherche globale (juste @...)
    else:
        # Projets
        proj_query = db.query(Project).filter(Project.status == ProjectStatus.ACTIVE)
        if current_user.role != "admin":
            proj_query = proj_query.filter(Project.members.any(ProjectMember.user_id == current_user.id))
        
        projects = proj_query.filter(Project.name.ilike(f"%{search_term}%")).limit(5).all()
        for p in projects:
            results.append({"id": p.id, "type": "project", "name": p.name, "display_text": f"📁 {p.name}"})

        # Utilisateurs (soumis au contexte si présent)
        u_query = db.query(User).filter(User.is_active == True, User.id != current_user.id)
        if resolved_project_id:
            u_query = u_query.join(ProjectMember).filter(ProjectMember.project_id == resolved_project_id)
            
        users = u_query.filter(User.display_name.ilike(f"%{search_term}%")).limit(5).all()
        for u in users:
            results.append({"id": u.id, "type": "user", "name": u.display_name, "display_text": f"👤 {u.display_name}"})

    return results

# Garder les autres routes (projects/users) inchangées si elles fonctionnent
@router.get("/projects", response_model=List[AutocompleteItem])
def autocomplete_projects(
    q: str = Query("", min_length=0, max_length=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search_term = f"%{q}%"
    proj_query = db.query(Project).filter(Project.status == ProjectStatus.ACTIVE)
    if current_user.role != "admin":
        proj_query = proj_query.filter(Project.members.any(ProjectMember.user_id == current_user.id))
    
    projects = proj_query.filter(Project.name.ilike(search_term)).limit(10).all()
    return [{"id": p.id, "type": "project", "name": p.name, "display_text": f"📁 {p.name}"} for p in projects]

@router.get("/users", response_model=List[AutocompleteItem])
def autocomplete_users(
    q: str = Query("", min_length=0, max_length=50),
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_query = db.query(User).filter(User.is_active == True, User.id != current_user.id)
    if project_id:
        user_query = user_query.join(ProjectMember).filter(ProjectMember.project_id == project_id)
    
    users = user_query.filter(User.display_name.ilike(f"%{q}%")).limit(10).all()
    return [{"id": u.id, "type": "user", "name": u.display_name, "display_text": f"👤 {u.display_name}"} for u in users]