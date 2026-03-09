import type { PropsWithChildren, ReactNode } from "react";

type InspectorSectionProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  mobileOnlyCollapse?: boolean;
  meta?: ReactNode;
  testId?: string;
}>;

export function InspectorSection({
  title,
  subtitle,
  defaultOpen = true,
  mobileOnlyCollapse = true,
  meta,
  testId,
  children,
}: InspectorSectionProps) {
  return (
    <details
      data-testid={testId}
      className={`inspector-section${mobileOnlyCollapse ? " inspector-section-mobile" : ""}`}
      open={defaultOpen}
    >
      <summary className="inspector-section-summary">
        <div>
          <p className="section-kicker">{subtitle}</p>
          <h3>{title}</h3>
        </div>
        <div className="inspector-section-meta">
          {meta}
          <span className="inspector-chevron" aria-hidden="true">
            ▾
          </span>
        </div>
      </summary>
      <div className="inspector-section-body">{children}</div>
    </details>
  );
}
