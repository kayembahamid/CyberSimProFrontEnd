# Gated Content Plan

## Goals
- Capture mid-funnel leads (security leaders, compliance managers) with high-value resources.
- Qualify intent before sales engagement by tracking asset interest (workbooks, benchmark reports).

## Assets & Placement
| Asset | Format | Gate type | Funnel stage | Notes |
| --- | --- | --- | --- | --- |
| SOC Readiness Workbook | PDF | Simple form (name/email/company) | Mid-funnel | Promote under workflow section |
| Compliance Benchmark Report | PDF | Form + consent checkbox | Mid/late | Tie to governance section |
| MCP Playbook Webinar Recording | Video | Form + follow-up nurture | Late | Share after nurture email #2 |

## Form Mechanics
- Use existing `/api/leads` endpoint; add `asset` field to payload.
- Route to CRM campaign for follow-up automation.
- On submission, send email with download link + schedule CTA.

## Nurture Sequences
- **Workbook** → 3-email series focused on SOC automation.
- **Benchmark report** → compliance-focused conversation, highlight governance features.
- **Webinar** → invite to live Q&A / demo.

## Content Production
- Draft assets according to templates in `docs/content/`.
- Coordinate with design for layout; ensure brand consistency.
- Host final PDFs in `assets/docs/` or secure CDN.

## Measurement
- Track asset downloads (`download_click` event with asset name).
- Monitor conversion from gated asset → booked demo (within CRM).

