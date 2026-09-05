import json
import os
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()

class CitationVerifier:

    def __init__(self):

        self.client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1"
        )

        self.model = os.getenv(
            "GROQ_MODEL",
            "openai/gpt-oss-20b"
        )


    def verify(self,answer: str,contexts: list[dict]) -> dict:

        if not answer or not contexts:
            return {
                "status": "UNSUPPORTED",
                "supported_claims": 0,
                "total_claims": 0,
                "claims": []
            }

        evidence = self._build_evidence(contexts)

        prompt = f"""
You are a strict grounding verifier.

Your task is to determine whether the factual claims
in an answer are supported by the provided evidence.

Rules:
- Use ONLY the provided evidence.
- Do not use outside knowledge.
- Break the answer into atomic factual claims.
- Ignore purely stylistic or non-factual statements.
- A claim is SUPPORTED only when the evidence clearly
  supports it.
- If only part of a claim is supported, classify it as
  PARTIALLY_SUPPORTED.
- If the evidence does not support the claim, classify
  it as UNSUPPORTED.
- Identify which source IDs support each claim.
- Do not invent source IDs.

Return ONLY valid JSON using exactly this structure:

{{
  "status": "SUPPORTED | PARTIALLY_SUPPORTED | UNSUPPORTED",
  "supported_claims": 0,
  "total_claims": 0,
  "claims": [
    {{
      "claim": "claim text",
      "status": "SUPPORTED | PARTIALLY_SUPPORTED | UNSUPPORTED",
      "source_ids": ["S1"],
      "reason": "short explanation"
    }}
  ]
}}

ANSWER:
{answer}

EVIDENCE:
{evidence}
"""

        response = self.client.responses.create(
            model=self.model,
            input=prompt
        )

        raw_output = response.output_text.strip()

        return self._parse_response(raw_output)


    def _build_evidence(self,contexts: list[dict]) -> str:

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


    def _parse_response(self,raw_output: str) -> dict:
         
        cleaned = raw_output
        print("\nRAW VERIFIER OUTPUT:")
        print(raw_output)

        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]

        if cleaned.startswith("```"):
            cleaned = cleaned[3:]

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)

        except json.JSONDecodeError:
            return {
                "status": "ERROR",
                "supported_claims": 0,
                "total_claims": 0,
                "claims": [],
                "raw_output": raw_output
            }