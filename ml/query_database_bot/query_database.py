import os
from pinecone import Pinecone
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

model = SentenceTransformer("all-MiniLM-L6-v2")

api_key = os.getenv("PINECONE_API")
index_name = os.getenv("PINECONE_INDEX_NAME")

pc = Pinecone(api_key=api_key)
index = pc.Index(index_name)

def infer_vector_search(query):
    query_vector = model.encode([query])[0].tolist()

    results = index.query(
        vector=query_vector,
        top_k=5,
        include_metadata=True
    )

    return results

