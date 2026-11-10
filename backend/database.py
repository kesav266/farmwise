import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from the root .env file
load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL") or os.getenv(
    "DATABASE_URL", "sqlite:///./urea_management.db"
)

# Render supplies PostgreSQL URLs using the ``postgres://`` form. SQLAlchemy
# needs an explicit psycopg driver for PostgreSQL connections.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://", "postgresql+psycopg://", 1
    )
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )

# SQLite requires this setting for FastAPI applications
connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """Provide a database session to API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
