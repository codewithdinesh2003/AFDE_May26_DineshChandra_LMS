from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from fastapi import HTTPException
import models
import schemas


# ── Books ─────────────────────────────────────────────────────────────────────

def get_books(db: Session):
    return db.query(models.Book).all()


def get_book(db: Session, book_id: int):
    book = db.query(models.Book).filter(models.Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


def update_book(db: Session, book_id: int, book: schemas.BookUpdate):
    db_book = get_book(db, book_id)
    for field, value in book.model_dump(exclude_unset=True).items():
        setattr(db_book, field, value)
    db.commit()
    db.refresh(db_book)
    return db_book


def delete_book(db: Session, book_id: int):
    db_book = get_book(db, book_id)
    if db_book.availability_status == "borrowed":
        raise HTTPException(status_code=400, detail="Cannot delete a book that is currently borrowed")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted successfully"}


def search_books(db: Session, query: str):
    return db.query(models.Book).filter(
        or_(
            models.Book.title.like(f"%{query}%"),
            models.Book.author.like(f"%{query}%"),
            models.Book.category.like(f"%{query}%"),
        )
    ).all()


# ── Borrowers ─────────────────────────────────────────────────────────────────

def get_borrowers(db: Session):
    return db.query(models.Borrower).all()


def get_borrower(db: Session, borrower_id: int):
    borrower = db.query(models.Borrower).filter(models.Borrower.borrower_id == borrower_id).first()
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")
    return borrower


def create_borrower(db: Session, borrower: schemas.BorrowerCreate):
    db_borrower = models.Borrower(**borrower.model_dump())
    db.add(db_borrower)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def update_borrower(db: Session, borrower_id: int, borrower: schemas.BorrowerUpdate):
    db_borrower = get_borrower(db, borrower_id)
    for field, value in borrower.model_dump(exclude_unset=True).items():
        setattr(db_borrower, field, value)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def delete_borrower(db: Session, borrower_id: int):
    db_borrower = get_borrower(db, borrower_id)
    db.delete(db_borrower)
    db.commit()
    return {"message": "Borrower deleted successfully"}


# ── Transactions ──────────────────────────────────────────────────────────────

def get_transactions(db: Session):
    return db.query(models.Transaction).all()


def borrow_book(db: Session, request: schemas.BorrowRequest):
    book = db.query(models.Book).filter(models.Book.book_id == request.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.availability_status != "available":
        raise HTTPException(status_code=400, detail="Book is not available for borrowing")

    borrower = db.query(models.Borrower).filter(models.Borrower.borrower_id == request.borrower_id).first()
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    transaction = models.Transaction(
        book_id=request.book_id,
        borrower_id=request.borrower_id,
        borrow_date=datetime.utcnow(),
        status="borrowed",
    )
    db.add(transaction)

    book.availability_status = "borrowed"
    db.commit()
    db.refresh(transaction)
    return transaction


def return_book(db: Session, request: schemas.ReturnRequest):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == request.transaction_id,
        models.Transaction.status == "borrowed",
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Active transaction not found")

    transaction.return_date = datetime.utcnow()
    transaction.status = "returned"

    book = db.query(models.Book).filter(models.Book.book_id == transaction.book_id).first()
    if book:
        book.availability_status = "available"

    db.commit()
    db.refresh(transaction)
    return transaction


def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
    total_books = db.query(models.Book).count()
    available_books = db.query(models.Book).filter(models.Book.availability_status == "available").count()
    borrowed_books = db.query(models.Book).filter(models.Book.availability_status == "borrowed").count()
    total_borrowers = db.query(models.Borrower).count()
    total_transactions = db.query(models.Transaction).count()

    return schemas.DashboardStats(
        total_books=total_books,
        available_books=available_books,
        borrowed_books=borrowed_books,
        total_borrowers=total_borrowers,
        total_transactions=total_transactions,
    )
