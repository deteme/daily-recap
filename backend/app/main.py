from fastapi import FastAPI
from .api import auth, users, projects, members, reports, autocomplete, dashboard    # Import des routers
from .core.database import engine
from .models import Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DailyRecap API", 
    version="0.1.0",
    description="API pour l'application de rapports quotidiens")

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(projects.router, prefix="/api") 
app.include_router(members.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(autocomplete.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API DailyRecap"}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.2.0"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # URLs de ton front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)