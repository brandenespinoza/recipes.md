import httpx

from .config import get_settings
from .prompts import RECIPE_SYSTEM_PROMPT, build_recipe_user_prompt


class LLMClient:
    """
    Thin wrapper around the OpenAI Responses API.
    """

    def __init__(self) -> None:
        self.settings = get_settings()

    async def generate_recipe_markdown(self, url: str) -> str:
        if not self.settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY not configured")

        system_prompt = RECIPE_SYSTEM_PROMPT
        user_prompt = build_recipe_user_prompt(url)

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                "https://api.openai.com/v1/responses",
                headers={
                    "Authorization": f"Bearer {self.settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.settings.openai_model,
                    "instructions": system_prompt,
                    "input": user_prompt,
                    "tools": [{"type": "web_search"}],
                    "temperature": 0,
                },
            )
            response.raise_for_status()
            data = response.json()

            output_text = data.get("output_text")
            if output_text:
                return output_text

            chunks: list[str] = []
            for item in data.get("output", []):
                if item.get("type") != "message":
                    continue
                for part in item.get("content", []):
                    if part.get("type") == "output_text" and part.get("text"):
                        chunks.append(part["text"])

            if not chunks:
                raise RuntimeError("OpenAI response did not include output text")

            return "".join(chunks)


async def generate_recipe_markdown(url: str) -> str:
    client = LLMClient()
    return await client.generate_recipe_markdown(url)
