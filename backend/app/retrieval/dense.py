import chromadb
from sentence_transformers import SentenceTransformer


class DenseRetriever:

    def __init__(self):

        self.embedding_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        self.client = chromadb.PersistentClient(
            path="./chroma_db"
        )

        self.collection = self.client.get_or_create_collection(
            name="documents"
        )


    def index_chunks(self, chunks: list[dict]):

        texts = [chunk["text"] for chunk in chunks]

        embeddings = self.embedding_model.encode(
            texts
        ).tolist()

        ids = [
            chunk["chunk_id"]
            for chunk in chunks
        ]

        metadata = [
            {
                "document": chunk["document"],
                "page": chunk["page"]
            }
            for chunk in chunks
        ]

        self.collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadata
        )


    def search(self, question: str, top_k: int = 5)-> list[dict]:
        
        query_embedding = self.embedding_model.encode(
            question
        ).tolist()
    

        raw_results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        results=[]
        for i in range(
            len(raw_results["ids"][0])
        ):
            results.append({
                "chunk_id": raw_results["ids"][0][i],
                "text": raw_results["documents"][0][i],
                "document": raw_results["metadatas"][0][i]["document"],
                "page": raw_results["metadatas"][0][i]["page"],
                "distance": raw_results["distances"][0][i],
                "rank": i + 1
            })
        return results
# qst devient  query.embedding  puis collection . query cherche les vecteurs proches 
    def get_all_chunks(self)-> list[dict]:
        data= self.collection.get(
            include=["documents","metadatas"]
        )
        chunks=[]
        for i in range(len(data["ids"])):
            chunks.append({
                "chunk_id": data["ids"][i],
                "text": data["documents"][i],
                 "document": data["metadatas"][i]["document"],
                 "page": data["metadatas"][i]["page"]
            })
        return chunks