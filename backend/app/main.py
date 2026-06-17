from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routers import trades, journal, entry_models, dashboard, mt5_sync, rules

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trading Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(trades.router)
app.include_router(journal.router)
app.include_router(entry_models.router)
app.include_router(dashboard.router)
app.include_router(mt5_sync.router)
app.include_router(rules.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
