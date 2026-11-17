/* eslint-disable @next/next/no-img-element -- Asset management previews must support original files and temporary authenticated blob URLs. */
"use client";
import catalog from "@/lib/cms/catalog.json";
import { safeUrl, type CmsDocument } from "@/lib/cms/model";
import { repository } from "@/lib/cms/storage";
import { Film, ImageIcon, Link2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
const sources = catalog.filter((e) => e.kind === "media");
export function MediaLibrary({
  document,
  update,
  report,
}: {
  document: CmsDocument;
  update: (next: CmsDocument) => void;
  report: (message: string) => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [target, setTarget] = useState(sources[0]?.source ?? "");
  const [replacement, setReplacement] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const matches = useMemo(
    () =>
      sources.filter((e) =>
        e.source.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );
  useEffect(() => {
    let active = true;
    const created: string[] = [];
    void Promise.all(
      document.media.map(async (m) => {
        const blob = await repository.getMedia(m.id);
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        created.push(url);
        return [m.id, url] as const;
      }),
    )
      .then((items) => {
        if (active)
          setUrls(Object.fromEntries(items.filter((i) => i !== null)));
      })
      .catch((e) => report(String(e)));
    return () => {
      active = false;
      created.forEach(URL.revokeObjectURL);
    };
  }, [document.media, report]);
  async function upload(file: File) {
    setBusy(true);
    try {
      const id = crypto.randomUUID();
      await repository.putMedia(id, file);
      update({
        ...document,
        media: [
          ...document.media,
          {
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            alt: file.name.replace(/\.[^.]+$/, ""),
            description: "",
            createdAt: new Date().toISOString(),
          },
        ],
      });
      setReplacement(`cms-media:${id}`);
      report("Uploaded. Select a placement below to use this asset.");
    } catch (e) {
      report(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  function apply() {
    if (!safeUrl(replacement, true))
      return report(
        "Choose an uploaded asset, a local path, or a valid HTTPS media URL.",
      );
    const asset = replacement.startsWith("cms-media:")
      ? document.media.find((item) => item.id === replacement.slice(10))
      : undefined;
    const imagePlacement = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(target);
    if (
      imagePlacement &&
      (asset?.type.startsWith("video/") ||
        /\.(mp4|webm)(\?|$)/i.test(replacement))
    )
      return report(
        "Choose an image for this image placement. Use a video placement for uploaded videos.",
      );
    if (!imagePlacement && asset?.type.startsWith("image/"))
      return report("Choose a video for this video placement.");
    if (!alt.trim())
      return report("Add descriptive alternative text before applying.");
    update({
      ...document,
      overrides: {
        ...document.overrides,
        [`media:${target}`]: replacement,
        [`text:media-alt:${target}`]: alt.trim(),
      },
    });
    report("Media replacement added to your draft. Preview before publishing.");
  }
  return (
    <div className="ctl-stack">
      <div className="ctl-panel ctl-upload">
        <div className="ctl-upload-icon">
          <Upload size={25} />
        </div>
        <div>
          <h3>Your next great visual starts here.</h3>
          <p>PNG, JPEG, WebP, GIF, MP4 or WebM. Maximum 20 MB.</p>
        </div>
        <label className="ctl-button ctl-primary">
          {busy ? "Uploading…" : "Upload media"}
          <input
            className="ctl-sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="ctl-panel">
        <div className="ctl-panel-heading">
          <h3>
            <Link2 size={18} />
            Place or replace media
          </h3>
          <span className="ctl-badge">Draft changes</span>
        </div>
        <div className="ctl-form-grid">
          <label className="ctl-field">
            <span>Existing website placement</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {sources.map((e) => (
                <option key={e.source} value={e.source}>
                  {e.source.split("/").pop()?.slice(0, 95)}
                </option>
              ))}
            </select>
          </label>
          <label className="ctl-field">
            <span>New image or video URL</span>
            <input
              value={replacement}
              placeholder="https://… or choose an upload below"
              onChange={(e) => setReplacement(e.target.value)}
            />
          </label>
          <label className="ctl-field">
            <span>Alternative text / video title</span>
            <input
              value={alt}
              placeholder="Describe this visual for visitors"
              onChange={(e) => setAlt(e.target.value)}
            />
          </label>
        </div>
        <button className="ctl-button ctl-primary" onClick={apply}>
          Apply to draft
        </button>
        <p className="ctl-help">
          Use supported Mux, YouTube or Vimeo player URLs for embeds. Existing
          aspect ratios stay in place.
        </p>
      </div>
      {document.media.length > 0 && (
        <>
          <h3>
            Uploaded assets{" "}
            <span className="ctl-count">{document.media.length}</span>
          </h3>
          <div className="ctl-media-grid">
            {document.media.map((asset) => (
              <article className="ctl-media-card" key={asset.id}>
                <div className="ctl-media-visual">
                  {urls[asset.id] ? (
                    asset.type.startsWith("video/") ? (
                      <video src={urls[asset.id]} controls preload="metadata" />
                    ) : (
                      <img src={urls[asset.id]} alt={asset.alt} />
                    )
                  ) : (
                    <ImageIcon size={32} />
                  )}
                </div>
                <div className="ctl-media-info">
                  <strong>{asset.name}</strong>
                  <small>
                    {(asset.size / 1024 / 1024).toFixed(2)} MB · {asset.type}
                  </small>
                  <label className="ctl-field">
                    <span>Alternative text</span>
                    <input
                      value={asset.alt}
                      onChange={(e) =>
                        update({
                          ...document,
                          media: document.media.map((m) =>
                            m.id === asset.id
                              ? { ...m, alt: e.target.value }
                              : m,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="ctl-field">
                    <span>Description</span>
                    <input
                      value={asset.description}
                      onChange={(e) =>
                        update({
                          ...document,
                          media: document.media.map((m) =>
                            m.id === asset.id
                              ? { ...m, description: e.target.value }
                              : m,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    className="ctl-button ctl-small"
                    onClick={() => {
                      setReplacement(`cms-media:${asset.id}`);
                      setAlt(asset.alt);
                    }}
                  >
                    Choose for placement
                  </button>
                  <button
                    className="ctl-button ctl-small ctl-danger-text"
                    onClick={() => {
                      if (
                        JSON.stringify({ ...document, media: [] }).includes(
                          `cms-media:${asset.id}`,
                        )
                      )
                        return report(
                          "This asset is used in the draft. Replace its placements before removing it.",
                        );
                      if (
                        window.confirm(
                          "Remove this asset from the draft library? Published media and history are retained.",
                        )
                      )
                        update({
                          ...document,
                          media: document.media.filter(
                            (m) => m.id !== asset.id,
                          ),
                        });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <div className="ctl-section-bar">
        <h3>
          Website media <span className="ctl-count">{sources.length}</span>
        </h3>
        <input
          className="ctl-search"
          placeholder="Search media…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="ctl-media-grid">
        {matches.slice(0, 60).map((entry) => (
          <button
            className="ctl-media-card ctl-media-select"
            key={entry.source}
            onClick={() => {
              setTarget(entry.source);
              setReplacement(document.overrides[`media:${entry.source}`] ?? "");
              setAlt(
                document.overrides[`text:media-alt:${entry.source}`] ?? "",
              );
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="ctl-media-visual">
              {/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(entry.source) ? (
                <img src={entry.source} alt="" loading="lazy" />
              ) : (
                <Film size={30} />
              )}
            </div>
            <div className="ctl-media-info">
              <strong>{entry.source.split("/").pop()?.slice(0, 60)}</strong>
              <small>
                {document.overrides[`media:${entry.source}`]
                  ? "Replacement in draft"
                  : "Original website asset"}
              </small>
            </div>
          </button>
        ))}
      </div>
      {matches.length > 60 && (
        <p className="ctl-help">
          Showing the first 60 matches. Search to narrow the library.
        </p>
      )}
    </div>
  );
}
