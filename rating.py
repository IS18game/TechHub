from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, conint
from sqlalchemy import create_engine, Column, Integer
from sqlalchemy.orm import sessionmaker, declarative_base, Session

DATABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.hcngokfrfzaefaepqkux.supabase.co:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

app = FastAPI()


class ReviewTable(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    id_user = Column(Integer, nullable=False)
    id_tovara = Column(Integer, nullable=False)
    otcenka = Column(Integer, nullable=False)


class ReviewCreate(BaseModel):
    id_user: int
    id_tovara: int
    otcenka: conint(ge=1, le=5)


class ReviewResponse(BaseModel):
    id: int
    id_user: int
    id_tovara: int
    otcenka: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/reviews", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    new_review = ReviewTable(**review.dict())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review


@app.get("/reviews/{tovar_id}", response_model=list[ReviewResponse])
def get_reviews_by_tovar(tovar_id: int, db: Session = Depends(get_db)):
    return db.query(ReviewTable).filter(ReviewTable.id_tovara == tovar_id).all()
