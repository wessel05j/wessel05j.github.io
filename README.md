# Erich Johannes Wessel — Portfolio

Personal software and AI portfolio, published at https://wessel05j.github.io/.

## Local preview

The site is plain HTML, CSS, and JavaScript with no build step or runtime dependencies.

```sh
python -m http.server 4317 --bind 127.0.0.1
```

Open http://127.0.0.1:4317/. Opening index.html directly also works.

## Structure

- `index.html`: project stories, experience, skills, biography, and contact links.
- `styles.css`: responsive layout, both themes, and motion preferences.
- `theme-init.js`: restores the theme and motion preferences before paint.
- `script.js`: theme controls, keyboard-accessible workflow explorer, scroll progress, chapter navigation, and optional reveals.
- `assets/fonts/`: self-hosted Manrope from Google Fonts, with its OFL license.
- `profil_bilde_proff.png`: existing portrait and social-preview image.

The first visit uses dark mode. Theme and motion preferences are stored only on the visitor's device. There are no analytics, external embeds, or server APIs. Content and all four VerbaCut workflow steps remain readable without JavaScript. Reduced-motion preferences are respected, with a manual control in the footer.

## Content maintenance

Project descriptions are grounded in their READMEs and Johannes's September 2026 CV. BeyondComfort views and earnings are dated to September 2026. Satoshi Signal's live-test period and historical research are presented separately as reported figures, not a real-time performance feed. Its repository is private, so no public source link is shown.

Update the internship year, availability, dated figures, and experience when they change. Keep the BeyondComfort channel link, GitHub repositories, and contact details current.

## GitHub Pages

GitHub Pages serves the repository root on the existing `main` branch. Pushes to `main` publish through the repository's Pages build and deployment workflow. No additional hosting service is required.
