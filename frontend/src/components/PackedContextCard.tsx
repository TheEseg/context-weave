type PackedContextCardProps = {
  packedContext: string;
  contextLengthChars?: number;
  memoryEnabled: boolean;
};

export function PackedContextCard({
  packedContext,
  contextLengthChars,
  memoryEnabled,
}: PackedContextCardProps) {
  return (
    <section className="inspector-card-panel" data-testid="packed-context-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Context debugger</p>
          <h3>Final packed context</h3>
        </div>
        <span className="card-tag">
          {contextLengthChars !== undefined ? `${contextLengthChars} chars` : memoryEnabled ? "Live pack" : "Current message only"}
        </span>
      </div>
      {packedContext ? (
        <div className="packed-context-block">
          <p className="packed-context-meta">
            {memoryEnabled ? "Final packed context sent to the provider." : "Memory bypassed: current user message only."}
          </p>
          <pre>{packedContext}</pre>
        </div>
      ) : (
        <p className="card-body">
          Send a message to inspect the final packed context that ContextWeave assembled for the provider.
        </p>
      )}
    </section>
  );
}
