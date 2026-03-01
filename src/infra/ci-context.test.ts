import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveGitOpenClawCIContext } from "./ci-context.js";

vi.mock("node:fs");

describe("resolveGitOpenClawCIContext", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("detects CI + .GITOPENCLAW present", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const ctx = resolveGitOpenClawCIContext(
      { CI: "true", GITHUB_ACTIONS: "true" },
      "/workspace/repo",
    );
    expect(ctx.isCI).toBe(true);
    expect(ctx.isGitOpenClaw).toBe(true);
    expect(ctx.configPath).toBe(
      path.join("/workspace/repo", ".GITOPENCLAW", "config", "settings.json"),
    );
  });

  it("detects CI without .GITOPENCLAW", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const ctx = resolveGitOpenClawCIContext({ CI: "true" }, "/workspace/repo");
    expect(ctx.isCI).toBe(true);
    expect(ctx.isGitOpenClaw).toBe(false);
    expect(ctx.configPath).toBeNull();
  });

  it("detects non-CI with .GITOPENCLAW", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const ctx = resolveGitOpenClawCIContext({}, "/workspace/repo");
    expect(ctx.isCI).toBe(false);
    expect(ctx.isGitOpenClaw).toBe(true);
    expect(ctx.configPath).toBeNull();
  });

  it("returns null configPath when not in CI even if .GITOPENCLAW exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const ctx = resolveGitOpenClawCIContext({ CI: "false" }, "/workspace/repo");
    expect(ctx.isCI).toBe(false);
    expect(ctx.configPath).toBeNull();
  });

  it("handles GITHUB_ACTIONS=true as CI", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const ctx = resolveGitOpenClawCIContext({ GITHUB_ACTIONS: "true" }, "/workspace/repo");
    expect(ctx.isCI).toBe(true);
    expect(ctx.isGitOpenClaw).toBe(true);
  });

  it("handles fs.existsSync throwing", () => {
    vi.mocked(fs.existsSync).mockImplementation(() => {
      throw new Error("permission denied");
    });
    const ctx = resolveGitOpenClawCIContext({ CI: "true" }, "/workspace/repo");
    expect(ctx.isCI).toBe(true);
    expect(ctx.isGitOpenClaw).toBe(false);
    expect(ctx.configPath).toBeNull();
  });
});
