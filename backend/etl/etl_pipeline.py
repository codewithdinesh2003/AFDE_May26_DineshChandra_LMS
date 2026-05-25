import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pandas as pd
from sqlalchemy import text
from database import engine


def extract():
    with engine.connect() as conn:
        books_df = pd.read_sql(text("SELECT * FROM books"), conn)
        borrowers_df = pd.read_sql(text("SELECT * FROM borrowers"), conn)
        transactions_df = pd.read_sql(
            text("""
                SELECT
                    t.transaction_id,
                    t.book_id,
                    b.title AS book_title,
                    t.borrower_id,
                    br.borrower_name,
                    t.borrow_date,
                    t.return_date,
                    t.status
                FROM transactions t
                LEFT JOIN books b ON t.book_id = b.book_id
                LEFT JOIN borrowers br ON t.borrower_id = br.borrower_id
            """),
            conn,
        )

    print(f"Extracted: {len(books_df)} books, {len(borrowers_df)} borrowers, {len(transactions_df)} transactions")
    return books_df, borrowers_df, transactions_df


def transform(books_df, borrowers_df, transactions_df):
    df = transactions_df.copy()

    # Drop duplicates
    df = df.drop_duplicates(subset=["transaction_id"])

    # Convert dates
    df["borrow_date"] = pd.to_datetime(df["borrow_date"])
    df["return_date"] = pd.to_datetime(df["return_date"], errors="coerce")

    # Borrow duration for returned transactions
    df["borrow_duration_days"] = (df["return_date"] - df["borrow_date"]).dt.days
    df.loc[df["status"] != "returned", "borrow_duration_days"] = pd.NA

    # Flag overdue: status='borrowed' AND borrow_date older than 14 days
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    cutoff = pd.Timestamp(today) - pd.Timedelta(days=14)
    df["is_overdue"] = (df["status"] == "borrowed") & (df["borrow_date"] < cutoff)
    df["days_overdue"] = (
        (pd.Timestamp(today) - df["borrow_date"]).dt.days - 14
    ).where(df["is_overdue"], other=pd.NA)

    # ── book_analytics ──────────────────────────────────────────────────────
    book_analytics_df = (
        df.groupby("book_id")
        .agg(
            total_borrows=("transaction_id", "count"),
            total_returns=("status", lambda x: (x == "returned").sum()),
            avg_borrow_days=("borrow_duration_days", "mean"),
            last_borrowed=("borrow_date", "max"),
        )
        .reset_index()
    )
    book_analytics_df["avg_borrow_days"] = book_analytics_df["avg_borrow_days"].fillna(0)

    # ── monthly_trends ──────────────────────────────────────────────────────
    df["year"] = df["borrow_date"].dt.year
    df["month"] = df["borrow_date"].dt.month

    monthly_trends_df = (
        df.groupby(["year", "month"])
        .agg(
            total_borrows=("transaction_id", "count"),
            total_returns=("status", lambda x: (x == "returned").sum()),
            unique_borrowers=("borrower_id", "nunique"),
            unique_books=("book_id", "nunique"),
        )
        .reset_index()
        .sort_values(["year", "month"])
    )

    # ── overdue_df ──────────────────────────────────────────────────────────
    overdue_df = df[df["is_overdue"]].copy()
    overdue_df = overdue_df[["transaction_id", "book_id", "borrower_id", "borrow_date", "days_overdue"]].copy()
    overdue_df["status"] = "overdue"
    overdue_df["days_overdue"] = overdue_df["days_overdue"].fillna(0).astype(int)

    print(f"Transformed: {len(book_analytics_df)} book analytics records")
    print(f"Transformed: {len(monthly_trends_df)} monthly trend records")
    print(f"Transformed: {len(overdue_df)} overdue records")

    return book_analytics_df, monthly_trends_df, overdue_df


def load(book_analytics_df, monthly_trends_df, overdue_df):
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM book_analytics"))
        conn.execute(text("DELETE FROM monthly_trends"))
        conn.execute(text("DELETE FROM overdue_analytics"))

    book_analytics_df.to_sql("book_analytics", engine, if_exists="append", index=False)
    monthly_trends_df.to_sql("monthly_trends", engine, if_exists="append", index=False)
    overdue_df.to_sql("overdue_analytics", engine, if_exists="append", index=False)

    print("Loaded analytics data successfully")


if __name__ == "__main__":
    print("Starting ETL Pipeline...")
    books_df, borrowers_df, transactions_df = extract()
    book_analytics_df, monthly_trends_df, overdue_df = transform(books_df, borrowers_df, transactions_df)
    load(book_analytics_df, monthly_trends_df, overdue_df)
    print("ETL Pipeline completed successfully.")
