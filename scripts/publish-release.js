// Uploads the rendered MP4 as a GitHub Release asset (free + unlimited on a
// public repo) and records the public download URL for the callback step.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const requestPath = path.join(__dirname, "..", "props", "request.json");
const request = JSON.parse(fs.readFileSync(requestPath, "utf8"));
const outputPathFile = path.join(__dirname, "..", "props", "output-path.txt");

if (!fs.existsSync(outputPathFile)) {
  console.error("::error::No rendered output found — render step must have failed.");
  process.exit(1);
}

const mp4Path = fs.readFileSync(outputPathFile, "utf8").trim();
const safeRequestId = request.requestId.replace(/[^a-zA-Z0-9_-]/g, "_");
const tag = `render-${safeRequestId}-${Date.now()}`;

execFileSync(
  "gh",
  [
    "release",
    "create",
    tag,
    mp4Path,
    "--title",
    `Render ${safeRequestId}`,
    "--notes",
    `Automated render for requestId=${request.requestId}, composition=${request.composition}`,
  ],
  { stdio: "inherit", cwd: path.join(__dirname, "..") },
);

const assetName = path.basename(mp4Path);
const repo = execFileSync("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], {
  cwd: path.join(__dirname, ".."),
})
  .toString()
  .trim();

const downloadUrl = `https://github.com/${repo}/releases/download/${tag}/${assetName}`;
fs.writeFileSync(
  path.join(__dirname, "..", "props", "download-url.txt"),
  downloadUrl,
);

console.log(`Released: ${downloadUrl}`);
