"use client";
import catalog from "@/lib/cms/catalog.json";
import type { CmsDocument, Json, Revision } from "@/lib/cms/model";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  History,
  ImageIcon,
  Layers3,
  Paintbrush,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { Panel, dateLabel } from "./ControlUi";

export function Overview({
  document,
  revisions,
  go,
  setPageKey,
}: {
  document: CmsDocument;
  revisions: Revision[];
  go: (section: string) => void;
  setPageKey: (key: string) => void;
}) {
  const pageMap = document.data.pages as Record<string, Json>;
  return (
    <div className="ctl-stack">
      <section className="ctl-welcome">
        <div>
          <span className="ctl-badge ctl-badge-mint">
            <span />
            READY WHEN YOU ARE
          </span>
          <h2>
            A stronger website.
            <br />
            <em>One thoughtful update at a time.</em>
          </h2>
          <p>
            Refresh a page, share a new story, or make your next announcement.
            <br className="ctl-desktop" /> Everything you need is right here.
          </p>
          <button className="ctl-button ctl-white" onClick={() => go("pages")}>
            Start editing
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="ctl-welcome-art" aria-hidden>
          <div className="ctl-art-ring" />
          <div className="ctl-art-ring ctl-art-ring-two" />
          <div className="ctl-art-window">
            <div>
              <i />
              <i />
              <i />
            </div>
            <span className="ctl-art-line" />
            <span className="ctl-art-line short" />
            <div className="ctl-art-tiles">
              <span />
              <span />
              <span />
            </div>
            <span className="ctl-art-pill" />
          </div>
          <span className="ctl-art-check">
            <Check size={25} />
          </span>
          <span className="ctl-art-spark">
            <Sparkles size={20} />
          </span>
        </div>
      </section>
      <div className="ctl-stats">
        {[
          {
            name: "Website pages",
            value: Object.keys(pageMap).length + 1,
            note: "All in one place",
            icon: FileText,
            target: "pages",
          },
          {
            name: "Media assets",
            value:
              catalog.filter((e) => e.kind === "media").length +
              document.media.length,
            note: "Your visual library",
            icon: ImageIcon,
            target: "media",
          },
          {
            name: "Content collections",
            value: Object.keys(document.data).length,
            note: "Ready to make yours",
            icon: Layers3,
            target: "content",
          },
          {
            name: "Saved revisions",
            value: revisions.length,
            note: revisions[0]
              ? "Latest: " + new Date(revisions[0].at).toLocaleDateString()
              : "Your next chapter awaits",
            icon: Clock3,
            target: "history",
          },
        ].map(({ name, value, note, icon: Icon, target }) => (
          <button className="ctl-stat" key={name} onClick={() => go(target)}>
            <div>
              <span>{name}</span>
              <Icon size={19} />
            </div>
            <strong>{value}</strong>
            <small>
              {note}
              <ArrowRight size={14} />
            </small>
          </button>
        ))}
      </div>
      <div className="ctl-overview-grid">
        <Panel
          title="A good place to start"
          action={<span className="ctl-mini-label">QUICK ACTIONS</span>}
        >
          <div className="ctl-quick-actions">
            {[
              {
                title: "Update a page",
                sub: "Keep your content current",
                icon: FileText,
                target: "pages",
              },
              {
                title: "Add something visual",
                sub: "Upload images and videos",
                icon: Upload,
                target: "media",
              },
              {
                title: "Refine your look",
                sub: "Colors, type and the little details",
                icon: Paintbrush,
                target: "design",
              },
            ].map(({ title, sub, icon: Icon, target }) => (
              <button key={title} onClick={() => go(target)}>
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{sub}</small>
                </div>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Recent activity"
          action={
            <button className="ctl-text-button" onClick={() => go("history")}>
              View all
              <ArrowRight size={13} />
            </button>
          }
        >
          {revisions.length ? (
            <div className="ctl-activity">
              {revisions.slice(0, 3).map((revision) => (
                <div key={revision.id}>
                  <span>
                    <Check size={15} />
                  </span>
                  <div>
                    <strong>{revision.label}</strong>
                    <small>{dateLabel(revision.at)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ctl-empty">
              <History size={27} />
              <strong>Your story starts here.</strong>
              <p>Saved drafts and published updates will appear here.</p>
            </div>
          )}
        </Panel>
      </div>
      <Panel
        title="Your pages"
        action={
          <button className="ctl-text-button" onClick={() => go("pages")}>
            Manage all pages
            <ArrowRight size={14} />
          </button>
        }
      >
        <div className="ctl-page-table">
          <div className="ctl-page-table-head">
            <span>PAGE</span>
            <span>PATH</span>
            <span>SECTIONS</span>
            <span />
          </div>
          {[
            ["home", { title: "Homepage", sections: document.home }],
            ...Object.entries(pageMap).slice(0, 4),
          ].map(([key, value]) => {
            const p = value as { title: string; sections: unknown[] };
            return (
              <button
                key={String(key)}
                onClick={() => {
                  setPageKey(String(key));
                  go("pages");
                }}
              >
                <span>
                  <span className="ctl-page-icon">
                    <FileText size={17} />
                  </span>
                  <strong>{p.title}</strong>
                </span>
                <span>{key === "home" ? "/" : `/${key}`}</span>
                <span className="ctl-badge">{p.sections.length} sections</span>
                <ChevronRight size={16} />
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="ctl-bottom-note">
        <ShieldCheck size={16} />
        Drafts stay private until you publish. Your original website remains the
        starting point.
      </div>
    </div>
  );
}
