"use client";
import homeBlocks from "@/lib/cms/home-blocks.json";
import type { CmsDocument, Json } from "@/lib/cms/model";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Panel, pageSection, type Confirmation } from "./ControlUi";
import { FieldEditor } from "./FieldEditor";

export function PageManager({
  document,
  pageKey,
  setPageKey,
  search,
  setSearch,
  setShowNewPage,
  update,
  setData,
  setConfirm,
}: {
  document: CmsDocument;
  pageKey: string;
  setPageKey: (key: string) => void;
  search: string;
  setSearch: (text: string) => void;
  setShowNewPage: (show: boolean) => void;
  update: (next: CmsDocument) => void;
  setData: (key: string, value: Json) => void;
  setConfirm: (next: Confirmation) => void;
}) {
  const pageMap = document.data.pages as Record<string, Json>;
  const pageEntries = Object.entries(pageMap).filter(([slug, page]) =>
    `${slug} ${(page as Record<string, Json>).title}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const currentPath = pageKey === "home" ? "/" : `/${pageKey}`;
  return (
    <div className="ctl-page-editor">
      <aside className="ctl-page-list">
        <div className="ctl-section-bar">
          <strong>Website pages</strong>
          <button
            className="ctl-icon-button"
            aria-label="Create page"
            onClick={() => setShowNewPage(true)}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="ctl-search-box">
          <Search size={16} />
          <input
            placeholder="Find a page…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={pageKey === "home" ? "is-active" : ""}
          onClick={() => setPageKey("home")}
        >
          <FileText size={16} />
          <span>Homepage</span>
        </button>
        {pageEntries.map(([slug, p]) => (
          <button
            key={slug}
            className={pageKey === slug ? "is-active" : ""}
            onClick={() => setPageKey(slug)}
          >
            <FileText size={16} />
            <span>{String((p as Record<string, Json>).title)}</span>
          </button>
        ))}
      </aside>
      <Panel
        title={
          pageKey === "home"
            ? "Homepage sections"
            : String((pageMap[pageKey] as Record<string, Json>)?.title ?? "")
        }
        action={
          <a
            className="ctl-text-button"
            href={currentPath}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open page
            <ExternalLink size={14} />
          </a>
        }
      >
        {pageKey === "home" ? (
          <>
            <p className="ctl-help">
              Reorder, hide or duplicate existing sections. Edit their copy in
              Content → Website copy. Add new content blocks below.
            </p>
            <div className="ctl-home-sections">
              {document.home.map((block, i) => (
                <div className="ctl-home-block" key={`${block.id}-${i}`}>
                  <span className="ctl-section-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <label>
                    <input
                      type="checkbox"
                      checked={block.enabled}
                      onChange={(e) =>
                        update({
                          ...document,
                          home: document.home.map((b, j) =>
                            i === j ? { ...b, enabled: e.target.checked } : b,
                          ),
                        })
                      }
                    />
                    <span>{block.label}</span>
                  </label>
                  <div className="ctl-item-tools">
                    <button
                      aria-label={`Move ${block.label} up`}
                      disabled={i === 0}
                      onClick={() => {
                        const home = [...document.home];
                        [home[i - 1], home[i]] = [home[i], home[i - 1]];
                        update({ ...document, home });
                      }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      aria-label={`Move ${block.label} down`}
                      disabled={i === document.home.length - 1}
                      onClick={() => {
                        const home = [...document.home];
                        [home[i + 1], home[i]] = [home[i], home[i + 1]];
                        update({ ...document, home });
                      }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      aria-label={`Duplicate ${block.label}`}
                      onClick={() =>
                        update({
                          ...document,
                          home: [
                            ...document.home.slice(0, i + 1),
                            {
                              ...structuredClone(block),
                              id: `${block.id.split("~")[0]}~${crypto.randomUUID()}`,
                              label: `${block.label} copy`,
                            },
                            ...document.home.slice(i + 1),
                          ],
                        })
                      }
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      aria-label={`Delete ${block.label}`}
                      onClick={() =>
                        setConfirm({
                          title: "Delete this section?",
                          body: "The section will be removed from the draft. You can undo this before leaving.",
                          action: () =>
                            update({
                              ...document,
                              home: document.home.filter((_, j) => i !== j),
                            }),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {block.section && (
                    <div className="ctl-home-block-fields">
                      <FieldEditor
                        value={block.section}
                        onChange={(next) =>
                          update({
                            ...document,
                            home: document.home.map((b, j) =>
                              i === j ? { ...b, section: next } : b,
                            ),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="ctl-inline-actions">
              <button
                className="ctl-button"
                onClick={() =>
                  update({
                    ...document,
                    home: [
                      ...document.home,
                      {
                        id: crypto.randomUUID(),
                        label: "New content section",
                        enabled: true,
                        section: structuredClone(pageSection),
                      },
                    ],
                  })
                }
              >
                <Plus size={15} />
                Add content section
              </button>
              <button
                className="ctl-button"
                onClick={() =>
                  setConfirm({
                    title: "Restore homepage layout?",
                    body: "This restores the original section order and visibility in your draft.",
                    action: () => update({ ...document, home: homeBlocks }),
                  })
                }
              >
                Restore layout
              </button>
            </div>
          </>
        ) : (
          pageMap[pageKey] && (
            <>
              <FieldEditor
                value={pageMap[pageKey]}
                onChange={(next) =>
                  setData("pages", { ...pageMap, [pageKey]: next })
                }
              />
              <div className="ctl-inline-actions">
                <button
                  className="ctl-button"
                  onClick={() => {
                    const p = pageMap[pageKey] as Record<string, Json>;
                    setData("pages", {
                      ...pageMap,
                      [pageKey]: {
                        ...p,
                        sections: [
                          ...(p.sections as Json[]),
                          {
                            ...(pageSection as object),
                            id: `section-${crypto.randomUUID()}`,
                          },
                        ],
                      },
                    });
                  }}
                >
                  <Plus size={15} />
                  Add section
                </button>
                <button
                  className="ctl-button ctl-danger-text"
                  onClick={() =>
                    setConfirm({
                      title: "Delete this page?",
                      body: "This removes the page from the draft. Remove navigation links to this page before publishing.",
                      action: () => {
                        const next = { ...pageMap };
                        delete next[pageKey];
                        setData("pages", next);
                        setPageKey("home");
                      },
                    })
                  }
                >
                  <Trash2 size={15} />
                  Delete page
                </button>
              </div>
            </>
          )
        )}
      </Panel>
    </div>
  );
}
