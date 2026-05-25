from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    isbn = Column(String(50), unique=True, nullable=False)
    availability_status = Column(Enum("available", "borrowed"), default="available")
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="book")


class Borrower(Base):
    __tablename__ = "borrowers"

    borrower_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    borrower_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="borrower")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    borrower_id = Column(Integer, ForeignKey("borrowers.borrower_id"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    status = Column(Enum("borrowed", "returned"), default="borrowed")

    book = relationship("Book", back_populates="transactions")
    borrower = relationship("Borrower", back_populates="transactions")


class BookAnalytics(Base):
    __tablename__ = "book_analytics"

    analytics_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    total_borrows = Column(Integer, default=0)
    total_returns = Column(Integer, default=0)
    avg_borrow_days = Column(Float, default=0)
    last_borrowed = Column(DateTime, nullable=True)

    book = relationship("Book")


class MonthlyTrend(Base):
    __tablename__ = "monthly_trends"

    trend_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    total_borrows = Column(Integer, default=0)
    total_returns = Column(Integer, default=0)
    unique_borrowers = Column(Integer, default=0)
    unique_books = Column(Integer, default=0)


class OverdueAnalytics(Base):
    __tablename__ = "overdue_analytics"

    overdue_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transactions.transaction_id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    borrower_id = Column(Integer, ForeignKey("borrowers.borrower_id"), nullable=False)
    borrow_date = Column(DateTime, nullable=False)
    days_overdue = Column(Integer, default=0)
    status = Column(String(50), default="overdue")

    book = relationship("Book")
    borrower = relationship("Borrower")
