import { Fragment, ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing, ThemeColor } from "@/constants/theme";

export type PromptSegment =
  | { type: "text"; content: string }
  | { type: "inline-code"; content: string }
  | { type: "code-block"; content: string };

const SEGMENT_PATTERN = /<pre>([\s\S]*?)<\/pre>|<code>([\s\S]*?)<\/code>/g;

export function parseSegments(input: string): PromptSegment[] {
  const segments: PromptSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  SEGMENT_PATTERN.lastIndex = 0;
  while ((match = SEGMENT_PATTERN.exec(input))) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: input.slice(lastIndex, match.index),
      });
    }
    if (match[1] !== undefined) {
      segments.push({ type: "code-block", content: match[1].trim() });
    } else {
      segments.push({ type: "inline-code", content: match[2]! });
    }
    lastIndex = SEGMENT_PATTERN.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({ type: "text", content: input.slice(lastIndex) });
  }

  return segments;
}

export function CodeTerminal({ code }: { code: string }) {
  return (
    <View style={styles.terminal}>
      <ThemedText type="code" style={styles.terminalCode}>
        {code}
      </ThemedText>
    </View>
  );
}

function InlineCode({ content }: { content: string }) {
  return <Text style={styles.inlineCode}>{content}</Text>;
}

export function FormattedText({
  text,
  style,
  themeColor,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  themeColor?: ThemeColor;
}) {
  const segments = parseSegments(text);

  const blocks: ReactNode[] = [];
  let paragraph: PromptSegment[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push(
      <ThemedText key={blocks.length} themeColor={themeColor} style={style}>
        {paragraph.map((segment, i) =>
          segment.type === "inline-code" ? (
            <InlineCode key={i} content={segment.content} />
          ) : (
            <Fragment key={i}>{segment.content}</Fragment>
          ),
        )}
      </ThemedText>,
    );
    paragraph = [];
  }

  for (const segment of segments) {
    if (segment.type === "code-block") {
      flushParagraph();
      blocks.push(<CodeTerminal key={blocks.length} code={segment.content} />);
    } else {
      paragraph.push(segment);
    }
  }
  flushParagraph();

  return <View style={styles.blocks}>{blocks}</View>;
}

const styles = StyleSheet.create({
  blocks: {
    gap: Spacing.four,
  },
  inlineCode: {
    fontFamily: Fonts.mono,
  },
  terminal: {
    backgroundColor: "#1e1e1e",
    borderRadius: Spacing.two,
    overflow: "hidden",
  },
  terminalCode: {
    color: "#f0f0f0",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 14,
    lineHeight: 20,
  },
});
