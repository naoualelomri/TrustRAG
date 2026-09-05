from app.ingestion.chunker import chunk_pages


def test_chunk_pages_creates_chunks_with_metadata():
    pages = [
        {
            "page": 1,
            "text": "one two three four five six"
        }
    ]

    chunks = chunk_pages(
        pages=pages,
        document_name="test.pdf",
        chunk_size=4,
        overlap=1
    )

    assert len(chunks) == 2

    assert chunks[0]["document"] == "test.pdf"
    assert chunks[0]["page"] == 1
    assert chunks[0]["chunk_id"] == "test.pdf_chunk_0"

    assert chunks[0]["text"] == "one two three four"