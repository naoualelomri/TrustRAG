def reciprocal_rank_fusion( rankings: list[list[dict]], k: int = 60, top_k: int = 20) -> list[dict]:

    fused = {}

    for ranking in rankings:

        for result in ranking:

            chunk_id = result["chunk_id"]
            rank = result["rank"]

            rrf_score = 1 / (k + rank)

            if chunk_id not in fused:
                fused[chunk_id] = {
                    "chunk_id": chunk_id,
                    "text": result["text"],
                    "document": result["document"],
                    "page": result["page"],
                    "rrf_score": 0.0
                }

            fused[chunk_id]["rrf_score"] += rrf_score

    fused_results = sorted(
        fused.values(),
        key=lambda item: item["rrf_score"],
        reverse=True
    )

    return fused_results[:top_k]