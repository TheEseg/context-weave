import { useEffect, useState } from "react";

import { API_BASE_URL, getHealth, getSessionContext, sendChatMessage } from "./api/client";
import { ChatPanel } from "./components/ChatPanel";
import { ContextInspector } from "./components/ContextInspector";
import { Header } from "./components/Header";
import type { SessionContext } from "./types";

const DEMO_SESSION_ID = "demo-session";
const DEMO_USER_ID = "demo-user";

export default function App() {
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [sessionId, setSessionId] = useState(DEMO_SESSION_ID);
  const [userId, setUserId] = useState(DEMO_USER_ID);
  const [draftSessionId, setDraftSessionId] = useState(DEMO_SESSION_ID);
  const [draftUserId, setDraftUserId] = useState(DEMO_USER_ID);
  const [context, setContext] = useState<SessionContext | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load session context";
      setContext(null);
      setContextError(message);
    } finally {
      setContextLoading(false);
    }
  }

  async function handleSendMessage(message: string) {
    setChatLoading(true);
    setChatError(null);
    try {
      await sendChatMessage({
        session_id: sessionId,
        user_id: userId,
        message,
      });
      await loadContext(sessionId);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Unable to send message");
    } finally {
      setChatLoading(false);
    }
  }

  function handleApplySession() {
    setSessionId(draftSessionId.trim() || DEMO_SESSION_ID);
    setUserId(draftUserId.trim() || DEMO_USER_ID);
  }

  function handleResetSession() {
    setContext(null);
    setChatError(null);
    setContextError(null);
  }

  function handleLoadDemo() {
    setDraftSessionId(DEMO_SESSION_ID);
    setDraftUserId(DEMO_USER_ID);
    setSessionId(DEMO_SESSION_ID);
    setUserId(DEMO_USER_ID);
  }

  return (
    <div className="app-shell">
      <Header healthStatus={healthStatus} apiBaseUrl={API_BASE_URL} />

      <main className="main-layout">
        <ChatPanel
          sessionId={sessionId}
          userId={userId}
          draftSessionId={draftSessionId}
          draftUserId={draftUserId}
          messages={context?.messages ?? []}
          loading={chatLoading}
          error={chatError}
          onSessionIdChange={setDraftSessionId}
          onUserIdChange={setDraftUserId}
          onApplySession={handleApplySession}
          onResetSession={handleResetSession}
          onLoadDemo={handleLoadDemo}
          onSendMessage={handleSendMessage}
        />

        <ContextInspector context={context} loading={contextLoading} error={contextError} />
      </main>

      <footer className="app-footer">
        <p>ContextWeave demo UI for inspecting conversation memory, summary, facts, and retrieval context.</p>
      </footer>
    </div>
  );
}

