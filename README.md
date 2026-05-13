# LibraryOS — Library Management System

A full-stack Library Management System built as a Phase 1 Capstone Project.

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
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # SQLAlchemy engine + session
│   ├── models.py         # ORM models
│   ├── schemas.py        # Pydantic v2 schemas
│   ├── crud.py           # Business logic / DB queries
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   └── transactions.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Axios instance
│   │   ├── services/             # API service modules
│   │   ├── components/
│   │   │   ├── Layout/           # Sidebar, Header, Layout
│   │   │   └── UI/               # StatCard, Table, Modal, Badge, Button
│   │   └── pages/                # Dashboard, Books, Borrowers, Transactions, Search
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
```

---

## Screenshots

> _Add screenshots here after running the application_

---

## Evaluation Criteria

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
