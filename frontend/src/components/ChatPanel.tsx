import { useState, type FormEvent } from "react";

import { MessageList } from "./MessageList";
import type { ChatMessage, ContextDebug } from "../types";

type ChatPanelProps = {
  sessionId: string;
  userId: string;
  draftSessionId: string;
  draftUserId: string;
  messages: ChatMessage[];
  debug: ContextDebug | null;
  loading: boolean;
  error: string | null;
  memoryEnabled: boolean;
  onSessionIdChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onApplySession: () => void;
  onLoadDemo: () => void;
  onSendMessage: (message: string) => Promise<void>;
};

export function ChatPanel({
  sessionId,
  userId,
  draftSessionId,
  draftUserId,
  messages,
  debug,
  loading,
  error,
  memoryEnabled,
  onSessionIdChange,
  onUserIdChange,
  onApplySession,
  onLoadDemo,
  onSendMessage,
}: ChatPanelProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    const nextMessage = message;
    setMessage("");
    await onSendMessage(nextMessage);
  }

  return (
    <section className="panel chat-panel" data-testid="chat-panel">
      <div className="panel-heading panel-heading-chat">
        <div>
          <p className="section-kicker">Conversation</p>
          <h2>Chat panel</h2>
          <p className="panel-intro">
            Use the demo session to show how earlier architecture decisions stay available in later turns.
          </p>
        </div>
      </div>

      <div className="session-controls">
        <label>
          <span>Session ID</span>
          <input data-testid="session-id-input" value={draftSessionId} onChange={(event) => onSessionIdChange(event.target.value)} />
        </label>
        <label>
          <span>User ID</span>
          <input data-testid="user-id-input" value={draftUserId} onChange={(event) => onUserIdChange(event.target.value)} />
        </label>
      </div>

      <div className="action-row action-row-chat">
        <button className="secondary-button" data-testid="open-session" onClick={onApplySession} type="button">
          Open session
        </button>
        <button className="ghost-button" data-testid="load-demo-session" onClick={onLoadDemo} type="button">
          Load demo session
        </button>
        <div className="session-badge">
          <span>Active</span>
          <code>{sessionId}</code>
          <small>{userId}</small>
          <small>{memoryEnabled ? "Memory ON" : "Memory OFF"}</small>
        </div>
      </div>

      <MessageList messages={messages} debug={debug} loading={loading} />

      {error ? <div className="error-banner">{error}</div> : null}

      <form className="composer" onSubmit={handleSubmit}>
        <label>
          <span>Message</span>
          <textarea
            data-testid="message-input"
            placeholder="Ask something that should still be recallable later, even after topic changes."
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        <button className="primary-button" data-testid="send-message" disabled={loading || !message.trim()} type="submit">
          {loading ? "Sending..." : "Send message"}
        </button>
      </form>
    </section>
  );
}
