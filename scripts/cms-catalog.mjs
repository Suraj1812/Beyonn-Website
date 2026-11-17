import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
const entries = new Map();
function add(value, file, kind) {
  const text = value
    .replace(/&(?:apos|#39);/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 2 || !/[a-zA-Z]/.test(text)) return;
  if (text === "https://schema.org") return;
  const key = `${kind}:${text}`;
  const prior = entries.get(key);
  if (prior) {
    if (!prior.sources.includes(file)) prior.sources.push(file);
    return;
  }
  entries.set(key, { source: text, kind, sources: [file] });
}
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["cms", "api"].includes(entry.name)) scan(file);
      continue;
    }
    if (!/\.tsx?$/.test(file)) continue;
    if (
      file.includes("/control/") &&
      ![
        "HomeContent.tsx",
        "PageContent.tsx",
        "ArticleContent.tsx",
        "ResourcesContent.tsx",
        "SiteShell.tsx",
      ].includes(entry.name)
    )
      continue;
    const root = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    for (const match of fs
      .readFileSync(file, "utf8")
      .matchAll(/url\((\/assets\/[^)]+)\)/g))
      add(match[1], file, "media");
    function visit(n) {
      if (ts.isJsxText(n)) add(n.text, file, "text");
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
        const attr = ts.isJsxAttribute(n.parent)
          ? n.parent.name.getText(root)
          : "";
        if (
          ["src", "href", "poster"].includes(attr) ||
          /^(\/assets\/|https?:\/\/|mailto:|tel:)/.test(n.text)
        )
          add(
            n.text,
            file,
            /\.(png|jpe?g|webp|gif|svg|mp4|webm)(\?|$)|player\./.test(n.text)
              ? "media"
              : "link",
          );
        else if (
          [
            "alt",
            "title",
            "placeholder",
            "aria-label",
            "label",
            "sub",
            "eyebrow",
            "lead",
            "text",
            "value",
          ].includes(attr) ||
          (n.text.includes(" ") &&
            !/[{}]|(?:^|\s)[\w-]+:|\b(?:flex|grid|block|relative|absolute|hidden)\b/.test(
              n.text,
            ))
        )
          add(n.text, file, "text");
      }
      ts.forEachChild(n, visit);
    }
    visit(root);
  }
}
scan("src");
// Keep complete phrases available for headings that are split into animated word spans.
for (const message of JSON.parse(fs.readFileSync("src/lib/i18n/messages.json", "utf8"))) add(message, "Website copy", "text");
fs.writeFileSync(
  "src/lib/cms/catalog.json",
  JSON.stringify([...entries.values()], null, 2) + "\n",
);
console.log(
  `CMS catalog: ${entries.size} editable copy, link and media entries.`,
);
