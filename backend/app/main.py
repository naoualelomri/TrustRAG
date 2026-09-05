from fastapi import FastAPI
from app.api.documents import router as documents_router
from app.api.query import router as query_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TrustRAG API",
    description="Hybrid RAG backend with reranking and citation verification",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(documents_router)
app.include_router(query_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}