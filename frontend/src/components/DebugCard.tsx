import type { ChatMessage } from "../types";
import { InspectorSection } from "./InspectorSection";

type DebugCardProps = {
  sessionId: string;
  userId: string;
  totalMessages: number;
  recentMessages: ChatMessage[];
  taskState: Record<string, string>;
  memoryEnabled: boolean;
};

export function DebugCard({
  sessionId,
  userId,
  totalMessages,
  recentMessages,
  taskState,
  memoryEnabled,
}: DebugCardProps) {
  const taskStateKeys = Object.keys(taskState);

  return (
    <InspectorSection
      title="Debug metadata"
      subtitle="Inspector"
      meta={<span className="card-tag">{memoryEnabled ? `${recentMessages.length} recent` : "Memory bypassed"}</span>}
      defaultOpen={false}
      testId="debug-section"
    >
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
    </InspectorSection>
  );
}
