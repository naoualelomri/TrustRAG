def chunk_pages(
    pages: list[dict],
    document_name: str,
    chunk_size: int = 180,
    overlap: int = 30
) -> list[dict]:

    chunks = []
    chunk_id = 0

    for page in pages:

        words = page["text"].split()

        start = 0

        while start < len(words):

            end = start + chunk_size

            chunk_words = words[start:end]
            chunk_text = " ".join(chunk_words)

            if chunk_text.strip():
                chunks.append({
                    "chunk_id": f"{document_name}_chunk_{chunk_id}",
                    "text": chunk_text,
                    "document": document_name,
                    "page": page["page"]
                })

                chunk_id += 1

            start += chunk_size - overlap

    return chunks