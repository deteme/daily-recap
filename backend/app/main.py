from fastapi import FastAPI

app = FastAPI(title="DailyRecap API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API DailyRecap"}

@app.get("/health")
def health_check():
    return {"status": "ok"}