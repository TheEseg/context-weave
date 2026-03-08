type HeaderProps = {
  healthStatus: "checking" | "online" | "offline";
  apiBaseUrl: string;
};

export function Header({ healthStatus, apiBaseUrl }: HeaderProps) {
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
        <span className={`status-pill status-${healthStatus}`}>
          Backend {healthStatus === "checking" ? "checking" : healthStatus}
        </span>
        <code>{apiBaseUrl}</code>
      </div>
    </header>
  );
}
