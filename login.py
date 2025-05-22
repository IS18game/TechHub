from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime, timedelta
from typing import Optional
import os

DATABASE_URL = engine = 'postgresql://postgres:vismin-Vutna1-fugfad@db.hcngokfrfzaefaepqkux.supabase.co:5432/postgres'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

app = FastAPI()

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class UserTable(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)


class User(BaseModel):
    username: str
    email: EmailStr
    is_admin: bool = False


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_admin: Optional[bool] = False


class Token(BaseModel):
    access_token: str
    token_type: str


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_username(db: Session, username: str) -> Optional[UserTable]:
    return db.query(UserTable).filter(UserTable.username == username).first()


def authenticate_user(db: Session, username: str, password: str) -> Optional[UserTable]:
    user = get_user_by_username(db, username)
    if user and verify_password(password, user.hashed_password):
        return user
    return None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserTable:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin_user(current_user: UserTable = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    return current_user


@app.post("/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = UserTable(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_admin=user.is_admin or False,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return User(
        username=db_user.username,
        email=db_user.email,
        is_admin=db_user.is_admin
    )


@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/user/me", response_model=User)
def read_users_me(current_user: UserTable = Depends(get_current_user)):
    return User(
        username=current_user.username,
        email=current_user.email,
        is_admin=current_user.is_admin
    )


@app.get("/admin/dashboard", response_model=User)
def admin_dashboard(current_user: UserTable = Depends(get_current_admin_user)):
    return User(
        username=current_user.username,
        email=current_user.email,
        is_admin=current_user.is_admin
    )
