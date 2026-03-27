import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "./web-fetch-utils.js";

describe("decodeEntities", () => {
  it("decodes basic named entities", () => {
    const { text } = htmlToMarkdown("&amp; &lt; &gt; &quot; &#39;");
    expect(text).toBe("& < > \" '");
  });

  it("decodes BMP hex entities", () => {
    const { text } = htmlToMarkdown("&#x41;&#x42;&#x43;");
    expect(text).toBe("ABC");
  });

  it("decodes BMP decimal entities", () => {
    const { text } = htmlToMarkdown("&#65;&#66;&#67;");
    expect(text).toBe("ABC");
  });

  it("handles astral plane code points via hex entity", () => {
    // U+1F600 = 😀 — requires fromCodePoint, not fromCharCode
    const { text } = htmlToMarkdown("&#x1F600;");
    expect(text).toBe("\u{1F600}");
  });

  it("handles astral plane code points via decimal entity", () => {
    // U+1F4A9 = 💩 (decimal 128169)
    const { text } = htmlToMarkdown("&#128169;");
    expect(text).toBe("\u{1F4A9}");
  });

  it("drops code points above U+10FFFF", () => {
    const { text } = htmlToMarkdown("&#x110000;");
    expect(text).toBe("");
  });

  it("drops negative numeric references", () => {
    // &#-1; should not match the decimal pattern (no sign in regex)
    // but &#xFFFFFFFF; could produce a huge number
    const { text } = htmlToMarkdown("&#xFFFFFFFF;");
    expect(text).toBe("");
  });
});
