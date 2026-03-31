from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.api.endpoints import organizations, search, export_import
from app.db.database import Base, engine

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="組織電話簿系統")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(export_import.router, tags=["export/import"])

@app.get("/")
def root():
    return {"message": "組織電話簿系統 API"}
