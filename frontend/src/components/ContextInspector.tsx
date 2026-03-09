import type { SessionContext } from "../types";
import { ChunksCard } from "./ChunksCard";
import { DebugCard } from "./DebugCard";
import { FactsCard } from "./FactsCard";
import { SummaryCard } from "./SummaryCard";

type ContextInspectorProps = {
  context: SessionContext | null;
  loading: boolean;
  error: string | null;
};

export function ContextInspector({ context, loading, error }: ContextInspectorProps) {
  const hasContext = Boolean(context);

  return (
    <aside className="panel inspector-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Context continuity</p>
          <h2>Context inspector</h2>
        </div>
        <span className="inspector-status">{hasContext ? "Context loaded" : "Awaiting session data"}</span>
      </div>

      <p className="inspector-intro">
        This panel shows what ContextWeave can remember, retrieve, and pack around the active session.
      </p>

      {loading ? <div className="loading-card">Refreshing context pack…</div> : null}
      {error ? (
        <div className="error-banner">
          <strong>Context refresh issue.</strong> {error}
        </div>
      ) : null}

      {!context && !loading ? (
        <div className="empty-state compact">
          <h3>No session context loaded</h3>
          <p>Open a session or send a message to inspect summary, facts, chunks, and working memory.</p>
        </div>
      ) : null}

      {context ? (
        <div className="inspector-stack">
          <SummaryCard summary={context.summary} />
          <FactsCard facts={context.facts} />
          <ChunksCard chunks={context.chunks} />
          <DebugCard
            sessionId={context.session_id}
            userId={context.user_id}
            totalMessages={context.messages.length}
            recentMessages={context.recent_messages}
            taskState={context.task_state}
          />
        </div>
      ) : null}
    </aside>
  );
}
