import { InspectorSection } from "./InspectorSection";

type SummaryCardProps = {
  summary: string;
};

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <InspectorSection
      title="Session summary"
      subtitle="Working memory"
      meta={<span className="card-tag">Compressed view</span>}
      testId="summary-section"
    >
      <p className="card-body">
        {summary || "No summary yet. Send a few messages and ContextWeave will condense the session state here."}
      </p>
    </InspectorSection>
  );
}
