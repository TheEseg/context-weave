import type { ChatMessage, ContextDebug } from "../types";

type MessageListProps = {
  messages: ChatMessage[];
  loading: boolean;
  debug: ContextDebug | null;
};

export function MessageList({ messages, loading, debug }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <h3>No messages yet</h3>
        <p>Start a session and ask something that the system should remember across later turns.</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <article
          key={`${message.role}-${message.created_at ?? index}`}
          className={`message message-${message.role}`}
          data-testid={`message-${message.role}`}
        >
          <div className="message-meta">
            <span>{message.role === "user" ? "User" : "Assistant"}</span>
          </div>
          <p>{message.content}</p>
          {message.role === "assistant" && index === messages.length - 1 && debug ? (
            <div className="message-context-used">
              <span>Context used</span>
              <div className="message-context-tags">
                {buildContextUsedItems(debug).map((item) => (
                  <small key={item}>✓ {item}</small>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      ))}
      {loading ? <div className="message loading-message">Generating grounded response…</div> : null}
    </div>
  );
}

function buildContextUsedItems(debug: ContextDebug): string[] {
  const items: string[] = [];

  if (debug.retrieved_facts.length > 0) {
    const fact = debug.retrieved_facts[0];
    items.push(`fact: ${fact.fact_key} = ${fact.fact_value}`);
  }
  if (debug.recent_messages.length > 0) {
    items.push("recent message");
  }
  if (debug.retrieved_chunks.length > 0) {
    items.push("retrieved chunk");
  }
  if (debug.session_summary && debug.session_summary !== "disabled") {
    items.push("session summary");
  }

  return items.length > 0 ? items : ["current message only"];
}
