from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime

# Base commun
class ReportBase(BaseModel):
    report_date: date
    content: str = Field(..., min_length=1, max_length=5000)
    difficulties: Optional[str] = Field(None, max_length=1000)

class ReportCreate(ReportBase):
    pass

# Mise à jour (si on permet de modifier)
class ReportUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    difficulties: Optional[str] = Field(None, max_length=1000)

# Tag dans un rapport (pour la réponse)
class ReportTagInfo(BaseModel):
    tag_type: str  # "project" ou "user"
    id: int
    name: str  # nom du projet ou display_name de l'utilisateur

# Réponse complète
class ReportResponse(ReportBase):
    id: int
    user_id: int
    user_display_name: str
    created_at: datetime
    tags: List[ReportTagInfo] = []
    
    class Config:
        from_attributes = True

# Version simplifiée pour les listes
class ReportSimple(BaseModel):
    id: int
    report_date: date
    content_preview: str  # Premiers 100 caractères
    difficulties: Optional[str]
    user_display_name: str
    has_difficulties: bool
    tag_count: int
    
    class Config:
        from_attributes = True

# Résultat d'auto-complétion
class AutocompleteItem(BaseModel):
    id: int
    type: str  # "project" ou "user"
    name: str
    display_text: str  # Ce qui sera affiché