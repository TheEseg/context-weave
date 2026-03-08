import type { ChatResponse, HealthResponse, SessionContext } from "../types";

type SendChatPayload = {
  session_id: string;
  user_id: string;
  message: string;
};

const sessions = new Map<string, SessionContext>();

function createSeededSession(): SessionContext {
  return {
    session_id: "demo-session",
    user_id: "demo-user",
    messages: [
      {
        role: "user",
        content: "The architecture uses FastAPI, Redis, and PostgreSQL.",
      },
      {
        role: "assistant",
        content:
          "Stored the selected stack in layered memory so later turns can recall it through summary, facts, and retrieval context.",
      },
      {
        role: "user",
        content: "The report name is rai_occulto.",
      },
      {
        role: "assistant",
        content: "Captured the report identifier for future turns.",
      },
    ],
    recent_messages: [
      {
        role: "user",
        content: "The architecture uses FastAPI, Redis, and PostgreSQL.",
      },
      {
        role: "assistant",
        content:
          "Stored the selected stack in layered memory so later turns can recall it through summary, facts, and retrieval context.",
      },
      {
        role: "user",
        content: "The report name is rai_occulto.",
      },
      {
        role: "assistant",
        content: "Captured the report identifier for future turns.",
      },
    ],
    summary:
      "user: The architecture uses FastAPI, Redis, and PostgreSQL. | assistant: Stored the selected stack in layered memory. | user: The report name is rai_occulto.",
    facts: [
      { fact_key: "technology", fact_value: "FastAPI" },
      { fact_key: "technology", fact_value: "Redis" },
      { fact_key: "technology", fact_value: "PostgreSQL" },
      { fact_key: "report_name", fact_value: "rai_occulto" },
    ],
    chunks: [
      {
        document_title: "Demo Stack",
        chunk_index: 0,
        content:
          "The demo implementation uses FastAPI for the HTTP API, Redis for short-term memory, and PostgreSQL for durable storage.",
      },
      {
        document_title: "Architecture Principles",
        chunk_index: 0,
        content:
          "ContextWeave separates working memory from durable memory so the system can rebuild context after long gaps.",
      },
    ],
    task_state: {
      last_user_message: "The report name is rai_occulto.",
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

  const reportMatch = message.match(/report name is ([a-zA-Z0-9_-]+)/i);
  if (reportMatch) {
    facts.push({ fact_key: "report_name", fact_value: reportMatch[1] });
  }

  return facts;
}

function buildAssistantResponse(session: SessionContext, message: string): string {
  const lower = message.toLowerCase();
  const technologies = session.facts
    .filter((fact) => fact.fact_key === "technology")
    .map((fact) => fact.fact_value);

  if (lower.includes("which stack") || lower.includes("what stack") || lower.includes("chosen stack")) {
    if (technologies.length > 0) {
      return `The stack currently in memory is ${Array.from(new Set(technologies)).join(", ")}.`;
    }
  }

  if (session.facts.length > 0) {
    return `Grounded mock response from remembered facts: ${session.facts
      .slice(0, 3)
      .map((fact) => `${fact.fact_key}=${fact.fact_value}`)
      .join("; ")}.`;
  }

  return "Mock response: this public demo is running without a live backend, but the layered memory flow is still visible.";
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

  const assistantContent = buildAssistantResponse(session, payload.message);
  const assistantMessage = { role: "assistant" as const, content: assistantContent };

  session.messages.push(userMessage, assistantMessage);
  session.recent_messages = session.messages.slice(-6);
  session.summary = summarize(session.messages);
  session.task_state = { last_user_message: payload.message };
  session.user_id = payload.user_id;

  sessions.set(session.session_id, session);

  return {
    session_id: session.session_id,
    user_id: session.user_id,
    response: assistantContent,
    debug: {
      recent_messages: session.recent_messages.map(({ role, content }) => ({ role, content })),
      summary: session.summary,
      facts: session.facts,
      chunks: session.chunks,
    },
  };
}

ensureSession("demo-session", "demo-user");
