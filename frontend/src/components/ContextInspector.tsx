import { useState } from "react";

import type { ContextDebug, ContextDiffResponse, SessionContext } from "../types";
import { ChunksCard } from "./ChunksCard";
import { ContextDiffCard } from "./ContextDiffCard";
import { DebugCard } from "./DebugCard";
import { FactsCard } from "./FactsCard";
import { PackedContextCard } from "./PackedContextCard";
import { SummaryCard } from "./SummaryCard";

type InspectorTab = "memory" | "prompt" | "diff" | "debug";

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
  const latestTurn = context?.latest_turn ?? contextDiff?.turn ?? 0;
  const [activeTab, setActiveTab] = useState<InspectorTab>("memory");
  const tabs: Array<{ id: InspectorTab; label: string }> = [
    { id: "memory", label: "Memory" },
    { id: "prompt", label: "Prompt" },
    { id: "diff", label: "Diff" },
    { id: "debug", label: "Debug" },
  ];

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
          <div className="inspector-tabs" role="tablist" aria-label="Context inspector sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={activeTab === tab.id ? "inspector-tab inspector-tab-active" : "inspector-tab"}
                aria-selected={activeTab === tab.id}
                data-testid={`inspector-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "memory" ? (
            <div className="tab-panel-grid" data-testid="inspector-panel-memory">
              <SummaryCard summary={summary} memoryEnabled={resolvedMemoryEnabled} />
              <FactsCard facts={facts} memoryEnabled={resolvedMemoryEnabled} />
              <section className="inspector-card-panel" data-testid="recent-messages-section">
                <div className="inspector-card-header">
                  <div>
                    <p className="section-kicker">Working memory</p>
                    <h3>Recent messages</h3>
                  </div>
                  <span className="card-tag">{resolvedMemoryEnabled ? `${recentMessages.length} recent` : "Disabled"}</span>
                </div>
                {!resolvedMemoryEnabled ? (
                  <p className="card-body">Disabled for this turn. Recent working memory was bypassed.</p>
                ) : recentMessages.length === 0 ? (
                  <p className="card-body">No recent messages are currently available in working memory.</p>
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
              </section>
              <ChunksCard chunks={chunks} memoryEnabled={resolvedMemoryEnabled} />
            </div>
          ) : null}

          {activeTab === "prompt" ? (
            <div className="tab-panel-grid" data-testid="inspector-panel-prompt">
              <PackedContextCard
                packedContext={packedContext}
                contextLengthChars={contextLengthChars}
                memoryEnabled={resolvedMemoryEnabled}
              />
            </div>
          ) : null}

          {contextDiffError ? (
            <div className="error-banner">
              <strong>Context diff issue.</strong> {contextDiffError}
            </div>
          ) : null}

          {activeTab === "diff" ? (
            <div className="tab-panel-grid" data-testid="inspector-panel-diff">
              <ContextDiffCard contextDiff={contextDiff} />
            </div>
          ) : null}

          {activeTab === "debug" ? (
            <div className="tab-panel-grid" data-testid="inspector-panel-debug">
              <DebugCard
                sessionId={sessionId}
                userId={userId}
                totalMessages={totalMessages}
                recentMessages={recentMessages}
                taskState={taskState}
                memoryEnabled={resolvedMemoryEnabled}
                debug={debug}
                latestTurn={latestTurn}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
