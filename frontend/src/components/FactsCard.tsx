import type { SessionFact } from "../types";

type FactsCardProps = {
  facts: SessionFact[];
  memoryEnabled: boolean;
};

export function FactsCard({ facts, memoryEnabled }: FactsCardProps) {
  return (
    <section className="inspector-card-panel" data-testid="facts-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Persistent memory</p>
          <h3>Retrieved facts</h3>
        </div>
        <span className="card-tag">{memoryEnabled ? `${facts.length} stored` : "Disabled"}</span>
      </div>
      {!memoryEnabled ? (
        <p className="card-body">Disabled for this turn. Persistent facts were not pulled into the model context.</p>
      ) : facts.length === 0 ? (
        <p className="card-body">No durable facts extracted yet for this session.</p>
      ) : (
        <ul className="fact-list">
          {facts.map((fact) => (
            <li key={`${fact.fact_key}-${fact.fact_value}`}>
              <span>{fact.fact_key}</span>
              <strong>{fact.fact_value}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
