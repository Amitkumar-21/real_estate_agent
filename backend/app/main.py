from fastapi import FastAPI
from app.routers.chat import router as chat_router
from app.routers.extractor import router as extractor_router
from app.db.init_db import init_db
from app.routers.summary import router as summary_router
from fastapi.middleware.cors import CORSMiddleware

init_db()
app = FastAPI(title="Real Estate AI Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(extractor_router)
app.include_router(summary_router)

@app.get("/")
def home():
    return {"message": "Backend is Running "}