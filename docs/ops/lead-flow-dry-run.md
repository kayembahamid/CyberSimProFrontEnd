# Lead Flow Dry Run Procedure

Follow this sequence before each major release to ensure the funnel is working end-to-end.

## 1. Environment Setup
- Deploy latest build to staging (or run `npm run start` locally with staging `.env`).
- Set env variables:
  - `CRM_WEBHOOK_URL` → staging Zapier/HubSpot endpoint that writes to sandbox pipeline.
  - `SEGMENT_WRITE_KEY`, `GTM_ID` → staging containers.
  - `STRIPE_CHECKOUT_URL` → test-mode checkout session (`https://checkout.stripe.com/pay/cs_test_...`).
  - `CALENDLY_URL` → staging or real booking link.
  - `FEATURE_SELF_SERVICE_ENABLED=true` if you want to exercise Stripe button.

## 2. Lead Submission
- Complete the contact form using a test identity (e.g., `qa+date@cybersimpro.com`).
- Verify:
  - Client receives `202` response with `{ status: 'queued' }`.
  - CRM record is created with all fields (name, email, company, timeline, notes, source, UTM if applicable).
  - Notification email/slack fires (if configured).

## 3. Payment Stub
- Enable `FEATURE_SELF_SERVICE_ENABLED=true` and set Stripe test checkout URL.
- Click “Start 30-day pilot” → confirm new tab opens Stripe test page.
- Complete test checkout flow with Stripe test card (4242…). No charge occurs in test mode.
- Confirm webhook/logs capture the checkout attempt (if integrated).

## 4. Email Confirmation
- Check CRM automation sends any follow-up email (thank-you or scheduling link).
- If using email templates, ensure links (pricing sheet, compliance matrix) reference production URLs.

## 5. Consent & Analytics
- Clear localStorage, load site, **decline** cookies → confirm Segment/GTM absent in DevTools Network.
- Accept cookies → ensure scripts load and events are visible in debugger.

## 6. Record Results
- Capture screenshots of CRM entry, notification, Stripe test receipt.
- Log issues in QA tracker; rerun after fixes.

