import type { SessionFact } from "../types";
import { InspectorSection } from "./InspectorSection";

type FactsCardProps = {
  facts: SessionFact[];
};

export function FactsCard({ facts }: FactsCardProps) {
  return (
    <InspectorSection
      title="Retrieved facts"
      subtitle="Persistent memory"
      meta={<span className="card-tag">{facts.length} stored</span>}
      testId="facts-section"
    >
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
    </InspectorSection>
  );
}
