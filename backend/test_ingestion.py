from app.ingestion.pdf_parser import extract_pages
from app.ingestion.chunker import chunk_pages
from app.retrieval.dense import DenseRetriever
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.fusion import reciprocal_rank_fusion
from app.retrieval.reranker import CrossEncoderReranker
from app.generation.generator import AnswerGenerator
from app.generation.verifier import CitationVerifier
pdf_path = "../sample_documents/test.pdf"

pages = extract_pages(pdf_path)

chunks = chunk_pages(
    pages=pages,
    document_name="test.pdf"
)

bm25_retriever = BM25Retriever()
retriever = DenseRetriever()
retriever.index_chunks(chunks)
bm25_retriever.index_chunks(chunks)

question = "team collaboration"
dense_results = retriever.search(
    question,
    top_k=10
)

bm25_results = bm25_retriever.search(
    question,
    top_k=10
)
hybrid_results = reciprocal_rank_fusion(
    rankings=[
        dense_results,
        bm25_results
    ],
    top_k=10
)
reranker = CrossEncoderReranker()

final_results = reranker.rerank(
    question=question,
    candidates=hybrid_results,
    top_k=4
)

generator = AnswerGenerator()

response = generator.generate(
    question=question,
    contexts=final_results
)



verifier = CitationVerifier()

verification = verifier.verify(
    answer=response["answer"],
    contexts=final_results
)

print("\n")
print("=" * 50)
print("VERIFICATION")
print("=" * 50)

print("Overall status:", verification["status"])

print(
    "Supported:",
    verification["supported_claims"],
    "/",
    verification["total_claims"]
)
for claim in verification["claims"]:

    print("\n------------------------------")

    print("Claim:", claim["claim"])
    print("Status:", claim["status"])
    print("Sources:", claim["source_ids"])
    print("Reason:", claim["reason"])
