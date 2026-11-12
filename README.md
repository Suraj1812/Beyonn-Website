# Beyonn

Marketing website for Beyonn, the OSA + TMD program for dental and medical practices.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Lenis, GSAP, AOS and three.js.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command         | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the dev server                  |
| `npm run build` | Production build                      |
| `npm run start` | Serve the production build            |
| `npm run lint`  | Lint the project                      |

## Environment variables

All are optional.

| Variable                       | Purpose                                                                  | Default              |
| ------------------------------ | ------------------------------------------------------------------------ | -------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Public site URL used for canonical links, share images and the sitemap   | `https://beyonn.com` |
| `NEXT_PUBLIC_APP_STORE_URL`    | Beyonn Patient App on the App Store                                      | none                 |
| `NEXT_PUBLIC_GOOGLE_PLAY_URL`  | Beyonn Patient App on Google Play                                        | none                 |

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Next.js).
2. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. Deploy. No other configuration is needed.

## Project structure

```
src/
  app/          routes, metadata, sitemap, robots, share images (/og)
  components/   layout, sections, interactive pieces, visual effects
  content/      page copy, navigation, FAQs, articles, endorsements
  lib/          helpers (SEO metadata, class names)
public/assets/  photography, brand marks and platform screenshots
```

## Built-in website languages

The site supports English plus 21 translations: Hindi, Bengali, Marathi,
Tamil, Malayalam, Urdu, Arabic, Spanish, French, German,
Portuguese, Russian, Chinese, Japanese, Korean, Indonesian, Vietnamese,
Turkish, Italian, Dutch and Polish.

On the first visit, the browser's ordered language preferences select a supported
language (for example, `hi-IN` selects Hindi). Unsupported languages fall back to
English. The header picker changes languages without reloading or resetting
forms. An explicit choice is remembered in `beyonn:language` in local storage;
“Use device language” removes that override. Arabic and Urdu use right-to-left
layout. Text, forms, menus, accessibility labels and browser metadata use local
catalogs. Images, prerecorded videos/audio, and external registration/app pages
retain their original content/language.

There is no translation account, subscription, key, or runtime translation API.
Only the chosen catalog is downloaded from this website. English server-rendered
HTML remains available before JavaScript loads and if translations cannot load;
translated content appears after hydration. This is visitor-facing localization,
not separate indexed language URLs: canonical URLs, sitemap and structured data
continue to describe the English original.

### Updating translated content

1. Edit English copy in `src/` as usual, then run `npm run i18n:extract`.
2. Translate new entries in `public/locales/<language>.json`. These JSON files map
   English source phrases to complete translated phrases, with `{name}`-style
   placeholders for dynamic labels. Keep placeholders intact.
3. Store reviewed corrections in `scripts/i18n-ui-overrides.json` so regeneration
   preserves them. Run `node scripts/finalize-translations.mjs` to apply them.
4. Run `npm run i18n:check`, `npm run lint` and `npm run test:i18n`.

The initial drafts were prepared with [Google Translate](https://translate.google.com/)
during authoring and saved as static JSON, with hand-authored corrections in the
override file. No translation provider is contacted when visitors use the site.
A source-fidelity review and clinical-wording regression checks cover the translated
medical copy; details and limitations are recorded in [localization QA](docs/localization-qa.md).
This is AI-assisted translation QA, not independent clinical certification. Content
owners should review any new or changed clinical claims before publishing.
New translations can be written directly into the catalogs or prepared using your
preferred translation authoring tool; the deployed website has no provider dependency.

Browser tests use Playwright. Install its browser once with
`npx playwright install chromium`, or use an installed Chrome via
`PLAYWRIGHT_CHANNEL=chrome npm run test:i18n`.
