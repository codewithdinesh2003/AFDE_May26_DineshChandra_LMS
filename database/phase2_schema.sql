USE library_db;

-- Analytics table: aggregated borrowing stats per book
CREATE TABLE IF NOT EXISTS book_analytics (
    analytics_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    total_borrows INT DEFAULT 0,
    total_returns INT DEFAULT 0,
    avg_borrow_days FLOAT DEFAULT 0,
    last_borrowed DATETIME NULL,
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

-- Analytics table: monthly trends
CREATE TABLE IF NOT EXISTS monthly_trends (
    trend_id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    total_borrows INT DEFAULT 0,
    total_returns INT DEFAULT 0,
    unique_borrowers INT DEFAULT 0,
    unique_books INT DEFAULT 0
);

-- Analytics table: overdue tracking
CREATE TABLE IF NOT EXISTS overdue_analytics (
    overdue_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    book_id INT NOT NULL,
    borrower_id INT NOT NULL,
    borrow_date DATETIME NOT NULL,
    days_overdue INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'overdue',
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id)
);
