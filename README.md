# GrowEzy marketing site (redesign)

A static redesign of `growweb/`. The original folder is untouched.

## Preview

```bash
cd growweb-redesign
npx serve .            # or: python3 -m http.server 8080
```

## What is where

- `index.html`: the page.
- `css/app-mock.css`: the product screens drawn as live HTML, using the app's own tokens (Lexend, navy `#0A1C38`, lime `#A1B633`, Feather icons). These are taken from `client/src`: the app shell, Dashboard, Renewals, WhatsApp inbox, Support AI drawer and policy extraction.
- `css/hero.css`: the split hero. The words sit on the left. On the right is the advisor photograph (`images/hero-advisor.jpg`) with live HTML cards around it: Renewals, AI policy reading, Commission and a WhatsApp reminder.
- `css/highlights.css`: the "No more manual work" strip (`#easy`), the navy data security section with certification badges (`#security`, photo `images/security.jpg`) and "Easy to start, easy to use" (`#more`, photos `images/import-sheet.jpg` and `images/field-phone.jpg`).
- `css/chatbot.css`, `js/chatbot.js`: the GrowEzy Assistant website chatbot on every page. It uses the same backend as the old site (`POST /api/website-chat`: `localhost:4000` locally, `app.growezy.in` in production), with suggested questions, light markdown answers and a WhatsApp handover.
- `css/site.css`: where each screen sits on the page, plus responsive rules.
- `js/app-mock.js`: animations for the screens. Each one starts when it scrolls into view: counts, the renewal flipping to Renewed, the extraction ring, WhatsApp replies and the Support AI answer.
- `js/site.js`: hero photo settle, reveal on scroll, count-ups and the monthly/yearly pricing switch.
- `images/`: photographs generated for GrowEzy with Azure `gpt-image-2.5-flare`, plus the logo and icon.
- `assets/`: the taste-skill design kit (system.css, motion, layout).

## Pricing source

The prices come from `GrowEzy - Plans  Pricing (3).xlsx`, sheet "Pricing Nov 2026". All prices exclude GST.

| Plan | Monthly | Yearly |
|---|---|---|
| Grow Lite | ₹750 | ₹7,200 |
| Grow Plus | ₹1,750 | ₹15,750 |
| Grow Pro | ₹2,750 | ₹23,100 |

- The free trial is 15 days of Grow Plus with up to 100 policy uploads.
- Add-ons: an extra login is ₹200 a month, and 100 extra AI uploads cost ₹75.
