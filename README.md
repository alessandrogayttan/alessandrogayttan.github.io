# Alessandro Gayttan — Portfolio

Career-focused portfolio: full-stack development, applied AI, and automation. Built as a lightweight static site on GitHub Pages.

**Live:** [alessandrogayttan.github.io](https://alessandrogayttan.github.io)

## Pages

| Page | URL |
|------|-----|
| Home | `/index.html` |
| About | `/about.html` |
| Inpulso case study | `/case-inpulso.html` |
| Alessia case study | `/case-alessia.html` |
| Printable professional profile | `/resume.html` |

## Design and interactions

The shared `studio.css` layer supplies a cream, mint, and lilac visual identity. The homepage includes a CSS illustration, animated decorative elements, project previews, and an interactive explanation of Alessia's architecture. `studio.js` provides progressive enhancement, accessible mobile navigation, scroll reveals, motion controls, and architecture interactions. Content remains readable without JavaScript, and system reduced-motion preferences are respected.

`styles.css` retains the underlying layout rules for existing case studies. The former `script.js` is retained for history but is no longer loaded by the pages. There are no framework or build dependencies.

## Local preview

Run `python -m http.server 8765 --bind 127.0.0.1` from this directory, then open `http://127.0.0.1:8765`.

Use the résumé page's Print / Save as PDF button for a single-column, text-based professional profile. Its project-based format deliberately avoids inventing employers, education, or dates that have not been supplied.

## Validation of this revision

Browser checks covered all five pages at 320, 390, 768, and 1440 pixels: no horizontal overflow, missing images, or JavaScript errors. Internal paths and anchors were checked. Mobile menu opening, link dismissal, Escape, architecture selection, motion pause, reduced motion, and no-JavaScript content visibility were verified. The printed profile was rendered and visually reviewed as one A4 page. These checks are not a full accessibility audit or production performance benchmark.

## Content maintenance

Project descriptions are based on the existing portfolio. The scheduler deployment tradeoff in the Alessia case study is supported by its public repository README. Public source availability is described accurately without asserting an open-source license. Testimonials without verified attribution have been removed from this version. Confirm employment history, education, quantified outcomes, language proficiency, and LinkedIn details before adding them.

## Customize (see DOMAIN-SETUP.md)

1. **`site-config.js`** — WhatsApp, Calendly, LinkedIn, email
2. **`assets/photo.jpg`** — Your professional headshot
3. **`CNAME`** — When you buy a custom domain

## Refresh screenshots

```bash
python scripts/capture-screenshots.py
```

Requires: `python -m pip install playwright && python -m playwright install chromium`

© 2026 Alessandro Gayttan
