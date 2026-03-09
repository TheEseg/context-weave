type HeaderProps = {
  healthStatus: "checking" | "online" | "offline";
  apiBaseUrl: string;
  demoMode: boolean;
};

export function Header({ healthStatus, apiBaseUrl, demoMode }: HeaderProps) {
  const backendLabel = demoMode ? "Mock backend" : healthStatus === "online" ? "Live backend" : "Backend offline";
  const providerLabel = demoMode ? "Mock provider" : "Live provider";

  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-lockup">
          <div className="brand-copy">
            <p className="eyebrow">Layered memory demo</p>
            <h1>ContextWeave</h1>
          </div>
        </div>
        <p className="tagline">Context continuity beyond the prompt.</p>
      </div>

      <div className="header-meta">
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <span className="mode-pill">{backendLabel}</span>
        <span className="mode-pill">{providerLabel}</span>
        <span className={`status-pill status-${healthStatus}`}>
          {demoMode ? "GitHub Pages demo" : "Railway backend"}
        </span>
        <div className="endpoint-block">
          <span>API endpoint</span>
          <code>{apiBaseUrl}</code>
        </div>
      </div>
    </header>
  );
}
