import type { ContextDiffResponse, SessionContext } from "../types";

type ContextTimelineProps = {
  context: SessionContext | null;
  contextDiff: ContextDiffResponse | null;
};

type TimelineEntry = {
  turn: number;
  userMessage: string;
  assistantMessage: string;
  extractedFacts: string[];
  note: string;
};

export function ContextTimeline({ context, contextDiff }: ContextTimelineProps) {
  const timeline = buildTimeline(context, contextDiff);

  return (
    <section className="panel timeline-panel" data-testid="context-timeline">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Context evolution</p>
          <h2>Context timeline</h2>
          <p className="panel-intro">
            A chronological view of how conversation turns, extracted facts, and context changes evolve over the session.
          </p>
        </div>
        <span className="inspector-status">{timeline.length} turns</span>
      </div>

      {timeline.length === 0 ? (
        <div className="empty-state compact">
          <h3>No timeline yet</h3>
          <p>Start a conversation to see turn-by-turn context evolution.</p>
        </div>
      ) : (
        <div className="timeline-list">
          {timeline.map((entry) => (
            <article key={entry.turn} className="timeline-item" data-testid="timeline-turn">
              <div className="timeline-turn-marker">
                <span>Turn</span>
                <strong>{entry.turn}</strong>
              </div>
              <div className="timeline-content">
                <div className="timeline-row">
                  <span className="timeline-role">User</span>
                  <p>{entry.userMessage}</p>
                </div>
                <div className="timeline-row timeline-row-assistant">
                  <span className="timeline-role">Assistant</span>
                  <p>{entry.assistantMessage}</p>
                </div>
                <div className="timeline-footer">
                  <div className="timeline-facts">
                    {entry.extractedFacts.length === 0 ? (
                      <span className="timeline-chip timeline-chip-muted">No extracted fact</span>
                    ) : (
                      entry.extractedFacts.map((fact) => (
                        <span key={fact} className="timeline-chip">
                          {fact}
                        </span>
                      ))
                    )}
                  </div>
                  <p className="timeline-note">{entry.note}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function buildTimeline(context: SessionContext | null, contextDiff: ContextDiffResponse | null): TimelineEntry[] {
  if (!context) {
    return [];
  }

  const entries: TimelineEntry[] = [];
  for (let index = 0; index < context.messages.length; index += 2) {
    const userMessage = context.messages[index];
    const assistantMessage = context.messages[index + 1];
    if (!userMessage || !assistantMessage) {
      continue;
    }

    const turn = entries.length + 1;
    const extractedFacts = detectFacts(userMessage.content);
    const hasLatestDiff = contextDiff?.turn === turn;
    const note = hasLatestDiff
      ? buildDiffNote(contextDiff)
      : extractedFacts.length > 0
        ? "New context signals were introduced in this turn."
        : "Session state remained mostly conversational in this turn.";

    entries.push({
      turn,
      userMessage: userMessage.content,
      assistantMessage: truncate(assistantMessage.content, 180),
      extractedFacts,
      note,
    });
  }

  return entries;
}

function detectFacts(message: string): string[] {
  const lower = message.toLowerCase();
  const facts: string[] = [];

  for (const item of ["FastAPI", "Redis", "PostgreSQL", "GitHub Pages", "Railway"]) {
    if (lower.includes(item.toLowerCase())) {
      facts.push(item);
    }
  }

  return facts;
}

function buildDiffNote(contextDiff: ContextDiffResponse): string {
  const added = contextDiff.diff.added.length;
  const removed = contextDiff.diff.removed.length;

  if (added === 0 && removed === 0) {
    return "Packed context stayed stable relative to the previous turn.";
  }

  return `Packed context changed: ${added} added, ${removed} removed.`;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}
