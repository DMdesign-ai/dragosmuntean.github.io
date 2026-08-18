# Self-hosted webfonts

No CDN, no third-party request. Both families are the foundries' own
`.woff2` builds, copied unmodified — neither licence permits subsetting
or format conversion, and both ship web formats, so nothing was touched.

## Nohemi — display
Headings, wordmark, entry titles. By Rajesh Rajput. Free for personal and
commercial use. Only the weights in use are shipped:

| File | Weight | Used by |
| --- | --- | --- |
| `Nohemi-Regular.woff2` | 400 | reserve |
| `Nohemi-Medium.woff2` | 500 | entry titles, impact lines |
| `Nohemi-SemiBold.woff2` | 600 | wordmark, all headings |

Licence: `licenses/Nohemi-EULA.pdf` (scanned PDF, not machine-readable).
Full nine-weight family and a variable TTF are in the original download.

## Satoshi — text
Body copy, case studies, notes. Indian Type Foundry, ITF Free Font Licence,
which explicitly permits and recommends self-hosting.

| File | Weight | Notes |
| --- | --- | --- |
| `Satoshi-Variable.woff2` | 300–900 | 42 KB, smaller than two statics |

Licence: `licenses/Satoshi-ITF-FFL.txt`.

The `font-family` name in `race.css` is a CSS alias only — the files
themselves carry their original names and metadata.
