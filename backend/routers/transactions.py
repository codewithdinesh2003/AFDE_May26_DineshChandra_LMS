from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud
import schemas
from database import get_db

router = APIRouter(tags=["Transactions"])


@router.get("/transactions", response_model=List[schemas.TransactionResponse])
def get_all_transactions(db: Session = Depends(get_db)):
    return crud.get_transactions(db)


@router.post("/borrow", response_model=schemas.TransactionResponse, status_code=201)
def borrow_book(request: schemas.BorrowRequest, db: Session = Depends(get_db)):
    return crud.borrow_book(db, request)


@router.post("/return", response_model=schemas.TransactionResponse)
def return_book(request: schemas.ReturnRequest, db: Session = Depends(get_db)):
    return crud.return_book(db, request)


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


@router.get("/search", response_model=List[schemas.BookResponse])
def search_books(q: str, db: Session = Depends(get_db)):
    return crud.search_books(db, q)
