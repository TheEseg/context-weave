import type { ContextBudget } from "../types";

type ContextBudgetCardProps = {
  budget: ContextBudget | null | undefined;
};

const budgetRows: Array<{ key: keyof ContextBudget; label: string }> = [
  { key: "system_prompt", label: "System prompt" },
  { key: "session_summary", label: "Summary" },
  { key: "facts", label: "Facts" },
  { key: "retrieved_chunks", label: "Retrieved chunks" },
  { key: "recent_messages", label: "Recent messages" },
];

export function ContextBudgetCard({ budget }: ContextBudgetCardProps) {
  return (
    <section className="inspector-card-panel" data-testid="context-budget-section">
      <div className="inspector-card-header">
        <div>
          <p className="section-kicker">Prompt observability</p>
          <h3>Context budget</h3>
        </div>
        <span className="card-tag">
          {budget ? `${Math.round(budget.usage_ratio * 100)}% used` : "Awaiting debug data"}
        </span>
      </div>

      {!budget ? (
        <p className="card-body">
          Send a message to inspect how the final prompt budget is distributed across summary, facts, retrieval, and recent
          messages.
        </p>
      ) : (
        <div className="budget-block">
          <div className="budget-summary">
            <div className="budget-total-row">
              <span>Total</span>
              <strong>
                {budget.final_packed_context_total} / {budget.model_limit} {budget.unit}
              </strong>
            </div>
            <div className="budget-total-row">
              <span>Usage</span>
              <strong>{Math.round(budget.usage_ratio * 100)}%</strong>
            </div>
          </div>

          <div className="budget-rows">
            {budgetRows.map((row) => {
              const value = budget[row.key] as number;
              const width = budget.model_limit > 0 ? Math.min(100, (value / budget.model_limit) * 100) : 0;
              return (
                <div key={row.key} className="budget-row">
                  <div className="budget-row-meta">
                    <span>{row.label}</span>
                    <strong>{value}</strong>
                  </div>
                  <div className="budget-bar-track" aria-hidden="true">
                    <div className="budget-bar-fill" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {budget.warning ? (
            <div
              className={
                budget.usage_ratio >= 1 || budget.truncated ? "budget-warning budget-warning-critical" : "budget-warning"
              }
            >
              <strong>{budget.usage_ratio >= 1 || budget.truncated ? "Limit exceeded" : "Heads up"}</strong>
              <span>{budget.warning}</span>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
