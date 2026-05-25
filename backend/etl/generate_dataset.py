import os
import sys
import random
from datetime import datetime, timedelta

# Allow running as `python -m etl.generate_dataset` from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from faker import Faker
from sqlalchemy import text
from database import engine

fake = Faker()
random.seed(42)
Faker.seed(42)

CATEGORIES = [
    "Fiction", "Science", "Technology", "History",
    "Mathematics", "Literature", "Philosophy", "Business",
]

BOOK_TEMPLATES = {
    "Fiction":      lambda: (fake.catch_phrase() + ": A Novel", fake.name()),
    "Science":      lambda: ("The Science of " + fake.word().capitalize(), fake.name()),
    "Technology":   lambda: (fake.bs().capitalize(), fake.name()),
    "History":      lambda: ("A History of " + fake.country(), fake.name()),
    "Mathematics":  lambda: ("Principles of " + fake.word().capitalize() + " Mathematics", fake.name()),
    "Literature":   lambda: (fake.sentence(nb_words=4).rstrip("."), fake.name()),
    "Philosophy":   lambda: ("The Philosophy of " + fake.word().capitalize(), fake.name()),
    "Business":     lambda: (fake.catch_phrase(), fake.name()),
}


def _isbn():
    return fake.isbn13(separator="-")


def generate_books(conn, n=50):
    books = []
    seen_isbns = set()
    for i in range(n):
        category = CATEGORIES[i % len(CATEGORIES)]
        title, author = BOOK_TEMPLATES[category]()
        isbn = _isbn()
        while isbn in seen_isbns:
            isbn = _isbn()
        seen_isbns.add(isbn)
        books.append({
            "title": title[:255],
            "author": author[:255],
            "category": category,
            "isbn": isbn,
            "availability_status": "available",
        })

    conn.execute(
        text("""
            INSERT IGNORE INTO books (title, author, category, isbn, availability_status)
            VALUES (:title, :author, :category, :isbn, :availability_status)
        """),
        books,
    )
    result = conn.execute(text("SELECT book_id FROM books ORDER BY book_id"))
    return [row[0] for row in result.fetchall()]


def generate_borrowers(conn, n=40):
    borrowers = []
    seen_emails = set()
    for _ in range(n):
        email = fake.unique.email()
        while email in seen_emails:
            email = fake.unique.email()
        seen_emails.add(email)
        borrowers.append({
            "borrower_name": fake.name()[:255],
            "email": email[:255],
            "phone": fake.numerify("###-###-####"),
        })

    conn.execute(
        text("""
            INSERT IGNORE INTO borrowers (borrower_name, email, phone)
            VALUES (:borrower_name, :email, :phone)
        """),
        borrowers,
    )
    result = conn.execute(text("SELECT borrower_id FROM borrowers ORDER BY borrower_id"))
    return [row[0] for row in result.fetchall()]


def generate_transactions(conn, book_ids, borrower_ids, n=150):
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    transactions = []

    for _ in range(n):
        book_id = random.choice(book_ids)
        borrower_id = random.choice(borrower_ids)
        days_ago = random.randint(1, 365)
        borrow_date = today - timedelta(days=days_ago)

        if random.random() < 0.70:
            duration = random.randint(3, 30)
            return_date = borrow_date + timedelta(days=duration)
            if return_date > today:
                return_date = today
            status = "returned"
        else:
            return_date = None
            status = "borrowed"

        transactions.append({
            "book_id": book_id,
            "borrower_id": borrower_id,
            "borrow_date": borrow_date,
            "return_date": return_date,
            "status": status,
        })

    conn.execute(
        text("""
            INSERT INTO transactions (book_id, borrower_id, borrow_date, return_date, status)
            VALUES (:book_id, :borrower_id, :borrow_date, :return_date, :status)
        """),
        transactions,
    )


def update_book_availability(conn):
    conn.execute(text("""
        UPDATE books b
        JOIN (
            SELECT t.book_id, t.status
            FROM transactions t
            INNER JOIN (
                SELECT book_id, MAX(transaction_id) AS max_tid
                FROM transactions
                GROUP BY book_id
            ) latest ON t.book_id = latest.book_id AND t.transaction_id = latest.max_tid
        ) latest_tx ON b.book_id = latest_tx.book_id
        SET b.availability_status = CASE
            WHEN latest_tx.status = 'borrowed' THEN 'borrowed'
            ELSE 'available'
        END
    """))


def main():
    with engine.begin() as conn:
        book_ids = generate_books(conn)
        borrower_ids = generate_borrowers(conn)
        generate_transactions(conn, book_ids, borrower_ids, n=150)
        update_book_availability(conn)

        book_count = conn.execute(text("SELECT COUNT(*) FROM books")).scalar()
        borrower_count = conn.execute(text("SELECT COUNT(*) FROM borrowers")).scalar()
        tx_count = conn.execute(text("SELECT COUNT(*) FROM transactions")).scalar()

    print(f"Generated {book_count} books, {borrower_count} borrowers, {tx_count} transactions")


if __name__ == "__main__":
    main()
