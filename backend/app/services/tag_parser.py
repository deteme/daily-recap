import re
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user import User
from ..models.project_member import ProjectMember

class TagParser:
    """
    Service de parsing et validation des tags dans les rapports.
    Format attendu : @projet:NomDuProjet ou @personne:NomUtilisateur
    """
    
    # Patterns regex pour détecter les tags
    PROJECT_PATTERN = r'@project:([^\s]+)'  # Capture jusqu'au prochain espace
    USER_PATTERN = r'@user:([^\s]+)'
    
    def __init__(self, db: Session, current_user_id: int):
        self.db = db
        self.current_user_id = current_user_id
        
    def extract_tags(self, content: str) -> Tuple[List[Dict], List[Dict]]:
        """
        Extrait les tags du contenu.
        Retourne : (projets_trouvés, personnes_trouvées)
        Chaque élément est un dict avec 'identifier' (ce qui a été tapé)
        """
        # Extraire les projets
        project_matches = re.findall(self.PROJECT_PATTERN, content)
        projects = [{'identifier': match} for match in project_matches]
        
        # Extraire les personnes
        user_matches = re.findall(self.USER_PATTERN, content)
        users = [{'identifier': match} for match in user_matches]
        
        return projects, users
    
    def validate_project_tag(self, project_identifier: str) -> Dict[str, Any]:
        """
        Valide qu'un projet tagué existe et que l'utilisateur en est membre.
        Retourne les infos du projet ou lève une exception.
        """
        # Chercher le projet par nom (insensible à la casse)
        project = self.db.query(Project).filter(
            Project.name.ilike(project_identifier),
            Project.status == "active"
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le projet '{project_identifier}' n'existe pas ou est archivé"
            )
        
        # Vérifier que l'utilisateur est membre du projet
        is_member = self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == self.current_user_id
        ).first()
        
        if not is_member:
            # Vérifier si c'est le créateur (qui est automatiquement membre)
            if project.created_by != self.current_user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Vous n'êtes pas membre du projet '{project.name}'"
                )
        
        return {
            'id': project.id,
            'name': project.name,
            'type': 'project'
        }
    
    def validate_user_tag(self, user_identifier: str, project_context: List[int] = None) -> Dict[str, Any]:
        """
        Valide qu'un utilisateur tagué existe, est actif, et (si project_context fourni)
        est membre d'au moins un des projets tagués dans le même rapport.
        """
        # Chercher l'utilisateur par display_name ou username
        user = self.db.query(User).filter(
            (User.display_name.ilike(f"%{user_identifier}%")) |
            (User.username.ilike(user_identifier)),
            User.is_active == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"L'utilisateur '{user_identifier}' n'existe pas ou est inactif"
            )
        
        # Si on a un contexte de projet, vérifier que l'utilisateur est membre
        if project_context:
            is_member = self.db.query(ProjectMember).filter(
                ProjectMember.user_id == user.id,
                ProjectMember.project_id.in_(project_context)
            ).first()
            
            if not is_member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"L'utilisateur '{user.display_name}' n'est pas membre des projets mentionnés"
                )
        
        return {
            'id': user.id,
            'name': user.display_name,
            'type': 'user'
        }
    
    def validate_all_tags(self, content: str) -> Tuple[List[Dict], List[Dict]]:
        """
        Valide tous les tags dans le contenu.
        Retourne les tags validés (prêts pour insertion en base).
        """
        projects_raw, users_raw = self.extract_tags(content)
        
        validated_projects = []
        validated_users = []
        project_ids = []
        
        # Valider d'abord tous les projets
        for p in projects_raw:
            validated = self.validate_project_tag(p['identifier'])
            validated_projects.append(validated)
            project_ids.append(validated['id'])
        
        # Ensuite valider les utilisateurs avec le contexte des projets
        for u in users_raw:
            validated = self.validate_user_tag(u['identifier'], project_ids if project_ids else None)
            validated_users.append(validated)
        
        return validated_projects, validated_users
    
    def normalize_content(self, content: str) -> str:
        """
        Nettoie le contenu (optionnel, pour garder une version sans tags si besoin)
        """
        # Pour l'instant, on garde le contenu original
        return content