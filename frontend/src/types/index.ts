export type HealthResponse = {
  status: string;
  service: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  created_at?: string | null;
};

export type SessionFact = {
  fact_key: string;
  fact_value: string;
};

export type SessionChunk = {
  document_title: string;
  chunk_index: number;
  content: string;
};

export type ContextDebug = {
  recent_messages: Array<{ role: string; content: string }>;
  summary: string;
  facts: SessionFact[];
  chunks: SessionChunk[];
};

export type ChatResponse = {
  session_id: string;
  user_id: string;
  response: string;
  debug?: ContextDebug | null;
};

export type SessionContext = {
  session_id: string;
  user_id: string;
  messages: ChatMessage[];
  recent_messages: ChatMessage[];
  summary: string;
  facts: SessionFact[];
  chunks: SessionChunk[];
  task_state: Record<string, string>;
};

