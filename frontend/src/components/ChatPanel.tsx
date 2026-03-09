import { useState, type FormEvent } from "react";

import { MessageList } from "./MessageList";
import type { ChatMessage } from "../types";

type ChatPanelProps = {
  sessionId: string;
  userId: string;
  draftSessionId: string;
  draftUserId: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSessionIdChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onApplySession: () => void;
  onResetSession: () => void;
  onLoadDemo: () => void;
  onSendMessage: (message: string) => Promise<void>;
};

export function ChatPanel({
  sessionId,
  userId,
  draftSessionId,
  draftUserId,
  messages,
  loading,
  error,
  onSessionIdChange,
  onUserIdChange,
  onApplySession,
  onResetSession,
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
    <section className="panel chat-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Conversation</p>
          <h2>Chat panel</h2>
          <p className="panel-intro">
            Use the demo session to show how earlier architecture decisions stay available in later turns.
          </p>
        </div>
        <button className="secondary-button" onClick={onLoadDemo} type="button">
          Load demo session
        </button>
      </div>

      <div className="session-controls">
        <label>
          <span>Session ID</span>
          <input value={draftSessionId} onChange={(event) => onSessionIdChange(event.target.value)} />
        </label>
        <label>
          <span>User ID</span>
          <input value={draftUserId} onChange={(event) => onUserIdChange(event.target.value)} />
        </label>
      </div>

      <div className="action-row">
        <button className="secondary-button" onClick={onApplySession} type="button">
          Open session
        </button>
        <button className="ghost-button" onClick={onResetSession} type="button">
          Reset session view
        </button>
        <div className="session-badge">
          <span>Active</span>
          <code>{sessionId}</code>
          <small>{userId}</small>
        </div>
      </div>

      <MessageList messages={messages} loading={loading} />

      {error ? <div className="error-banner">{error}</div> : null}

      <form className="composer" onSubmit={handleSubmit}>
        <label>
          <span>Message</span>
          <textarea
            placeholder="Ask something that should still be recallable later, even after topic changes."
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        <button className="primary-button" disabled={loading || !message.trim()} type="submit">
          {loading ? "Sending..." : "Send message"}
        </button>
      </form>
    </section>
  );
}
