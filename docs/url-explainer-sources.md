# Url-explainer — sources

The URL-explainer is a legacy episode. Its original packaging lists the
following references inline in `results/videos/what_happens_when_you_type_a_url/about.txt`.
Frozen here for cloners (results/ is gitignored).

| Claim | Source | Status |
| --- | --- | --- |
| DNS resolution (RFC 1034 / 1035) | https://datatracker.ietf.org/doc/html/rfc1034 · https://datatracker.ietf.org/doc/html/rfc1035 | NEEDS HUMAN CONFIRMATION |
| IP routing behaviour | https://datatracker.ietf.org/doc/html/rfc791 | NEEDS HUMAN CONFIRMATION |
| Submarine cable map | TeleGeography — https://www.submarinecablemap.com | NEEDS HUMAN CONFIRMATION |
| IANA registries (IPv4 allocation, ports) | https://www.iana.org | NEEDS HUMAN CONFIRMATION |
| Physical-address-to-AP routing (CDN edge) | vendor docs vary — not cited line-by-line | NEEDS HUMAN CONFIRMATION |

**Legacy `[src:]` markers are not present in `src/App.tsx` or inside `public/audio/manifest.json`. Any re-render of this episode must first retrofit markers (see `docs/conventions.md`).**
