# TrustRAG

**Citation-aware Hybrid RAG for trustworthy document question answering.**

TrustRAG is an end-to-end Retrieval-Augmented Generation application that allows users to upload PDF documents, ask questions about their content, and receive answers grounded in retrieved evidence.

Unlike a basic *chat with PDF* application, TrustRAG combines:

- dense semantic retrieval;
- BM25 lexical retrieval;
- Reciprocal Rank Fusion;
- cross-encoder reranking;
- citation-aware generation;
- post-generation grounding verification.

The goal is not only to generate an answer, but also to make the answer **traceable to its supporting evidence**.

---

## Why TrustRAG?

Large Language Models can generate fluent answers even when the available evidence is incomplete or insufficient.

TrustRAG was built around a simple question:

> **Can document question answering be made more traceable and trustworthy?**

Instead of directly sending document content to an LLM, TrustRAG builds a retrieval pipeline that selects relevant evidence before generation and then verifies the generated claims against that evidence.

The application therefore performs four major tasks:

1. retrieve relevant document chunks;
2. improve retrieval quality through hybrid search and reranking;
3. generate an answer with explicit citations;
4. verify whether the generated factual claims are supported by the retrieved evidence.

---

# Features

## PDF ingestion

TrustRAG supports document ingestion through a FastAPI endpoint.

The ingestion pipeline performs:

- PDF upload;
- text extraction with PyMuPDF;
- page-aware chunking;
- configurable chunk overlap;
- metadata preservation;
- embedding generation;
- persistent indexing in ChromaDB.

Each chunk preserves information such as:

```text
document
page
chunk_id
text
```

This metadata is later used for citations and source traceability.

---

## Dense semantic retrieval

TrustRAG uses SentenceTransformers embeddings to represent document chunks and user questions as vectors.

The embedding model used is:

```text
all-MiniLM-L6-v2
```

The vectors are stored in ChromaDB and used to retrieve semantically similar document chunks.

Dense retrieval is particularly useful when the question and the relevant document passage use different wording but express similar meaning.

---

## BM25 lexical retrieval

Dense search alone may miss exact identifiers, acronyms, technical terms or rare keywords.

TrustRAG therefore also uses BM25 lexical retrieval through:

```text
BM25Okapi
```

BM25 ranks document chunks according to lexical relevance between the query and the indexed text.

---

## Hybrid retrieval with Reciprocal Rank Fusion

Dense retrieval and BM25 produce different rankings and use scores that are not directly comparable.

TrustRAG combines both rankings using **Reciprocal Rank Fusion (RRF)**.

Conceptually:

```text
Dense Ranking ─────┐
                   │
                   ├── Reciprocal Rank Fusion
                   │
BM25 Ranking ──────┘
                           │
                           ▼
                   Hybrid Candidates
```

RRF combines ranking positions instead of raw similarity scores, avoiding manual score normalization between dense and lexical retrieval.

---

## Cross-encoder reranking

Hybrid retrieval prioritizes recall and produces a candidate set.

TrustRAG then reranks these candidates using:

```text
cross-encoder/ms-marco-MiniLM-L-6-v2
```

Unlike embedding-based retrieval, the cross-encoder evaluates the:

```text
question + candidate chunk
```

pair jointly.

This is more computationally expensive, so it is applied only to a small candidate set produced by hybrid retrieval.

The highest-ranked chunks become the final evidence used for generation.

---

## Citation-aware answer generation

The final evidence chunks are assigned explicit source identifiers:

```text
[S1]
[S2]
[S3]
...
```

They are then sent to the LLM together with instructions to:

- answer only from the provided evidence;
- avoid unsupported outside knowledge;
- cite factual statements using source IDs;
- clearly state when evidence is insufficient.

Generation is performed through the **Groq API** using an OpenAI-compatible client.

The model is configurable through:

```env
GROQ_MODEL
```

---

## Grounding verification

Citations alone do not guarantee that a generated statement is actually supported by the cited evidence.

TrustRAG therefore performs a second LLM-based verification step after generation.

The verifier:

1. decomposes the generated answer into factual claims;
2. compares each claim against the retrieved evidence;
3. associates supporting source IDs;
4. classifies each claim.

Possible statuses are:

```text
SUPPORTED
PARTIALLY_SUPPORTED
UNSUPPORTED
```

If verification cannot be completed, the application uses:

```text
ERROR
```

without discarding an otherwise successfully generated answer.

The frontend displays:

- global grounding status;
- supported claims / total claims;
- claim-level verification;
- explanation for each claim;
- supporting source IDs.

---

# RAG Pipeline

```text
                         User Question
                              │
                              ▼
                    ┌──────────────────┐
                    │  FastAPI Backend │
                    └────────┬─────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        Dense Vector Search         BM25 Search
                 │                       │
                 └───────────┬───────────┘
                             │
                             ▼
                Reciprocal Rank Fusion
                             │
                             ▼
                  Hybrid Candidate Set
                             │
                             ▼
                  Cross-Encoder Reranker
                             │
                             ▼
                       Top Evidence
                             │
                             ▼
                         Groq LLM
                             │
                             ▼
                  Answer + Citations
                             │
                             ▼
                Grounding Verification
                             │
                             ▼
            Answer + Sources + Verification
```

---

# Application Architecture

```text
                           Browser
                              │
                              ▼
                    http://localhost:5173
                              │
                              ▼
                ┌────────────────────────┐
                │   Frontend Container   │
                │                        │
                │ React + Vite build     │
                │ Nginx                  │
                └────────────┬───────────┘
                             │
                             │ REST API
                             ▼
                    http://localhost:8000
                             │
                             ▼
                ┌────────────────────────┐
                │    Backend Container   │
                │                        │
                │ FastAPI                │
                │ PyTorch CPU            │
                │ SentenceTransformers   │
                │ ChromaDB               │
                │ BM25                   │
                │ RRF                    │
                │ CrossEncoder           │
                └────────────┬───────────┘
                             │
                 ┌───────────┼─────────────┐
                 │           │             │
                 ▼           ▼             ▼
              uploads    ChromaDB     Hugging Face
              volume      volume          cache
                                             │
                                             │
                             ┌───────────────┘
                             │
                             ▼
                          Groq API
```

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- JavaScript
- Nginx

## Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- PyMuPDF

## Retrieval

- SentenceTransformers
- ChromaDB
- BM25Okapi
- Reciprocal Rank Fusion
- CrossEncoder

## LLM

- Groq API
- OpenAI-compatible Python SDK

## Infrastructure

- Docker
- Docker Compose
- Nginx
- CPU-only PyTorch
- Persistent volumes

## Testing

- Pytest
- FastAPI TestClient
- HTTPX

---

# Project Structure

```text
trustrag/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── documents.py
│   │   │   └── query.py
│   │   │
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── pdf_parser.py
│   │   │   └── chunker.py
│   │   │
│   │   ├── retrieval/
│   │   │   ├── __init__.py
│   │   │   ├── dense.py
│   │   │   ├── bm25.py
│   │   │   ├── fusion.py
│   │   │   └── reranker.py
│   │   │
│   │   ├── generation/
│   │   │   ├── __init__.py
│   │   │   ├── generator.py
│   │   │   └── verifier.py
│   │   │
│   │   └── main.py
│   │
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_chunker.py
│   │   └── test_fusion.py
│   │
│   ├── uploads/
│   ├── chroma_db/
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnswerCard.jsx
│   │   │   ├── DocumentPanel.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── QuestionInput.jsx
│   │   │   ├── SourcesList.jsx
│   │   │   └── VerificationPanel.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   └── App.jsx
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── docs/
├── evaluation/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# Running TrustRAG with Docker

Docker Compose is the recommended way to run the application.

## Prerequisites

Make sure you have:

- Docker Desktop
- Docker Compose
- a Groq API key

---

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd trustrag
```



---

## 2. Configure Groq

Create:

```text
backend/.env
```

with:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

The `.env` file contains secrets and must never be committed to Git.

---

## 3. Start the application

From the project root:

```bash
docker compose up --build
```

Docker Compose will:

- build the backend image;
- build the frontend image;
- create the Docker network;
- start FastAPI;
- start the React/Nginx frontend;
- mount persistent application data;
- create the Hugging Face model cache.

---

## 4. Access the application

### Frontend

```text
http://localhost:5173
```

### FastAPI

```text
http://localhost:8000
```

### Swagger API documentation

```text
http://localhost:8000/docs
```

### Health endpoint

```text
http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## Stop the application

Press:

```text
CTRL + C
```

or run:

```bash
docker compose down
```

Persistent document and ChromaDB data remain available after the containers are recreated.

---

# Docker Architecture

TrustRAG uses two application containers.

## Backend container

The backend image contains:

- Python 3.11;
- FastAPI;
- PyTorch CPU;
- SentenceTransformers;
- ChromaDB;
- BM25;
- RRF;
- CrossEncoder;
- document ingestion logic;
- generation and verification logic.

## Frontend container

The frontend uses a multi-stage Docker build.

### Build stage

```text
Node.js
   │
   ▼
npm ci
   │
   ▼
Vite build
   │
   ▼
dist/
```

### Runtime stage

Only the built static files are copied into:

```text
Nginx Alpine
```

The final frontend image therefore does not need the complete Node.js development environment.

---

# Persistent Storage

TrustRAG keeps runtime data outside the Docker image.

The Compose configuration mounts:

```text
backend/uploads
```

into:

```text
/app/uploads
```

and:

```text
backend/chroma_db
```

into:

```text
/app/chroma_db
```

This means:

```text
docker compose down
```

can remove the containers without deleting indexed documents.

When the application starts again, the same ChromaDB index is available.

---

# Hugging Face Model Cache

TrustRAG uses local SentenceTransformer and CrossEncoder models.

Docker Compose creates a dedicated named volume for:

```text
/root/.cache/huggingface
```

This prevents the models from being unnecessarily downloaded every time the backend container is recreated.

---

# Docker Optimization

Machine learning dependencies can make Docker images significantly larger.

TrustRAG therefore applies several optimizations.

## Slim Python base image

The backend uses:

```dockerfile
FROM python:3.11-slim
```

instead of a complete Python image.

---

## CPU-only PyTorch

TrustRAG uses lightweight MiniLM models for local embeddings and reranking.

GPU acceleration is unnecessary for this prototype.

The Docker image therefore installs **CPU-only PyTorch**, avoiding unnecessary CUDA and NVIDIA dependencies.

The larger language model used for answer generation runs remotely through Groq.

Conceptually:

```text
Local container
├── embeddings          → CPU
├── reranker            → CPU
└── generation          → Groq API
```

---

## Pip cache disabled

Dependencies are installed using:

```text
--no-cache-dir
```

to avoid storing unnecessary package installation archives inside Docker layers.

---

## Docker layer caching

`requirements.txt` is copied before the application source code.

This allows Docker to reuse the dependency installation layer when the Python code changes without modifying dependencies.

The frontend applies the same principle with:

```text
package.json
package-lock.json
```

before copying React source files.

---

# API Endpoints

## Health

```http
GET /health
```

Checks whether the FastAPI application is running.

---

## List indexed documents

```http
GET /api/documents
```

Returns documents currently indexed in ChromaDB.

---

## Upload document

```http
POST /api/documents
```

Accepts PDF files.

The backend performs:

```text
PDF
 ↓
text extraction
 ↓
chunking
 ↓
embeddings
 ↓
ChromaDB indexing
```

---

## Query documents

```http
POST /api/query
```

Example request:

```json
{
  "question": "What does the document say about access control?"
}
```

The endpoint performs:

```text
question
   │
   ├──────────────┐
   ▼              ▼
Dense           BM25
   │              │
   └──────┬───────┘
          ▼
         RRF
          ▼
     CrossEncoder
          ▼
      Top Evidence
          ▼
         Groq
          ▼
 Answer + Citations
          ▼
      Verification
```

Example response structure:

```json
{
  "question": "What is git?",
  "answer": "The document states ... [S1]",
  "sources": [
    {
      "source_id": "S1",
      "document": "test.pdf",
      "page": 4,
      "chunk_id": "test.pdf_chunk_8"
    }
  ],
  "verification": {
    "status": "SUPPORTED",
    "supported_claims": 1,
    "total_claims": 1,
    "claims": []
  }
}
```

---

# Error Handling

TrustRAG validates both user input and external service failures.

Handled scenarios include:

- unsupported file formats;
- PDFs with no extractable text;
- PDFs that cannot produce searchable chunks;
- empty questions;
- queries without indexed documents;
- unavailable answer generation service;
- grounding verification failures.

Generation failures return an appropriate API error.

Verification failures use graceful degradation:

```text
answer                ✅ preserved
sources               ✅ preserved
verification.status   ERROR
```

This prevents a secondary verification failure from discarding an otherwise valid generated response.

---

# Testing

The backend contains deterministic unit and API tests.

Run them from:

```bash
cd backend
pytest
```

---

## Unit tests

The test suite validates important deterministic RAG logic.

### Chunking

Tests verify:

- number of generated chunks;
- overlap behavior;
- page metadata;
- document metadata;
- chunk identifiers.

### Reciprocal Rank Fusion

Tests verify that a chunk appearing strongly across multiple retrieval rankings is correctly prioritized.

---

## API tests

FastAPI endpoints are tested using:

```text
TestClient
```

Current API tests include:

- health endpoint;
- blank question rejection;
- non-PDF upload rejection.

External LLM calls are intentionally excluded from the deterministic test suite to avoid:

- network dependency;
- API quota usage;
- non-deterministic responses.

---

# Frontend

The React interface provides:

- persistent indexed-document listing;
- PDF upload;
- document indexing status;
- question input;
- retrieval/generation loading state;
- generated answer;
- grounding status;
- claim-level verification;
- supporting source cards;
- user-facing error messages.

The frontend is organized into reusable components:

```text
DocumentPanel
QuestionInput
AnswerCard
VerificationPanel
SourcesList
ErrorMessage
```

`App.jsx` acts mainly as an orchestration layer managing application state and communication with the API service.

---

# Engineering Decisions

## Why Hybrid Retrieval?

Dense search and lexical search solve different retrieval problems.

Dense search is strong for:

```text
semantic similarity
paraphrases
conceptual matches
```

BM25 is strong for:

```text
exact terminology
identifiers
acronyms
technical keywords
```

Using both increases retrieval coverage.

---

## Why Reciprocal Rank Fusion?

Dense similarity scores and BM25 scores exist on different scales.

Combining their raw values would require score normalization.

RRF instead combines:

```text
ranking positions
```

making fusion simple and robust.

---

## Why a Cross-Encoder?

Initial retrieval is optimized for efficiently finding candidate evidence.

A CrossEncoder performs a more precise relevance evaluation by processing:

```text
question + document chunk
```

jointly.

Because this is more expensive, reranking is applied only after the candidate set has been reduced.

---

## Why Citation Verification?

Generated citations do not automatically guarantee factual grounding.

A language model may still produce a statement that is not fully supported by the referenced context.

TrustRAG therefore verifies claims after generation and explicitly exposes the verification result to the user.

---

## Why CPU-only PyTorch?

The local models used by TrustRAG are lightweight enough for CPU inference in the scope of this prototype.

Using GPU/CUDA dependencies would significantly increase Docker image size without providing enough value for this use case.

The resource-intensive generation stage is delegated to Groq.

---

## Why persistent volumes?

Documents and vector indexes are application data, not application code.

Embedding them inside Docker images would couple runtime data to the application image.

TrustRAG therefore separates:

```text
Application
→ Docker images

Runtime data
→ persistent volumes / bind mounts
```

---

# Current Limitations

TrustRAG is currently a focused portfolio prototype.

Known limitations include:

- text-based PDF extraction only;
- no OCR support for scanned image-only documents;
- no user authentication;
- no multi-user document isolation;
- no distributed vector database;
- BM25 index is rebuilt from indexed Chroma chunks for the prototype;
- grounding verification depends on an LLM;
- retrieval quality has not yet been formally benchmarked.

These trade-offs were intentionally made to keep the project focused on hybrid retrieval, reranking, traceability and grounding verification.

---

# Evaluation Roadmap

Formal retrieval evaluation is planned as future work.

The intended benchmark compares:

```text
Dense Retrieval
       vs
Dense + BM25 + RRF
       vs
Dense + BM25 + RRF + CrossEncoder
```

Planned metrics include:

### Recall@K

Measures whether relevant chunks appear within the top K retrieved results.

### Mean Reciprocal Rank

Measures how highly the first relevant result appears in the ranking.

No retrieval improvement percentages are claimed until these experiments are completed.

---

# Roadmap

- [x] PDF ingestion
- [x] Text extraction
- [x] Page-aware chunking
- [x] Dense vector retrieval
- [x] ChromaDB persistence
- [x] BM25 lexical retrieval
- [x] Reciprocal Rank Fusion
- [x] Cross-encoder reranking
- [x] Groq-based generation
- [x] Source citations
- [x] Post-generation grounding verification
- [x] React frontend
- [x] FastAPI backend
- [x] Error handling
- [x] Unit tests
- [x] API tests
- [x] Docker backend
- [x] CPU-only PyTorch optimization
- [x] Multi-stage frontend Docker build
- [x] Docker Compose
- [x] Persistent ChromaDB storage
- [x] Persistent document storage
- [x] Persistent Hugging Face cache
- [ ] Retrieval evaluation with Recall@K
- [ ] Mean Reciprocal Rank evaluation
- [ ] Dense vs Hybrid benchmark
- [ ] Hybrid vs Hybrid + Reranking benchmark
- [ ] OCR support for scanned PDFs

---

# Security

Secrets are never embedded into the frontend or Docker images.

The Groq API key is supplied to the backend at runtime through:

```text
backend/.env
```

Example:

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

The `.env` file must be excluded from Git.

Never expose:

```text
GROQ_API_KEY
```

inside React code or a public repository.

---

# Future Improvements

Potential future extensions include:

- OCR support for scanned PDFs;
- configurable retrieval parameters;
- document deletion and re-indexing;
- authentication and multi-user workspaces;
- retrieval evaluation dashboard;
- query history;
- source-text preview;
- improved structured-output verification;
- document collections;
- additional document formats;
- production deployment.

---

# Author

Built as a Software Engineering and AI portfolio project exploring:

- Retrieval-Augmented Generation;
- information retrieval;
- LLM grounding;
- full-stack AI application development;
- API design;
- testing;
- Docker-based application packaging.

---

# License

This project is intended for educational and portfolio purposes.