from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, case
from typing import List, Optional, Dict, Any
from datetime import date, timedelta, datetime
from ..models.user import User
from ..models.project import Project, ProjectStatus
from ..models.project_member import ProjectMember
from ..models.report import Report
from ..models.tag import ReportTag, TagType

class StatsService:
    """Service de calcul des statistiques pour les dashboards"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_manager_projects(self, manager_id: int) -> List[Project]:
        """Récupère tous les projets gérés par un manager"""
        return self.db.query(Project).filter(
            Project.created_by == manager_id,
            Project.status == ProjectStatus.ACTIVE
        ).all()
    
    def get_project_summary(self, project_id: int) -> Dict[str, Any]:
        """Calcule les stats de base pour un projet"""
        
        # Nombre de membres
        member_count = self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id
        ).count()
        
        # Période : 7 derniers jours
        week_ago = date.today() - timedelta(days=7)
        
        # Rapports du projet (via les tags)
        reports = self.db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(
            ReportTag.project_id == project_id,
            Report.report_date >= week_ago
        ).distinct().all()
        
        report_count = len(reports)
        
        # Rapports avec difficultés
        difficulty_count = sum(1 for r in reports if r.difficulties and r.difficulties.strip())
        
        # Dernier rapport
        last_report = self.db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(
            ReportTag.project_id == project_id
        ).order_by(desc(Report.report_date)).first()
        
        last_report_date = last_report.report_date if last_report else None
        
        return {
            "member_count": member_count,
            "report_count": report_count,
            "difficulty_count": difficulty_count,
            "last_report_date": last_report_date
        }
    
    def get_project_reports(
        self, 
        project_id: int, 
        filters: Optional[Dict] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Récupère les rapports d'un projet avec filtres"""
        
        query = self.db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(ReportTag.project_id == project_id).distinct()
        
        # Appliquer les filtres
        if filters:
            if filters.get('user_id'):
                query = query.filter(Report.user_id == filters['user_id'])
            
            if filters.get('from_date'):
                query = query.filter(Report.report_date >= filters['from_date'])
            
            if filters.get('to_date'):
                query = query.filter(Report.report_date <= filters['to_date'])
            
            if filters.get('has_difficulties') is True:
                query = query.filter(Report.difficulties.isnot(None))
                query = query.filter(Report.difficulties != '')
            elif filters.get('has_difficulties') is False:
                query = query.filter(
                    (Report.difficulties.is_(None)) | (Report.difficulties == '')
                )
            
            if filters.get('search_term'):
                search = f"%{filters['search_term']}%"
                query = query.filter(Report.content.ilike(search))
        
        # Tri et pagination
        reports = query.order_by(
            desc(Report.report_date), 
            desc(Report.created_at)
        ).offset(skip).limit(limit).all()
        
        result = []
        for r in reports:
            # Récupérer les tags du rapport
            tags = self.db.query(ReportTag).filter(ReportTag.report_id == r.id).all()
            
            project_names = []
            tagged_users = []
            
            for tag in tags:
                if tag.tag_type == TagType.PROJECT and tag.project_id:
                    project = self.db.query(Project).filter(Project.id == tag.project_id).first()
                    if project:
                        project_names.append(project.name)
                
                elif tag.tag_type == TagType.USER and tag.user_id:
                    user = self.db.query(User).filter(User.id == tag.user_id).first()
                    if user:
                        tagged_users.append(user.display_name)
            
            # Récupérer l'utilisateur
            user = self.db.query(User).filter(User.id == r.user_id).first()
            
            result.append({
                "id": r.id,
                "user_id": r.user_id,
                "user_display_name": user.display_name if user else "Inconnu",
                "user_email": user.email if user else "",
                "report_date": r.report_date,
                "content_preview": r.content[:150] + "..." if len(r.content) > 150 else r.content,
                "difficulties": r.difficulties,
                "has_difficulties": bool(r.difficulties and r.difficulties.strip()),
                "created_at": r.created_at,
                "project_names": project_names,
                "tagged_users": tagged_users
            })
        
        return result
    
    def get_project_stats(self, project_id: int) -> Dict[str, Any]:
        """Calcule des stats avancées pour un projet"""
        
        # Membres actifs
        members = self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id
        ).all()
        member_ids = [m.user_id for m in members]
        
        # Périodes
        today = date.today()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Stats par membre
        reports_by_member = []
        for user_id in member_ids[:5]:  # Top 5 seulement pour éviter trop de données
            user = self.db.query(User).filter(User.id == user_id).first()
            if user and user.is_active:
                report_count = self.db.query(Report).join(
                    ReportTag, Report.id == ReportTag.report_id
                ).filter(
                    ReportTag.project_id == project_id,
                    Report.user_id == user_id,
                    Report.report_date >= month_ago
                ).count()
                
                reports_by_member.append({
                    "user_id": user_id,
                    "user_name": user.display_name,
                    "report_count": report_count
                })
        
        # Rapports des 7 derniers jours
        reports_last_7_days = []
        for i in range(7):
            day = today - timedelta(days=i)
            count = self.db.query(Report).join(
                ReportTag, Report.id == ReportTag.report_id
            ).filter(
                ReportTag.project_id == project_id,
                Report.report_date == day
            ).count()
            
            reports_last_7_days.append({
                "date": day.isoformat(),
                "count": count
            })
        
        # Utilisateurs les plus tagués
        most_tagged = self.db.query(
            ReportTag.user_id, 
            func.count(ReportTag.id).label('tag_count')
        ).filter(
            ReportTag.project_id == project_id,
            ReportTag.tag_type == TagType.USER
        ).group_by(ReportTag.user_id).order_by(desc('tag_count')).limit(5).all()
        
        most_tagged_users = []
        for user_id, count in most_tagged:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                most_tagged_users.append({
                    "user_id": user_id,
                    "user_name": user.display_name,
                    "tag_count": count
                })
        
        return {
            "reports_by_member": reports_by_member,
            "reports_last_7_days": reports_last_7_days,
            "most_tagged_users": most_tagged_users
        }
    
    def get_dashboard_overview(self, manager_id: int) -> Dict[str, Any]:
        """Construit la vue d'ensemble du dashboard manager"""
        
        projects = self.get_manager_projects(manager_id)
        project_ids = [p.id for p in projects]
        
        today = date.today()
        week_ago = today - timedelta(days=7)
        
        # Stats globales
        total_members = self.db.query(ProjectMember).filter(
            ProjectMember.project_id.in_(project_ids)
        ).distinct(ProjectMember.user_id).count()
        
        # Rapports de la semaine sur tous les projets
        weekly_reports = self.db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(
            ReportTag.project_id.in_(project_ids),
            Report.report_date >= week_ago
        ).distinct().count()
        
        # Difficultés non résolues (concept simple pour l'instant)
        difficulties = self.db.query(Report).join(
            ReportTag, Report.id == ReportTag.report_id
        ).filter(
            ReportTag.project_id.in_(project_ids),
            Report.difficulties.isnot(None),
            Report.difficulties != '',
            Report.report_date >= week_ago
        ).distinct().count()
        
        # Résumés des projets
        project_summaries = []
        for p in projects:
            stats = self.get_project_summary(p.id)
            project_summaries.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "member_count": stats['member_count'],
                "report_count": stats['report_count'],
                "difficulty_count": stats['difficulty_count'],
                "last_report_date": stats['last_report_date'],
                "created_at": p.created_at
            })
        
        # Rapports récents (10 derniers tous projets confondus)
        recent_reports = []
        for project_id in project_ids[:3]:  # Limiter à 3 projets pour la perf
            reports = self.get_project_reports(
                project_id, 
                filters={"from_date": week_ago},
                limit=5
            )
            recent_reports.extend(reports)
        
        # Trier par date et limiter
        recent_reports.sort(key=lambda x: x['report_date'], reverse=True)
        recent_reports = recent_reports[:10]
        
        return {
            "managed_projects": project_summaries,
            "total_projects": len(projects),
            "total_members": total_members,
            "total_reports_week": weekly_reports,
            "pending_difficulties": difficulties,
            "recent_reports": recent_reports
        }