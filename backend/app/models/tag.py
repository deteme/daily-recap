from sqlalchemy import Column, Integer, ForeignKey, Enum, CheckConstraint
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base

class TagType(str, enum.Enum):
    PROJECT = "project"
    USER = "user"

class ReportTag(Base):
    __tablename__ = "report_tags"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    
    tag_type = Column(Enum(TagType), nullable=False)
    
    # Specific Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    # Relationships
    report = relationship("Report", back_populates="tags")
    project = relationship("Project")
    user = relationship("User")

    # Constraint: must be either a project OR a user, not both, not neither
    __table_args__ = (
        CheckConstraint(
            '(project_id IS NOT NULL AND user_id IS NULL) OR (project_id IS NULL AND user_id IS NOT NULL)',
            name='check_single_tag_type'
        ),
    )