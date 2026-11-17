# CMS verification — 17 November 2026

## Passed

- Production Next.js build, TypeScript and ESLint.
- Complete English + 21 language catalogs (1,418 source messages each).
- 80 existing website regression tests: Academy content, translation switching, screeners, scrolling, animation timing, anchors, RTL and responsive layouts.
- 6 CMS end-to-end tests against a production Next.js server with Firebase Auth emulator and the dedicated Beyonn Firestore project:
  - private login route and mobile layout;
  - anonymous draft/history rejection and cross-origin mutation rejection;
  - draft isolation and publishing visible to a separate browser, including server metadata;
  - stale-version conflicts, unsafe links and invalid section rejection;
  - actual editor changes, authenticated iframe draft preview, unchanged public content and reload persistence;
  - unauthorized uploads and invalid file signatures rejected.
- Direct unauthenticated Firestore REST access returns 403 under the deployed deny-all rules.
- Production dependency audit reports no known vulnerabilities.
- Desktop and mobile admin previews visually inspected. Homepage renders its original section structure without React errors.

The publishing tests restore the starting published and draft documents. Test account credentials are private, test traces are disabled, and no production admin password is committed.

## Connected infrastructure

- Firebase Authentication initialized; Email/Password enabled; requested admin account created with the `beyonnAdmin` claim.
- Real Firebase login returned 200 with an HttpOnly, SameSite=Strict session; logout returned 200.
- Dedicated runtime identity verified for Auth authorization lookup and Firestore read/write.
- Dedicated private media bucket created in the already billed Marian-AI project; no new billing account was created. Uniform IAM, public-access prevention, bucket-scoped runtime permissions, direct-upload CORS and staging cleanup are configured.
- Scoped runtime Storage write/read verified.
- Production Firebase configuration and encrypted runtime credential configured in the existing Vercel project.

Production URL, actual signed media upload and HTTPS publishing checks are performed after the Git push/deployment. The $0–$10/month low-traffic planning range remains an estimate, not a spending cap.
