from database import SessionLocal, engine, Base
import models
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)

BOOKS = [
    ("The Great Gatsby", "F. Scott Fitzgerald", "Fiction", "978-0-7432-7356-5"),
    ("To Kill a Mockingbird", "Harper Lee", "Fiction", "978-0-06-112008-4"),
    ("1984", "George Orwell", "Fiction", "978-0-45-228285-3"),
    ("A Brief History of Time", "Stephen Hawking", "Science", "978-0-55-310538-5"),
    ("Sapiens", "Yuval Noah Harari", "History", "978-0-06-231609-7"),
    ("Clean Code", "Robert C. Martin", "Technology", "978-0-13-235088-4"),
    ("The Pragmatic Programmer", "David Thomas", "Technology", "978-0-13-595705-9"),
    ("Educated", "Tara Westover", "Biography", "978-0-39-959050-4"),
    ("Atomic Habits", "James Clear", "Self-Help", "978-0-73-521129-2"),
    ("The Alchemist", "Paulo Coelho", "Fiction", "978-0-06-231500-7"),
    ("Dune", "Frank Herbert", "Science Fiction", "978-0-44-101359-8"),
    ("The Hobbit", "J.R.R. Tolkien", "Fantasy", "978-0-54-792822-7"),
]

BORROWERS = [
    ("Alice Johnson", "alice.johnson@email.com", "+1-555-101-2020"),
    ("Bob Martinez", "bob.martinez@email.com", "+1-555-202-3030"),
    ("Clara Smith", "clara.smith@email.com", "+1-555-303-4040"),
    ("David Lee", "david.lee@email.com", "+1-555-404-5050"),
    ("Eva Brown", "eva.brown@email.com", "+1-555-505-6060"),
]


def seed():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(models.Book).count() > 0:
            print("Database already has data — skipping seed.")
            return

        # Insert books
        book_objs = []
        for title, author, category, isbn in BOOKS:
            b = models.Book(title=title, author=author, category=category,
                            isbn=isbn, availability_status="available")
            db.add(b)
            book_objs.append(b)
        db.flush()

        # Insert borrowers
        borrower_objs = []
        for name, email, phone in BORROWERS:
            br = models.Borrower(borrower_name=name, email=email, phone=phone)
            db.add(br)
            borrower_objs.append(br)
        db.flush()

        # Insert transactions — 3 active borrows, 2 returned
        now = datetime.utcnow()
        transactions = [
            # returned
            models.Transaction(
                book_id=book_objs[0].book_id,
                borrower_id=borrower_objs[0].borrower_id,
                borrow_date=now - timedelta(days=14),
                return_date=now - timedelta(days=7),
                status="returned",
            ),
            models.Transaction(
                book_id=book_objs[4].book_id,
                borrower_id=borrower_objs[1].borrower_id,
                borrow_date=now - timedelta(days=10),
                return_date=now - timedelta(days=3),
                status="returned",
            ),
            # active borrows
            models.Transaction(
                book_id=book_objs[1].book_id,
                borrower_id=borrower_objs[2].borrower_id,
                borrow_date=now - timedelta(days=5),
                status="borrowed",
            ),
            models.Transaction(
                book_id=book_objs[5].book_id,
                borrower_id=borrower_objs[3].borrower_id,
                borrow_date=now - timedelta(days=3),
                status="borrowed",
            ),
            models.Transaction(
                book_id=book_objs[9].book_id,
                borrower_id=borrower_objs[4].borrower_id,
                borrow_date=now - timedelta(days=1),
                status="borrowed",
            ),
        ]

        for tx in transactions:
            db.add(tx)
        db.flush()

        # Mark borrowed books as unavailable
        borrowed_ids = {tx.book_id for tx in transactions if tx.status == "borrowed"}
        for b in book_objs:
            if b.book_id in borrowed_ids:
                b.availability_status = "borrowed"

        db.commit()
        print(f"Seeded: {len(book_objs)} books, {len(borrower_objs)} borrowers, {len(transactions)} transactions.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
