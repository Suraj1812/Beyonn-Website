# Localization release review

The feature provides visitor-facing text localization in English and 21 translated
languages. It uses checked-in JSON catalogs; production makes no translation API
requests. The initial HTML, canonical URLs and structured data remain English.
Translation applies after hydration. Recorded media, image text and external app
or registration pages retain their original language.

## Translation fidelity

The review screened 296 clinical source phrases across 21 catalogs (6,216
source/translation comparisons), using reverse translation to identify potential
omissions, changed qualifiers and ambiguous terminology. Flagged entries were
compared with the English source; a reverse translation was treated as a review
signal, not proof of correctness. The remaining short screening questions and
numeric facts were also checked directly.

Corrections include:

- Preserving all three observed sleep symptoms: breathing stops, choking and gasping.
- Referring to dental splints rather than security personnel when translating
  “night guard,” and to teeth rather than hands when translating “clenching.”
- Keeping the distinction between the joint (TMJ) and its disorders (TMD).
- Restoring truncated Urdu answers and maintaining conditional treatment language.
- Preserving strict “over 50” wording rather than changing it to “50 or older,”
  and preserving the neck measurement's strict comparison and both units.
- Keeping US Central Time rather than relabeling workshop times as Polish time.

798 source-key overrides preserve corrected wording, interface labels and protected
names/abbreviations. This count includes ordinary interface wording, not just
clinical corrections. `scripts/i18n-clinical-checks.json` adds independent concept,
threshold, unit and terminology checks to the normal catalog validation. These
checks run before every production build.

This was AI-assisted source-fidelity QA. No independent clinician or professional
translator signed off on these catalogs. It does not revalidate the medical
claims in the original English content, and is not clinical certification. New or
changed clinical copy needs deliberate content-owner review; it must not be
published solely because strings exist in every catalog.

## Technical checks

The release checks cover all 1,338 source messages in every translated catalog,
automatic browser-language detection, explicit preferences, RTL layout, error and
retry behavior, stalled downloads, malformed assets, rapid selection races,
screening-state preservation, client navigation and tablet-menu scroll locking.
All content routes and the not-found page are checked for translated headings.

Native-language visual checks were also performed for Hindi, Chinese, Arabic and
German, including phone and tablet widths. Long translated labels wrap instead of
clipping in the workshop banner; the header uses the drawer where needed.

The normal-motion browser suite passed locally. Hosted CI uses reduced-motion
mode and one worker to keep decorative WebGL animation from competing with the
translation and interaction checks on software-rendered runners. All assertions
remain enabled.

CI runs lint, catalog validation, the production build and the browser suite for
pull requests and pushes to main in either repository. Translation generation is
not part of CI or deployment and needs no service account or subscription.
