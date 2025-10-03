# Launch QA Checklist

Use this checklist to validate the marketing site before go-live.

## 1. Responsive Behavior
- [ ] Desktop (≥1440px): hero animation, pricing grid, case study, consent banner.
- [ ] Laptop (1280px): navigation wrap, workflow cards, support resources.
- [ ] Tablet (834px): mobile nav toggle, grids collapse, case study stack.
- [ ] Mobile (390px): hero stack, CTA buttons, lead form spacing.
- [ ] Verify anchor scroll with `section[id]` offsets on all breakpoints.

## 2. Accessibility
- [ ] Run Lighthouse/axe accessibility audit (score ≥ 90).
- [ ] Ensure keyboard navigation through nav menu, lead form, and consent banner.
- [ ] Confirm focus outlines visible (nav links, buttons, summary details).
- [ ] Check color contrast for text vs background (using WCAG AA).
- [ ] Add descriptive alt text for logos/badges/screenshots when final assets land.

## 3. Performance
- [ ] Lighthouse Performance score ≥ 90 on desktop & mobile (test locally and via PageSpeed).
- [ ] Largest Contentful Paint < 2.5s; reduce image sizes if needed.
- [ ] Ensure `npm run package` outputs optimized bundle and remove unused CSS.

## 4. Lead & Checkout Flows
- [ ] Submit form with real env values (success response, CRM entry created).
- [ ] Try invalid input (missing email) and confirm inline error.
- [ ] Honeypot test (fill hidden `website`) returns 400.
- [ ] Self-service checkout button opens Stripe URL when flag enabled.
- [ ] Consent flow: decline (no analytics), accept (Segment/GTM load).

## 5. Email/Notification Dry-Run
- [ ] Confirm webhook triggers lead-notification email/slack as configured.
- [ ] Review auto-responder copy (if CRM sends thank-you email).

## 6. Content QA
- [ ] All links (docs, downloads, legal) resolve and use HTTPS.
- [ ] Verify case study metrics match approved numbers.
- [ ] Validate PDF downloads are final versions.
- [ ] Check for typos or inconsistent terminology.

Sign off requires stakeholder initials and date.
