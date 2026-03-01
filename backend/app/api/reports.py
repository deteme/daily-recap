from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_
from typing import List, Optional
from datetime import date, timedelta
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.project import Project
from ..models.report import Report
from ..models.tag import ReportTag, TagType
from ..schemas.report import (
    ReportCreate, ReportUpdate, ReportResponse, 
    ReportSimple, AutocompleteItem
)
from ..services.tag_parser import TagParser

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crée un nouveau rapport avec validation des tags.
    """
    # Vérifier que la date est dans les 7 derniers jours
    today = date.today()
    min_date = today - timedelta(days=7)
    
    if report.report_date < min_date or report.report_date > today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La date doit être entre {min_date} et {today}"
        )
    
    # Vérifier qu'il n'y a pas déjà un rapport pour cette date
    existing = db.query(Report).filter(
        Report.user_id == current_user.id,
        Report.report_date == report.report_date
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous avez déjà un rapport pour cette date"
        )
    
    # Parser et valider les tags
    parser = TagParser(db, current_user.id)
    try:
        validated_projects, validated_users = parser.validate_all_tags(report.content)
    except HTTPException as e:
        # Relever l'exception pour que FastAPI la traite
        raise e
    
    # Créer le rapport
    db_report = Report(
        user_id=current_user.id,
        report_date=report.report_date,
        content=report.content,
        difficulties=report.difficulties
    )
    
    db.add(db_report)
    db.flush()  # Pour obtenir l'ID du rapport
    
    # Créer les tags
    for project in validated_projects:
        tag = ReportTag(
            report_id=db_report.id,
            tag_type=TagType.PROJECT,
            project_id=project['id'],
            user_id=None
        )
        db.add(tag)
    
    for user in validated_users:
        tag = ReportTag(
            report_id=db_report.id,
            tag_type=TagType.USER,
            project_id=None,
            user_id=user['id']
        )
        db.add(tag)
    
    db.commit()
    db.refresh(db_report)
    
    # Préparer la réponse avec les tags
    return prepare_report_response(db_report, db)

@router.get("/me", response_model=List[ReportSimple])
def get_my_reports(
    skip: int = 0,
    limit: int = 50,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère l'historique des rapports de l'utilisateur connecté.
    """
    query = db.query(Report).filter(Report.user_id == current_user.id)
    
    # Filtres de date
    if from_date:
        query = query.filter(Report.report_date >= from_date)
    if to_date:
        query = query.filter(Report.report_date <= to_date)
    
    # Tri du plus récent au plus ancien
    reports = query.order_by(desc(Report.report_date)).offset(skip).limit(limit).all()
    
    result = []
    for r in reports:
        # Compter les tags
        tag_count = db.query(ReportTag).filter(ReportTag.report_id == r.id).count()
        
        result.append({
            "id": r.id,
            "report_date": r.report_date,
            "content_preview": r.content[:100] + "..." if len(r.content) > 100 else r.content,
            "difficulties": r.difficulties,
            "user_display_name": current_user.display_name,
            "has_difficulties": r.difficulties is not None and r.difficulties.strip() != "",
            "tag_count": tag_count
        })
    
    return result

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère un rapport spécifique avec ses tags.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rapport non trouvé"
        )
    
    # Vérifier les droits (propriétaire ou admin/manager du projet)
    if report.user_id != current_user.id and current_user.role != "admin":
        # Vérifier si l'utilisateur est manager d'un projet tagué
        tags = db.query(ReportTag).filter(ReportTag.report_id == report_id).all()
        project_ids = [t.project_id for t in tags if t.project_id is not None]
        
        if project_ids:
            projects = db.query(Project).filter(
                Project.id.in_(project_ids),
                Project.created_by == current_user.id
            ).all()
            
            if not projects and current_user.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Vous n'avez pas accès à ce rapport"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas accès à ce rapport"
            )
    
    return prepare_report_response(report, db)

@router.put("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: int,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Met à jour un rapport (seulement si c'est le propriétaire).
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rapport non trouvé"
        )
    
    # Seul le propriétaire peut modifier
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez pas modifier ce rapport"
        )
    
    # Mise à jour
    update_data = report_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(report, key, value)
    
    db.commit()
    db.refresh(report)
    
    return prepare_report_response(report, db)

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprime un rapport (soft delete ? Pour l'instant hard delete).
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rapport non trouvé"
        )
    
    # Seul le propriétaire ou admin peut supprimer
    if report.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez pas supprimer ce rapport"
        )
    
    db.delete(report)
    db.commit()
    
    return {"message": "Rapport supprimé avec succès"}

# Fonction utilitaire pour préparer la réponse avec les tags
def prepare_report_response(report: Report, db: Session) -> dict:
    """Convertit un rapport en dict avec ses tags enrichis"""
    
    # Récupérer les tags
    tags = db.query(ReportTag).filter(ReportTag.report_id == report.id).all()
    
    tags_info = []
    for tag in tags:
        if tag.tag_type == TagType.PROJECT and tag.project_id:
            project = db.query(Project).filter(Project.id == tag.project_id).first()
            if project:
                tags_info.append({
                    "tag_type": "project",
                    "id": project.id,
                    "name": project.name
                })
        elif tag.tag_type == TagType.USER and tag.user_id:
            user = db.query(User).filter(User.id == tag.user_id).first()
            if user:
                tags_info.append({
                    "tag_type": "user",
                    "id": user.id,
                    "name": user.display_name
                })
    
    # Récupérer l'utilisateur
    user = db.query(User).filter(User.id == report.user_id).first()
    
    return {
        "id": report.id,
        "user_id": report.user_id,
        "user_display_name": user.display_name if user else "Utilisateur inconnu",
        "report_date": report.report_date,
        "content": report.content,
        "difficulties": report.difficulties,
        "created_at": report.created_at,
        "tags": tags_info
    }