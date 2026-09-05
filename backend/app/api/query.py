from fastapi import APIRouter ,  HTTPException
from pydantic import BaseModel  , Field

from app.retrieval.dense import DenseRetriever
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.fusion import reciprocal_rank_fusion
from app.retrieval.reranker import CrossEncoderReranker
from app.generation.generator import (AnswerGenerator,AnswerGenerationError)
from app.generation.verifier import CitationVerifier

router = APIRouter(
    prefix="/api/query",
    tags=["query"]
)


class QueryRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=1000
    )
    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
    )





dense_retriever = DenseRetriever()
bm25_retriever = BM25Retriever()
reranker = CrossEncoderReranker()
generator = AnswerGenerator()
verifier = CitationVerifier()

@router.post("")
def query_documents(request: QueryRequest):
    
    question = request.question.strip()
    
    
    
    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )
        
        
    all_chunks = dense_retriever.get_all_chunks()
    
    if not all_chunks:
        raise HTTPException(
           status_code=400,
           detail="No documents are indexed yet. Upload a PDF before asking a question."
        )

    bm25_retriever.index_chunks(all_chunks)

    dense_results = dense_retriever.search(
        question=question,
        top_k=10
    )

    bm25_results = bm25_retriever.search(
        question=question,
        top_k=10
    )
    hybrid_results = reciprocal_rank_fusion(
        rankings=[
           dense_results,
           bm25_results
        ],
        top_k=10
    )
    reranked_results = reranker.rerank(
        question=question,
        candidates=hybrid_results,
        top_k=4
    )
    try :
        generated_response = generator.generate(
                question=question,
                contexts=reranked_results
            )
        
    except AnswerGenerationError:
        raise HTTPException(
            status_code=503,
            detail="Answer generation is temporarily unavailable. Please try again."
        )
    try : 
        verification = verifier.verify(
                answer=generated_response["answer"],
                contexts=reranked_results
            )
            
    except Exception :
        verification={
            "status": "ERROR",
            "supported_claims": 0,
            "total_claims": 0,
            "claims": [],
            "message": "Grounding verification could not be completed."
        }
    return {
    "question": question,
    "answer": generated_response["answer"],
    "sources": generated_response["sources"],
    "verification": verification,
    }