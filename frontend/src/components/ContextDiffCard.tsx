import type { ContextDiffResponse } from "../types";

type ContextDiffCardProps = {
  contextDiff: ContextDiffResponse | null;
};

export function ContextDiffCard({ contextDiff }: ContextDiffCardProps) {
  const added = contextDiff?.diff.added ?? [];
  const removed = contextDiff?.diff.removed ?? [];
  const unchanged = contextDiff?.diff.unchanged ?? [];
  const total = added.length + removed.length + unchanged.length;

  return (
    <section className="inspector-card-panel" data-testid="context-diff-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Observability</p>
          <h3>Context Diff</h3>
        </div>
        <span className="card-tag">{contextDiff ? `Turn ${contextDiff.turn}` : "Awaiting turn data"}</span>
      </div>
      {!contextDiff ? (
        <p className="card-body">Send at least one message to compare the current packed context with the previous turn.</p>
      ) : (
        <div className="diff-block">
          <div className="diff-summary-bar">
            <p className="packed-context-meta">These context elements changed since the previous turn.</p>
            <div className="diff-stat-chips">
              <span className="diff-stat diff-stat-added">{added.length} added</span>
              <span className="diff-stat diff-stat-removed">{removed.length} removed</span>
              <span className="diff-stat diff-stat-unchanged">{unchanged.length} unchanged</span>
            </div>
          </div>
          {total === 0 ? (
            <div className="diff-empty-state">
              <strong>No context changes since the previous turn.</strong>
              <span>The packed context remained stable across these two turns.</span>
            </div>
          ) : (
            <div className="diff-layout">
              <section className="diff-group diff-group-added diff-group-primary" data-testid="diff-group-added">
                <div className="diff-group-heading">
                  <h4>Added ({added.length})</h4>
                  <span>New context brought into this turn</span>
                </div>
                {added.length === 0 ? (
                  <p className="card-body muted">No added elements.</p>
                ) : (
                  <DiffList items={added} prefix="+" variant="added" />
                )}
              </section>

              <div className="diff-side-stack">
                <section className="diff-group diff-group-removed" data-testid="diff-group-removed">
                  <div className="diff-group-heading">
                    <h4>Removed ({removed.length})</h4>
                    <span>No longer included in the packed context</span>
                  </div>
                  {removed.length === 0 ? (
                    <p className="card-body muted">No removed elements.</p>
                  ) : (
                    <DiffList items={removed} prefix="-" variant="removed" />
                  )}
                </section>

                <details className="diff-group diff-group-unchanged diff-group-collapsible" data-testid="diff-group-unchanged">
                  <summary className="diff-group-summary">
                    <div className="diff-group-heading">
                      <h4>Unchanged ({unchanged.length})</h4>
                      <span>Still supporting the current turn</span>
                    </div>
                    <span className="diff-collapse-label">{unchanged.length > 0 ? "Show" : "Empty"}</span>
                  </summary>
                  <div className="diff-group-body">
                    {unchanged.length === 0 ? (
                      <p className="card-body muted">No unchanged elements.</p>
                    ) : (
                      <DiffList items={unchanged} prefix="•" variant="unchanged" />
                    )}
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function DiffList({
  items,
  prefix,
  variant,
}: {
  items: Array<{ type: string; value: string }>;
  prefix: string;
  variant: "added" | "removed" | "unchanged";
}) {
  return (
    <ul className="diff-list">
      {items.map((item) => (
        <li key={`${item.type}-${item.value}`} className={`diff-row diff-row-${variant}`}>
          <div className="diff-row-top">
            <strong className="diff-row-marker">{prefix}</strong>
            <span>{formatDiffType(item.type)}</span>
          </div>
          <p>{item.value}</p>
        </li>
      ))}
    </ul>
  );
}

function formatDiffType(type: string): string {
  switch (type) {
    case "fact":
      return "Fact";
    case "retrieval_chunk":
      return "Retrieved chunk";
    case "recent_message":
      return "Recent message";
    case "packed_context":
      return "Packed context";
    case "session_summary":
      return "Summary";
    default:
      return type.replace(/_/g, " ");
  }
}
