# Beyonn website control

The private workspace is `/control`. It is absent from public navigation and excluded from indexing. The existing navy, blue and mint brand is used throughout.

Choose a page, then click the item you want to edit in its preview. The editor opens with controls for that item. Change copy, normal or hover text color, text size, or the optional loading label on navigation buttons. Select a colored part of a line, or drag to highlight individual words. Highlighted words can be changed on one page or everywhere the same source text appears. Replace an image or video, set alt text, or update a link destination. Click **Apply** to see the edit, **Save draft** to keep it private, or **Publish** to update the live website.

If the same source text, media URL, or link destination appears multiple times on one page, its matching occurrences are updated together. New copy is edited in English.

## Design and page building

Open **Design & sections** next to the page picker. The three tools are:

- **Sections:** jump to a section, insert a heading/text, image, list, cards or call-to-action section before or after an existing section, or at the start/end of the page. New sections can contain any combination of headings, multiline text, lists, cards, images, uploaded MP4/WebM videos, buttons and spacers. Rename, duplicate, hide, delete or relocate them. Hidden custom sections remain accessible through their edit buttons. Existing homepage and content-page sections can be moved or hidden.
- **Design:** click an element in the preview, or choose a section, then change its solid background or two-color gradient, text color, four-sided padding and margins, item gap, maximum width, corner radius, alignment and visibility. Use **Select parent container** to adjust the enclosing card or section. Desktop settings apply by default; mobile overrides apply at viewport widths of 640px or less. **Preview size** switches the iframe to desktop or 390px mobile. **Reset desktop/mobile design** restores the original settings for that element and screen size.
- **Content:** expand a content collection to edit its fields and add, move or remove entries in lists, cards, buttons, FAQs and paragraphs. Changes affect the selected collection wherever it is used. The current page has its own collection. Adding entries to an existing visual list is also available in Design after selecting that list.

**Undo** and **Redo** keep up to 50 in-memory editing steps, including deletions, across page changes. They reset on reload. Saving a draft persists the whole document privately; publishing applies the content and design together. Existing text, link, media and selected-word editing remains available under **Edit text & media**. Newlines in edited or added text render as separate lines.

The optional `builder` property is keyed by route. It stores validated element styles, added sections and extra visual-list entries. Old documents remain valid without it. Backgrounds accept six-digit hex colors and bounded gradient angles; spacing is bounded; layout selectors are restricted to elements inside `#main`. New blocks use React rendering rather than arbitrary HTML or scripts. Content and media URL validation applies to all new blocks. Media uploads use the same authenticated upload pipeline and library as the original editor.

Section anchors and element selectors are stable within the existing source layout. A later developer redesign that removes a section or changes its internal markup may require resetting or reapplying styles anchored to that markup. Custom English copy falls back to English in other locales until translations are provided; existing translation catalogs continue to work.

## Backend

Firebase project: `beyonn-website-cms`.

- **Firebase Authentication:** email/password verification on the Next.js server. Only users with the server-assigned `beyonnAdmin: true` custom claim receive a session. There is no public admin signup.
- **Firestore:** shared drafts, published content, bounded revision history, opaque server sessions, persistent login limits and media metadata.
- **Cloud Storage via Firebase Admin:** immutable validated image/video uploads in the dedicated `beyonn-cms-media-347549647510` bucket, hosted in the existing billed `marian-ai` project. Authentication and Firestore remain isolated in `beyonn-website-cms`. The bucket is private. Next.js serves an asset publicly only if the published document references it; draft assets require an admin session. The existing billing setup is reused; no new billing account was created.
- **Next.js APIs:** authorization on every administrative request, same-origin checks on mutations, payload limits, schema and URL validation, optimistic concurrency checks and no-store responses for private data.

Firestore client security rules deny all access. The media bucket enforces uniform IAM and public-access prevention. Its dedicated runtime identity has object create/read permissions only for that bucket. The server uses Application Default Credentials and checks admin access before using its privileged SDK. The published content API returns only the published document. It never returns drafts, sessions or account credentials.

Sessions use a random opaque token in an HttpOnly, SameSite=Strict cookie (`Secure` under production HTTPS). Only a hash of the token is stored in Firestore. Sessions expire after 15 minutes without a heartbeat and have an eight-hour absolute lifetime. Logout deletes the server session. Every authorized request re-checks the account and its admin claim, including account disablement and revocation. Eight login attempts per 15 minutes are allowed across server instances. The account-wide limit intentionally prevents bypass through spoofed forwarding headers; it can also temporarily lock out the admin during an attack.

Published content is cached for up to 15 seconds per server instance. A publication clears the current instance's cached version. Other instances and existing browser tabs refresh on the next navigation or reload. Shared publishing does not depend on localStorage or IndexedDB.

## Local setup

1. Copy `.env.example` to `.env.local` and supply the Firebase web-app configuration.
2. Configure private Google Application Default Credentials. Local credentials must remain outside Git. `.secrets/` is ignored and must not be uploaded.
3. Open Firebase Authentication → Get started and enable Email/Password.
4. Authorize an admin through `npm run cms:admin` with `CMS_ADMIN_EMAIL` and, for a new user, `CMS_ADMIN_PASSWORD` supplied privately in the process environment. The setup script preserves existing passwords. Do not put passwords in source, command-line arguments, or committed files.
5. Deploy the Firestore rules and index exclusions with `firebase deploy --only firestore`.
6. Set the configured private media bucket. Its IAM policy and public-access prevention protect it; the unused `storage.rules` file is a deny-all template for a future Firebase client-storage configuration.
7. Start Next.js and open `/control`.

The one-time password supplied in chat is not part of the repository. Firebase Authentication and the requested admin account have been provisioned. Rotate it through Firebase Authentication before a public launch.

## Drafts and publishing

The editable preview uses in-memory changes in a same-origin frame. Saving writes a shared private draft. Publishing validates and atomically updates the draft and public version. A stale editor receives a conflict instead of overwriting a newer draft. Firestore retains a bounded backup history and media objects stay immutable so existing references can be recovered.

## Deployment and costs

### Cloud media library

All shipped photographs, logos, icons, posters, videos, audio and captions now live in the same private `beyonn-cms-media-347549647510` bucket. `src/lib/media/assets.json` is the public allowlist; it contains object references and metadata, never credentials or file contents. Content-addressed objects are uploaded with create-only preconditions. The original oral-appliance video keeps its existing object name.

Existing `/assets/...`, `/icon.png` and `/apple-icon.png` URLs are rewritten to the cloud asset handler. Images remain same-origin and compatible with Next.js image optimization, CSS masks, canvas and existing CMS keys. Image responses have browser and shared-cache headers. Video and audio requests redirect to one-hour signed Storage URLs, with the redirect cached for five minutes, so playback and range/seek bytes bypass the application server. Only registered site assets are accessible through this handler; private CMS uploads retain their existing authenticated/publication checks.

The original Mux introduction and Frame.io walkthrough now resolve to cloud-hosted MP4 copies and posters. The introduction uses the existing 1080p rendition and the walkthrough uses Frame.io's 1080p delivery rendition rather than its much larger editing original. Original CMS source keys are preserved through aliases, so previously saved video overrides still take precedence. New cloud players use controls, inline playback and `preload="none"`. These MP4 files do not provide automatic adaptive-bitrate switching.

To add or update a developer-managed asset, put it under `public/assets`, then run `npm run media:migrate` with the existing private Firebase server configuration. The script verifies the cloud object's size and SHA-256 metadata before updating the registry. After verification, archive the local original outside shipped source. An optional directory argument can recheck archived sources: `npm run media:migrate -- .secrets/media-source/assets`. Local migration backups are ignored and are not deployed. CMS uploads continue to use the CMS, with its existing 20 MB per-file limit; this one-time server-side migration is separate from that limit.

Read-only cloud delivery checks: `CMS_MEDIA_E2E=1 PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/media.spec.ts --workers=1`. These require real bucket read credentials and a signing-capable runtime identity. They check registry URLs, privacy boundaries, optimized images, share cards, direct video/audio range requests and rendered cloud players.

The live frontend uses the existing Vercel project `beyonn-website`. Production Firebase configuration and the dedicated runtime service-account credential are stored in Vercel environment variables; the credential is an encrypted production Secret, never a public variable. On non-Google hosting, `FIREBASE_ADMIN_CREDENTIALS` supplies that server-only JSON. Local files stay ignored. The runtime identity can read Firebase Auth users, read/write CMS Firestore data and create/read objects only in the dedicated media bucket.

Browser uploads use ten-minute signed POST policies with an exact file size and MIME type. Files first land in private `incoming/` objects. The authenticated completion endpoint rechecks ownership, expiry, size, MIME type and binary signature before copying to immutable `cms/` objects. This avoids Vercel request-body limits for 20 MB videos. Abandoned or invalid staging objects are deleted by the bucket lifecycle after one day.

`apphosting.yaml` is an optional template for a future Firebase App Hosting deployment with zero minimum instances, two maximum instances, 512 MiB memory and concurrency 40. This is a low-traffic starting point, not a monthly price guarantee or a hard cap. Zero minimum instances can introduce cold starts. App Hosting should be associated with the existing Beyonn web app so `FIREBASE_WEBAPP_CONFIG` is supplied automatically. Use the runtime service account / ADC, never the local CLI refresh-token file in production. Never set `FIREBASE_AUTH_EMULATOR_HOST` on production.

The current deployment reuses existing Vercel hosting and Marian-AI billing for the dedicated storage bucket. A new Firebase App Hosting deployment is not required. Firebase App Hosting and default Firebase Storage buckets require the billing-enabled Blaze plan. Based on the pricing checked on 17 November 2026:

- Firestore Standard includes 1 GiB stored data, 50,000 document reads/day and 20,000 writes/day at no cost.
- App Hosting includes 10 GiB/month outgoing bandwidth; additional cached traffic is $0.15/GiB and uncached traffic is $0.20/GiB. Cloud Run compute, builds, artifact storage, logs and secrets have their own usage pricing.
- Media storage, operations and transfer depend on bucket region and usage. Streaming large videos can dominate costs; existing external video providers avoid transferring that video through this backend.
- A small website with one admin and low traffic can use a **$0–$10/month planning range**, but this is an estimate, not a quotation or maximum. Traffic spikes, large videos and abuse can raise it.

Budget alerts notify owners about spending. They do not stop charges.

Official references: https://firebase.google.com/pricing, https://firebase.google.com/docs/app-hosting/costs, https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024.

## Verification

- `npm run lint`
- `npm run build` (includes all translation-catalog checks)
- `PLAYWRIGHT_CHANNEL=chrome npm run test:cms`
- Opt-in authenticated tests require `CMS_TEST_EMAIL`, `CMS_TEST_PASSWORD`, and `CMS_E2E_WRITE=1`. Use an Auth emulator or a separate test account/project: these tests publish a temporary page and restore the original published and draft documents afterward. They disable traces so login credentials are not written to browser traces.
- `PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/cms-builder.spec.ts --workers=1` tests the real editor and preview using an isolated in-memory content API, including draft privacy, reload persistence, cross-browser publication, responsive CSS, media upload integration, validation, undo/redo and save conflicts. It makes no production writes.
- Existing Academy, scrolling, interactive-experience and language tests remain relevant regression coverage.

Run the Auth emulator with `firebase emulators:start --only auth`. A test server may set `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`; production must never set it. File-upload success, media streaming and cloud-deployment checks require an actual provisioned Storage bucket and deployed environment. Signature rejection and anonymous upload rejection can be checked without a bucket.
