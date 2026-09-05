import re

from rank_bm25 import BM25Okapi


class BM25Retriever:

    def __init__(self):
        self.bm25 = None
        self.chunks = []


    def _tokenize(self, text: str) -> list[str]:
        return re.findall(
            r"[\w.-]+",
            text.lower()
        )


    def index_chunks(self, chunks: list[dict]) -> None:

        self.chunks = chunks

        tokenized_corpus = [
            self._tokenize(chunk["text"])
            for chunk in chunks
        ]

        self.bm25 = BM25Okapi(tokenized_corpus)


    def search(
        self,
        question: str,
        top_k: int = 5
    ) -> list[dict]:

        if self.bm25 is None:
            raise RuntimeError(
                "BM25 index has not been created."
            )

        tokenized_query = self._tokenize(question)

        scores = self.bm25.get_scores(
            tokenized_query
        )

        ranked_indices = sorted(
            range(len(scores)),
            key=lambda index: scores[index],
            reverse=True
        )[:top_k]

        results = []

        for rank, index in enumerate(
            ranked_indices,
            start=1
        ):

            chunk = self.chunks[index]

            results.append({
                "chunk_id": chunk["chunk_id"],
                "text": chunk["text"],
                "document": chunk["document"],
                "page": chunk["page"],
                "score": float(scores[index]),
                "rank": rank
            })

        return results