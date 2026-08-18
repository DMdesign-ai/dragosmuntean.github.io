# Company logos

Fetched from each company's own site (apple-touch-icon or web manifest icon),
normalised to 160x160 WebP. Used to identify past employers, which is the same
nominative use LinkedIn makes of them.

Present: twint, on, wefox, coachhub, freelancermap, marktplatz, sibiu100

Not present, and why:
  Flying.com          domain no longer resolves
  KeepCalling         site returns 403 to non-browser requests
  dragos.is           domain no longer resolves
  not less but better notlessbutbetter.com is now an unrelated gambling site;
                      deliberately NOT used

Those roles fall back to a monogram tile drawn from their initials, which is a
designed fallback rather than a missing image.

Logos render greyscale (`filter: grayscale(1)` on `.role__logo img`) so a row of
brand colours doesn't fight the page. Remove that filter for full colour.
