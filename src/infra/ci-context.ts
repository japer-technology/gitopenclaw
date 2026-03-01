import fs from "node:fs";
import path from "node:path";

/**
 * Detect whether we are running inside a CI environment with a
 * `.GITOPENCLAW` workspace present in the current working directory.
 *
 * This context changes how status/doctor output should be presented:
 * - Gateway connection errors are expected (no local gateway in CI)
 * - Service checks (systemd/LaunchAgent) are irrelevant
 * - Config lives in `.GITOPENCLAW/config/settings.json`, not `~/.openclaw/`
 */
export function resolveGitOpenClawCIContext(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): GitOpenClawCIContext {
  const isCI = env.CI === "true" || env.GITHUB_ACTIONS === "true";
  const gitOpenClawDir = path.join(cwd, ".GITOPENCLAW");
  const isGitOpenClaw = (() => {
    try {
      return fs.existsSync(gitOpenClawDir);
    } catch {
      return false;
    }
  })();
  const configPath =
    isGitOpenClaw && isCI ? path.join(gitOpenClawDir, "config", "settings.json") : null;
  return { isCI, isGitOpenClaw, configPath };
}

export type GitOpenClawCIContext = {
  /** True when CI=true or GITHUB_ACTIONS=true. */
  isCI: boolean;
  /** True when `.GITOPENCLAW/` exists in cwd. */
  isGitOpenClaw: boolean;
  /** Path to `.GITOPENCLAW/config/settings.json` when both CI and `.GITOPENCLAW` are present. */
  configPath: string | null;
};
