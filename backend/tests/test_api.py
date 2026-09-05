from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok"
    }


def test_query_rejects_blank_question():
    response = client.post(
        "/api/query",
        json={
            "question": "   "
        }
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Question cannot be empty."
    )


def test_upload_rejects_non_pdf_file():
    response = client.post(
        "/api/documents",
        files={
            "file": (
                "notes.txt",
                b"Hello TrustRAG",
                "text/plain"
            )
        }
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Only PDF files are supported."
    )