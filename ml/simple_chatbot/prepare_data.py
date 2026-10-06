import os
import chromadb
from sentence_transformers import SentenceTransformer

chroma_client = chromadb.PersistentClient(path="./chroma_db")

collection = chroma_client.get_or_create_collection(name="text_chunks")
embedder = SentenceTransformer("all-MiniLM-L6-v2")


def read_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()
    
def chunk_text(text, chunk_size=100):
    words = text.split()
    return [
        " ".join(words[i:i+chunk_size])
        for i in range(0, len(words), chunk_size)
    ]
    
def get_embedding(text):
    return embedder.encode(text).tolist()

def store_in_chroma(file_path):
    text = read_file(file_path)
    chunks = chunk_text(text)

    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        collection.add(
            ids=[f"chunk_{i}"],
            documents=[chunk],
            embeddings=[embedding]
        )
    print(f"Stored {len(chunks)} chunks in ChromaDB.")
    
store_in_chroma("simple_chatbot/query_data.txt")
