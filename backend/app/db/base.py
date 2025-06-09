from app.db.base_class import Base
from app.models.models import User, Category, Product, CartItem
from app.db.session import engine

# Import all models here that should be included in the database
# This is used by Alembic for migrations

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine) 