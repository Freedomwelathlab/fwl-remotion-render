// Optional step: if the request included voiceoverText, synthesize it with
// edge-tts (free, no API key) and point the render props at the resulting
// file. Uses execFileSync (argv array, no shell) so voiceoverText can never
// be interpreted as shell syntax.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const requestPath = path.join(__dirname, "..", "props", "request.json");
const request = JSON.parse(fs.readFileSync(requestPath, "utf8"));
const { props, requestId } = request;

if (!props.voiceoverText) {
  console.log("No voiceoverText in props — skipping voiceover generation.");
  process.exit(0);
}

const voice = props.voiceoverVoice || "en-US-AndrewNeural";
const audioDir = path.join(__dirname, "..", "public", "audio");
fs.mkdirSync(audioDir, { recursive: true });

const fileName = `${requestId}.mp3`;
const outPath = path.join(audioDir, fileName);

execFileSync(
  "python",
  [
    "-m",
    "edge_tts",
    "--voice",
    voice,
    "--text",
    props.voiceoverText,
    "--write-media",
    outPath,
  ],
  { stdio: "inherit" },
);

props.voiceoverFile = fileName;
delete props.voiceoverText;
delete props.voiceoverVoice;

request.props = props;
fs.writeFileSync(requestPath, JSON.stringify(request, null, 2));
fs.writeFileSync(
  path.join(__dirname, "..", "props", "render.json"),
  JSON.stringify(props, null, 2),
);

console.log(`Voiceover written to public/audio/${fileName}`);
