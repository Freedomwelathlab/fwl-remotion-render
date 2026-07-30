// Posts the render result back to the Make.com webhook named in the
// original request, so EM4b can pick up where EM4a left off. Runs with
// `if: always()` so Make hears about failures too, instead of a scenario
// hanging forever waiting on a webhook that never fires.
const fs = require("fs");
const path = require("path");

const requestPath = path.join(__dirname, "..", "props", "request.json");
const request = JSON.parse(fs.readFileSync(requestPath, "utf8"));
const downloadUrlPath = path.join(__dirname, "..", "props", "download-url.txt");

const ok = fs.existsSync(downloadUrlPath);
const body = {
  requestId: request.requestId,
  composition: request.composition,
  status: ok ? "success" : "failed",
  downloadUrl: ok ? fs.readFileSync(downloadUrlPath, "utf8").trim() : null,
  runId: process.env.GITHUB_RUN_ID || null,
  runUrl:
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null,
  ...(request.socialCopy || {}),
};

(async () => {
  const res = await fetch(request.callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log(`Callback POST -> ${res.status} ${res.statusText}`);
  if (!ok) {
    console.error("::error::Render failed — reported failure to Make webhook.");
    process.exit(1);
  }
})();
