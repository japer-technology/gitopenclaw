/**
 * Command parser tests — verify that Task 1.1 features are structurally
 * present and that the parseCommand function behaves correctly.
 *
 * Run with: node --test .GITOPENCLAW/tests/command-parser.test.js
 *        or: bun test .GITOPENCLAW/tests/command-parser.test.js
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const GITOPENCLAW = path.resolve(REPO_ROOT, ".GITOPENCLAW");

function readFile(relPath) {
  return fs.readFileSync(path.resolve(REPO_ROOT, relPath), "utf-8");
}

// ── 1. Module structure ───────────────────────────────────────────────────

describe("Command parser module structure", () => {
  it("command-parser.ts exists in lifecycle/", () => {
    assert.ok(
      fs.existsSync(path.join(GITOPENCLAW, "lifecycle", "command-parser.ts")),
      "command-parser.ts must exist in lifecycle/"
    );
  });

  it("exports parseCommand function", () => {
    const src = readFile(".GITOPENCLAW/lifecycle/command-parser.ts");
    assert.ok(
      src.includes("export function parseCommand"),
      "Must export parseCommand function"
    );
  });

  it("exports SUPPORTED_COMMANDS constant", () => {
    const src = readFile(".GITOPENCLAW/lifecycle/command-parser.ts");
    assert.ok(
      src.includes("export const SUPPORTED_COMMANDS"),
      "Must export SUPPORTED_COMMANDS constant"
    );
  });

  it("exports MUTATION_COMMANDS set", () => {
    const src = readFile(".GITOPENCLAW/lifecycle/command-parser.ts");
    assert.ok(
      src.includes("export const MUTATION_COMMANDS"),
      "Must export MUTATION_COMMANDS set"
    );
  });

  it("defines ParsedCommand interface", () => {
    const src = readFile(".GITOPENCLAW/lifecycle/command-parser.ts");
    assert.ok(
      src.includes("ParsedCommand"),
      "Must define ParsedCommand interface"
    );
    assert.ok(src.includes("command: string"), "ParsedCommand must have command field");
    assert.ok(src.includes("args: string[]"), "ParsedCommand must have args field");
    assert.ok(src.includes("rawText: string"), "ParsedCommand must have rawText field");
  });

  it("defines CommandDescriptor interface with mutation flag", () => {
    const src = readFile(".GITOPENCLAW/lifecycle/command-parser.ts");
    assert.ok(
      src.includes("CommandDescriptor"),
      "Must define CommandDescriptor interface"
    );
    assert.ok(
      src.includes("mutation: boolean"),
      "CommandDescriptor must have mutation field"
    );
  });
});

// ── 2. SUPPORTED_COMMANDS covers all expected commands ────────────────────

describe("SUPPORTED_COMMANDS coverage", () => {
  const { SUPPORTED_COMMANDS } = require("../lifecycle/command-parser.ts");

  const expectedCommands = [
    // Core commands
    "setup", "onboard", "configure", "config", "doctor", "dashboard",
    "reset", "uninstall", "message", "memory", "agent", "agents",
    "status", "health", "sessions", "browser",
    // Sub-CLI commands
    "gateway", "logs", "system", "models", "approvals", "nodes",
    "devices", "sandbox", "cron", "dns", "docs", "hooks", "webhooks",
    "pairing", "plugins", "channels", "directory", "security",
    "secrets", "skills", "update", "completion",
    // Help (built-in)
    "help",
  ];

  for (const cmd of expectedCommands) {
    it(`includes "${cmd}" command`, () => {
      assert.ok(
        cmd in SUPPORTED_COMMANDS,
        `SUPPORTED_COMMANDS must include "${cmd}"`
      );
    });
  }

  it("every command has a description", () => {
    for (const [name, desc] of Object.entries(SUPPORTED_COMMANDS)) {
      assert.ok(
        typeof desc.description === "string" && desc.description.length > 0,
        `Command "${name}" must have a non-empty description`
      );
    }
  });

  it("every command has a mutation flag", () => {
    for (const [name, desc] of Object.entries(SUPPORTED_COMMANDS)) {
      assert.ok(
        typeof desc.mutation === "boolean",
        `Command "${name}" must have a boolean mutation flag`
      );
    }
  });
});

// ── 3. parseCommand function logic (unit tests) ──────────────────────────

describe("parseCommand logic", () => {
  const { parseCommand } = require("../lifecycle/command-parser.ts");

  // ── Slash command detection ──────────────────────────────────────────────

  it("parses /status as a recognized command", () => {
    const result = parseCommand("/status");
    assert.strictEqual(result.command, "status");
    assert.deepStrictEqual(result.args, []);
    assert.strictEqual(result.rawText, "/status");
  });

  it("parses /help as a recognized command", () => {
    const result = parseCommand("/help");
    assert.strictEqual(result.command, "help");
    assert.deepStrictEqual(result.args, []);
  });

  it("parses /config set provider openai with arguments", () => {
    const result = parseCommand("/config set provider openai");
    assert.strictEqual(result.command, "config");
    assert.deepStrictEqual(result.args, ["set", "provider", "openai"]);
  });

  it("parses /memory search query with arguments", () => {
    const result = parseCommand("/memory search some query");
    assert.strictEqual(result.command, "memory");
    assert.deepStrictEqual(result.args, ["search", "some", "query"]);
  });

  it("parses /channels status with arguments", () => {
    const result = parseCommand("/channels status");
    assert.strictEqual(result.command, "channels");
    assert.deepStrictEqual(result.args, ["status"]);
  });

  it("parses /sessions list with arguments", () => {
    const result = parseCommand("/sessions list");
    assert.strictEqual(result.command, "sessions");
    assert.deepStrictEqual(result.args, ["list"]);
  });

  it("parses /models list with arguments", () => {
    const result = parseCommand("/models list");
    assert.strictEqual(result.command, "models");
    assert.deepStrictEqual(result.args, ["list"]);
  });

  it("parses /cron create with arguments", () => {
    const result = parseCommand("/cron create");
    assert.strictEqual(result.command, "cron");
    assert.deepStrictEqual(result.args, ["create"]);
  });

  it("parses /plugins install with arguments", () => {
    const result = parseCommand("/plugins install");
    assert.strictEqual(result.command, "plugins");
    assert.deepStrictEqual(result.args, ["install"]);
  });

  it("parses /update as a recognized command", () => {
    const result = parseCommand("/update");
    assert.strictEqual(result.command, "update");
    assert.deepStrictEqual(result.args, []);
  });

  it("parses /skills list with arguments", () => {
    const result = parseCommand("/skills list");
    assert.strictEqual(result.command, "skills");
    assert.deepStrictEqual(result.args, ["list"]);
  });

  it("parses /doctor as a recognized command", () => {
    const result = parseCommand("/doctor");
    assert.strictEqual(result.command, "doctor");
    assert.deepStrictEqual(result.args, []);
  });

  // ── Natural language fallback ───────────────────────────────────────────

  it("returns agent command for plain text (natural language)", () => {
    const result = parseCommand("Please explain how the routing works");
    assert.strictEqual(result.command, "agent");
    assert.deepStrictEqual(result.args, []);
    assert.strictEqual(result.rawText, "Please explain how the routing works");
  });

  it("returns agent command for multiline text without slash prefix", () => {
    const result = parseCommand("Can you help me?\nI need to fix a bug.");
    assert.strictEqual(result.command, "agent");
    assert.deepStrictEqual(result.args, []);
  });

  it("returns agent command for empty string", () => {
    const result = parseCommand("");
    assert.strictEqual(result.command, "agent");
    assert.deepStrictEqual(result.args, []);
  });

  it("returns agent command for whitespace-only string", () => {
    const result = parseCommand("   \n   ");
    assert.strictEqual(result.command, "agent");
    assert.deepStrictEqual(result.args, []);
  });

  // ── Unknown command handling ────────────────────────────────────────────

  it("returns unknown command name for unrecognized slash commands", () => {
    const result = parseCommand("/foobar do something");
    assert.strictEqual(result.command, "foobar");
    assert.deepStrictEqual(result.args, ["do", "something"]);
    assert.strictEqual(result.rawText, "/foobar do something");
  });

  it("returns 'unknown' for bare slash", () => {
    const result = parseCommand("/");
    assert.strictEqual(result.command, "unknown");
    assert.deepStrictEqual(result.args, []);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────

  it("is case-insensitive for command names", () => {
    const result = parseCommand("/STATUS");
    assert.strictEqual(result.command, "status");
  });

  it("ignores leading whitespace", () => {
    const result = parseCommand("  /status");
    assert.strictEqual(result.command, "status");
  });

  it("only checks the first line for slash prefix", () => {
    const result = parseCommand("Some text\n/status");
    assert.strictEqual(result.command, "agent");
  });

  it("preserves rawText in all cases", () => {
    const input = "/config set model gpt-4\n\nSome extra context";
    const result = parseCommand(input);
    assert.strictEqual(result.rawText, input);
    assert.strictEqual(result.command, "config");
    assert.deepStrictEqual(result.args, ["set", "model", "gpt-4"]);
  });

  it("handles multiple spaces between arguments", () => {
    const result = parseCommand("/config   set   provider   openai");
    assert.strictEqual(result.command, "config");
    assert.deepStrictEqual(result.args, ["set", "provider", "openai"]);
  });
});

// ── 4. MUTATION_COMMANDS correctness ──────────────────────────────────────

describe("MUTATION_COMMANDS", () => {
  const { SUPPORTED_COMMANDS, MUTATION_COMMANDS } = require("../lifecycle/command-parser.ts");

  it("is a Set", () => {
    assert.ok(MUTATION_COMMANDS instanceof Set, "MUTATION_COMMANDS must be a Set");
  });

  it("contains exactly the commands with mutation=true", () => {
    const expected = new Set(
      Object.entries(SUPPORTED_COMMANDS)
        .filter(([, desc]) => desc.mutation)
        .map(([name]) => name)
    );
    assert.deepStrictEqual(MUTATION_COMMANDS, expected);
  });

  it("includes known mutation commands", () => {
    const knownMutation = ["config", "plugins", "update", "setup", "reset", "uninstall"];
    for (const cmd of knownMutation) {
      assert.ok(MUTATION_COMMANDS.has(cmd), `MUTATION_COMMANDS must include "${cmd}"`);
    }
  });

  it("excludes known read-only commands", () => {
    const knownReadOnly = ["status", "help", "doctor", "sessions", "memory", "models", "skills"];
    for (const cmd of knownReadOnly) {
      assert.ok(!MUTATION_COMMANDS.has(cmd), `MUTATION_COMMANDS must not include "${cmd}"`);
    }
  });
});

// ── 5. Agent integration — command parser wired into GITOPENCLAW-AGENT.ts ─

describe("Agent command-parser integration", () => {
  const agent = readFile(".GITOPENCLAW/lifecycle/GITOPENCLAW-AGENT.ts");

  it("imports parseCommand from command-parser.ts", () => {
    assert.ok(
      agent.includes('import { parseCommand'),
      "Agent must import parseCommand"
    );
  });

  it("imports MUTATION_COMMANDS from command-parser.ts", () => {
    assert.ok(
      agent.includes("MUTATION_COMMANDS"),
      "Agent must import MUTATION_COMMANDS"
    );
  });

  it("calls parseCommand with the comment/prompt text", () => {
    assert.ok(
      agent.includes("parseCommand("),
      "Agent must call parseCommand"
    );
  });

  it("handles structured slash commands differently from natural language", () => {
    assert.ok(
      agent.includes('parsedCmd.command !== "agent"'),
      "Agent must check if the parsed command is a slash command vs natural language"
    );
  });

  it("builds openclaw CLI invocation for structured commands", () => {
    assert.ok(
      agent.includes("openclaw") && agent.includes("parsedCmd.command"),
      "Agent must build openclaw CLI invocation for slash commands"
    );
  });

  it("blocks mutation commands for semi-trusted users", () => {
    assert.ok(
      agent.includes("MUTATION_COMMANDS") && agent.includes("semi-trusted"),
      "Agent must check mutation commands against trust level"
    );
    assert.ok(
      agent.includes("Permission Denied"),
      "Agent must post a denial message for blocked mutation commands"
    );
  });
});
