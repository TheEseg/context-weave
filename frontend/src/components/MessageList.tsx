import type { ChatMessage } from "../types";

type MessageListProps = {
  messages: ChatMessage[];
  loading: boolean;
};

export function MessageList({ messages, loading }: MessageListProps) {
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
        </article>
      ))}
      {loading ? <div className="message loading-message">Generating grounded response…</div> : null}
    </div>
  );
}
