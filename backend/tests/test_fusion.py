from app.retrieval.fusion import reciprocal_rank_fusion


def test_rrf_prioritizes_chunk_present_in_both_rankings():
    dense_results = [
        {
            "chunk_id": "chunk_a",
            "text": "A",
            "document": "test.pdf",
            "page": 1,
            "rank": 1
        },
        {
            "chunk_id": "chunk_b",
            "text": "B",
            "document": "test.pdf",
            "page": 2,
            "rank": 2
        }
    ]

    bm25_results = [
        {
            "chunk_id": "chunk_b",
            "text": "B",
            "document": "test.pdf",
            "page": 2,
            "rank": 1
        },
        {
            "chunk_id": "chunk_c",
            "text": "C",
            "document": "test.pdf",
            "page": 3,
            "rank": 2
        }
    ]

    results = reciprocal_rank_fusion(
        rankings=[
            dense_results,
            bm25_results
        ],
        top_k=3
    )

    assert results[0]["chunk_id"] == "chunk_b"