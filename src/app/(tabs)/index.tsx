import { Link } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <Logo size={240} />
        </ThemedView>

        <ThemedView style={styles.actions}>
          <Link href="/training" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="text" style={styles.primaryButton}>
                <ThemedText themeColor="background" style={styles.buttonLabel}>
                  Start Training
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>

          <Link href="/storage" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView
                type="backgroundElement"
                style={styles.secondaryButton}
              >
                <ThemedText style={styles.buttonLabel}>
                  See Storage Data
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
  },
  actions: {
    alignSelf: "stretch",
    gap: Spacing.three,
  },
  primaryButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  secondaryButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
