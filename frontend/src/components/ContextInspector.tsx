import type { ContextDebug, ContextDiffResponse, SessionContext } from "../types";
import { ChunksCard } from "./ChunksCard";
import { ContextDiffCard } from "./ContextDiffCard";
import { DebugCard } from "./DebugCard";
import { FactsCard } from "./FactsCard";
import { PackedContextCard } from "./PackedContextCard";
import { SummaryCard } from "./SummaryCard";

type ContextInspectorProps = {
  context: SessionContext | null;
  debug: ContextDebug | null;
  contextDiff: ContextDiffResponse | null;
  memoryEnabled: boolean;
  loading: boolean;
  error: string | null;
  contextDiffError: string | null;
};

export function ContextInspector({
  context,
  debug,
  contextDiff,
  memoryEnabled,
  loading,
  error,
  contextDiffError,
}: ContextInspectorProps) {
  const hasContext = Boolean(context || debug);
  const resolvedMemoryEnabled = debug?.memory_enabled ?? memoryEnabled;
  const summary = debug?.session_summary ?? context?.summary ?? "";
  const facts = debug?.retrieved_facts ?? context?.facts ?? [];
  const chunks = debug?.retrieved_chunks ?? context?.chunks ?? [];
  const recentMessages = debug?.recent_messages ?? context?.recent_messages ?? [];
  const packedContext = debug?.final_packed_context ?? "";
  const contextLengthChars = debug?.context_length_chars;
  const totalMessages = context?.messages.length ?? 0;
  const sessionId = context?.session_id ?? "pending";
  const userId = context?.user_id ?? "pending";
  const taskState = context?.task_state ?? {};

  return (
    <aside className="panel inspector-panel" data-testid="context-inspector">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Context continuity</p>
          <h2>Context inspector</h2>
        </div>
        <span className="inspector-status">
          {!resolvedMemoryEnabled ? "Memory bypassed" : hasContext ? "Context loaded" : "Awaiting session data"}
        </span>
      </div>

      <p className="inspector-intro">
        This panel shows what ContextWeave can remember, retrieve, and pack around the active session.
      </p>
      <div className="mobile-divider">Context inspector</div>

      {loading ? <div className="loading-card">Refreshing context pack…</div> : null}
      {error ? (
        <div className="error-banner">
          <strong>Context refresh issue.</strong> {error}
        </div>
      ) : null}

      {!hasContext && !loading ? (
        <div className="empty-state compact">
          <h3>No session context loaded</h3>
          <p>Open a session or send a message to inspect summary, facts, chunks, the final packed context, and working memory.</p>
        </div>
      ) : null}

      {hasContext ? (
        <div className="inspector-stack">
          <SummaryCard summary={summary} memoryEnabled={resolvedMemoryEnabled} />
          <FactsCard facts={facts} memoryEnabled={resolvedMemoryEnabled} />
          <ChunksCard chunks={chunks} memoryEnabled={resolvedMemoryEnabled} />
          <PackedContextCard
            packedContext={packedContext}
            contextLengthChars={contextLengthChars}
            memoryEnabled={resolvedMemoryEnabled}
          />
          {contextDiffError ? (
            <div className="error-banner">
              <strong>Context diff issue.</strong> {contextDiffError}
            </div>
          ) : null}
          <ContextDiffCard contextDiff={contextDiff} />
          <DebugCard
            sessionId={sessionId}
            userId={userId}
            totalMessages={totalMessages}
            recentMessages={recentMessages}
            taskState={taskState}
            memoryEnabled={resolvedMemoryEnabled}
          />
        </div>
      ) : null}
    </aside>
  );
}
