from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    script = Column(String, nullable=False)
    drive_link = Column(String, nullable=True)
    instagram_link = Column(String, nullable=True)
    file_name = Column(String, nullable=True)  # ✅ Add this line
    created_at = Column(DateTime, default=datetime.utcnow)
