from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import engine, Base
from app.routers import trades, journal, entry_models, dashboard, mt5_sync, rules, edge, news, accounts

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
app.include_router(edge.router)
app.include_router(news.router)
app.include_router(accounts.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}


STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="frontend-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
