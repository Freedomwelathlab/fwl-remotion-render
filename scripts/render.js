// Renders via Remotion's Node API (bundle + renderMedia) instead of
// shelling out to the CLI. This avoids child_process/npx entirely, so
// there's no shell-quoting risk from paths containing spaces (bit Windows
// local testing) and no argv-injection surface at all.
const fs = require("fs");
const path = require("path");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");

const ALLOWED_COMPOSITIONS = ["HookOverlay", "ShortVideo", "ProductVideo"];
const ROOT = path.join(__dirname, "..");

async function main() {
  const requestPath = path.join(ROOT, "props", "request.json");
  const request = JSON.parse(fs.readFileSync(requestPath, "utf8"));
  const { composition, outputName, props } = request;

  if (!ALLOWED_COMPOSITIONS.includes(composition)) {
    console.error(`::error::Refusing to render unknown composition "${composition}"`);
    process.exit(1);
  }

  const safeName = outputName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const outDir = path.join(ROOT, "out");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${safeName}.mp4`);

  console.log("Bundling Remotion project...");
  const bundleLocation = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
    onProgress: (p) => {
      if (p % 20 === 0) console.log(`Bundling ${p}%`);
    },
  });

  const compositionObj = await selectComposition({
    serveUrl: bundleLocation,
    id: composition,
    inputProps: props,
  });

  console.log(`Rendering ${composition} (${compositionObj.durationInFrames} frames)...`);
  await renderMedia({
    composition: compositionObj,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outPath,
    inputProps: props,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) {
        console.log(`Render ${Math.round(progress * 100)}%`);
      }
    },
  });

  fs.writeFileSync(path.join(ROOT, "props", "output-path.txt"), outPath);
  console.log(`Rendered ${outPath}`);
}

main().catch((err) => {
  console.error("::error::Render failed:", err);
  process.exit(1);
});
