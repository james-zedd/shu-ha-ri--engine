import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

export function splitPrompt(prompt: string): {
  prose: string;
  code: string | null;
} {
  const separatorIndex = prompt.indexOf("\n\n");
  if (separatorIndex === -1) {
    return { prose: prompt, code: null };
  }
  return {
    prose: prompt.slice(0, separatorIndex),
    code: prompt.slice(separatorIndex + 2),
  };
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

const styles = StyleSheet.create({
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
