# Patient app screenshots

Captured from the running Expo web app on 11 November 2026.

- Source: https://github.com/Suraj1812/Beyonn
- Source commit: `4a5c542ef15b7521b086e678b426ce6dbeb7fde5`
- Local checkout: `/Users/surajsingh/Documents/Beyonn`
- Runtime: development, explicit demo mode; no live patient account or backend used.
- Capture: Chromium, 390 × 780 viewport, 2× pixel density. App-root element only; no browser chrome or outer desktop background. WebP quality 90.
- Screens: `/` (welcome), `/home`, `/sleep-check`, `/exam-checklist`, `/progress`.
- Files: `public/assets/patient-app/*.webp`.

All people, appointments and outcomes visible in these screens are demo fixtures. Sample-data labels remain visible on the progress screen and accompany the website previews.

To run the source app for future captures:

```sh
EXPO_PUBLIC_APP_ENV=development EXPO_PUBLIC_API_MODE=demo npm run web -- --host localhost --port 8081
```
