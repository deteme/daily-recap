from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

# Base commun
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

# Création (manager seulement)
class ProjectCreate(ProjectBase):
    pass

# Mise à jour (manager du projet ou admin)
class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[ProjectStatus] = None

# Réponse (ce qu'on renvoie au front)
class ProjectResponse(ProjectBase):
    id: int
    created_by: int
    status: ProjectStatus
    created_at: datetime
    member_count: Optional[int] = None  # Calculé optionnellement
    
    class Config:
        from_attributes = True

# Pour la liste des projets (version simplifiée)
class ProjectSimple(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: ProjectStatus
    created_by: int
    member_count: int = 0
    
    class Config:
        from_attributes = True