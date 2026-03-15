type HeaderProps = {
  healthStatus: "checking" | "online" | "offline";
  apiBaseUrl: string;
  demoMode: boolean;
  sessionId: string;
  userId: string;
  memoryEnabled: boolean;
  onMemoryEnabledChange: (value: boolean) => void;
  onResetSession: () => void;
};

export function Header({
  healthStatus,
  apiBaseUrl,
  demoMode,
  sessionId,
  userId,
  memoryEnabled,
  onMemoryEnabledChange,
  onResetSession,
}: HeaderProps) {
  const backendLabel = demoMode ? "Mock backend" : healthStatus === "online" ? "Live backend" : "Backend offline";
  const providerLabel = demoMode ? "Mock provider" : "Live provider";

  return (
    <header className="app-header compact-header" data-testid="app-header">
      <div className="brand-block header-brand">
        <div className="brand-lockup">
          <div className="brand-copy">
            <p className="eyebrow">Context debugging workspace</p>
            <h1>ContextWeave</h1>
          </div>
        </div>
        <p className="tagline">Context continuity beyond the prompt.</p>
      </div>

      <div className="header-workspace">
        <div className="header-session">
          <div className="header-chip-group">
            <span className="mode-pill">{backendLabel}</span>
            <span className="mode-pill">{providerLabel}</span>
            <span className={`status-pill status-${healthStatus}`}>
              {demoMode ? "GitHub Pages demo" : "Railway backend"}
            </span>
          </div>
          <div className="session-inline-meta">
            <div className="session-inline-card">
              <span>Session</span>
              <code>{sessionId}</code>
            </div>
            <div className="session-inline-card">
              <span>User</span>
              <code>{userId}</code>
            </div>
          </div>
        </div>

        <div className="header-controls">
          <div className="memory-toggle" data-testid="memory-toggle" role="group" aria-label="Memory mode">
            <button
              className={memoryEnabled ? "toggle-button toggle-button-active" : "toggle-button"}
              data-testid="memory-on"
              type="button"
              onClick={() => onMemoryEnabledChange(true)}
              aria-pressed={memoryEnabled}
            >
              Memory ON
            </button>
            <button
              className={!memoryEnabled ? "toggle-button toggle-button-active" : "toggle-button"}
              data-testid="memory-off"
              type="button"
              onClick={() => onMemoryEnabledChange(false)}
              aria-pressed={!memoryEnabled}
            >
              Memory OFF
            </button>
          </div>
          <button className="ghost-button" data-testid="reset-session" onClick={onResetSession} type="button">
            Reset session
          </button>
          <div className="endpoint-block">
            <span>API endpoint</span>
            <code>{apiBaseUrl}</code>
          </div>
        </div>
      </div>
    </header>
  );
}
