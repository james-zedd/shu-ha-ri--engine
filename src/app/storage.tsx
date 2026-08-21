import { StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useDayCounter } from "@/hooks/use-day-counter";
import { useImmediateFeedback } from "@/hooks/use-immediate-feedback";
import { useTheme } from "@/hooks/use-theme";

export default function StorageScreen() {
  const { count } = useDayCounter();
  const { immediateFeedback, setImmediateFeedback } = useImmediateFeedback();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Activity</ThemedText>

        <ThemedView type="backgroundElement" style={styles.table}>
          <View style={styles.row}>
            <ThemedText themeColor="textSecondary">Days used</ThemedText>
            <ThemedText>{count ?? "—"}</ThemedText>
          </View>
        </ThemedView>

        <ThemedText type="title">Settings</ThemedText>

        <ThemedView type="backgroundElement" style={styles.table}>
          <View style={styles.row}>
            <ThemedText themeColor="textSecondary">
              Show answer after each question
            </ThemedText>
            <Switch
              value={immediateFeedback ?? true}
              onValueChange={setImmediateFeedback}
              trackColor={{ true: theme.text }}
            />
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
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
