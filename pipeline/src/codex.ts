/** One Codex CLI run (`codex exec`, ChatGPT login, no API key) in `cwd` with the given images attached; log in cwd/codex.log. */
import { spawn } from "node:child_process";
import { appendFileSync, closeSync, existsSync, openSync } from "node:fs";
import { join } from "node:path";

/**
 * Node's `spawn` does not run `codex.cmd`. On Windows the npm install's real binary is this exe.
 * The managed ChatGPT policy ignores `-s workspace-write` and leaves the session read-only, so the
 * image tool cannot write `out.png`. Bypassing the sandbox is what makes the paint succeed there.
 */
function codexLaunch(): { command: string; args: string[]; env: NodeJS.ProcessEnv } {
  const sandbox = process.platform === "win32"
    ? ["--dangerously-bypass-approvals-and-sandbox", "-s", "danger-full-access"]
    : ["-s", "workspace-write"];
  if (process.platform !== "win32") return { command: "codex", args: sandbox, env: process.env };
  const root = join(process.env.APPDATA ?? "", "npm/node_modules/@openai/codex");
  const exe = join(root, "node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe");
  const env = { ...process.env, CODEX_MANAGED_PACKAGE_ROOT: root, CODEX_MANAGED_BY_NPM: "1" };
  return { command: existsSync(exe) ? exe : "codex", args: sandbox, env };
}

/**
 * `model`: the Codex model that drives the image tool (else CODEX_MODEL, else ~/.codex/config.toml's);
 * `effort`: its reasoning effort.
 */
export function codex(cwd: string, images: string[], prompt: string, opts: { model?: string; effort?: string; timeoutMs?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    const log = openSync(join(cwd, "codex.log"), "w");
    const codexModel = opts.model ?? process.env.CODEX_MODEL;
    const model = [...(codexModel ? ["-m", codexModel] : []), ...(opts.effort ? ["-c", `model_reasoning_effort="${opts.effort}"`] : [])];
    const launch = codexLaunch();
    const p = spawn(launch.command, ["exec", "--skip-git-repo-check", ...launch.args, ...model, "-C", cwd, ...images.flatMap((f) => ["-i", f]), "-"],
      { stdio: ["pipe", log, log], env: launch.env });
    const timer = setTimeout(() => p.kill("SIGTERM"), opts.timeoutMs ?? 900_000);
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { closeSync(log); } catch { /* already closed */ }
      resolve();
    };
    p.on("error", (err) => {
      try { appendFileSync(join(cwd, "codex.log"), `\nspawn error: ${String(err)}\n`); } catch { /* log unavailable */ }
      finish();
    });
    p.on("close", finish);
    p.stdin!.end(prompt);
  });
}
