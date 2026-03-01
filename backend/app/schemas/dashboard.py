from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class ProjectShort(BaseModel):
    id: int
    name: str
    member_count: int
    has_recent_activity: bool # Un petit indicateur visuel sympa

# Vue synthétique d'un projet pour le manager
class ManagerProjectSummary(BaseModel):
    id: int
    name: str
    description: Optional[str]
    member_count: int
    report_count: int  # Nombre de rapports cette semaine
    difficulty_count: int  # Nombre de rapports avec difficultés
    last_report_date: Optional[date]  # Dernier rapport soumis
    created_at: datetime

# Rapport avec infos utilisateur (pour le manager)
class ManagerReportItem(BaseModel):
    id: int
    user_id: int
    user_display_name: str
    user_email: str
    report_date: date
    content_preview: str
    difficulties: Optional[str]
    has_difficulties: bool
    created_at: datetime
    project_names: List[str]  # Noms des projets tagués
    tagged_users: List[str]  # Noms des utilisateurs tagués

# Filtres pour les rapports
class ReportFilters(BaseModel):
    project_id: Optional[int] = None
    user_id: Optional[int] = None
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    has_difficulties: Optional[bool] = None
    search_term: Optional[str] = None

# Statistiques pour un projet
class ProjectStats(BaseModel):
    project_id: int
    project_name: str
    total_reports: int
    reports_with_difficulties: int
    active_members: int
    reports_by_member: List[Dict[str, Any]]
    reports_last_7_days: List[Dict[str, Any]]
    most_tagged_users: List[Dict[str, Any]]
    
# Vue d'ensemble pour le manager
class ManagerDashboard(BaseModel):
    managed_projects: List[ProjectShort]
    total_projects: int
    total_members: int
    total_reports_week: int
    pending_difficulties: int  # Difficultés non lues (si on implémente)
    recent_reports: List[ManagerReportItem]