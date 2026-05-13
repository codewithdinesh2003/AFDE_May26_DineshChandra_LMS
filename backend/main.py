from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import books, borrowers, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Library Management System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(borrowers.router)
app.include_router(transactions.router)


@app.get("/")
def root():
    return {"message": "Library Management System API", "version": "1.0.0"}
