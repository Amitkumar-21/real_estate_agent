from fastapi import FastAPI
from app.routers.chat import router as chat_router

app = FastAPI(title="Real Estate AI Agent",version="1.0.0")

app.include_router(chat_router)


@app.get("/")
def home():
    return {"message": "Backend is Running "}