import { InspectorSection } from "./InspectorSection";

type SummaryCardProps = {
  summary: string;
  memoryEnabled: boolean;
};

export function SummaryCard({ summary, memoryEnabled }: SummaryCardProps) {
  return (
    <InspectorSection
      title="Session summary"
      subtitle="Working memory"
      meta={<span className="card-tag">{memoryEnabled ? "Compressed view" : "Disabled"}</span>}
      testId="summary-section"
    >
      <p className="card-body">
        {!memoryEnabled
          ? "Disabled for this turn. ContextWeave bypassed summary reconstruction and sent only the current user message."
          : summary || "No summary yet. Send a few messages and ContextWeave will condense the session state here."}
      </p>
    </InspectorSection>
  );
}
