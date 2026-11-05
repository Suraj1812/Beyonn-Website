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
