import os
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from query_database_bot.query_database import infer_vector_search

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=gemini_api_key)

def infer_chatbot(query):
    
    system_template = """
    You are a knowledgeable medical assistant.
    When given a diagnosis and the retrieved database entries,
    you must return all the relevant codes from Ayurveda, Siddha, Unani, and ICD-11.

    Instructions:
    - Respond in plain text only (no Markdown, no asterisks, no bullet points).
    - Organize the answer by system: ICD-11, Ayurveda, Siddha, Unani.
    - For each code, include the diagnosis/title from the metadata on the same line.
    - Separate each entry with a newline.
    - If a code is missing, explicitly say "Not Available".
    - Do not invent or hallucinate codes.
    """

    human_template = """
    The user has asked: {query}

    Here are the retrieved database entries:
    {context}

    Now, based on the above entries, provide a clear structured answer
    with codes grouped by system and each code explained by its diagnosis.
    """
    
    prompt = ChatPromptTemplate.from_messages([
    ("system", system_template),
    ("human", human_template)
    ])
    
    chain = prompt | llm
    
    context = infer_vector_search(query)
    
    resp = chain.invoke({"query": query, "context": context})
    return resp.content




