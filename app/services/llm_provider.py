from __future__ import annotations

from abc import ABC, abstractmethod

from app.context.context_packer import ContextPack
from app.core.config import Settings


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(self, user_message: str, context: ContextPack, memory_enabled: bool = True) -> str:
        raise NotImplementedError


class MockLLMProvider(BaseLLMProvider):
    def generate(self, user_message: str, context: ContextPack, memory_enabled: bool = True) -> str:
        lower_message = user_message.lower()
        technologies = sorted({fact["fact_value"] for fact in context.facts if fact["fact_key"] == "technology"})
        frontend_hosting = next(
            (fact["fact_value"] for fact in context.facts if fact["fact_key"] == "frontend_hosting"),
            None,
        )
        backend_hosting = next(
            (fact["fact_value"] for fact in context.facts if fact["fact_key"] == "backend_hosting"),
            None,
        )

        if not memory_enabled:
            if "which stack" in lower_message or "what stack" in lower_message or "architecture" in lower_message:
                return (
                    "Memory is off, so I only have your latest message. "
                    "I cannot confirm earlier architecture decisions unless you restate them in this turn."
                )
            return (
                "Memory is off for this turn, so I am responding only to the current message without "
                "session summary, stored facts, or retrieved chunks."
            )

        if "which stack" in lower_message or "what stack" in lower_message or "architecture" in lower_message:
            if technologies:
                details: list[str] = [f"Based on the reconstructed session context, the stack includes {', '.join(technologies)}."]
                if frontend_hosting or backend_hosting:
                    details.append(
                        "The deployment split remains "
                        f"{frontend_hosting or 'the frontend'} on the frontend and {backend_hosting or 'the backend'} on the backend."
                    )
                if context.chunks:
                    details.append(f"Retrieved support points to: {str(context.chunks[0]['content'])[:140]}.")
                return " ".join(details)

        if "report name" in lower_message:
            report_name = next((fact["fact_value"] for fact in context.facts if fact["fact_key"] == "report_name"), None)
            if report_name:
                return f"The report name currently remembered for this session is {report_name}."

        if context.facts:
            fact_lines = [f'{fact["fact_key"]}={fact["fact_value"]}' for fact in context.facts[:4]]
            response = "I grounded this reply in stored session facts: " + "; ".join(fact_lines) + "."
            if context.recent_messages:
                response += f" The recent turns still center on: {context.recent_messages[-1]['content'][:120]}."
            if context.summary:
                response += " Summary context: " + context.summary[:120] + "."
            return response

        if context.chunks:
            return (
                "I grounded this reply in retrieved document support: "
                + str(context.chunks[0]["content"])[:220]
                + "."
            )

        if context.summary:
            return "I used the running session summary to stay consistent: " + context.summary[:220] + "."

        return (
            "I do not have stored facts or retrieval support yet, so this answer is based only on the active turn. "
            "Once the session accumulates more evidence, ContextWeave will surface it through summary, facts, and chunks."
        )


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        from openai import OpenAI

        self.client = OpenAI(api_key=api_key)

    def generate(self, user_message: str, context: ContextPack, memory_enabled: bool = True) -> str:
        if memory_enabled:
            prompt = (
                "You are ContextWeave, a grounded assistant. Use the provided context only when relevant.\n"
                f"Summary: {context.summary}\n"
                f"Facts: {context.facts}\n"
                f"Chunks: {context.chunks}\n"
                f"Recent messages: {context.recent_messages}\n"
                f"User message: {user_message}"
            )
        else:
            prompt = (
                "You are ContextWeave, a grounded assistant. Memory is disabled for this turn.\n"
                "Answer using only the current user message.\n"
                f"User message: {user_message}"
            )
        response = self.client.responses.create(model="gpt-4.1-mini", input=prompt)
        return response.output_text.strip()


def build_llm_provider(settings: Settings) -> BaseLLMProvider:
    if settings.llm_provider.lower() == "openai" and settings.openai_api_key:
        return OpenAIProvider(api_key=settings.openai_api_key)
    return MockLLMProvider()
