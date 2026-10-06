import pandas as pd
import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()
api_key = os.getenv("PINECONE_API")
index_name = os.getenv("PINECONE_INDEX_NAME")

df = pd.read_csv("conciseFinalData.csv")

pc = Pinecone(api_key=api_key)
index = pc.Index(index_name)

for i, row in df.iterrows():
    vector_id = str(i)  
    print(vector_id)
    metadata = {
        "Ayurveda_Long_Definition": str(row.get("Ayurveda_Long_definition", "")),
        "Siddha_Long_Definition": str(row.get("Siddha_Long_definition", "")),
        "Unani_Long_Definition": str(row.get("Unani_Long_definition", "")),
    }
    metadata = {k: ("Not Available" if v == "nan" else v) for k, v in metadata.items()}

    index.update(id=vector_id, set_metadata=metadata)
