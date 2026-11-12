import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const messages = new Set();
const skipProps = /^(className|class|href|src|id|key|name|type|role|rel|target|style|variant|tone|size|screen|audioSrc|videoSrc|poster|slug|url|icon|image|photo|email|phone|phoneHref|date|datetime|dateTime|method|action|htmlFor|autoComplete|inputMode|pattern|viewBox|d|fill|stroke|xmlns|as|align|placement|position|direction|strategy|format|locale|lang|language|inLanguage|contentType|encoding|property|itemProp|itemType|content|charset|charSet|itemID|itemRef|fontFamily|fontWeight|fontStyle|display|animation|transition|ease|transform|filter|color|background|border|overflow|width|height|maxWidth|minHeight|margin|padding|gridTemplateColumns|pointerEvents|opacity)$/;
const entities = {amp:'&',apos:"'",quot:'"',lt:'<',gt:'>',nbsp:' ',ldquo:'“',rdquo:'”',lsquo:'‘',rsquo:'’',mdash:'—',ndash:'–',bull:'•',middot:'·',rarr:'→',larr:'←',times:'×',copy:'©',trade:'™',reg:'®',thinsp:' '};
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (all,k) => k[0] === '#' ? String.fromCodePoint(parseInt(k.slice(k[1]?.toLowerCase()==='x'?2:1), k[1]?.toLowerCase()==='x'?16:10)) : entities[k] ?? all);
export const normalize = s => decode(s).replace(/\s+/g,' ').trim();
function add(s, visible = false) {
  s = normalize(s);
  if (!/[A-Za-z]/.test(s) || s.length > 3500) return;
  if (/^(https?:|mailto:|tel:|\/|#|data:|--|@|[Mm]\d)/.test(s) || /\.(mp4|png|jpg|svg|webp|pdf|mp3|woff2?)(\?|$)/i.test(s)) return;
  if (!visible && !/\s/.test(s) && (/^[a-z]/.test(s) || /[{}[\]@/:_]/.test(s))) return;
  if (/[{}]|=>|\b(?:SELECT|var\(--)/.test(s) || /(?:^|\s)(?:bg-|text-|flex|grid|rounded-|border-|hover:|absolute|relative|hidden|block|inline-block)/.test(s)) return;
  if (/^(?:[-+]?\d+(?:\.\d+)?(?:px|ms|rem|em|vh|vw|s)|[a-z-]+:)/.test(s) || /(?:^|\s)(?:p[lrtbxy]?|m[lrtbxy]?|w|h|gap|grid-cols|col-span|row-span)-[\d[]/.test(s) || /\[(?:[&0-9]|mask)/.test(s)) return;
  messages.add(s);
}
function visible(node) {
  if (ts.isJsxText(node)) return decode(node.text);
  if (ts.isJsxExpression(node)) {
    const e = node.expression;
    return e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) ? e.text : '';
  }
  if (ts.isJsxElement(node) || ts.isJsxFragment(node)) return node.children.map(visible).join('');
  return '';
}
function scan(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file,'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(n) {
    if (ts.isJsxText(n)) add(n.text, true);
    if (ts.isJsxElement(n) || ts.isJsxFragment(n)) {
      const tag = ts.isJsxElement(n) ? n.openingElement.tagName.getText(source) : '';
      const phraseTags = /^(h[1-6]|p|span|em|strong|b|i|a|button|label|legend|blockquote|figcaption|summary|option)$/;
      const containsBlock = (node) => ts.forEachChild(node, child =>
        ts.isJsxElement(child) && /^(div|section|article|header|footer|main|nav|ul|ol|li|table|form|fieldset)$/.test(child.openingElement.tagName.getText(source)) || containsBlock(child));
      if ((phraseTags.test(tag) || ts.isJsxFragment(n)) && !containsBlock(n)) add(visible(n), true);
    }
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const p = n.parent;
      if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isImportSpecifier(p)) return;
      if (ts.isJsxAttribute(p) && (skipProps.test(p.name.getText(source)) || /^(data-|aria-(controls|current|expanded|hidden|modal|live|atomic|describedby|labelledby))/.test(p.name.getText(source)))) return;
      if (ts.isPropertyAssignment(p) && p.name.getText(source) === "id" && file.endsWith('/content/pages.ts')) {
        add(n.text === 'faq' || n.text === 'tmd' ? n.text.toUpperCase() : n.text.charAt(0).toUpperCase() + n.text.slice(1).replaceAll('-', ' '), true);
      }
      if (ts.isPropertyAssignment(p) && p.initializer === n && !["name", "role"].includes(p.name.getText(source)) && skipProps.test(p.name.getText(source).replace(/['"]/g,''))) return;
      if (ts.isCallExpression(p) && /(?:cn|querySelector|querySelectorAll|matchMedia|addEventListener|removeEventListener|getItem|setItem|setAttribute|removeAttribute|setProperty|removeProperty|includes|startsWith|endsWith|replace|split|join|test|closest|createElement|fetch|getElementById)$/.test(p.expression.getText(source))) return;
      add(n.text);
    }
    ts.forEachChild(n,visit);
  }
  visit(source);
}
function walk(dir) {for(const f of fs.readdirSync(dir,{withFileTypes:true})) {const p=path.join(dir,f.name); if(f.isDirectory()) {if(!['i18n'].includes(f.name)) walk(p);} else if(/\.tsx?$/.test(f.name) && !/\b(og|sitemap|robots|manifest|seo|proxy)\b/.test(p)) scan(p);}}
walk(root);
for (const text of ['Language','English','Use English','Use device language','Choose your language','Loading translation…','Translation could not be loaded. Please try again.','Retry','Website language','Audio is available in English.']) add(text);
const overrides = JSON.parse(fs.readFileSync('scripts/i18n-ui-overrides.json', 'utf8'));
for (const values of Object.values(overrides)) for (const key of Object.keys(values)) messages.add(key);
const result = [...messages].sort();
fs.writeFileSync('src/lib/i18n/messages.json',JSON.stringify(result,null,2)+'\n');
console.log(`${result.length} source messages (${result.reduce((n,s)=>n+s.split(/\s+/).length,0)} words)`);
