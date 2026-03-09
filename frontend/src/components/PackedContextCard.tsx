import { InspectorSection } from "./InspectorSection";

type PackedContextCardProps = {
  packedContext: string;
  contextLengthChars?: number;
  memoryEnabled: boolean;
};

export function PackedContextCard({
  packedContext,
  contextLengthChars,
  memoryEnabled,
}: PackedContextCardProps) {
  return (
    <InspectorSection
      title="Final packed context"
      subtitle="Context debugger"
      meta={
        <span className="card-tag">
          {contextLengthChars !== undefined ? `${contextLengthChars} chars` : memoryEnabled ? "Live pack" : "Current message only"}
        </span>
      }
      defaultOpen={false}
      testId="packed-context-section"
    >
      {packedContext ? (
        <div className="packed-context-block">
          <p className="packed-context-meta">
            {memoryEnabled ? "Final packed context sent to the provider." : "Memory bypassed: current user message only."}
          </p>
          <pre>{packedContext}</pre>
        </div>
      ) : (
        <p className="card-body">
          Send a message to inspect the final packed context that ContextWeave assembled for the provider.
        </p>
      )}
    </InspectorSection>
  );
}
