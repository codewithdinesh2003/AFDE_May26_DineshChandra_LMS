from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud
import schemas
from database import get_db

router = APIRouter(tags=["Borrowers"])


@router.get("/borrowers", response_model=List[schemas.BorrowerResponse])
def get_all_borrowers(db: Session = Depends(get_db)):
    return crud.get_borrowers(db)


@router.get("/borrowers/{borrower_id}", response_model=schemas.BorrowerResponse)
def get_borrower(borrower_id: int, db: Session = Depends(get_db)):
    return crud.get_borrower(db, borrower_id)


@router.post("/borrowers", response_model=schemas.BorrowerResponse, status_code=201)
def create_borrower(borrower: schemas.BorrowerCreate, db: Session = Depends(get_db)):
    return crud.create_borrower(db, borrower)


@router.put("/borrowers/{borrower_id}", response_model=schemas.BorrowerResponse)
def update_borrower(borrower_id: int, borrower: schemas.BorrowerUpdate, db: Session = Depends(get_db)):
    return crud.update_borrower(db, borrower_id, borrower)


@router.delete("/borrowers/{borrower_id}")
def delete_borrower(borrower_id: int, db: Session = Depends(get_db)):
    return crud.delete_borrower(db, borrower_id)
