import { describe, expect, it } from "vitest";
import { validateConfigObjectWithPlugins } from "./config.js";

describe("hooks.mappings[].channel accepts plugin channel ids", () => {
  const baseConfig = (channel: string | undefined) => ({
    agents: { list: [{ id: "pi" }] },
    hooks: {
      mappings: [
        {
          match: { path: "custom" },
          action: "agent" as const,
          channel,
        },
      ],
    },
  });

  it("accepts a plugin channel id like feishu", () => {
    const res = validateConfigObjectWithPlugins(baseConfig("feishu"));
    expect(res.ok).toBe(true);
  });

  it("accepts other plugin channel ids (e.g. line, viber)", () => {
    for (const ch of ["line", "viber", "rocketchat"]) {
      const res = validateConfigObjectWithPlugins(baseConfig(ch));
      expect(res.ok).toBe(true);
    }
  });

  it("rejects empty string as channel", () => {
    const res = validateConfigObjectWithPlugins(baseConfig(""));
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.issues.some((iss) => iss.path?.includes("channel"))).toBe(true);
    }
  });
});

describe("config hooks module paths", () => {
  const expectRejectedIssuePath = (config: Record<string, unknown>, expectedPath: string) => {
    const res = validateConfigObjectWithPlugins(config);
    expect(res.ok).toBe(false);
    if (res.ok) {
      throw new Error("expected validation failure");
    }
    expect(res.issues.some((iss) => iss.path === expectedPath)).toBe(true);
  };

  it("rejects absolute hooks.mappings[].transform.module", () => {
    expectRejectedIssuePath(
      {
        agents: { list: [{ id: "pi" }] },
        hooks: {
          mappings: [
            {
              match: { path: "custom" },
              action: "agent",
              transform: { module: "/tmp/transform.mjs" },
            },
          ],
        },
      },
      "hooks.mappings.0.transform.module",
    );
  });

  it("rejects escaping hooks.mappings[].transform.module", () => {
    expectRejectedIssuePath(
      {
        agents: { list: [{ id: "pi" }] },
        hooks: {
          mappings: [
            {
              match: { path: "custom" },
              action: "agent",
              transform: { module: "../escape.mjs" },
            },
          ],
        },
      },
      "hooks.mappings.0.transform.module",
    );
  });

  it("rejects absolute hooks.internal.handlers[].module", () => {
    expectRejectedIssuePath(
      {
        agents: { list: [{ id: "pi" }] },
        hooks: {
          internal: {
            enabled: true,
            handlers: [{ event: "command:new", module: "/tmp/handler.mjs" }],
          },
        },
      },
      "hooks.internal.handlers.0.module",
    );
  });

  it("rejects escaping hooks.internal.handlers[].module", () => {
    expectRejectedIssuePath(
      {
        agents: { list: [{ id: "pi" }] },
        hooks: {
          internal: {
            enabled: true,
            handlers: [{ event: "command:new", module: "../handler.mjs" }],
          },
        },
      },
      "hooks.internal.handlers.0.module",
    );
  });
});
