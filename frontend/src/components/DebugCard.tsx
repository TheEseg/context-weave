import type { ChatMessage, ContextDebug } from "../types";

type DebugCardProps = {
  sessionId: string;
  userId: string;
  totalMessages: number;
  recentMessages: ChatMessage[];
  taskState: Record<string, string>;
  memoryEnabled: boolean;
  debug: ContextDebug | null;
  latestTurn?: number;
};

export function DebugCard({
  sessionId,
  userId,
  totalMessages,
  recentMessages,
  taskState,
  memoryEnabled,
  debug,
  latestTurn,
}: DebugCardProps) {
  const taskStateKeys = Object.keys(taskState);
  const scoringSignals = [
    { label: "Summary signal", value: debug?.session_summary ? "present" : "none" },
    { label: "Fact signal", value: `${debug?.retrieved_facts.length ?? 0} facts` },
    { label: "Retrieval signal", value: `${debug?.retrieved_chunks.length ?? 0} chunks` },
    { label: "Recent-turn signal", value: `${recentMessages.length} messages` },
    { label: "Packed size", value: `${debug?.context_length_chars ?? 0} chars` },
    { label: "Latest turn", value: String(latestTurn ?? 0) },
  ];

  return (
    <section className="inspector-card-panel" data-testid="debug-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Inspector</p>
          <h3>Debug metadata</h3>
        </div>
        <span className="card-tag">{memoryEnabled ? `${recentMessages.length} recent` : "Memory bypassed"}</span>
      </div>
      <dl className="metadata-grid">
        <div>
          <dt>Session</dt>
          <dd>{sessionId}</dd>
        </div>
        <div>
          <dt>User</dt>
          <dd>{userId}</dd>
        </div>
        <div>
          <dt>Total messages</dt>
          <dd>{totalMessages}</dd>
        </div>
        <div>
          <dt>Memory mode</dt>
          <dd>{memoryEnabled ? "ON" : "OFF"}</dd>
        </div>
        <div>
          <dt>Recent memory entries</dt>
          <dd>{recentMessages.length}</dd>
        </div>
      </dl>

      <div className="subsection">
        <h4>Scoring signals</h4>
        <div className="signal-grid">
          {scoringSignals.map((signal) => (
            <div key={signal.label} className="signal-card">
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="subsection">
        <h4>Task state</h4>
        {!memoryEnabled ? (
          <p className="card-body muted">Task state was bypassed for this turn.</p>
        ) : taskStateKeys.length === 0 ? (
          <p className="card-body muted">No task-state values stored yet.</p>
        ) : (
          <pre>{JSON.stringify(taskState, null, 2)}</pre>
        )}
      </div>

      <div className="subsection">
        <h4>Recent working memory</h4>
        {!memoryEnabled ? (
          <p className="card-body muted">Working memory was bypassed for this turn.</p>
        ) : recentMessages.length === 0 ? (
          <p className="card-body muted">No recent messages in Redis working memory yet.</p>
        ) : (
          <ul className="recent-list">
            {recentMessages.map((message, index) => (
              <li key={`${message.role}-${index}`}>
                <span>{message.role}</span>
                <p>{message.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="subsection">
        <h4>Raw debug payload</h4>
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>
    </section>
  );
}
