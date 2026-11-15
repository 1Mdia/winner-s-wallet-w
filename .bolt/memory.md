# Project memory

## Product intent & audience

- A web application/site exists and is intended to be publicly accessible to visitors.
- Deployment target: Netlify (currently configured); Bolt hosting available as alternative.
- The site itself and its core purpose are not yet described.

## Brand personality & voice

- User communicates in Brazilian Portuguese; assistant responses should match.

## Visual design & UX direction

- No design details inferred yet.

## Decisions, constraints & rationale

- Netlify visitor-access password protection was identified as the cause of the login prompt on the published site — not an application code issue.
- Remediation options presented: (a) disable password protection in Netlify **Project configuration → Access & security → Visitor access**; or (b) switch hosting provider via **All project settings → Domains & Hosting** from Netlify to Bolt hosting and redeploy.
- Reference doc used: https://support.bolt.new/integrations/netlify

## Open questions & assumptions

- Whether the user will disable Netlify password protection or switch to Bolt hosting is unresolved.
- Project type, stack, domain, and intended audience remain unknown.
- Assumption: the password prompt is the only current deployment blocker; no code-level defects are suspected.