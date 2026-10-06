from pinecone import Pinecone
import pandas as pd
from dotenv import load_dotenv
import os
from sentence_transformers import SentenceTransformer
load_dotenv()
df = pd.read_csv("query_database.csv")

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(df['ICD11_Title'].tolist(), show_progress_bar=True)

api_key = os.getenv("PINECONE_API")
index_name = os.getenv("PINECONE_INDEX_NAME")

pc = Pinecone(api_key=api_key)
index = pc.Index(index_name)


for i, row in df.iterrows():
    vector_id = str(i)
    metadata = {
    "ICD11_Code": str(row['ICD11_Code']) if pd.notna(row['ICD11_Code']) else "Na",
    "Ayurveda_NAMC_CODE": str(row['Ayurveda_NAMC_CODE']) if pd.notna(row['Ayurveda_NAMC_CODE']) else "Na",
    "Siddha_NAMC_CODE": str(row['Siddha_NAMC_CODE']) if pd.notna(row['Siddha_NAMC_CODE']) else "Na",
    "Unani_NUMC_CODE": str(row['Unani_NUMC_CODE']) if pd.notna(row['Unani_NUMC_CODE']) else "Na",
    "ICD11_Title": str(row['ICD11_Title']) if pd.notna(row['ICD11_Title']) else "Na"
    }
    index.upsert(
        vectors=[{"id": vector_id, "values": embeddings[i], "metadata": metadata}]
    )





