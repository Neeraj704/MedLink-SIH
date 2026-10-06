import os
import requests
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv  
from query_database_bot.query_chatbot import infer_chatbot
from pydantic import BaseModel
from simple_chatbot.simple_chatbot import infer_simple_chatbot
from fastapi import FastAPI
load_dotenv()

app = FastAPI()

class QueryRequest(BaseModel):
    query: str
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "medlink.vercel.app", "medlink1.vercel.app",
                   "medlink2.vercel.app", "medlink3.vercel.app", "http://localhost:8080",
                   "http://localhost:8000","http://localhost:5124", "http://localhost:3000",
                   "http://localhost:3001"], 
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.get("/")
def check():
    return {"status": "API running!"}

@app.post("/doctor_chat")
def doctor_chat(request: QueryRequest):
    response = infer_chatbot(request.query)
    return {"answer": response}

@app.post("/landing_chat")
def landing_chat(request: QueryRequest):
    response = infer_simple_chatbot(request.query)
    return {"answer": response}