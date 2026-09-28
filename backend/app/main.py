import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database.db import init_db
from app.api.routes.auth import router as auth_router
from app.api.routes.learning import router as learning_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.admin import router as admin_router
from app.core.config import get_allowed_config

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database and verify configuration on startup."""
    print("[Startup] Initializing SQLite database schema...")
    await init_db()
    cfg = get_allowed_config()
    print(f"[Startup] Configuration loaded: {len(cfg.get('allowed_users', []))} allowed users.")
    yield
    print("[Shutdown] Application shutdown completed.")

app = FastAPI(
    title="LinguaSphere AI Platform",
    description="Multilingual AI-Powered Language Learning Platform for private authorized learners",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vercel, localhost, and all frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes with /api prefix AND without prefix to avoid any 404 Not Found errors
app.include_router(auth_router, prefix="/api")
app.include_router(learning_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

app.include_router(auth_router)
app.include_router(learning_router)
app.include_router(dashboard_router)
app.include_router(admin_router)

@app.get("/health")
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "ok", "service": "LinguaSphere AI Backend", "version": "1.0.0"}

@app.get("/api")
def api_root():
    return {
        "name": "LinguaSphere AI API",
        "status": "online",
        "docs_url": "/docs"
    }

# Check if built frontend static assets exist locally
FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend",
    "dist"
)

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi") or full_path.startswith("auth") or full_path.startswith("learning"):
            return None
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
