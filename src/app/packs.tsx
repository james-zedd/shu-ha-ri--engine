import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PackCard } from "@/components/pack-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { CuratedPack } from "@/data/curated-packs-list";
import { fetchCuratedPacks } from "@/data/fetch-curated-packs";

type DirectoryState =
  | { status: "loading" }
  | { status: "error"; reason: string }
  | { status: "loaded"; packs: CuratedPack[] };

export default function PacksScreen() {
  const [state, setState] = useState<DirectoryState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    fetchCuratedPacks().then((result) => {
      if (!active) return;
      setState(
        result.ok
          ? { status: "loaded", packs: result.packs }
          : { status: "error", reason: result.reason },
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Packs</ThemedText>

        {state.status === "loading" ? (
          <ActivityIndicator style={styles.loading} />
        ) : state.status === "error" ? (
          <ThemedText themeColor="textSecondary">
            {state.reason} Pull down or reopen this screen to try again.
          </ThemedText>
        ) : state.packs.length === 0 ? (
          <ThemedText themeColor="textSecondary">
            No curated packs are available yet.
          </ThemedText>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {state.packs.map((pack) => (
              // Status is fixed until getInstalledPack lands (#35); this
              // screen currently just proves the directory fetch works.
              <PackCard
                key={pack.id}
                name={pack.name}
                description={pack.description}
                author={pack.author}
                status="not-installed"
              />
            ))}
          </ScrollView>
        )}
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
  loading: {
    marginTop: Spacing.four,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
