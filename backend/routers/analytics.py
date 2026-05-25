from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from datetime import datetime
import calendar

from database import get_db
from schemas import (
    PopularBookResponse,
    CategoryWiseResponse,
    MonthlyTrendResponse,
    OverdueResponse,
    AnalyticsSummaryResponse,
)

router = APIRouter(tags=["Analytics"])


@router.get("/popular-books", response_model=List[PopularBookResponse])
def get_popular_books(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            b.book_id, b.title, b.author, b.category,
            ba.total_borrows, ba.total_returns,
            COALESCE(ba.avg_borrow_days, 0) AS avg_borrow_days,
            ba.last_borrowed
        FROM book_analytics ba
        JOIN books b ON ba.book_id = b.book_id
        ORDER BY ba.total_borrows DESC
        LIMIT 10
    """)).fetchall()

    return [
        PopularBookResponse(
            book_id=r.book_id,
            title=r.title,
            author=r.author,
            category=r.category,
            total_borrows=r.total_borrows,
            total_returns=r.total_returns,
            avg_borrow_days=float(r.avg_borrow_days),
            last_borrowed=r.last_borrowed,
        )
        for r in rows
    ]


@router.get("/category-wise", response_model=List[CategoryWiseResponse])
def get_category_wise(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            b.category,
            SUM(ba.total_borrows) AS total_borrows,
            COUNT(DISTINCT b.book_id) AS book_count
        FROM books b
        JOIN book_analytics ba ON b.book_id = ba.book_id
        GROUP BY b.category
        ORDER BY total_borrows DESC
    """)).fetchall()

    return [
        CategoryWiseResponse(
            category=r.category,
            total_borrows=int(r.total_borrows),
            book_count=int(r.book_count),
        )
        for r in rows
    ]


@router.get("/monthly-trends", response_model=List[MonthlyTrendResponse])
def get_monthly_trends(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT year, month, total_borrows, total_returns, unique_borrowers, unique_books
        FROM monthly_trends
        ORDER BY year ASC, month ASC
    """)).fetchall()

    return [
        MonthlyTrendResponse(
            year=r.year,
            month=r.month,
            month_label=f"{calendar.month_abbr[r.month]} {r.year}",
            total_borrows=r.total_borrows,
            total_returns=r.total_returns,
            unique_borrowers=r.unique_borrowers,
            unique_books=r.unique_books,
        )
        for r in rows
    ]


@router.get("/overdue", response_model=List[OverdueResponse])
def get_overdue(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            oa.overdue_id,
            oa.transaction_id,
            b.title AS book_title,
            br.borrower_name,
            br.email AS borrower_email,
            oa.borrow_date,
            oa.days_overdue,
            oa.status
        FROM overdue_analytics oa
        JOIN books b ON oa.book_id = b.book_id
        JOIN borrowers br ON oa.borrower_id = br.borrower_id
        ORDER BY oa.days_overdue DESC
    """)).fetchall()

    return [
        OverdueResponse(
            overdue_id=r.overdue_id,
            transaction_id=r.transaction_id,
            book_title=r.book_title,
            borrower_name=r.borrower_name,
            borrower_email=r.borrower_email,
            borrow_date=r.borrow_date,
            days_overdue=r.days_overdue,
            status=r.status,
        )
        for r in rows
    ]


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    books = db.execute(text("""
        SELECT
            COUNT(*) AS total_books,
            SUM(availability_status = 'available') AS available_books,
            SUM(availability_status = 'borrowed') AS borrowed_books
        FROM books
    """)).fetchone()

    total_borrowers = db.execute(text("SELECT COUNT(*) FROM borrowers")).scalar()
    total_transactions = db.execute(text("SELECT COUNT(*) FROM transactions")).scalar()
    overdue_count = db.execute(text("SELECT COUNT(*) FROM overdue_analytics")).scalar()

    popular = db.execute(text("""
        SELECT b.title FROM book_analytics ba
        JOIN books b ON ba.book_id = b.book_id
        ORDER BY ba.total_borrows DESC
        LIMIT 1
    """)).fetchone()

    top_cat = db.execute(text("""
        SELECT b.category
        FROM books b
        JOIN book_analytics ba ON b.book_id = ba.book_id
        GROUP BY b.category
        ORDER BY SUM(ba.total_borrows) DESC
        LIMIT 1
    """)).fetchone()

    return AnalyticsSummaryResponse(
        total_books=books.total_books,
        available_books=int(books.available_books or 0),
        borrowed_books=int(books.borrowed_books or 0),
        total_borrowers=total_borrowers,
        total_transactions=total_transactions,
        overdue_count=overdue_count,
        most_popular_book=popular.title if popular else None,
        top_category=top_cat.category if top_cat else None,
    )
