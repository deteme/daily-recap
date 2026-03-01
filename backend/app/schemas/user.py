from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"

# Base commun
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.USER

# Création (admin seulement)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Mise à jour (admin ou self)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

# Réponse (ce qu'on renvoie au front)
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True  # Pydantic V2 (anciennement orm_mode)

# Pour le manager : liste simplifiée (pour ajouter aux projets)
class UserSimple(BaseModel):
    id: int
    username: str
    display_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    
    class Config:
        from_attributes = True