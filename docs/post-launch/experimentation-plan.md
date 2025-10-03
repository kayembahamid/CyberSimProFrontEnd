# Experimentation Plan

## Framework
- Hypothesis → Variant → Metric → Sample Size → Runtime → Decision rubric.
- Use Optimizely, VWO, or GTM/Google Optimize replacement (e.g., LaunchDarkly experiments) once selected. For lightweight tests, feature flags (self-service checkout, CTA copy) can toggle variants manually.

## Initial Test Backlog
| Test | Hypothesis | Primary Metric | Secondary Metric | Status |
| --- | --- | --- | --- | --- |
| Hero headline vs. current | “Secure everything your code depends on” vs. “Launch MCP-native incident readiness in days” | Hero CTA CTR | Lead conversion rate | Planned |
| CTA wording in pricing cards | “Start 30-day pilot” vs. “Launch your pilot” | Pricing CTA CTR | Lead conversion | Planned |
| Pricing layout (3 columns vs. stacked) | Simplified layout increases mobile engagement | Scroll depth to FAQ | Conversion rate | Planned |
| Case study positioning (above testimonials) | Moving proof earlier increases credibility | Lead conversion | Time on page | Backlog |

## Execution Steps
1. Define success metric & confidence threshold (e.g., 95% confidence, +10% relative lift).
2. Implement flags or experiment code (via GTM or inline JS toggles).
3. Ensure analytics/Segment captures experiment assignment (property `experiment_variant`).
4. Run experiment until sample size met; review with Growth + PMM.
5. Document outcome in experimentation log (`docs/post-launch/experiment-log.md`).

## Guardrails
- Cap tests at one primary change per page at a time.
- Avoid running experiments during major campaigns or site outages.
- Ensure old variants respect legal/compliance claims.

