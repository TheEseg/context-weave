import type { SessionFact } from "../types";

type FactsCardProps = {
  facts: SessionFact[];
};

export function FactsCard({ facts }: FactsCardProps) {
  return (
    <section className="inspector-card">
      <div className="card-header">
        <div>
          <p className="section-kicker">Persistent memory</p>
          <h3>Retrieved facts</h3>
        </div>
        <span className="card-tag">{facts.length} stored</span>
      </div>
      {facts.length === 0 ? (
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
