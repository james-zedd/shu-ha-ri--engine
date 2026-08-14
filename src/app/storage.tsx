import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useDayCounter } from "@/hooks/use-day-counter";

export default function StorageScreen() {
  const { count } = useDayCounter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Activity</ThemedText>

        <ThemedView type="backgroundElement" style={styles.table}>
          <View style={styles.row}>
            <ThemedText themeColor="textSecondary">Days used</ThemedText>
            <ThemedText>{count ?? "—"}</ThemedText>
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
