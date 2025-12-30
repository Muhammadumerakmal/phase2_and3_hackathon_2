from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Todo, User
from schemas import TodoCreate, TodoRead, TodoUpdate
from auth import get_current_active_user


router = APIRouter(
    prefix="/todos",
    tags=["todos"],
)


@router.get("", response_model=List[TodoRead])
async def read_todos(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    todos = session.exec(select(Todo).where(Todo.user_id == current_user.id)).all()
    return todos


@router.post("", response_model=TodoRead)
async def create_todo(
    todo_create: TodoCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    todo = Todo(content=todo_create.content, user_id=current_user.id)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


@router.put("/{todo_id}", response_model=TodoRead)
async def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.content = todo_update.content
    todo.completed = todo_update.completed
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Todo not found")
    session.delete(todo)
    session.commit()
    return {"ok": True}
