// Claude Code hook (PostToolUse · Edit|Write): content/, public/art/ ya content
// script badalte hi `build-content` chala do. YAML mein galti ho to exit 2 —
// Claude ko error turant dikh jaata hai, build tak rukna nahi padta.

import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const WATCH = /\/(content\/|public\/art\/|scripts\/(schema|build-content)\.mts$)/;

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let input = {};
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    return; // input samajh nahi aaya — chup-chaap chhod do, edit ko mat roko
  }
  const file = String(input.tool_input?.file_path ?? input.tool_response?.filePath ?? "").replaceAll("\\", "/");
  if (!WATCH.test(file)) return;

  try {
    execFileSync(process.execPath, [path.join(ROOT, "scripts/build-content.mts")], { cwd: ROOT, stdio: "pipe" });
  } catch (e) {
    process.stderr.write(`content check fail (${path.basename(file)}):\n${e.stderr || e.message}`);
    process.exit(2);
  }
});
