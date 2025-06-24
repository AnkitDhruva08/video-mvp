from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.video import Video
from app.core.database import get_db
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic schema to return video data
class VideoOut(BaseModel):
    id: int
    title: str
    date: str
    drive_link: str
    instagram_link: str
    script: str
    file_name: str  # ✅ NEW FIELD

    class Config:
        orm_mode = True

@router.get("/fetch-video", response_model=List[VideoOut])
def fetch_videos(db: Session = Depends(get_db)):
    try:
        videos = db.query(Video).order_by(Video.created_at.desc()).all()


        # Format response with fields expected by the frontend
        return [
    {
        "id": video.id,
        "title": video.title,
        "date": video.created_at.strftime('%Y-%m-%d'),
        "drive_link": video.drive_link or "",
        "instagram_link": video.instagram_link or "",
        "script": video.script or "",
        "file_name": video.file_name,  
    }
    for video in videos
]      
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
