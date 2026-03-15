import { useEffect, useState } from "react";

import { API_BASE_URL, DEMO_MODE, getContextDiff, getHealth, getSessionContext, sendChatMessage } from "./api/client";
import { ChatPanel } from "./components/ChatPanel";
import { ContextTimeline } from "./components/ContextTimeline";
import { ContextInspector } from "./components/ContextInspector";
import { Header } from "./components/Header";
import type { ContextDebug, ContextDiffResponse, SessionContext } from "./types";

const DEMO_SESSION_ID = "demo-session";
const DEMO_USER_ID = "demo-user";

export default function App() {
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [sessionId, setSessionId] = useState(DEMO_SESSION_ID);
  const [userId, setUserId] = useState(DEMO_USER_ID);
  const [draftSessionId, setDraftSessionId] = useState(DEMO_SESSION_ID);
  const [draftUserId, setDraftUserId] = useState(DEMO_USER_ID);
  const [context, setContext] = useState<SessionContext | null>(null);
  const [latestDebug, setLatestDebug] = useState<ContextDebug | null>(null);
  const [contextDiff, setContextDiff] = useState<ContextDiffResponse | null>(null);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextDiffError, setContextDiffError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then(() => setHealthStatus("online"))
      .catch(() => setHealthStatus("offline"));
  }, []);

  useEffect(() => {
    void loadContext(sessionId);
  }, [sessionId]);

  async function loadContext(nextSessionId: string) {
    setContextLoading(true);
    setContextError(null);
    try {
      const nextContext = await getSessionContext(nextSessionId);
      setContext(nextContext);
      if (nextContext.latest_turn > 0) {
        try {
          const nextDiff = await getContextDiff(nextSessionId, nextContext.latest_turn);
          setContextDiff(nextDiff);
          setContextDiffError(null);
        } catch (error) {
          setContextDiff(null);
          setContextDiffError(error instanceof Error ? error.message : "Unable to load context diff");
        }
      } else {
        setContextDiff(null);
        setContextDiffError(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load session context";
      if (message.includes("not found")) {
        setContext(null);
        setContextDiff(null);
        setContextError("No stored context exists yet for this session. Send a message to start building memory.");
      } else {
        setContextError("Unable to refresh context inspector. The latest session view may be stale.");
      }
    } finally {
      setContextLoading(false);
    }
  }

  async function handleSendMessage(message: string) {
    setChatLoading(true);
    setChatError(null);
    setProcessingLabel("Building context...");
    try {
      setProcessingLabel(memoryEnabled ? "Retrieving memory..." : "Packing prompt...");
      const result = await sendChatMessage({
        session_id: sessionId,
        user_id: userId,
        message,
        memory_enabled: memoryEnabled,
      });
      setLatestDebug(result.debug ?? null);
      setProcessingLabel("Refreshing inspector...");
      await loadContext(sessionId);
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Unable to send message. Check whether the Railway backend is reachable.",
      );
    } finally {
      setProcessingLabel(null);
      setChatLoading(false);
    }
  }

  function handleApplySession() {
    const nextSessionId = draftSessionId.trim() || DEMO_SESSION_ID;
    const nextUserId = draftUserId.trim() || DEMO_USER_ID;
    setSessionId(nextSessionId);
    setUserId(nextUserId);
    setLatestDebug(null);
    setContextDiff(null);
    setContextDiffError(null);
    void loadContext(nextSessionId);
  }

  function handleResetSession() {
    setContext(null);
    setLatestDebug(null);
    setContextDiff(null);
    setChatError(null);
    setContextError(null);
    setContextDiffError(null);
  }

  function handleLoadDemo() {
    setDraftSessionId(DEMO_SESSION_ID);
    setDraftUserId(DEMO_USER_ID);
    setSessionId(DEMO_SESSION_ID);
    setUserId(DEMO_USER_ID);
    setLatestDebug(null);
    setContextDiff(null);
    setContextDiffError(null);
    setMemoryEnabled(true);
    void loadContext(DEMO_SESSION_ID);
  }

  return (
    <div className="app-shell">
      <Header
        healthStatus={healthStatus}
        apiBaseUrl={API_BASE_URL}
        demoMode={DEMO_MODE}
        sessionId={sessionId}
        userId={userId}
        memoryEnabled={memoryEnabled}
        onMemoryEnabledChange={setMemoryEnabled}
        onResetSession={handleResetSession}
      />

      <main className="app-content">
        <section className="main-layout">
        <ChatPanel
          sessionId={sessionId}
          userId={userId}
          draftSessionId={draftSessionId}
          draftUserId={draftUserId}
          messages={context?.messages ?? []}
          debug={latestDebug}
          loading={chatLoading}
          error={chatError}
          onSessionIdChange={setDraftSessionId}
          onUserIdChange={setDraftUserId}
          onApplySession={handleApplySession}
          onLoadDemo={handleLoadDemo}
          memoryEnabled={memoryEnabled}
          processingLabel={processingLabel}
          onSendMessage={handleSendMessage}
        />

        <ContextInspector
          context={context}
          debug={latestDebug}
          contextDiff={contextDiff}
          memoryEnabled={memoryEnabled}
          loading={contextLoading}
          error={contextError}
          contextDiffError={contextDiffError}
        />
        </section>

        <ContextTimeline context={context} contextDiff={contextDiff} />
      </main>

      <footer className="app-footer">
        <p>ContextWeave demo UI for inspecting conversation memory, summary, facts, and retrieval context.</p>
      </footer>
    </div>
  );
}
