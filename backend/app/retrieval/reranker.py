from sentence_transformers import CrossEncoder


class CrossEncoderReranker:

    def __init__(self):
        self.model = CrossEncoder(
            "cross-encoder/ms-marco-MiniLM-L-6-v2"
        )


    def rerank(
        self,
        question: str,
        candidates: list[dict],
        top_k: int = 4
    ) -> list[dict]:

        if not candidates:
            return []

        pairs = [
            [question, candidate["text"]]
            for candidate in candidates
        ]

        scores = self.model.predict(pairs)

        reranked_results = []

        for candidate, score in zip(
            candidates,
            scores
        ):
            result = candidate.copy()

            result["reranker_score"] = float(score)

            reranked_results.append(result)

        reranked_results.sort(
            key=lambda result: result["reranker_score"],
            reverse=True
        )

        return reranked_results[:top_k]