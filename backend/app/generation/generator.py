import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

class AnswerGenerationError(Exception):
    pass

class AnswerGenerator:

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("GROQ_API_KEY"),base_url="https://api.groq.com/openai/v1")
        self.model = os.getenv( "GROQ_MODEL","openai/gpt-oss-20b"   )

    def generate(self,question: str,contexts: list[dict]) -> dict:

        if not contexts:
            return {
                "answer": (
                    "I could not find enough information "
                    "in the uploaded documents."
                ),
                "sources": []
            }

        context_text = self._build_context(contexts)

        prompt = f"""
You are a document question-answering assistant.

Answer the user's question using ONLY the evidence
provided below.

Rules:
- Do not use outside knowledge.
- If the evidence is insufficient, explicitly say so.
- Cite factual statements using source identifiers such
  as [S1], [S2], etc.
- Do not invent citations.
- Keep the answer concise and precise.

QUESTION:
{question}

EVIDENCE:
{context_text}
"""

        try: 

               response = self.client.responses.create(
                    model=self.model,         
                    input=prompt
                )
        except Exception as error:
                 raise AnswerGenerationError("The answer generation service is unavailable.") from error

        sources = self._build_sources(contexts)

        return {
            "answer": response.output_text,
            "sources": sources
        }

    def _build_context(self,contexts: list[dict]) -> str:
        sections = []
        for index, context in enumerate(
            contexts,
            start=1
        ):
            section = f"""
[S{index}]
Document: {context["document"]}
Page: {context["page"]}

{context["text"]}
""".strip()

            sections.append(section)

        return "\n\n".join(sections)

    def _build_sources(self,contexts: list[dict]) -> list[dict]:

        return [
            {
                "source_id": f"S{index}",
                "document": context["document"],
                "page": context["page"],
                "chunk_id": context["chunk_id"]
            }
            for index, context in enumerate(
                contexts,
                start=1
            )
        ]