from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..core.database import get_db
from ..core.security import verify_password, create_access_token, get_current_user
from ..core.config import settings
from ..models.user import User
from ..schemas.auth import LoginRequest, LoginResponse, Token
from ..schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(
    request: OAuth2PasswordRequestForm = Depends(), 
          db: Session = Depends(get_db)
):
    """
    Authentification d'un utilisateur.
    Retourne un token JWT et les infos de l'utilisateur.
    """
    # Chercher l'utilisateur par email(Swagger envoie l'email dans le champ 'username')
    user = db.query(User).filter(User.email == request.username).first()
    
    # Vérifier si l'utilisateur existe
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier si le compte est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé. Contactez l'administrateur."
        )
    
    # Vérifier le mot de passe
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Créer le token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},  # sub = subject, convention JWT
        expires_delta=access_token_expires
    )
    
    # Retourner le token + infos utilisateur
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        role=user.role
    )

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Récupère les informations de l'utilisateur connecté.
    """
    return current_user

@router.post("/logout")
def logout():
    """
    Déconnexion (côté client, le front supprime le token).
    Ici juste pour la forme, pas de logique serveur nécessaire.
    """
    return {"message": "Déconnexion réussie"}