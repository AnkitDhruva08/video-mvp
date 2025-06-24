from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.auth import auth
from app.models import user 
from app.api.routes import generate, fetch_videos
from fastapi.staticfiles import StaticFiles


video_path = "/home/atlantick-solutions/Desktop/Ankit Mishra/video-mvp/backend/video_outputs"

app = FastAPI()

# Create tables at startup
Base.metadata.create_all(bind=engine) 

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(generate.router, prefix="/api", tags=["routes"])
app.include_router(fetch_videos.router, prefix="/api", tags=["routes"])
app.mount("/videos", StaticFiles(directory=video_path), name="videos")