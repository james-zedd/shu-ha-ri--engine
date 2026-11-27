import Constants from "expo-constants";
import { Link } from "expo-router";
import { Image, Pressable, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const appVersion = Constants.expoConfig?.version;

// Narrower than MaxContentWidth: a column of buttons looks stretched at 800,
// which is about the full width of an iPad in portrait.
const HomeMaxWidth = 480;

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          {/* <Logo size={240} /> */}
          <Image
            source={
              isDark
                ? require("@/assets/images/logo-dark.png")
                : require("@/assets/images/logo.png")
            }
            style={{ width: 240, height: 144 }}
          />
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

          <Link href="/packs" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView
                type="selected"
                style={[
                  styles.secondaryButton,
                  { borderWidth: 1, borderColor: "#92aed7" },
                ]}
              >
                <ThemedText style={styles.buttonLabel}>View Packs</ThemedText>
              </ThemedView>
            </Pressable>
          </Link>

          <Link href="/storage" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView
                type="backgroundElement"
                style={[
                  styles.secondaryButton,
                  { borderWidth: 1, borderColor: "#cccccc" },
                ]}
              >
                <ThemedText style={styles.buttonLabel}>
                  Storage Data and Settings
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>

          <Link href="/about" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView
                type="backgroundElement"
                style={[
                  styles.tertiaryButton,
                  {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: "gray",
                  },
                ]}
              >
                <ThemedText style={styles.buttonLabel}>
                  About Shu Ha Ri
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        </ThemedView>
        {appVersion && (
          // Absolute positioning ignores the SafeAreaView's padding, so offset
          // by the bottom inset to keep the version above the system nav bar.
          <ThemedView
            style={[styles.versionSection, { bottom: insets.bottom }]}
          >
            <ThemedText
              type="small"
              themeColor="textDimmed"
              style={styles.versionText}
            >
              v{appVersion}
            </ThemedText>
          </ThemedView>
        )}
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
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    maxWidth: HomeMaxWidth,
  },
  heroSection: {
    alignItems: "center",
  },
  versionSection: {
    alignItems: "center",
    height: 20,
    position: "absolute",
  },
  versionText: {
    textAlign: "center",
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
  tertiaryButton: {
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
