import os
import chromadb
from sentence_transformers import SentenceTransformer
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv 

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=gemini_api_key)
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_collection(name="text_chunks")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def return_response(query, n_results=3):
    embedded_text = embedder.encode(query).tolist()

    results = collection.query(
            query_embeddings=[embedded_text],
            n_results=n_results
    )
    
    return results['documents']


def infer_simple_chatbot(take_query):
    
    system_template = """
    You are MedLink's professional virtual assistant. 
    MedLink is a healthcare platform that enables users to upload medical reports, receive simplified explanations of results, and visualize trends in health parameters.

    Guidelines:
    - Provide clear, professional, and concise responses in plain text only (no Markdown, no bullet points, no extra spacing).
    - Use the retrieved context when relevant, but you may also rely on your baseline knowledge of MedLink provided above.
    - Only when you do not know the answer, or when the information is missing, politely inform the user and direct them to email hemankkumar24@gmail.com for further assistance.
    - Do not add the email if you are already confident in your answer.
    """

    human_template = """
    User Query: {query}

    Relevant Context:
    {context}

    Respond in a professional and helpful tone, using only plain text.
    """
    
    prompt = ChatPromptTemplate.from_messages([
    ("system", system_template),
    ("human", human_template)
    ])
    
    chain = prompt | llm
    
    context = return_response(take_query)
    
    resp = chain.invoke({"query": take_query, "context": context})
    return resp.content
