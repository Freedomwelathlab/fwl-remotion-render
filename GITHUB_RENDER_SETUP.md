# EM4 render pipeline — status

Repo: https://github.com/Freedomwelathlab/fwl-remotion-render (public)

## Wiring (done — verified end to end 2026-07-30)

```
EM4a (Make)  --repository_dispatch-->  GitHub Actions "Render Video"
                                              |
                                       renders with Remotion
                                              |
                                       uploads MP4 as a Release asset
                                              |
EM4b (Make)  <--POST callbackUrl---------------
```

EM4a module 21 (`Create JSON`) builds the dispatch payload against the
`EM4 Render Dispatch Payload` data structure, and module 19 (GitHub
"Make an API Call") POSTs it:

- URL: `/repos/Freedomwelathlab/fwl-remotion-render/dispatches`
  (relative — the GitHub app prepends `https://api.github.com`)
- Headers: `Accept: application/vnd.github+json`, `Content-Type: application/json`
- Body: `{{21.json}}`

The payload's `callbackUrl` is EM4b's webhook, so the render result travels
with each request instead of living in a secret. No repo secrets are needed —
the workflow uses GitHub's automatic `GITHUB_TOKEN`.

Payload shape consumed by `scripts/write-request.js`:

```json
{
  "event_type": "render-video",
  "client_payload": {
    "requestId": "em4-<productId>-<epoch>",
    "composition": "ProductVideo",
    "callbackUrl": "https://hook.eu1.make.com/...",
    "outputName": "em4-...",
    "props": { "productTitle": "", "hook": "", "caption": "",
               "images": [], "accent": "mint", "secondsPerImage": 3 }
  }
}
```

`composition` must be one of `HookOverlay`, `ShortVideo`, `ProductVideo`.

## Still outstanding

1. **EM4b is inactive.** Callbacks queue on its webhook instead of posting.
   Activate it once PostPulse is reconnected.
2. **PostPulse connection expired 2026-07-29.** Reconnect in Make — OAuth
   can't be done from here.
3. **Check the store domain in EM4a module 10.** `ProductLink` is built as
   `https://fwlonline.myshopify.com/products/<handle>`, but the Shopify
   connection is `1dis4u-xn.myshopify.com`. If `fwlonline` isn't a live
   custom domain, every posted link 404s.

## What's free that used to cost credits

| Step | Before | Now |
|---|---|---|
| Slideshow render | JSON2Video (paid) | Remotion on GitHub Actions (free, unlimited on public repos) |
| B-roll / images | Shopify's own product images | unchanged |
| Video hosting | JSON2Video's temp URL | GitHub Release asset (free, permanent) |
| Copy generation | OpenAI (unchanged) | OpenAI (unchanged) |
| Posting | PostPulse + YouTube (unchanged) | PostPulse + YouTube (unchanged) |

EM2 (the original, JSON2Video-based scenario) is left untouched and inactive
as a fallback — nothing was deleted.
