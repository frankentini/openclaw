import { describe, expect, it } from "vitest";
import { sanitizeForConsole } from "./console-sanitize.js";

describe("sanitizeForConsole", () => {
  it("returns undefined for empty/whitespace input", () => {
    expect(sanitizeForConsole(undefined)).toBeUndefined();
    expect(sanitizeForConsole("")).toBeUndefined();
    expect(sanitizeForConsole("   ")).toBeUndefined();
  });

  it("passes through normal text", () => {
    expect(sanitizeForConsole("hello world")).toBe("hello world");
  });

  it("strips C0 control characters", () => {
    expect(sanitizeForConsole("a\x01b\x02c")).toBe("abc");
    expect(sanitizeForConsole("\x08backspace")).toBe("backspace");
    expect(sanitizeForConsole("bell\x07ring")).toBe("bellring");
  });

  it("strips DEL (0x7F)", () => {
    expect(sanitizeForConsole("before\x7Fafter")).toBe("beforeafter");
  });

  it("strips C1 control characters (U+0080..U+009F)", () => {
    // CSI (0x9B) can start terminal escape sequences without a preceding ESC
    expect(sanitizeForConsole("safe\x9Bunsafe")).toBe("safeunsafe");
    // OSC (0x9D) can set terminal window titles
    expect(sanitizeForConsole("title\x9Dinjection")).toBe("titleinjection");
    // DCS (0x90) is the Device Control String introducer
    expect(sanitizeForConsole("data\x90control")).toBe("datacontrol");
    // Full C1 range should be stripped
    for (let code = 0x80; code <= 0x9f; code++) {
      const input = `a${String.fromCharCode(code)}b`;
      expect(sanitizeForConsole(input)).toBe("ab");
    }
  });

  it("collapses whitespace and newlines", () => {
    expect(sanitizeForConsole("foo\n\nbar\tbaz")).toBe("foo bar baz");
    expect(sanitizeForConsole("a  b   c")).toBe("a b c");
  });

  it("truncates to maxChars", () => {
    const long = "x".repeat(300);
    const result = sanitizeForConsole(long, 200);
    expect(result).toBe("x".repeat(200) + "…");
  });

  it("respects custom maxChars", () => {
    expect(sanitizeForConsole("abcdefgh", 5)).toBe("abcde…");
  });

  it("does not truncate when at exactly maxChars", () => {
    expect(sanitizeForConsole("abcde", 5)).toBe("abcde");
  });
});
