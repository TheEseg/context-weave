import type { SessionFact } from "../types";
import { InspectorSection } from "./InspectorSection";

type FactsCardProps = {
  facts: SessionFact[];
  memoryEnabled: boolean;
};

export function FactsCard({ facts, memoryEnabled }: FactsCardProps) {
  return (
    <InspectorSection
      title="Retrieved facts"
      subtitle="Persistent memory"
      meta={<span className="card-tag">{memoryEnabled ? `${facts.length} stored` : "Disabled"}</span>}
      testId="facts-section"
    >
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
    </InspectorSection>
  );
}
