import type { ContextDiffResponse } from "../types";
import { InspectorSection } from "./InspectorSection";

type ContextDiffCardProps = {
  contextDiff: ContextDiffResponse | null;
};

export function ContextDiffCard({ contextDiff }: ContextDiffCardProps) {
  const added = contextDiff?.diff.added ?? [];
  const removed = contextDiff?.diff.removed ?? [];
  const unchanged = contextDiff?.diff.unchanged ?? [];
  const total = added.length + removed.length + unchanged.length;

  return (
    <InspectorSection
      title="Context Diff"
      subtitle="Observability"
      meta={<span className="card-tag">{contextDiff ? `Turn ${contextDiff.turn}` : "Awaiting turn data"}</span>}
      defaultOpen={true}
      testId="context-diff-section"
    >
      {!contextDiff ? (
        <p className="card-body">Send at least one message to compare the current packed context with the previous turn.</p>
      ) : (
        <div className="diff-block">
          <p className="packed-context-meta">These context elements changed since the previous turn.</p>
          {total === 0 ? <p className="card-body">No context changes were detected between the last two turns.</p> : null}

          <div className="diff-columns">
            <div className="diff-group">
              <h4>* Added</h4>
              {added.length === 0 ? <p className="card-body muted">No added elements.</p> : <DiffList items={added} />}
            </div>
            <div className="diff-group">
              <h4>- Removed</h4>
              {removed.length === 0 ? <p className="card-body muted">No removed elements.</p> : <DiffList items={removed} />}
            </div>
            <div className="diff-group">
              <h4>• Unchanged</h4>
              {unchanged.length === 0 ? <p className="card-body muted">No unchanged elements.</p> : <DiffList items={unchanged} />}
            </div>
          </div>
        </div>
      )}
    </InspectorSection>
  );
}

function DiffList({ items }: { items: Array<{ type: string; value: string }> }) {
  return (
    <ul className="diff-list">
      {items.map((item) => (
        <li key={`${item.type}-${item.value}`}>
          <span>{item.type}</span>
          <p>{item.value}</p>
        </li>
      ))}
    </ul>
  );
}
