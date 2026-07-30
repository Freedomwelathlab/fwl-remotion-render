// Parses the repository_dispatch client_payload (passed in via the
// RENDER_REQUEST env var, never interpolated into a shell command) and
// writes it to disk for later steps to consume.
const fs = require("fs");
const path = require("path");

const ALLOWED_COMPOSITIONS = ["HookOverlay", "ShortVideo", "ProductVideo"];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

const raw = process.env.RENDER_REQUEST;
if (!raw) fail("RENDER_REQUEST env var is empty");

let payload;
try {
  payload = JSON.parse(raw);
} catch (e) {
  fail(`RENDER_REQUEST is not valid JSON: ${e.message}`);
}

const { requestId, composition, props, callbackUrl, outputName } = payload;

if (!requestId || typeof requestId !== "string") {
  fail("payload.requestId is required (string)");
}
if (!ALLOWED_COMPOSITIONS.includes(composition)) {
  fail(
    `payload.composition "${composition}" is not one of: ${ALLOWED_COMPOSITIONS.join(", ")}`,
  );
}
if (!props || typeof props !== "object") {
  fail("payload.props is required (object)");
}
if (!callbackUrl || !/^https:\/\//.test(callbackUrl)) {
  fail("payload.callbackUrl must be an https:// URL");
}

const outDir = path.join(__dirname, "..", "props");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "request.json"),
  JSON.stringify(
    {
      requestId,
      composition,
      props,
      callbackUrl,
      outputName: outputName || `${composition}-${requestId}`,
    },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(outDir, "render.json"),
  JSON.stringify(props, null, 2),
);

console.log(`Wrote request for ${composition} (requestId=${requestId})`);
