"use client";

import Image from "next/image";
import { LogOut, Save, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createDefaultDocument, validateDocument, type CmsDocument } from "@/lib/cms/model";
import { announce, repository } from "@/lib/cms/storage";
import { Login } from "./Login";
import { VisualEditor } from "./VisualEditor";
import "./control.css";

function Loading({ label }: { label: string }) {
  return (
    <div className="ctl-loading" role="status">
      <Image src="/assets/site/beyonn-control-logo.png" alt="Beyonn" width={165} height={34} />
      <p>{label}</p>
    </div>
  );
}

export default function ControlDashboard() {
  const [session, setSession] = useState<"checking" | "signed-in" | "signed-out">("checking");
  const [notice, setNotice] = useState("");
  const activity = useRef(0);
  const touch = useCallback(() => { activity.current = Date.now(); }, []);

  useEffect(() => {
    const request = new AbortController();
    void fetch("/api/control/session", { signal: request.signal, cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSession(data.authenticated ? "signed-in" : "signed-out"))
      .catch(() => { if (!request.signal.aborted) setSession("signed-out"); });
    return () => request.abort();
  }, []);

  useEffect(() => {
    if (session !== "signed-in") return;
    touch();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) => window.addEventListener(event, touch, { passive: true }));
    function expire() {
      setNotice("Your session ended. Sign in again to continue.");
      setSession("signed-out");
    }
    const timer = window.setInterval(() => {
      if (Date.now() - activity.current > 15 * 60_000) {
        void fetch("/api/control/session", { method: "DELETE" }).catch(() => {});
        expire();
      } else {
        void fetch("/api/control/session", { method: "PATCH" })
          .then((response) => { if (response.status === 401) expire(); })
          .catch(() => {});
      }
    }, 60_000);
    return () => {
      clearInterval(timer);
      events.forEach((event) => window.removeEventListener(event, touch));
    };
  }, [session, touch]);

  if (session === "checking") return <Loading label="Opening Beyonn Control…" />;
  if (session === "signed-out") return (
    <>
      <Login onLogin={() => { setNotice(""); setSession("signed-in"); }} />
      {notice && <p className="ctl-toast" role="status">{notice}</p>}
    </>
  );
  return <Editor onSignOut={() => setSession("signed-out")} onInteraction={touch} />;
}

function Editor({ onSignOut, onInteraction }: {
  onSignOut: () => void;
  onInteraction: () => void;
}) {
  const [draft, setDraft] = useState<CmsDocument>();
  const [saved, setSaved] = useState("");
  const [published, setPublished] = useState("");
  const [path, setPath] = useState("/");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"publish" | "sign-out">("publish");
  const dialog = useRef<HTMLDialogElement>(null);
  const serialized = draft ? JSON.stringify(draft) : "";
  const dirty = Boolean(draft) && serialized !== saved;
  const pendingPublish = Boolean(draft) && serialized !== published;

  const load = useCallback(async () => {
    setError(false);
    try {
      const [savedDraft, live] = await Promise.all([repository.read("draft"), repository.read("published")]);
      const liveDocument = live ?? createDefaultDocument();
      const current = savedDraft ?? liveDocument;
      setDraft(current);
      setSaved(JSON.stringify(current));
      setPublished(JSON.stringify(liveDocument));
    } catch (failure) {
      setError(true);
      setMessage(failure instanceof Error ? failure.message : "Could not load the website.");
    }
  }, []);

  useEffect(() => {
    const task = setTimeout(() => void load(), 0);
    return () => clearTimeout(task);
  }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(goLive: boolean) {
    if (!draft || busy) return;
    setBusy(true);
    setError(false);
    setMessage("");
    try {
      validateDocument(draft);
      await repository.write(goLive ? "published" : "draft", draft);
      setSaved(serialized);
      if (goLive) setPublished(serialized);
      announce(goLive ? "published" : "draft");
      setMessage(goLive ? "Published to your website." : "Draft saved securely.");
    } catch (failure) {
      setError(true);
      setMessage(failure instanceof Error ? failure.message : "Could not save your changes.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError(false);
    try {
      if (!(await fetch("/api/control/session", { method: "DELETE" })).ok)
        throw new Error("Could not sign out. Try again.");
      onSignOut();
    } catch {
      setMessage("Could not sign out. Try again.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  function ask(action: "publish" | "sign-out") {
    setConfirm(action);
    dialog.current?.showModal();
  }

  if (!draft && !error) return <Loading label="Loading website content…" />;
  const pages = draft ? [
    { path: "/", label: "Homepage" },
    ...Object.keys(draft.data.pages as Record<string, unknown>).map((slug) => ({
      path: `/${slug}`,
      label: slug.split("/").map((part) => part.charAt(0).toUpperCase() + part.slice(1).replaceAll("-", " ")).join(" / "),
    })),
    { path: "/resources", label: "Resources" },
    ...(draft.data.articles as { slug: string; title: string }[]).map(({ slug, title }) => ({ path: `/resources/${slug}`, label: title })),
  ] : [];

  return (
    <div className="ctl-app">
      <header className="ctl-editor-header">
        <Image className="ctl-editor-brand" src="/assets/site/beyonn-control-logo.png" alt="Beyonn" width={165} height={34} />
        <button type="button" className="ctl-button" disabled={busy} onClick={() => dirty ? ask("sign-out") : void signOut()}>
          <LogOut size={17} aria-hidden="true" /> Sign out
        </button>
      </header>
      <main className="ctl-editor-main">
        <div className="ctl-editor-heading">
          <h1>Edit website</h1>
          {draft && (
            <div className="ctl-editor-actions">
              {dirty && <span className="ctl-editor-status">Unsaved changes</span>}
              <button type="button" className="ctl-button" disabled={busy || !dirty} onClick={() => void save(false)}>
                <Save size={17} aria-hidden="true" /> Save draft
              </button>
              <button type="button" className="ctl-button ctl-primary" disabled={busy || !pendingPublish} onClick={() => ask("publish")}>
                <Upload size={17} aria-hidden="true" /> Publish
              </button>
            </div>
          )}
        </div>
        {message && <p className={error ? "ctl-error" : "ctl-editor-message"} role={error ? "alert" : "status"}>{message}</p>}
        {draft ? (
          <VisualEditor key={path} draft={draft} path={path} pages={pages} selectPage={setPath}
            update={(next) => { setDraft(next); setMessage(""); }} onInteraction={onInteraction} />
        ) : (
          <button className="ctl-button" type="button" onClick={() => void load()}>Try again</button>
        )}
      </main>
      <dialog className="ctl-confirm" ref={dialog} aria-labelledby="ctl-confirm-title">
        <h2 id="ctl-confirm-title">{confirm === "publish" ? "Publish changes?" : "Sign out without saving?"}</h2>
        <p>{confirm === "publish" ? "Visitors will see your edits on the live website." : "Your unsaved edits will be lost."}</p>
        <div className="ctl-editor-actions">
          <button type="button" className="ctl-button" onClick={() => dialog.current?.close()}>Cancel</button>
          <button type="button" className="ctl-button ctl-primary" onClick={() => {
            dialog.current?.close();
            if (confirm === "publish") void save(true);
            else void signOut();
          }}>{confirm === "publish" ? "Publish now" : "Sign out"}</button>
        </div>
      </dialog>
    </div>
  );
}
