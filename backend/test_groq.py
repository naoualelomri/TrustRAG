import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


response = client.responses.create(
    model=os.getenv(
        "GROQ_MODEL",
        "openai/gpt-oss-20b"
    ),
    input="Answer only with: TrustRAG works."
)


print(response.output_text)