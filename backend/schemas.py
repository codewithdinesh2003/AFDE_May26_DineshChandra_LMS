from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Book schemas ──────────────────────────────────────────────────────────────

class BookBase(BaseModel):
    title: str
    author: str
    category: str
    isbn: str
    availability_status: Optional[str] = "available"


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    isbn: Optional[str] = None
    availability_status: Optional[str] = None


class BookResponse(BookBase):
    book_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Borrower schemas ──────────────────────────────────────────────────────────

class BorrowerBase(BaseModel):
    borrower_name: str
    email: str
    phone: str


class BorrowerCreate(BorrowerBase):
    pass


class BorrowerUpdate(BaseModel):
    borrower_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class BorrowerResponse(BorrowerBase):
    borrower_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Transaction schemas ───────────────────────────────────────────────────────

class BookInTransaction(BaseModel):
    book_id: int
    title: str

    model_config = {"from_attributes": True}


class BorrowerInTransaction(BaseModel):
    borrower_id: int
    borrower_name: str

    model_config = {"from_attributes": True}


class TransactionResponse(BaseModel):
    transaction_id: int
    book_id: int
    borrower_id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None
    status: str
    book: Optional[BookInTransaction] = None
    borrower: Optional[BorrowerInTransaction] = None

    model_config = {"from_attributes": True}


class BorrowRequest(BaseModel):
    book_id: int
    borrower_id: int


class ReturnRequest(BaseModel):
    transaction_id: int


# ── Dashboard schemas ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_books: int
    available_books: int
    borrowed_books: int
    total_borrowers: int
    total_transactions: int
