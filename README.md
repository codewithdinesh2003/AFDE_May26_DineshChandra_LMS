# LibraryOS — Library Management System

A full-stack Library Management System with ETL pipeline and analytics dashboard.  
**Phase 1** covers core CRUD operations. **Phase 2** adds an ETL pipeline, aggregated analytics tables, and a live analytics dashboard.

---

## Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | Vite + React 18 + Tailwind CSS v3 + React Router v6  |
| Charts     | Recharts                                             |
| Icons      | Lucide React                                         |
| HTTP       | Axios                                                |
| Backend    | FastAPI + SQLAlchemy + Pydantic v2 + Uvicorn         |
| Database   | MySQL 8+                                             |
| ORM Driver | PyMySQL                                              |
| ETL        | pandas + Faker + openpyxl                            |

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- MySQL 8+

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd library-management-system
```

### 2. Database — run schema

Open MySQL and execute:

```bash
mysql -u root -p < database/schema.sql
```

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Phase 2 — ETL Pipeline & Analytics

### Overview

Phase 2 extends the system with a data pipeline that aggregates raw transaction data into analytics tables, and surfaces the results on a dedicated analytics dashboard.

```
Raw MySQL tables          ETL Pipeline            Analytics tables
─────────────────    ──────────────────────    ────────────────────────
books                │  extract()             │  book_analytics
borrowers      ───►  │  transform()     ───►  │  monthly_trends
transactions         │  load()                │  overdue_analytics
```

### Phase 2 Setup

**Step 1 — Apply analytics schema:**
```bash
# Windows PowerShell
cmd /c "mysql -u root -proot library_db < database/phase2_schema.sql"
```

**Step 2 — Generate seed dataset (50 books, 40 borrowers, 150+ transactions):**
```bash
cd backend
python -m etl.generate_dataset
```

**Step 3 — Export dataset to Excel:**
```bash
python -m etl.export_dataset
# Output: dataset/library_dataset.xlsx  (3 sheets: Books, Borrowers, Transactions)
```

**Step 4 — Run the ETL pipeline:**
```bash
python -m etl.etl_pipeline
```

### ETL Pipeline (`backend/etl/etl_pipeline.py`)

| Stage | What it does |
|-------|-------------|
| **Extract** | Loads books, borrowers, and transactions from MySQL using `pd.read_sql()` |
| **Transform** | Deduplicates, parses dates, calculates borrow duration, flags overdue records (>14 days), aggregates book stats and monthly trends |
| **Load** | Truncates and reloads `book_analytics`, `monthly_trends`, `overdue_analytics` tables |

### Analytics API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/summary | Combined stats: books, borrowers, transactions, overdue count, top book & category |
| GET | /analytics/popular-books | Top 10 most borrowed books with borrow stats |
| GET | /analytics/category-wise | Borrows grouped by book category |
| GET | /analytics/monthly-trends | Month-by-month borrow/return counts with unique borrower/book counts |
| GET | /analytics/overdue | All overdue transactions with borrower and book details |

### Analytics Dashboard (`/analytics`)

Four sections on the analytics page:

- **Summary bar** — 6 stat cards (Total Books, Available, Borrowed, Overdue, Borrowers, Transactions)
- **Monthly Trends** — Recharts AreaChart showing borrows vs returns over time
- **Most Borrowed Books** — Horizontal bar chart of top 10 books
- **Category Distribution** — Pie chart of borrows by category
- **Overdue Table** — Full list of overdue transactions with days overdue and borrower contact

---

## API Endpoints

### Books

| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | /books          | List all books       |
| GET    | /books/{id}     | Get book by ID       |
| POST   | /books          | Create a book        |
| PUT    | /books/{id}     | Update a book        |
| DELETE | /books/{id}     | Delete a book        |

### Borrowers

| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| GET    | /borrowers          | List all borrowers      |
| GET    | /borrowers/{id}     | Get borrower by ID      |
| POST   | /borrowers          | Register a borrower     |
| PUT    | /borrowers/{id}     | Update a borrower       |
| DELETE | /borrowers/{id}     | Delete a borrower       |

### Transactions

| Method | Endpoint            | Description                |
|--------|---------------------|----------------------------|
| GET    | /transactions       | List all transactions      |
| POST   | /borrow             | Borrow a book              |
| POST   | /return             | Return a book              |
| GET    | /dashboard/stats    | Dashboard statistics       |
| GET    | /search?q=query     | Search books               |

---

## Folder Structure

```
library-management-system/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── database.py           # SQLAlchemy engine + session
│   ├── models.py             # ORM models (Phase 1 + Phase 2)
│   ├── schemas.py            # Pydantic v2 schemas (Phase 1 + Phase 2)
│   ├── crud.py               # Business logic / DB queries
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   ├── transactions.py
│   │   └── analytics.py      # Phase 2 — analytics endpoints
│   ├── etl/                  # Phase 2 — ETL pipeline
│   │   ├── generate_dataset.py
│   │   ├── export_dataset.py
│   │   └── etl_pipeline.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Axios instance
│   │   ├── services/
│   │   │   ├── bookService.js
│   │   │   ├── borrowerService.js
│   │   │   ├── transactionService.js
│   │   │   └── analyticsService.js   # Phase 2
│   │   ├── components/
│   │   │   ├── Layout/           # Sidebar, Header, Layout
│   │   │   └── UI/               # StatCard, Table, Modal, Badge, Button
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Books.jsx
│   │       ├── Borrowers.jsx
│   │       ├── Transactions.jsx
│   │       ├── Search.jsx
│   │       └── Analytics.jsx     # Phase 2
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── database/
│   ├── schema.sql            # Phase 1 schema
│   └── phase2_schema.sql     # Phase 2 analytics tables
├── dataset/
│   └── library_dataset.xlsx  # Generated by export_dataset.py
└── README.md
```

---

## Screenshots

-Dashboard 
<img width="1919" height="894" alt="image" src="https://github.com/user-attachments/assets/3c843409-c3b0-4bd3-a344-db7f743939e8" />

-books page 
<img width="1919" height="887" alt="image" src="https://github.com/user-attachments/assets/e02890b2-cbb5-455e-a323-e969bd28e4d3" />

- borrowers page
  <img width="1919" height="895" alt="image" src="https://github.com/user-attachments/assets/7adab9e3-1964-4755-9594-1a3a7290d7bd" />

-transactions page
  <img width="1919" height="885" alt="image" src="https://github.com/user-attachments/assets/f9a6248d-8755-4502-9085-f3a6697f86f7" />

-search and filter page
  <img width="1919" height="894" alt="image" src="https://github.com/user-attachments/assets/96c6122f-9d97-458f-a091-15e514d7db82" />




## Evaluation Criteria

### Phase 1

| Criteria                        | Implementation                                          |
|---------------------------------|---------------------------------------------------------|
| Database design                 | Normalized 3-table schema with FK constraints           |
| RESTful API design              | Full CRUD with proper HTTP methods and status codes     |
| Business logic                  | Availability checks, borrow/return state transitions    |
| Frontend UI/UX                  | Premium SaaS design with Tailwind CSS                   |
| Component architecture          | Reusable UI components (Table, Modal, Badge, etc.)      |
| Data visualization              | Recharts AreaChart + PieChart on Dashboard              |
| Form validation                 | Client-side inline validation on all forms              |
| Error handling                  | Toast notifications + API error boundaries              |
| Loading states                  | Skeleton loaders on all data-fetching views             |
| Search                          | Debounced live search with card-grid results            |

### Phase 2

| Criteria                        | Implementation                                                        |
|---------------------------------|-----------------------------------------------------------------------|
| ETL Extract                     | `pd.read_sql()` loads all 3 tables with JOIN for denormalized view    |
| ETL Transform                   | Dedup, date parsing, duration calc, overdue flagging, aggregations    |
| ETL Load                        | Truncate + `df.to_sql()` into 3 analytics tables                      |
| Seed dataset                    | Faker generates 50 books, 40 borrowers, 150+ realistic transactions   |
| Excel export                    | openpyxl writes 3-sheet workbook to `dataset/library_dataset.xlsx`    |
| Analytics schema                | 3 new tables: `book_analytics`, `monthly_trends`, `overdue_analytics` |
| Analytics APIs                  | 5 endpoints under `/analytics` prefix                                 |
| Analytics dashboard             | 4-section page: summary, trends, popular books, overdue table         |
| Charts                          | AreaChart (trends), HorizontalBarChart (books), PieChart (categories) |
| Overdue detection               | Transactions with status=borrowed older than 14 days flagged as overdue|
