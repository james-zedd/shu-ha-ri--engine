import { parseSegments, type PromptSegment } from "@/components/code-terminal";

// Zero-width/BOM/bidi-override characters used for visual spoofing, plus C0
// control characters other than newline/tab. Built from numeric code points
// via String.fromCharCode rather than a literal regex escape, so this file
// never has to embed the actual raw control/invisible bytes it strips out.
const CONTROL_CODEPOINT_RANGES: [number, number][] = [
  [0x0000, 0x0008],
  [0x000b, 0x000c],
  [0x000e, 0x001f],
  [0x007f, 0x007f],
  [0x200b, 0x200d], // zero-width space/non-joiner/joiner
  [0xfeff, 0xfeff], // BOM / zero-width no-break space
  [0x202a, 0x202e], // bidi embedding/override controls
  [0x2066, 0x2069], // bidi isolate controls
];

function buildControlAndSpoofingPattern(): RegExp {
  const ranges = CONTROL_CODEPOINT_RANGES.map(([start, end]) =>
    start === end
      ? String.fromCharCode(start)
      : `${String.fromCharCode(start)}-${String.fromCharCode(end)}`,
  ).join("");
  return new RegExp(`[${ranges}]`, "g");
}

const CONTROL_AND_SPOOFING_PATTERN = buildControlAndSpoofingPattern();

export function stripControlAndSpoofingChars(text: string): string {
  return text.replace(CONTROL_AND_SPOOFING_PATTERN, "");
}

// Real markup tag names to strip from prose text. Deliberately excludes
// "pre"/"code" (the only tags the renderer understands) and is matched
// lowercase-only: TS generic params conventionally use a single uppercase
// letter (T, K, P, ...), so requiring a lowercase tag name lets content like
// "Partial<T>" or "<A, B>" pass through untouched instead of colliding with
// short real tag names like <a>, <b>, <p>.
const DENYLISTED_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "svg", "img", "a", "form",
  "input", "button", "select", "textarea", "link", "meta", "base", "div",
  "span", "p", "br", "hr", "table", "tr", "td", "th", "ul", "ol", "li", "b",
  "i", "u", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6", "video",
  "audio", "source", "canvas", "applet", "frame", "frameset", "noscript",
]);

const TAG_PATTERN = /<\/?([a-z][a-z0-9]*)((?:\s[^<>]*)?)\/?>/g;

function stripDenylistedTags(text: string): string {
  return text.replace(TAG_PATTERN, (match, tagName: string, tail: string) => {
    if (!DENYLISTED_TAGS.has(tagName)) return match;
    // A comma or "extends" in the tag's tail means this is TS generic
    // syntax (e.g. <T, K>, <T extends X>), not a real attribute list.
    if (tail.includes(",")) return match;
    if (/\bextends\b/.test(tail)) return match;
    return "";
  });
}

// Note: does not trim leading/trailing whitespace here, since this runs on
// individual text segments that get concatenated with adjacent <pre>/<code>
// segments — trimming per-segment would eat the space between prose and an
// adjacent tag (e.g. "the <code>new</code> keyword"). The full reassembled
// string is trimmed once, in sanitizeString.
function normalizeWhitespace(text: string): string {
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

function reassemble(segments: PromptSegment[]): string {
  return segments
    .map((segment) => {
      if (segment.type === "code-block") return `<pre>${segment.content}</pre>`;
      if (segment.type === "inline-code") return `<code>${segment.content}</code>`;
      return segment.content;
    })
    .join("");
}

/**
 * Sanitizes a prose field (prompt, explanation, choice, correctAnswer).
 * Only the <pre>/<code> tags the renderer understands are preserved as
 * markup; everything else that looks like a real HTML tag is stripped from
 * the surrounding prose. Content inside <pre>/<code> is left untouched
 * (aside from stripping invisible/spoofing characters), since it's real
 * code and may legitimately contain `<`/`>` as operators or generics.
 */
export function sanitizeString(value: string): string {
  const segments = parseSegments(value);

  const cleaned = segments.map((segment): PromptSegment => {
    if (segment.type === "text") {
      return {
        ...segment,
        content: normalizeWhitespace(
          stripDenylistedTags(stripControlAndSpoofingChars(segment.content)),
        ),
      };
    }
    return {
      ...segment,
      content: stripControlAndSpoofingChars(segment.content),
    };
  });

  return reassemble(cleaned).trim();
}
