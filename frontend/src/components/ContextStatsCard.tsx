type ContextStatsCardProps = {
  factsCount: number;
  chunksCount: number;
  recentMessagesCount: number;
  packedContextChars: number;
  memoryEnabled: boolean;
};

const stats = [
  { key: "facts", label: "Facts" },
  { key: "chunks", label: "Retrieved" },
  { key: "recent", label: "Recent messages" },
  { key: "packed", label: "Packed context" },
] as const;

export function ContextStatsCard({
  factsCount,
  chunksCount,
  recentMessagesCount,
  packedContextChars,
  memoryEnabled,
}: ContextStatsCardProps) {
  const values = {
    facts: memoryEnabled ? String(factsCount) : "disabled",
    chunks: memoryEnabled ? String(chunksCount) : "disabled",
    recent: memoryEnabled ? String(recentMessagesCount) : "disabled",
    packed: `${packedContextChars} chars`,
  };

  return (
    <section className="inspector-card-panel" data-testid="context-stats-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Quick scan</p>
          <h3>Context stats</h3>
        </div>
        <span className="card-tag">{memoryEnabled ? "Live counts" : "Memory bypassed"}</span>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.key} className="stat-card">
            <span>{stat.label}</span>
            <strong>{values[stat.key]}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
