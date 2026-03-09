import type { ChatMessage } from "../types";

type DebugCardProps = {
  sessionId: string;
  userId: string;
  totalMessages: number;
  recentMessages: ChatMessage[];
  taskState: Record<string, string>;
};

export function DebugCard({
  sessionId,
  userId,
  totalMessages,
  recentMessages,
  taskState,
}: DebugCardProps) {
  const taskStateKeys = Object.keys(taskState);

  return (
    <section className="inspector-card">
      <div className="card-header">
        <div>
          <p className="section-kicker">Inspector</p>
          <h3>Debug metadata</h3>
        </div>
        <span className="card-tag">{recentMessages.length} recent</span>
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
          <dt>Recent memory entries</dt>
          <dd>{recentMessages.length}</dd>
        </div>
      </dl>

      <div className="subsection">
        <h4>Task state</h4>
        {taskStateKeys.length === 0 ? (
          <p className="card-body muted">No task-state values stored yet.</p>
        ) : (
          <pre>{JSON.stringify(taskState, null, 2)}</pre>
        )}
      </div>

      <div className="subsection">
        <h4>Recent working memory</h4>
        {recentMessages.length === 0 ? (
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
    </section>
  );
}
