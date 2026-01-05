from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import get_password_hash, get_current_active_user
from database import get_session
from models import User
from schemas import UserCreate, UserRead

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/", response_model=UserRead)
async def create_user(user_create: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.username == user_create.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user_create.password)
    user = User(
        username=user_create.username,
        email=user_create.email,
        full_name=user_create.full_name,
        hashed_password=hashed_password,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/", response_model=List[UserRead])
async def read_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    users = session.exec(select(User)).all()
    return users
