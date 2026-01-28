from __future__ import annotations

from datetime import datetime
from pathlib import Path

from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

from .config import get_settings

Base = declarative_base()
DEFAULT_AUTH_DB_PATH = Path("/data/auth.db")


def get_database_url() -> str:
  """
  Returns the database URL.
  By default we store the SQLite DB in /data so user accounts persist with the
  data volume and remain separate from the recipe files.
  """
  _ = get_settings()
  db_path = DEFAULT_AUTH_DB_PATH
  db_path.parent.mkdir(parents=True, exist_ok=True)
  return f"sqlite:///{db_path}"


engine = create_engine(get_database_url(), connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True)
  username = Column(String, unique=True, index=True, nullable=False)
  password_hash = Column(String, nullable=False)
  is_active = Column(Boolean, default=True, nullable=False)
  is_admin = Column(Boolean, default=False, nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


def init_db() -> None:
  Base.metadata.create_all(bind=engine)


def get_db() -> Session:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()
