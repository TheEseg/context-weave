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
        lower_message = user_message.lower()

        if "which stack" in lower_message or "what stack" in lower_message:
            technologies = sorted({fact["fact_value"] for fact in context.facts if fact["fact_key"] == "technology"})
            if technologies:
                summary_hint = f" The session summary also points to: {context.summary[:120]}." if context.summary else ""
                return "Based on the stored session context, the stack is " + ", ".join(technologies) + "." + summary_hint

        if "report name" in lower_message:
            report_name = next((fact["fact_value"] for fact in context.facts if fact["fact_key"] == "report_name"), None)
            if report_name:
                return f"The report name currently remembered for this session is {report_name}."

        if context.facts:
            fact_lines = [f'{fact["fact_key"]}={fact["fact_value"]}' for fact in context.facts[:3]]
            response = "I answered from durable session facts: " + "; ".join(fact_lines) + "."
            if context.summary:
                response += " Summary context: " + context.summary[:120] + "."
            return response

        if context.chunks:
            return (
                "I answered from retrieved document support: "
                + str(context.chunks[0]["content"])[:220]
                + "."
            )

        if context.summary:
            return "I used the running session summary to stay consistent: " + context.summary[:220] + "."

        return "I stored this turn in ContextWeave. Future turns can recall it through summary, facts, and retrieval context."


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
