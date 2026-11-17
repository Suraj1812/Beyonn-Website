"use client";

import catalog from "@/lib/cms/catalog.json";
import {
  createDefaultDocument,
  validateDocument,
  type CmsDocument,
  type Json,
  type Revision,
} from "@/lib/cms/model";
import { announce, repository } from "@/lib/cms/storage";
import {
  ArrowRight,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe2,
  History,
  ImageIcon,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Navigation,
  Paintbrush,
  PanelBottom,
  Plus,
  Redo2,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Tablet,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "./control.css";
import { Panel, dateLabel, pageSection } from "./ControlUi";
import { FieldEditor, human } from "./FieldEditor";
import { Login } from "./Login";
import { MediaLibrary } from "./MediaLibrary";
import { Overview } from "./Overview";
import { PageManager } from "./PageManager";
import { ThemeSettings } from "./ThemeSettings";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "content", label: "Content", icon: FolderOpen },
  { id: "media", label: "Media library", icon: ImageIcon },
  { id: "navbar", label: "Navigation", icon: Navigation },
  { id: "footer", label: "Footer", icon: PanelBottom },
  { id: "design", label: "Design & theme", icon: Paintbrush },
  { id: "components", label: "Components", icon: Layers3 },
  { id: "seo", label: "SEO settings", icon: Globe2 },
  { id: "history", label: "Change history", icon: History },
  { id: "settings", label: "General settings", icon: Settings2 },
];
const descriptions: Record<string, string> = {
  overview: "A little clarity. A lot of possibility. Your website at a glance.",
  pages: "Every page, every section. Make your story yours.",
  content: "The words and details that bring Beyonn to life.",
  media: "A considered home for every image and video.",
  navbar: "Help your visitors find exactly where they need to go.",
  footer: "Make the last impression as thoughtful as the first.",
  design: "Your brand, beautifully consistent. Preview every change.",
  components: "Bring the right pieces together, in the right order.",
  seo: "Give every page a clear introduction to the world.",
  history: "A record of your progress, with room to go back.",
  settings: "The details that keep everything connected.",
};
const contentCollections = [
  "workshopContent",
  "team",
  "articles",
  "endorsements",
  "academyTiers",
  "protocolSteps",
  "practitionerQuickAnswers",
  "patientQuickAnswers",
  "systemFaq",
  "academyFaq",
  "globalFaq",
  "partnerFaq",
  "patientFaq",
];

export default function ControlDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [document, setDocument] = useState(createDefaultDocument);
  const [published, setPublished] = useState(createDefaultDocument);
  const [saved, setSaved] = useState("");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [section, setSection] = useState("overview");
  const [pageKey, setPageKey] = useState("home");
  const [collection, setCollection] = useState(contentCollections[0]);
  const [search, setSearch] = useState("");
  const [copySearch, setCopySearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<CmsDocument[]>([]);
  const [future, setFuture] = useState<CmsDocument[]>([]);
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    action: () => void;
  } | null>(null);
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState("desktop");
  const [newPage, setNewPage] = useState("");
  const [showNewPage, setShowNewPage] = useState(false);
  const activity = useRef(0);
  const dirty = saved !== "" && JSON.stringify(document) !== saved;
  const pendingPublish = JSON.stringify(document) !== JSON.stringify(published);
  const report = useCallback((message: string) => setNotice(message), []);
  const pageMap = document.data.pages as Record<string, Json>;
  const currentPath = pageKey === "home" ? "/" : `/${pageKey}`;

  const load = useCallback(async () => {
    try {
      const [draft, live, recent] = await Promise.all([
        repository.read("draft"),
        repository.read("published"),
        repository.revisions(),
      ]);
      const initial = draft ?? live ?? createDefaultDocument();
      setDocument(initial);
      setPublished(live ?? createDefaultDocument());
      setSaved(JSON.stringify(initial));
      setRevisions(recent);
      setHistory([]);
      setFuture([]);
    } catch (e) {
      report(e instanceof Error ? e.message : "Could not load content.");
    }
  }, [report]);
  useEffect(() => {
    let active = true;
    void fetch("/api/control/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((result) => {
        if (active) setAuthenticated(result.authenticated === true);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (authenticated) {
      const task = setTimeout(() => void load(), 0);
      return () => clearTimeout(task);
    }
  }, [authenticated, load]);
  useEffect(() => {
    if (!authenticated) return;
    activity.current = Date.now();
    const touch = () => {
      activity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) =>
      window.addEventListener(event, touch, { passive: true }),
    );
    const timer = window.setInterval(() => {
      if (Date.now() - activity.current > 15 * 60_000) {
        void fetch("/api/control/session", { method: "DELETE" });
        setAuthenticated(false);
        report("Your session ended after 15 minutes of inactivity.");
      } else
        void fetch("/api/control/session", { method: "PATCH" }).then((r) => {
          if (r.status === 401) {
            setAuthenticated(false);
            report("Your session has expired. Please sign in again.");
          }
        });
    }, 60_000);
    return () => {
      clearInterval(timer);
      events.forEach((event) => window.removeEventListener(event, touch));
    };
  }, [authenticated, report]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 8000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!confirm && !showNewPage && !preview) return;
    const previous = window.document.activeElement as HTMLElement | null;
    const modal = window.document.querySelector<HTMLElement>(
      ".ctl-modal, .ctl-preview-modal",
    );
    const focusable = () =>
      Array.from(
        modal?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input, select, textarea, a[href], iframe",
        ) ?? [],
      );
    const task = setTimeout(() => focusable()[0]?.focus(), 0);
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirm(null);
        setShowNewPage(false);
        setPreview(false);
      }
      if (event.key !== "Tab") return;
      const list = focusable();
      const first = list[0];
      const last = list.at(-1);
      if (event.shiftKey && window.document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && window.document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.document.addEventListener("keydown", handle);
    return () => {
      clearTimeout(task);
      window.document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [confirm, showNewPage, preview]);
  function update(next: CmsDocument) {
    setHistory((h) => [...h.slice(-29), document]);
    setFuture([]);
    setDocument(next);
  }
  function setData(key: string, value: Json) {
    update({ ...document, data: { ...document.data, [key]: value } });
  }
  function undo() {
    const previous = history.at(-1);
    if (previous) {
      setFuture((f) => [document, ...f]);
      setDocument(previous);
      setHistory((h) => h.slice(0, -1));
    }
  }
  function redo() {
    const next = future[0];
    if (next) {
      setHistory((h) => [...h, document]);
      setDocument(next);
      setFuture((f) => f.slice(1));
    }
  }
  async function save(publish = false) {
    setBusy(true);
    try {
      validateDocument(document);
      await repository.write(publish ? "published" : "draft", document);
      setSaved(JSON.stringify(document));
      if (publish) setPublished(document);
      void repository.revisions().then(setRevisions).catch(() => {});
      announce(publish ? "published" : "draft");
      report(
        publish
          ? "Published. Your changes are now visible to website visitors."
          : "Draft saved securely. The published website has not changed.",
      );
      return true;
    } catch (e) {
      report(e instanceof Error ? e.message : "Could not save your changes.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function openPreview() {
    if (await save()) {
      setPreview(true);
      announce("draft");
    }
  }
  function go(next: string) {
    setSection(next);
    setMobileMenu(false);
    setSearch("");
  }
  function addPage() {
    const slug = newPage
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, "");
    if (
      !/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(slug) ||
      /^(control|api|resources|local|_next|og)(\/|$)/.test(slug) ||
      slug in pageMap
    )
      return report(
        "Use a unique page path with lowercase letters, numbers, hyphens or slashes.",
      );
    setData("pages", {
      ...pageMap,
      [slug]: {
        title: human(slug.split("/").pop() ?? slug),
        description: "Introduce this page to your visitors.",
        sections: [structuredClone(pageSection)],
        seo: {
          title: human(slug),
          description: "Introduce this page to your visitors.",
        },
      },
    });
    setPageKey(slug);
    setNewPage("");
    setShowNewPage(false);
    report("Page added to your draft. Add it to Navigation when ready.");
  }
  async function signOut() {
    try {
      const r = await fetch("/api/control/session", { method: "DELETE" });
      if (!r.ok) throw new Error("Unable to sign out. Try again.");
      setAuthenticated(false);
    } catch (e) {
      report(String(e));
    }
  }
  function requestSignOut() {
    if (dirty)
      setConfirm({
        title: "Leave unsaved changes?",
        body: "Your unsaved edits will be lost. Save a draft first if you want to keep them.",
        action: () => {
          void signOut();
        },
      });
    else void signOut();
  }
  function exportDocument() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(document, null, 2)], {
        type: "application/json",
      }),
    );
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `beyonn-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (checking)
    return (
      <div className="ctl-loading">
        <span className="ctl-brand-mark">b.</span>
        <p>Opening your workspace…</p>
      </div>
    );
  if (!authenticated)
    return (
      <>
        <Login
          onLogin={() => {
            setAuthenticated(true);
            activity.current = Date.now();
          }}
        />
        {notice && (
          <div role="status" className="ctl-toast">
            {notice}
          </div>
        )}
      </>
    );
  return (
    <div className="ctl-app">
      <a className="ctl-skip" href="#control-main">
        Skip to dashboard content
      </a>
      {mobileMenu && (
        <button
          aria-label="Close navigation"
          className="ctl-backdrop"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`ctl-sidebar ${mobileMenu ? "is-open" : ""}`}>
        <Link className="ctl-brand" href="/control">
          <span className="ctl-brand-mark">b.</span>
          <span>
            beyonn<span className="ctl-brand-sub">WEBSITE CONTROL</span>
          </span>
        </Link>
        <div className="ctl-workspace">
          <span className="ctl-workspace-icon">
            <Globe2 size={19} />
          </span>
          <span>
            <strong>Beyonn website</strong>
            <small>Content workspace</small>
          </span>
          <span className="ctl-online" />
        </div>
        <span className="ctl-nav-heading">WORKSPACE</span>
        <nav aria-label="Control navigation">
          {sections.map(({ id, label, icon: Icon }, i) => (
            <button
              key={id}
              className={`${section === id ? "is-active" : ""} ${i === 6 ? "ctl-nav-divider" : ""}`}
              onClick={() => go(id)}
              aria-current={section === id ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {id === "pages" && (
                <small>{Object.keys(pageMap).length + 1}</small>
              )}
              {section === id && <span className="ctl-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="ctl-sidebar-bottom">
          <div className="ctl-secure-note">
            <ShieldCheck size={17} />
            <div>
              <strong>A space you can trust</strong>
              <small>Protected admin workspace</small>
            </div>
          </div>
          <button className="ctl-user" onClick={requestSignOut}>
            <span className="ctl-avatar">B</span>
            <span>
              <strong>Website administrator</strong>
              <small>Sign out of Control</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="ctl-main">
        <header className="ctl-topbar">
          <div className="ctl-breadcrumb">
            <button
              className="ctl-mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{sections.find((s) => s.id === section)?.label}</strong>
          </div>
          <div className="ctl-top-actions">
            <span className={`ctl-status ${dirty ? "is-dirty" : ""}`}>
              <span />
              {dirty
                ? "Unsaved changes"
                : pendingPublish
                  ? "Draft saved"
                  : "Up to date"}
            </span>
            <a
              className="ctl-button ctl-small"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View website
              <ExternalLink size={14} />
            </a>
            <span className="ctl-avatar ctl-avatar-small">B</span>
          </div>
        </header>
        <main id="control-main" className="ctl-content">
          <div className="ctl-heading">
            <div>
              <span className="ctl-eyebrow">
                {section === "overview"
                  ? "YOUR DIGITAL HOME, IN GOOD HANDS"
                  : "BEYONN WEBSITE CONTROL"}
              </span>
              <h1>
                {section === "overview"
                  ? "Make a little progress today."
                  : sections.find((s) => s.id === section)?.label}
              </h1>
              <p>{descriptions[section]}</p>
            </div>
            <div className="ctl-heading-actions">
              <div className="ctl-undo">
                <button
                  aria-label="Undo"
                  disabled={!history.length || busy}
                  onClick={undo}
                >
                  <Undo2 size={17} />
                </button>
                <button
                  aria-label="Redo"
                  disabled={!future.length || busy}
                  onClick={redo}
                >
                  <Redo2 size={17} />
                </button>
              </div>
              <button
                className="ctl-button"
                disabled={busy}
                onClick={() => void save()}
              >
                <Save size={16} />
                Save draft
              </button>
              <button
                className="ctl-button"
                disabled={busy}
                onClick={() => void openPreview()}
              >
                <Monitor size={16} />
                Preview
              </button>
              <button
                className="ctl-button ctl-primary"
                disabled={busy || !pendingPublish}
                onClick={() =>
                  setConfirm({
                    title: "Publish your changes?",
                    body: "This publishes all saved and current edits to the live website. Visitors will see the new version.",
                    action: () => {
                      void save(true);
                    },
                  })
                }
              >
                {busy ? "Saving…" : "Publish"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          {section === "overview" && (
            <Overview
              document={document}
              revisions={revisions}
              go={go}
              setPageKey={setPageKey}
            />
          )}
          {section === "pages" && (
            <PageManager
              document={document}
              pageKey={pageKey}
              setPageKey={setPageKey}
              search={search}
              setSearch={setSearch}
              setShowNewPage={setShowNewPage}
              update={update}
              setData={setData}
              setConfirm={setConfirm}
            />
          )}
          {section === "content" && (
            <div className="ctl-stack">
              <Panel title="Content collections">
                <label className="ctl-field">
                  <span>Choose what to edit</span>
                  <select
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                  >
                    {contentCollections.map((key) => (
                      <option key={key} value={key}>
                        {human(key)}
                      </option>
                    ))}
                  </select>
                </label>
                <FieldEditor
                  name={collection}
                  value={document.data[collection]}
                  onChange={(value) => setData(collection, value)}
                />
              </Panel>
              <Panel
                title="Website copy & links"
                action={
                  <span className="ctl-badge">
                    {catalog.filter((e) => e.kind !== "media").length} entries
                  </span>
                }
              >
                <p className="ctl-help">
                  Search any existing phrase, label, button or URL. Replacements
                  apply wherever that exact source is used. New copy uses the
                  original English language; translations need a separate
                  review.
                </p>
                <div className="ctl-search-box">
                  <Search size={16} />
                  <input
                    placeholder="Find a heading, button, link or phrase…"
                    value={copySearch}
                    onChange={(e) => setCopySearch(e.target.value)}
                  />
                </div>
                {catalog
                  .filter(
                    (e) =>
                      e.kind !== "media" &&
                      `${e.source} ${e.sources.join(" ")}`
                        .toLowerCase()
                        .includes(copySearch.toLowerCase()),
                  )
                  .slice(0, 35)
                  .map((entry) => (
                    <label
                      className="ctl-field ctl-copy-field"
                      key={`${entry.kind}:${entry.source}`}
                    >
                      <span>
                        {entry.kind === "link" ? "Link" : "Website copy"}
                        <small title={entry.sources.join(", ")}>
                          {entry.sources[0].split("/").pop()}
                        </small>
                      </span>
                      <small className="ctl-source-text">{entry.source}</small>
                      <textarea
                        rows={entry.source.length > 120 ? 3 : 2}
                        value={
                          document.overrides[`${entry.kind}:${entry.source}`] ??
                          entry.source
                        }
                        onChange={(e) => {
                          const overrides = { ...document.overrides };
                          if (e.target.value === entry.source)
                            delete overrides[`${entry.kind}:${entry.source}`];
                          else
                            overrides[`${entry.kind}:${entry.source}`] =
                              e.target.value;
                          update({ ...document, overrides });
                        }}
                      />
                    </label>
                  ))}
                <p className="ctl-help">
                  Showing up to 35 matches. Search to find more specific
                  content.
                </p>
              </Panel>
            </div>
          )}
          {section === "media" && (
            <MediaLibrary document={document} update={update} report={report} />
          )}
          {section === "navbar" && (
            <div className="ctl-stack">
              <Panel title="Main navigation">
                <FieldEditor
                  name="primaryNav"
                  value={document.data.primaryNav}
                  onChange={(value) => setData("primaryNav", value)}
                />
              </Panel>
              <Panel title="Sign-in menu">
                <FieldEditor
                  name="signInNav"
                  value={document.data.signInNav}
                  onChange={(value) => setData("signInNav", value)}
                />
              </Panel>
            </div>
          )}
          {section === "footer" && (
            <div className="ctl-stack">
              <Panel title="Footer columns">
                <FieldEditor
                  name="footerNav"
                  value={document.data.footerNav}
                  onChange={(value) => setData("footerNav", value)}
                />
              </Panel>
              <Panel title="Legal links">
                <FieldEditor
                  name="legalNav"
                  value={document.data.legalNav}
                  onChange={(value) => setData("legalNav", value)}
                />
              </Panel>
            </div>
          )}
          {section === "design" && (
            <ThemeSettings
              document={document}
              update={update}
              setConfirm={setConfirm}
            />
          )}
          {section === "components" && (
            <div className="ctl-stack">
              <Panel title="Global components">
                <p className="ctl-help">
                  Visibility changes apply across the website after publishing.
                  Manage page-specific components in Pages.
                </p>
                {Object.entries(document.components).map(([key, enabled]) => (
                  <label key={key} className="ctl-toggle">
                    <span>{human(key)}</span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        update({
                          ...document,
                          components: {
                            ...document.components,
                            [key]: e.target.checked,
                          },
                        })
                      }
                    />
                    <span className="ctl-switch" />
                  </label>
                ))}
              </Panel>
              <Panel title="Page components & layout">
                <p>
                  Every existing page section supports editing, reordering,
                  duplication and visibility. Add cards, images, FAQs and other
                  supported blocks through section fields.
                </p>
                <button className="ctl-button" onClick={() => go("pages")}>
                  Manage page sections
                  <ArrowRight size={15} />
                </button>
              </Panel>
            </div>
          )}
          {section === "seo" && (
            <Panel title="Search appearance">
              <label className="ctl-field">
                <span>Page</span>
                <select
                  value={pageKey}
                  onChange={(e) => setPageKey(e.target.value)}
                >
                  <option value="home">Homepage</option>
                  <option value="resources">Resources</option>
                  {(
                    document.data.articles as { slug: string; title: string }[]
                  ).map((article) => (
                    <option
                      key={article.slug}
                      value={`resources/${article.slug}`}
                    >
                      {article.title}
                    </option>
                  ))}
                  {Object.keys(pageMap).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ctl-field">
                <span>Search title</span>
                <input
                  maxLength={160}
                  placeholder={
                    pageKey === "home"
                      ? "Beyonn | Dental Sleep Medicine"
                      : String(
                          (pageMap[pageKey] as Record<string, Json>)?.title ??
                            "",
                        )
                  }
                  value={document.seo[currentPath]?.title ?? ""}
                  onChange={(e) =>
                    update({
                      ...document,
                      seo: {
                        ...document.seo,
                        [currentPath]: {
                          description:
                            document.seo[currentPath]?.description ?? "",
                          title: e.target.value,
                        },
                      },
                    })
                  }
                />
                <small>Usually 50–60 characters reads best.</small>
              </label>
              <label className="ctl-field">
                <span>Meta description</span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={document.seo[currentPath]?.description ?? ""}
                  onChange={(e) =>
                    update({
                      ...document,
                      seo: {
                        ...document.seo,
                        [currentPath]: {
                          title: document.seo[currentPath]?.title ?? "",
                          description: e.target.value,
                        },
                      },
                    })
                  }
                />
                <small>
                  A clear summary helps visitors decide whether to visit.
                </small>
              </label>
              <div className="ctl-search-preview">
                <small>
                  {String((document.data.site as Record<string, Json>).url)}
                  {currentPath}
                </small>
                <h3>
                  {document.seo[currentPath]?.title ||
                    "Your page title | Beyonn"}
                </h3>
                <p>
                  {document.seo[currentPath]?.description ||
                    "Add a clear, helpful description for this page."}
                </p>
              </div>
            </Panel>
          )}
          {section === "history" && (
            <Panel
              title="Saved changes"
              action={<span className="ctl-badge">Latest 20 revisions</span>}
            >
              {revisions.length ? (
                <div className="ctl-revision-list">
                  {revisions.map((r) => (
                    <div key={r.id}>
                      <span className="ctl-revision-icon">
                        <History size={19} />
                      </span>
                      <div>
                        <strong>{r.label}</strong>
                        <small>{dateLabel(r.at)}</small>
                      </div>
                      <button
                        className="ctl-button ctl-small"
                        onClick={() =>
                          setConfirm({
                            title: "Restore this revision to your draft?",
                            body: "The live website stays unchanged. Preview and publish the restored version when ready.",
                            action: () => {
                              update(r.document);
                              report(
                                "Revision restored to the editor. Save a draft or preview your changes.",
                              );
                            },
                          })
                        }
                      >
                        Restore to draft
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ctl-empty">
                  <History />
                  <strong>No saved changes yet.</strong>
                  <p>Save a draft to start your website history.</p>
                </div>
              )}
            </Panel>
          )}
          {section === "settings" && (
            <div className="ctl-stack">
              <Panel title="Website & contact details">
                <FieldEditor
                  name="site"
                  value={document.data.site}
                  onChange={(value) => setData("site", value)}
                />
              </Panel>
              <Panel title="Content backups">
                <p>
                  Export a content backup before making a large update. Media
                  files remain in secure storage and are referenced by asset ID.
                </p>
                <div className="ctl-inline-actions">
                  <button className="ctl-button" onClick={exportDocument}>
                    Export content backup
                  </button>
                  <label className="ctl-button">
                    Import content backup
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="ctl-sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        if (file.size > 900_000)
                          return report(
                            "Content backups must be under 900 KB.",
                          );
                        try {
                          const next: unknown = JSON.parse(await file.text());
                          validateDocument(next);
                          setConfirm({
                            title: "Import this backup into your draft?",
                            body: "Your published website will stay unchanged. Review imported content before publishing.",
                            action: () => update(next),
                          });
                        } catch (err) {
                          report(
                            err instanceof Error
                              ? err.message
                              : "Invalid backup.",
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </Panel>
              <Panel title="Discard draft edits">
                <p>Return the editor to the currently published version.</p>
                <button
                  className="ctl-button ctl-danger-text"
                  onClick={() =>
                    setConfirm({
                      title: "Discard your draft changes?",
                      body: "This replaces the saved draft with the currently published version. Existing history is retained.",
                      action: () => {
                        setBusy(true);
                        void repository
                          .write("draft", published)
                          .then(() => {
                            update(published);
                            setSaved(JSON.stringify(published));
                            announce("draft");
                            report("Draft reset to the published version.");
                          })
                          .catch((e) => report(String(e)))
                          .finally(() => setBusy(false));
                      },
                    })
                  }
                >
                  Discard draft
                </button>
              </Panel>
            </div>
          )}
          <footer className="ctl-workspace-footer">
            <span>Made for the way Beyonn works.</span>
            <span>
              <ShieldCheck size={13} />
              Private workspace · Firebase backend
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="ctl-toast" role="status">
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
      {confirm && (
        <div
          className="ctl-modal-backdrop"
          onKeyDown={(e) => {
            if (e.key === "Escape") setConfirm(null);
          }}
        >
          <section
            className="ctl-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-heading"
          >
            <button
              className="ctl-modal-close"
              aria-label="Close confirmation"
              onClick={() => setConfirm(null)}
            >
              <X size={20} />
            </button>
            <h2 id="confirm-heading">{confirm.title}</h2>
            <p>{confirm.body}</p>
            <div className="ctl-inline-actions">
              <button
                autoFocus
                className="ctl-button"
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="ctl-button ctl-primary"
                onClick={() => {
                  const action = confirm.action;
                  setConfirm(null);
                  action();
                }}
              >
                Confirm
              </button>
            </div>
          </section>
        </div>
      )}
      {showNewPage && (
        <div className="ctl-modal-backdrop">
          <section
            className="ctl-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-page-heading"
          >
            <h2 id="new-page-heading">Give your idea a home.</h2>
            <p>Create a new page, then add its sections and navigation link.</p>
            <label className="ctl-field">
              <span>Page path</span>
              <input
                autoFocus
                placeholder="our-new-page"
                value={newPage}
                onChange={(e) => setNewPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addPage();
                  if (e.key === "Escape") setShowNewPage(false);
                }}
              />
            </label>
            <div className="ctl-inline-actions">
              <button
                className="ctl-button"
                onClick={() => setShowNewPage(false)}
              >
                Cancel
              </button>
              <button className="ctl-button ctl-primary" onClick={addPage}>
                Create page
                <Plus size={16} />
              </button>
            </div>
          </section>
        </div>
      )}
      {preview && (
        <div
          className="ctl-preview-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Website draft preview"
        >
          <div className="ctl-preview-bar">
            <strong>
              <Monitor size={17} />
              Draft preview
            </strong>
            <select
              aria-label="Preview page"
              value={pageKey}
              onChange={(e) => setPageKey(e.target.value)}
            >
              <option value="home">Homepage</option>
              <option value="resources">Resources</option>
              {(
                document.data.articles as { slug: string; title: string }[]
              ).map((article) => (
                <option key={article.slug} value={`resources/${article.slug}`}>
                  {article.title}
                </option>
              ))}
              {Object.keys(pageMap).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <div className="ctl-preview-devices">
              {[
                { id: "desktop", icon: Monitor },
                { id: "tablet", icon: Tablet },
                { id: "mobile", icon: Smartphone },
              ].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  aria-label={`${id} preview`}
                  aria-pressed={device === id}
                  onClick={() => setDevice(id)}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <button
              className="ctl-button ctl-small"
              onClick={() => setPreview(false)}
            >
              <X size={16} />
              Close preview
            </button>
          </div>
          <div className="ctl-preview-stage">
            <iframe
              title="Website draft preview"
              key={currentPath}
              src={`${currentPath}?cms-preview=1`}
              style={{
                width:
                  device === "mobile"
                    ? 390
                    : device === "tablet"
                      ? 768
                      : "100%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
