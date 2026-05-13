from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud
import schemas
from database import get_db

router = APIRouter(tags=["Books"])


@router.get("/books", response_model=List[schemas.BookResponse])
def get_all_books(db: Session = Depends(get_db)):
    return crud.get_books(db)


@router.get("/books/{book_id}", response_model=schemas.BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    return crud.get_book(db, book_id)


@router.post("/books", response_model=schemas.BookResponse, status_code=201)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db, book)


@router.put("/books/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(get_db)):
    return crud.update_book(db, book_id, book)


@router.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    return crud.delete_book(db, book_id)
