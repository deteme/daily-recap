from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from ..models.project_member import ProjectMember
from ..models.report import Report
from ..models.tag import ReportTag
from ..core.database import get_db
from ..core.security import require_manager
from ..models.user import User
from ..models.project import Project
from ..services.stats_service import StatsService
from ..schemas.dashboard import (
    ManagerDashboard, ManagerProjectSummary, ManagerReportItem,
    ProjectStats
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/manager", response_model=ManagerDashboard)
def get_manager_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Vue d'ensemble légère pour le manager : 
    Stats globales + liste simplifiée des projets + rapports récents.
    """
    stats_service = StatsService(db)
    
    # On récupère les données complètes du service
    data = stats_service.get_dashboard_overview(current_user.id)
    
    # On simplifie la liste 'managed_projects' pour correspondre au nouveau schéma
    simplified_projects = []
    for p in data['managed_projects']:
        simplified_projects.append({
            "id": p["id"],
            "name": p["name"],
            "member_count": p["member_count"],
            "has_recent_activity": p["report_count"] > 0
        })
    
    # On remplace par la version légère
    data['managed_projects'] = simplified_projects
    
    return data

@router.get("/projects", response_model=List[ManagerProjectSummary])
def get_managed_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Liste tous les projets gérés par le manager avec leurs stats.
    """
    stats_service = StatsService(db)
    projects = stats_service.get_manager_projects(current_user.id)
    
    result = []
    for p in projects:
        stats = stats_service.get_project_summary(p.id)
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "member_count": stats['member_count'],
            "report_count": stats['report_count'],
            "difficulty_count": stats['difficulty_count'],
            "last_report_date": stats['last_report_date'],
            "created_at": p.created_at
        })
    
    return result

@router.get("/projects/{project_id}/reports", response_model=List[ManagerReportItem])
def get_project_reports(
    project_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    has_difficulties: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Récupère les rapports d'un projet spécifique avec filtres.
    """
    # Vérifier que le projet existe et appartient au manager
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.created_by == current_user.id
    ).first()
    
    if not project and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas accès à ce projet"
        )
    
    # Construire les filtres
    filters = {}
    if user_id is not None:
        filters['user_id'] = user_id
    if from_date is not None:
        filters['from_date'] = from_date
    if to_date is not None:
        filters['to_date'] = to_date
    if has_difficulties is not None:
        filters['has_difficulties'] = has_difficulties
    if search is not None and search.strip():
        filters['search_term'] = search.strip()
    
    stats_service = StatsService(db)
    reports = stats_service.get_project_reports(
        project_id, 
        filters=filters,
        skip=skip,
        limit=limit
    )
    
    return reports

@router.get("/projects/{project_id}/stats", response_model=ProjectStats)
def get_project_statistics(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Statistiques détaillées pour un projet.
    """
    # Vérifier que le projet existe et appartient au manager
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.created_by == current_user.id
    ).first()
    
    if not project and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas accès à ce projet"
        )
    
    stats_service = StatsService(db)
    stats = stats_service.get_project_stats(project_id)
    
    # Ajouter les infos de base
    member_count = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).count()
    
    total_reports = db.query(Report).join(
        ReportTag, Report.id == ReportTag.report_id
    ).filter(
        ReportTag.project_id == project_id
    ).distinct().count()
    
    reports_with_difficulties = db.query(Report).join(
        ReportTag, Report.id == ReportTag.report_id
    ).filter(
        ReportTag.project_id == project_id,
        Report.difficulties.isnot(None),
        Report.difficulties != ''
    ).distinct().count()
    
    return {
        "project_id": project_id,
        "project_name": project.name,
        "total_reports": total_reports,
        "reports_with_difficulties": reports_with_difficulties,
        "active_members": member_count,
        "reports_by_member": stats['reports_by_member'],
        "reports_last_7_days": stats['reports_last_7_days'],
        "most_tagged_users": stats['most_tagged_users']
    }

@router.get("/projects/{project_id}/members")
def get_project_members_with_stats(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Liste les membres du projet avec leurs stats (nombre de rapports, etc.)
    """
    # Vérifier que le projet existe et appartient au manager
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.created_by == current_user.id
    ).first()
    
    if not project and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas accès à ce projet"
        )
    
    # Récupérer les membres
    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()
    
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    result = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        if not user or not user.is_active:
            continue
        
        # Compter les rapports
        reports_week = db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(
            ReportTag.project_id == project_id,
            Report.user_id == user.id,
            Report.report_date >= week_ago
        ).count()
        
        reports_month = db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(
            ReportTag.project_id == project_id,
            Report.user_id == user.id,
            Report.report_date >= month_ago
        ).count()
        
        # Dernier rapport
        last_report = db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(
            ReportTag.project_id == project_id,
            Report.user_id == user.id
        ).order_by(desc(Report.report_date)).first()
        
        result.append({
            "user_id": user.id,
            "display_name": user.display_name,
            "email": user.email,
            "joined_at": m.joined_at,
            "stats": {
                "reports_last_7_days": reports_week,
                "reports_last_30_days": reports_month,
                "last_report_date": last_report.report_date if last_report else None
            }
        })
    
    return result