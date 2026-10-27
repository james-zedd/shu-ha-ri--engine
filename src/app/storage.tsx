import { Pressable, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  type AppearancePreference,
  useAppearancePreference,
} from "@/hooks/use-appearance-preference";
import { useDayCounter } from "@/hooks/use-day-counter";
import { useImmediateFeedback } from "@/hooks/use-immediate-feedback";
import { useTheme } from "@/hooks/use-theme";

const APPEARANCE_OPTIONS: { value: AppearancePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function StorageScreen() {
  const { count } = useDayCounter();
  const { immediateFeedback, setImmediateFeedback } = useImmediateFeedback();
  const { appearance, setAppearance } = useAppearancePreference();
  const theme = useTheme();
  const rowStyle = [styles.row, { backgroundColor: theme.background }];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Activity</ThemedText>

        <ThemedView type="backgroundElement" style={styles.table}>
          <View style={rowStyle}>
            <ThemedText themeColor="textSecondary">Days used</ThemedText>
            <ThemedText>{count ?? "—"}</ThemedText>
          </View>
        </ThemedView>

        <ThemedText type="title">Settings</ThemedText>

        <ThemedView type="backgroundElement" style={styles.table}>
          <View style={rowStyle}>
            <ThemedText themeColor="textSecondary">
              Show answer after each question
            </ThemedText>
            <Switch
              value={immediateFeedback ?? true}
              onValueChange={setImmediateFeedback}
              trackColor={{ true: theme.text }}
            />
          </View>
          <View style={rowStyle}>
            <ThemedText themeColor="textSecondary">Appearance</ThemedText>
            <ThemedView type="backgroundElement" style={styles.segmented}>
              {APPEARANCE_OPTIONS.map(({ value, label }) => {
                const selected = (appearance ?? "system") === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setAppearance(value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <ThemedView
                      type={selected ? "text" : "backgroundElement"}
                      style={styles.segment}
                    >
                      <ThemedText
                        type="small"
                        themeColor={selected ? "background" : "textSecondary"}
                      >
                        {label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </ThemedView>
          </View>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  table: {
    borderRadius: Spacing.two,
    overflow: "hidden",
    marginBottom: Spacing.three,
    // Rows sit on the table background, so the gap draws a hairline divider.
    gap: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: Spacing.two,
    padding: Spacing.half,
  },
  segment: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two - Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
