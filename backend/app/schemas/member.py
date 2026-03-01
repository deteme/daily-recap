from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Ajout d'un membre
class MemberAdd(BaseModel):
    user_id: int

# Réponse (membre avec infos utilisateur)
class MemberResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    joined_at: datetime
    user_display_name: str
    user_email: str
    user_username: str
    
    class Config:
        from_attributes = True

# Version simplifiée pour les listes
class MemberSimple(BaseModel):
    user_id: int
    display_name: str
    email: str
    
    class Config:
        from_attributes = True