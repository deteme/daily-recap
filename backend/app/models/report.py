from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from ..core.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_date = Column(Date, default=date.today, nullable=False, index=True)
    content = Column(Text, nullable=False)  # Le texte brut avec les tags
    difficulties = Column(Text, nullable=True)  # Difficultés rencontrées (optionnel)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relations
    user = relationship("User", back_populates="reports")
    tags = relationship("ReportTag", back_populates="report", cascade="all, delete-orphan")