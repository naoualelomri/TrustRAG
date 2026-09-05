from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from app.ingestion.pdf_parser import extract_pages
from app.ingestion.chunker import chunk_pages
from app.retrieval.dense import DenseRetriever


router = APIRouter(
    prefix="/api/documents",
    tags=["documents"]
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
dense_retriever = DenseRetriever()

@router.post("")
async def upload_document(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    filename = Path(file.filename).name

    file_path = UPLOAD_DIR / filename

    content = await file.read()

    file_path.write_bytes(content)
    pages = extract_pages(str(file_path))
    if not pages:
        file_path.unlink(missing_ok=True)

        raise HTTPException(
              status_code=422,
              detail="No extractable text was found in the PDF."
         )

    chunks = chunk_pages(
        pages=pages,
        document_name=filename
    )
    
    if not chunks:
        file_path.unlink(missing_ok=True)

        raise HTTPException(
           status_code=422,
           detail="The PDF could not be converted into searchable chunks."
        )

    dense_retriever.index_chunks(chunks)

    return {
        "filename": filename,
        "status": "indexed",
        "pages_extracted": len(pages),
        "chunks_created": len(chunks)
    }

@router.get("")
def get_documents():

    chunks = dense_retriever.get_all_chunks()

    documents = {}

    for chunk in chunks:
        document_name = chunk["document"]

        if document_name not in documents:
            documents[document_name] = {
                "name": document_name,
                "status": "indexed",
                "chunks": 0
            }

        documents[document_name]["chunks"] += 1

    return {
        "documents": list(documents.values())
    }