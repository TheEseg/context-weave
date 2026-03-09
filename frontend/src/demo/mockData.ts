import type { ChatResponse, HealthResponse, SessionContext } from "../types";

type SendChatPayload = {
  session_id: string;
  user_id: string;
  message: string;
  memory_enabled: boolean;
};

const sessions = new Map<string, SessionContext>();

function createSeededSession(): SessionContext {
  return {
    session_id: "demo-session",
    user_id: "demo-user",
    messages: [
      {
        role: "user",
        content: "The API layer uses FastAPI.",
      },
      {
        role: "assistant",
        content: "Captured FastAPI as the API layer for ContextWeave.",
      },
      {
        role: "user",
        content: "The project uses Redis and PostgreSQL for memory and persistence.",
      },
      {
        role: "assistant",
        content:
          "Stored Redis and PostgreSQL as durable architecture facts for this session.",
      },
      {
        role: "user",
        content: "The frontend is deployed on GitHub Pages and the backend on Railway.",
      },
      {
        role: "assistant",
        content:
          "Captured the deployment split: GitHub Pages for the frontend demo and Railway for the backend service.",
      },
      {
        role: "user",
        content: "What architecture did we decide for ContextWeave?",
      },
      {
        role: "assistant",
        content:
          "For ContextWeave we settled on Redis and PostgreSQL behind the backend, with the frontend served from GitHub Pages and the API running on Railway.",
      },
    ],
    recent_messages: [
      {
        role: "user",
        content: "The API layer uses FastAPI.",
      },
      {
        role: "assistant",
        content: "Captured FastAPI as the API layer for ContextWeave.",
      },
      {
        role: "user",
        content: "The project uses Redis and PostgreSQL for memory and persistence.",
      },
      {
        role: "assistant",
        content:
          "Stored Redis and PostgreSQL as durable architecture facts for this session.",
      },
      {
        role: "user",
        content: "The frontend is deployed on GitHub Pages and the backend on Railway.",
      },
      {
        role: "assistant",
        content:
          "Captured the deployment split: GitHub Pages for the frontend demo and Railway for the backend service.",
      },
      {
        role: "user",
        content: "What architecture did we decide for ContextWeave?",
      },
      {
        role: "assistant",
        content:
          "For ContextWeave we settled on Redis and PostgreSQL behind the backend, with the frontend served from GitHub Pages and the API running on Railway.",
      },
    ],
    summary:
      "Session summary: FastAPI is the API layer. Redis and PostgreSQL were selected for memory and persistence. The frontend is deployed on GitHub Pages, and the backend runs on Railway.",
    facts: [
      { fact_key: "technology", fact_value: "FastAPI" },
      { fact_key: "technology", fact_value: "Redis" },
      { fact_key: "technology", fact_value: "PostgreSQL" },
      { fact_key: "frontend_hosting", fact_value: "GitHub Pages" },
      { fact_key: "backend_hosting", fact_value: "Railway" },
    ],
    chunks: [
      {
        document_title: "Deployment Notes",
        chunk_index: 0,
        content:
          "The public demo serves the frontend from GitHub Pages while the backend runs separately on Railway.",
      },
      {
        document_title: "Architecture Principles",
        chunk_index: 0,
        content:
          "ContextWeave separates working memory from durable memory so the system can rebuild context after long gaps.",
      },
      {
        document_title: "API Layer",
        chunk_index: 0,
        content:
          "FastAPI exposes the chat and health endpoints while the context builder assembles summary, facts, retrieval results, and recent messages.",
      },
      {
        document_title: "Storage Stack",
        chunk_index: 0,
        content:
          "Redis supports short-term working memory while PostgreSQL stores sessions, messages, facts, documents, and chunks.",
      },
    ],
    task_state: {
      last_user_message: "What architecture did we decide for ContextWeave?",
    },
  };
}

function createEmptySession(sessionId: string, userId: string): SessionContext {
  return {
    session_id: sessionId,
    user_id: userId,
    messages: [],
    recent_messages: [],
    summary: "",
    facts: [],
    chunks: [],
    task_state: {},
  };
}

function ensureSession(sessionId: string, userId: string): SessionContext {
  const existing = sessions.get(sessionId);
  if (existing) {
    return existing;
  }

  const created = sessionId === "demo-session" ? createSeededSession() : createEmptySession(sessionId, userId);
  sessions.set(sessionId, created);
  return created;
}

function summarize(messages: SessionContext["messages"]): string {
  return messages
    .slice(-4)
    .map((message) => `${message.role}: ${message.content}`)
    .join(" | ")
    .slice(0, 400);
}

function extractFacts(message: string): SessionContext["facts"] {
  const facts: SessionContext["facts"] = [];
  const lower = message.toLowerCase();

  for (const technology of ["FastAPI", "Redis", "PostgreSQL"]) {
    if (lower.includes(technology.toLowerCase())) {
      facts.push({ fact_key: "technology", fact_value: technology });
    }
  }

  if (lower.includes("github pages")) {
    facts.push({ fact_key: "frontend_hosting", fact_value: "GitHub Pages" });
  }

  if (lower.includes("railway")) {
    facts.push({ fact_key: "backend_hosting", fact_value: "Railway" });
  }

  const reportMatch = message.match(/report name is ([a-zA-Z0-9_-]+)/i);
  if (reportMatch) {
    facts.push({ fact_key: "report_name", fact_value: reportMatch[1] });
  }

  return facts;
}

function buildAssistantResponse(session: SessionContext, message: string, memoryEnabled: boolean): string {
  const lower = message.toLowerCase();
  const technologies = session.facts
    .filter((fact) => fact.fact_key === "technology")
    .map((fact) => fact.fact_value);
  const frontendHosting = session.facts.find((fact) => fact.fact_key === "frontend_hosting")?.fact_value;
  const backendHosting = session.facts.find((fact) => fact.fact_key === "backend_hosting")?.fact_value;

  if (!memoryEnabled) {
    if (lower.includes("stack") || lower.includes("architecture")) {
      return "Memory is off, so this reply uses only the current message and cannot recover earlier architecture decisions.";
    }
    return "Memory is off for this turn, so the response is limited to your latest message without stored summary, facts, or retrieval support.";
  }

  if (
    lower.includes("which stack") ||
    lower.includes("what stack") ||
    lower.includes("chosen stack") ||
    lower.includes("what architecture") ||
    lower.includes("architecture did we decide")
  ) {
    if (technologies.length > 0 || frontendHosting || backendHosting) {
      const stackPart = technologies.length > 0 ? `${technologies.join(", ")} are the remembered architecture components.` : "";
      const hostingPart =
        frontendHosting || backendHosting
          ? ` The demo delivery split is ${frontendHosting ?? "the frontend"} for the frontend and ${backendHosting ?? "the backend"} for the backend.`
          : "";
      const chunkSupport =
        session.chunks.length > 0 ? ` Retrieved context also points to: ${session.chunks[0].content}` : "";
      return `${stackPart}${hostingPart}${chunkSupport}`.trim();
    }
  }

  if (session.facts.length > 0) {
    return `Grounded mock response from remembered context: ${session.facts
      .slice(0, 4)
      .map((fact) => `${fact.fact_key}=${fact.fact_value}`)
      .join("; ")}. Session summary: ${session.summary.slice(0, 160)}.`;
  }

  return "Mock response: this public demo is running without a live backend, but the layered memory flow is still visible.";
}

function buildPackedContext(session: SessionContext, message: string, memoryEnabled: boolean): string {
  if (!memoryEnabled) {
    return `Current user message:\n${message}`;
  }

  const parts: string[] = [];
  if (session.summary) {
    parts.push(`Session summary:\n${session.summary}`);
  }
  if (session.facts.length > 0) {
    parts.push(
      `Retrieved facts:\n${session.facts.map((fact) => `- ${fact.fact_key}: ${fact.fact_value}`).join("\n")}`,
    );
  }
  if (session.chunks.length > 0) {
    parts.push(
      `Retrieved chunks:\n${session.chunks
        .map((chunk) => `[${chunk.document_title}#${chunk.chunk_index}] ${chunk.content}`)
        .join("\n\n")}`,
    );
  }
  if (session.recent_messages.length > 0) {
    parts.push(
      `Recent messages:\n${session.recent_messages.map((item) => `- ${item.role}: ${item.content}`).join("\n")}`,
    );
  }
  parts.push(`Current user message:\n${message}`);
  return parts.join("\n\n");
}

export async function mockHealth(): Promise<HealthResponse> {
  return { status: "ok", service: "ContextWeave" };
}

export async function mockGetSessionContext(sessionId: string): Promise<SessionContext> {
  const session = sessions.get(sessionId) ?? ensureSession(sessionId, "demo-user");
  return structuredClone(session);
}

export async function mockSendChatMessage(payload: SendChatPayload): Promise<ChatResponse> {
  const session = ensureSession(payload.session_id, payload.user_id);
  const userMessage = { role: "user" as const, content: payload.message };

  if (payload.memory_enabled) {
    const newFacts = extractFacts(payload.message);
    for (const fact of newFacts) {
      const exists = session.facts.some(
        (candidate) => candidate.fact_key === fact.fact_key && candidate.fact_value === fact.fact_value,
      );
      if (!exists) {
        session.facts.push(fact);
      }
    }

    if (session.chunks.length === 0) {
      session.chunks = [
        {
          document_title: "Pages Demo",
          chunk_index: 0,
          content:
            "GitHub Pages hosts only the frontend. Demo mode keeps the conversation, summary, facts, and chunks visible without requiring a live backend.",
        },
      ];
    }
  }

  const packedContext = buildPackedContext(session, payload.message, payload.memory_enabled);
  const assistantContent = buildAssistantResponse(session, payload.message, payload.memory_enabled);
  const assistantMessage = { role: "assistant" as const, content: assistantContent };

  session.messages.push(userMessage, assistantMessage);
  if (payload.memory_enabled) {
    session.recent_messages = session.messages.slice(-6);
    session.summary = summarize(session.messages);
    session.task_state = { last_user_message: payload.message };
  }
  session.user_id = payload.user_id;

  sessions.set(session.session_id, session);

  return {
    session_id: session.session_id,
    user_id: session.user_id,
    response: assistantContent,
    debug: {
      memory_enabled: payload.memory_enabled,
      recent_messages: payload.memory_enabled ? session.recent_messages.map(({ role, content }) => ({ role, content })) : [],
      session_summary: payload.memory_enabled ? session.summary : "disabled",
      retrieved_facts: payload.memory_enabled ? session.facts : [],
      retrieved_chunks: payload.memory_enabled ? session.chunks : [],
      final_packed_context: packedContext,
      context_length_chars: packedContext.length,
    },
  };
}

ensureSession("demo-session", "demo-user");
