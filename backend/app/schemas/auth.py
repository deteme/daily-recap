from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Token(BaseModel):
    """Réponse contenant le token JWT"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Données extraites du token"""
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    """Requête de connexion"""
    email: EmailStr
    password: str = Field(..., min_length=6)

class LoginResponse(BaseModel):
    """Réponse après connexion (avec infos utilisateur)"""
    access_token: str
    token_type: str
    user_id: int
    email: str
    username: str
    display_name: str
    role: str