# Post-Launch Analytics Monitoring

## Tooling
- Segment + Google Tag Manager (GTM) for core events.
- (Optional) Hotjar/FullStory for heatmaps and session replay.
- Plausible/GA4 dashboards for high-level traffic metrics.

## Events to Track
| Event | Description | Notes |
| --- | --- | --- |
| `hero_cta_click` | Book a Demo button (hero + nav) | Include CTA location (`hero`, `nav`) |
| `pricing_cta_click` | Talk to Sales / Start 30-day pilot | Segment by plan tier |
| `download_click` | Pricing sheet / compliance matrix | Track asset type |
| `lead_form_submit` | Successful POST to `/api/leads` | Include timeline, source |
| `consent_update` | Cookie consent accepted/declined | Helps monitor opt-in rate |
| `calendly_schedule` | Calendly link clicked | Add plan/timeline context |

## Dashboards
- Weekly KPI dashboard: traffic, conversion rate, consent opt-in, pilot requests.
- Monthly funnel report: hero → pricing → form → CRM status.
- Heatmap review: top pages (hero, pricing, contact) to identify drop-off.

## Cadence
- Daily: monitor alerts for webhook failures/lead rate-limit logs.
- Weekly: review KPI dashboard with PMM + Growth.
- Monthly: deep dive into session recordings, share findings in retrospective doc.

## Alerting
- Configure webhook failure alert (Slack/email) when `/api/leads` forwarding fails or rate-limit thresholds hit.
- Set GA4 anomaly detection for traffic dips/spikes.

