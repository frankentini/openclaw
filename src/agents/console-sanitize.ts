export function sanitizeForConsole(text: string | undefined, maxChars = 200): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) {
    return undefined;
  }
  const withoutControlChars = Array.from(trimmed)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return !(
        code <= 0x08 ||
        code === 0x0b ||
        code === 0x0c ||
        (code >= 0x0e && code <= 0x1f) ||
        code === 0x7f ||
        // C1 control characters (U+0080..U+009F) include terminal escape
        // sequences such as CSI (0x9B), OSC (0x9D), and DCS (0x90) that can
        // be used for terminal injection when logged to a TTY.
        (code >= 0x80 && code <= 0x9f)
      );
    })
    .join("");
  const sanitized = withoutControlChars
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return sanitized.length > maxChars ? `${sanitized.slice(0, maxChars)}…` : sanitized;
}
