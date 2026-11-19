# CMS page builder verification

Verified on 19 November 2026 in desktop Chrome and at a 390px mobile viewport.

## New editor coverage

`PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/cms-builder.spec.ts --workers=1`

The tests run the production Next.js app, real React editor, same-origin preview frame and public renderer, with an isolated in-memory content API. They validate submitted documents with the same schema used by the content endpoint. They do not publish temporary content to the live database.

Covered workflows:

- Select the actual hero, set a gradient and per-side padding, undo/redo and apply a mobile override. Switching iframe widths verifies computed CSS.
- Create a section containing headings, multiline text, lists, cards, video, an image and a button. Save, reload, publish and verify content in a separate visitor context.
- Insert before/after an existing section; duplicate, hide, delete and undo. Hidden sections remain editable.
- Add an entry to an existing collection and append text to an existing visual list.
- Reject stale saves and preserve unsaved edits.
- Reject unsafe CSS selectors/colors, unsafe URLs, invalid spacing and duplicate block IDs.
- Reject unsupported uploaded files; test the signed upload client flow and ensure the completed asset and block reference persist together.
- Scope additions to a content route and preserve them when the anchor section is hidden.

## Regression coverage

The existing CMS, Academy, scrolling and internationalization suites passed 82 tests. Four opt-in authenticated cloud-write tests were skipped; those require an isolated Firebase backend. No production publication was performed by the tests.

`npm run build` includes extraction and completeness checks for English plus 21 translation catalogs. TypeScript, ESLint and `git diff --check` are also checked.

## Limits

The media integration test uses a simulated upload service; it does not re-provision or change Cloud Storage. Existing upload authorization and signature verification remain in the unchanged server routes. Public content edits still require the explicit Publish action. New English copy does not automatically acquire translations.
