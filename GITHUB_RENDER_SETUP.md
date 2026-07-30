# EM4 render pipeline — one-time GitHub setup

I can't create repos or push code from here (no `gh`, no git auth in this
session). Five steps, ~10 minutes, then EM4a → EM4b runs itself forever.

## 1. Create the repo

Public, so Actions minutes are free and unlimited, and the rendered MP4s get
plain public download URLs PostPulse/YouTube can fetch with no auth.

```
https://github.com/new
```
Name it anything (e.g. `fwl-remotion-render`). **Public.** Don't initialize
with a README (we're pushing an existing project).

## 2. Push this project

From this folder:

```bash
git init
git add .
git commit -m "Remotion render pipeline for EM4"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## 3. Point EM4a at your repo

In Make.com, open scenario **EM4a Mkt_TikTok Video Engine (Remotion, $0)**,
find the "Make an API Call" (GitHub) module, and replace the URL field:

```
/repos/REPLACE_WITH_GITHUB_USERNAME/REPLACE_WITH_REPO_NAME/dispatches
```

with your real `<username>/<repo-name>`.

## 4. Reconnect PostPulse

Your PostPulse connection (used by EM4b for TikTok posting) expired
2026-07-29. Reconnect it in Make.com — I can't do OAuth for you.

## 5. Test end to end

1. In Make, run **EM4a** once manually (or `scenarios_run`).
2. Check the Actions tab on your new repo — a "Render Video" run should
   start within a few seconds.
3. When it finishes (a couple minutes), it POSTs to EM4b's webhook
   automatically. Check EM4b's execution history for a successful run,
   and check the repo's Releases tab for the uploaded MP4.
4. If the GitHub Action fails, its logs will show exactly where — most
   likely cause on a first run is a missing dependency lockfile mismatch,
   fixable by re-running `npm ci` locally to confirm `package-lock.json`
   is current before pushing.

No secrets to configure — the workflow uses GitHub's own automatic
`GITHUB_TOKEN`, and the callback URL travels with each dispatch payload
rather than living in a secret.

## What's now free that used to cost credits

| Step | Before | Now |
|---|---|---|
| Slideshow render | JSON2Video (paid) | Remotion on GitHub Actions (free, unlimited on public repos) |
| B-roll / images | Shopify's own product images | unchanged |
| Video hosting | JSON2Video's temp URL | GitHub Release asset (free, permanent) |
| Copy generation | OpenAI (unchanged) | OpenAI (unchanged) |
| Posting | PostPulse + YouTube (unchanged) | PostPulse + YouTube (unchanged) |

EM2 (the original, JSON2Video-based scenario) is left untouched and inactive
as a fallback — nothing was deleted.
