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

## Voiceover + captions (added 2026-07-31)

`ProductVideo` now accepts `voiceoverFile` and plays it as the video's audio
track (baked into the MP4 at render time — no separate audio asset to
distribute). EM4a's GPT step now also returns a `script` field (15-25s of
spoken narration) which module 21 maps to `props.voiceoverText`, with
`props.voiceoverVoice` hardcoded to `en-US-AriaNeural` (US female). The
on-screen `caption` field still renders as the caption bar — that's the
"captions" layer; there's no word-by-word burned-in transcript, the caption
bar text is the source of truth for both what's read aloud and what's shown.

Download links are logged to Google Sheet `EM4_Video_Render_Log`
(`1vBqvFHFNpcBWSrrXzEOSmyvl0Xv59XtA7YdR1xLdf2Y`) by EM4b immediately after
each webhook callback, columns: Date | RequestId | ProductTitle |
DownloadUrl | Status | TikTokTitle. Sheet has no header row yet — add one
manually before the first real run if you want it.

## Live test run — 2026-07-31

Full pipeline verified live: EM4a dispatch -> GitHub render (with AriaNeural
voiceover baked into the MP4) -> EM4b callback -> logged to
`EM4_Video_Render_Log` -> **posted live to TikTok** via PostPulse. YouTube
upload branch also ran (large data transfer matched the video size).
Only the Facebook Page scheduled-post module failed: it was sending
`youtubePublishAt` as an ISO8601 string but Facebook's `CreatePost` expects
a Unix timestamp for `date` — fixed by wrapping in `formatDate(...; "X")`.

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
