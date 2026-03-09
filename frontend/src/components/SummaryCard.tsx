type SummaryCardProps = {
  summary: string;
};

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <section className="inspector-card">
      <div className="card-header">
        <div>
          <p className="section-kicker">Working memory</p>
          <h3>Session summary</h3>
        </div>
        <span className="card-tag">Compressed view</span>
      </div>
      <p className="card-body">
        {summary || "No summary yet. Send a few messages and ContextWeave will condense the session state here."}
      </p>
    </section>
  );
}
