from dotenv import load_dotenv
import os

load_dotenv(override=True)



GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-oss-120b")