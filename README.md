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

The shared `glass.css` layer supplies an obsidian, steel-blue, and optical-glass visual identity. Reflective CSS rings surround a glass monogram in the hero. Glass surfaces use layered highlights, inset edges, and backdrop blur, with a solid fallback. A fine pointer adds restrained perspective and specular movement; reduced-motion preferences and the pause control disable movement.

Alessia is presented as Inpulso 43's AI assistant on WhatsApp. Its homepage and case-study demos contain clearly labeled, local illustrative conversations for appointments, workshops, and human support. They do not call the assistant API, process patient information, or claim to show actual conversations. The real WhatsApp button uses the contact number published by Inpulso 43 and opens a prefilled draft without sending it. Personal opportunity CTAs use Alessandro's email, rather than the business WhatsApp number.

`studio.js` provides progressive enhancement, accessible mobile navigation, scroll reveals, motion controls, architecture interactions, and the conversation examples. Content remains readable without JavaScript.

`styles.css` retains the underlying layout rules for existing case studies. The former `script.js` is retained for history but is no longer loaded by the pages. There are no framework or build dependencies.

## Local preview

Run `python -m http.server 8765 --bind 127.0.0.1` from this directory, then open `http://127.0.0.1:8765`.

Use the résumé page's Print / Save as PDF button for a single-column, text-based professional profile. The current Google DeepMind AI Developer L3 role was supplied by Alessandro. Start dates, responsibilities, education, and impact metrics have not been added without his input.

## Validation of this revision

Browser checks covered all five pages at 320, 390, 768, and 1440 pixels: no horizontal overflow, missing images, or JavaScript errors. Internal paths and anchors were checked. Mobile menu opening, link dismissal, Escape, architecture selection, motion pause, reduced motion, and no-JavaScript content visibility were verified. Both WhatsApp demos were checked for scenario changes, selected states, disclosure, and correct external destination. Inpulso website screenshots have been removed from the Alessia case study. The printed profile was rendered and visually reviewed as one A4 page. These checks are not a full accessibility audit or production performance benchmark.

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
