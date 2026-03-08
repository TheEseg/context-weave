from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import Settings
from app.memory.context_builder import ContextPack


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(self, user_message: str, context: ContextPack) -> str:
        raise NotImplementedError


class MockLLMProvider(BaseLLMProvider):
    def generate(self, user_message: str, context: ContextPack) -> str:
        if "which stack" in user_message.lower() or "what stack" in user_message.lower():
            technologies = sorted({fact["fact_value"] for fact in context.facts if fact["fact_key"] == "technology"})
            if technologies:
                return "The current stack in context is " + ", ".join(technologies) + "."

        if context.facts:
            fact_lines = [f'{fact["fact_key"]}={fact["fact_value"]}' for fact in context.facts[:3]]
            return "Grounded response based on stored facts: " + "; ".join(fact_lines) + "."

        if context.chunks:
            return "Grounded response from retrieved documents: " + context.chunks[0]["content"][:220]

        if context.summary:
            return "Grounded response from session summary: " + context.summary[:220]

        return (
            "Mock response: I received your message and stored it in ContextWeave. "
            "Future turns can recall it from layered memory."
        )


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        from openai import OpenAI

        self.client = OpenAI(api_key=api_key)

    def generate(self, user_message: str, context: ContextPack) -> str:
        prompt = (
            "You are ContextWeave, a grounded assistant. Use the provided context only when relevant.\n"
            f"Summary: {context.summary}\n"
            f"Facts: {context.facts}\n"
            f"Chunks: {context.chunks}\n"
            f"Recent messages: {context.recent_messages}\n"
            f"User message: {user_message}"
        )
        response = self.client.responses.create(model="gpt-4.1-mini", input=prompt)
        return response.output_text.strip()


def build_llm_provider(settings: Settings) -> BaseLLMProvider:
    if settings.llm_provider.lower() == "openai" and settings.openai_api_key:
        return OpenAIProvider(api_key=settings.openai_api_key)
    return MockLLMProvider()

