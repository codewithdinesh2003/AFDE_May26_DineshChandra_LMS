import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pandas as pd
from sqlalchemy import text
from database import engine

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dataset")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "library_dataset.xlsx")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

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
                ORDER BY t.transaction_id
            """),
            conn,
        )

    with pd.ExcelWriter(OUTPUT_FILE, engine="openpyxl") as writer:
        books_df.to_excel(writer, sheet_name="Books", index=False)
        borrowers_df.to_excel(writer, sheet_name="Borrowers", index=False)
        transactions_df.to_excel(writer, sheet_name="Transactions", index=False)

    print(f"Dataset exported to dataset/library_dataset.xlsx")


if __name__ == "__main__":
    main()
