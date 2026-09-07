import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PackActions } from "@/components/pack-actions";
import { PackCard, type PackCardStatus } from "@/components/pack-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { CuratedPack } from "@/data/curated-packs-list";
import { fetchCuratedPacks } from "@/data/fetch-curated-packs";
import { listInstalledPacks } from "@/data/install-pack";
import { compareSemver, isSemver } from "@/data/semver";
import type { Pack } from "@/data/validate-pack";

type DirectoryState =
  | { status: "loading" }
  | { status: "error"; reason: string }
  | { status: "loaded"; packs: CuratedPack[] };

/**
 * A pack's status is a local comparison — the directory entry's `version`
 * against the installed pack's — never a per-pack network call (#35).
 */
function derivePackStatus(
  entryVersion: string,
  installed: Pack | null,
): PackCardStatus {
  if (!installed) return "not-installed";
  if (
    isSemver(entryVersion) &&
    isSemver(installed.version) &&
    compareSemver(entryVersion, installed.version) > 0
  ) {
    return "update-available";
  }
  return "up-to-date";
}

export default function PacksScreen() {
  const [state, setState] = useState<DirectoryState>({ status: "loading" });
  const [installed, setInstalled] = useState<Pack[]>([]);

  const refreshInstalled = useCallback(() => {
    setInstalled(listInstalledPacks());
  }, []);

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

  // Re-read installed packs whenever the screen regains focus, so a pack
  // installed or deleted here (or elsewhere) stays reflected in each card.
  useFocusEffect(refreshInstalled);

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
            {state.packs.map((pack) => {
              const installedPack =
                installed.find((p) => p.id === pack.id) ?? null;
              const status = derivePackStatus(pack.version, installedPack);

              return (
                <PackCard
                  key={pack.id}
                  name={pack.name}
                  description={pack.description}
                  author={pack.author}
                  status={status}
                >
                  <PackActions
                    pack={pack}
                    status={status}
                    onChanged={refreshInstalled}
                  />
                </PackCard>
              );
            })}
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
