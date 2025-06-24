import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

# Read database credentials from environment
DB_HOST = os.getenv("DB_HOST_1")
DB_USER = os.getenv("DB_USER_1")
DB_PASSWORD = os.getenv("DB_PASS_1")
DB_NAME = os.getenv("DB_NAME_1")
DB_PORT = os.getenv("DB_PORT_1")

# Validate required variables
if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT]):
    raise ValueError("❌ One or more required database environment variables are missing.")

# Construct database URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# SQLAlchemy engine and session setup
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
