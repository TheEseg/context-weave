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
              <span className="diff-stat diff-stat-added">+ {added.length}</span>
              <span className="diff-stat diff-stat-removed">- {removed.length}</span>
              <span className="diff-stat diff-stat-unchanged">• {unchanged.length}</span>
            </div>
          </div>
          {total === 0 ? <p className="card-body">No context changes were detected between the last two turns.</p> : null}

          <div className="diff-columns">
            <div className="diff-group diff-group-added">
              <div className="diff-group-heading">
                <h4>Added</h4>
                <span>New context brought into this turn</span>
              </div>
              {added.length === 0 ? (
                <p className="card-body muted">No added elements.</p>
              ) : (
                <DiffList items={added} prefix="+" variant="added" />
              )}
            </div>
            <div className="diff-group diff-group-removed">
              <div className="diff-group-heading">
                <h4>Removed</h4>
                <span>No longer included in the packed context</span>
              </div>
              {removed.length === 0 ? (
                <p className="card-body muted">No removed elements.</p>
              ) : (
                <DiffList items={removed} prefix="-" variant="removed" />
              )}
            </div>
            <div className="diff-group diff-group-unchanged">
              <div className="diff-group-heading">
                <h4>Unchanged</h4>
                <span>Still supporting the current turn</span>
              </div>
              {unchanged.length === 0 ? (
                <p className="card-body muted">No unchanged elements.</p>
              ) : (
                <DiffList items={unchanged} prefix="•" variant="unchanged" />
              )}
            </div>
          </div>
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
    default:
      return type.replace(/_/g, " ");
  }
}
