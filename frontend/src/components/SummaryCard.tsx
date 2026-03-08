type SummaryCardProps = {
  summary: string;
};

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <section className="inspector-card">
      <div className="card-header">
        <p className="section-kicker">Working memory</p>
        <h3>Session summary</h3>
      </div>
      <p className="card-body">
        {summary || "No summary yet. Send a few messages and ContextWeave will condense the session state here."}
      </p>
    </section>
  );
}

