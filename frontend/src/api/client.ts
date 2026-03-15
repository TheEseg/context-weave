import type { ChatResponse, ContextDiffResponse, HealthResponse, SessionContext } from "../types";
import { mockGetContextDiff, mockGetSessionContext, mockHealth, mockSendChatMessage } from "../demo/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE || "false").toLowerCase() === "true";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        message = body.detail;
      }
    } catch {
      // Use the default message for non-JSON errors.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getHealth(): Promise<HealthResponse> {
  if (DEMO_MODE) {
    return mockHealth();
  }
  return request<HealthResponse>("/health");
}

export function sendChatMessage(payload: {
  session_id: string;
  user_id: string;
  message: string;
  memory_enabled: boolean;
}): Promise<ChatResponse> {
  if (DEMO_MODE) {
    return mockSendChatMessage(payload);
  }
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSessionContext(sessionId: string): Promise<SessionContext> {
  if (DEMO_MODE) {
    return mockGetSessionContext(sessionId);
  }
  return request<SessionContext>(`/sessions/${encodeURIComponent(sessionId)}/context`);
}

export function getContextDiff(sessionId: string, turn: number): Promise<ContextDiffResponse> {
  if (DEMO_MODE) {
    return mockGetContextDiff(sessionId, turn);
  }
  return request<ContextDiffResponse>(`/sessions/${encodeURIComponent(sessionId)}/context-diff/${turn}`);
}

export { API_BASE_URL, DEMO_MODE };
