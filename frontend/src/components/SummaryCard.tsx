type SummaryCardProps = {
  summary: string;
  memoryEnabled: boolean;
};

export function SummaryCard({ summary, memoryEnabled }: SummaryCardProps) {
  return (
    <section className="inspector-card-panel" data-testid="summary-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Working memory</p>
          <h3>Session summary</h3>
        </div>
        <span className="card-tag">{memoryEnabled ? "Compressed view" : "Disabled"}</span>
      </div>
      <p className="card-body">
        {!memoryEnabled
          ? "Disabled for this turn. ContextWeave bypassed summary reconstruction and sent only the current user message."
          : summary || "No summary yet. Send a few messages and ContextWeave will condense the session state here."}
      </p>
    </section>
  );
}
