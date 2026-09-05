import fitz


def extract_pages(pdf_path: str) -> list[dict]:
    document = fitz.open(pdf_path)

    pages = []

    for page_number, page in enumerate(document):
        text = page.get_text("text").strip()

        if not text:
            continue

        pages.append({
            "page": page_number + 1,
            "text": text
        })

    document.close()

    return pages