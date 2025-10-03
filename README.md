CyberSim Pro Frontend

Contents
- index.html — landing page (original wording preserved)
- assets/css/style.css — main stylesheet
- assets/img — image placeholders
- assets/js — future scripts
- server.js — minimal Express static server
- package.json — start/dev scripts

Run locally
1) In this folder:
   - npm install
   - cp .env.example .env   # populate CRM + analytics values
   - npm run start
   - Open http://localhost:5173
2) The landing page will automatically ping `/health` on load and the hero “Book a Demo” button will call `/tool/create_scenario` to spin up a sample scenario (using the email field to tag the request).

Payment integration handoff
- Pricing CTAs labelled “Start 30-day pilot” carry a `data-checkout-url` attribute. Swap in your live Stripe Checkout or Paddle pay link and wire an on-click handler if you need a custom modal.
- Until payment rails are live the buttons smooth-scroll to the contact block and update the helper text so sales can pick up the conversation.
- The CTA cluster in the contact form mirrors the funnel. Update the `mailto:` links with your CRM alias or replace them with your embedded form when ready.

Design system highlights
- Theme tokens live in `assets/css/style.css` under the `:root` block (brand palette, spacing, shadows, radii). Use these vars when introducing new sections so colors stay consistent.
- Buttons share a unified base (`.btn`, `.primary-btn`, `.ghost-btn`, `.cta-outline`, `.demo-btn`) with keyboard focus states; reuse these classes for new CTAs instead of re-implementing styles.
- Cards (`.value-card`, `.workflow-card`, `.pricing-card`) all rely on shared radii and border colors—extend them for future content panels to keep layout rhythm intact.

Integrations playbook
- **Lead capture**: the contact form posts JSON to `/api/leads`. Point that route at HubSpot, Salesforce, or your marketing automation with server-side validation. Failed submissions surface copy in the banner so prospects can fall back to email.
- **Calendly**: update the `href` on the “Schedule via Calendly” button with your real scheduling link. The button currently opens a new tab; swap for an embed if you prefer an in-page widget.
- **Analytics & consent**: set `SEGMENT_WRITE_KEY` / `GTM_ID` in the environment (served via `/config.json`). Visitors only load these scripts after accepting the cookie banner (`localStorage` key `cybersim-consent-v1`). When testing, decline consent first (no analytics requests) then accept to confirm the scripts load.
- **Download assets**: replace the placeholder PDFs in `assets/docs/` with the actual compliance matrix, pricing sheet, and product one-pager before launch. Update filenames if needed.
- After wiring analytics, start the dev server, open the site, decline consent (no Segment/GTM should appear in the Network tab), then accept consent to confirm the scripts load.

Bundle for static hosting
```bash
npm run package
# outputs dist/ with index.html, assets/, docs/, server.js for serverless/edge deployment
```

Nginx deployment (optional)
server {
    listen 80;
    server_name your.domain;
    root /var/www/CyberSimProFrontEnd;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

Integrate with cybersim-pro backend
- Repo: https://github.com/kayembahamid/cybersim-pro
- Option A (same host):
  - Keep this frontend on port 5173
  - Configure backend CORS to allow http://localhost:5173
  - In Nginx, reverse-proxy /api to backend and / to this folder
- Option B (mount under path):
  - Set MOUNT_PATH=/ui in .env next to server.js
  - Serve backend at /; the frontend at /ui

Legal references
- Key policies live in `docs/legal/`: privacy-policy.md, terms-of-service.md, acceptable-use-policy.md, cookie-statement.md. Update them with counsel before launch.

Additional collateral
- Work-in-progress content lives under `docs/content/` (workflow deep dives, case study outline, blog backlog, visual asset plan).

QA & launch resources
- QA checklist lives in `docs/qa-checklist.md` to guide responsive/performance reviews.
- Ops dry-run procedure: `docs/ops/lead-flow-dry-run.md`.
- Launch comms plan: `docs/comms/launch-plan.md`.

Post-launch resources
- Analytics & monitoring: `docs/post-launch/analytics-monitoring.md`.
- Experiment backlog & log: `docs/post-launch/experimentation-plan.md`, `docs/post-launch/experiment-log.md`.
- Gated content plan: `docs/post-launch/gated-content-plan.md`.
- Content roadmap: `docs/post-launch/content-roadmap.md`.
