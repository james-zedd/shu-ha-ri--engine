import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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
  const [fetching, setFetching] = useState(false);

  // Tracked as a ref, not just the `fetching` state, because setState is
  // async: two taps in the same tick would both pass a state-based check and
  // race two responses against each other.
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshInstalled = useCallback(() => {
    setInstalled(listInstalledPacks());
  }, []);

  // Deliberately does not reset to the "loading" state: on a re-focus the
  // already-loaded cards stay on screen instead of flashing a spinner, and
  // the initial load still shows one because that is the initial state.
  const loadDirectory = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFetching(true);

    const result = await fetchCuratedPacks();

    inFlight.current = false;
    if (!mounted.current) return;
    setFetching(false);
    setState(
      result.ok
        ? { status: "loaded", packs: result.packs }
        : { status: "error", reason: result.reason },
    );
  }, []);

  // Both run whenever the screen regains focus: installed packs so a pack
  // added or deleted elsewhere stays reflected in each card, and the
  // directory so a failed fetch recovers on reopen rather than sticking.
  useFocusEffect(
    useCallback(() => {
      refreshInstalled();
      loadDirectory();
    }, [refreshInstalled, loadDirectory]),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Packs</ThemedText>

        {state.status === "loading" ? (
          <ActivityIndicator style={styles.loading} />
        ) : state.status === "error" ? (
          <View style={styles.errorBlock}>
            <ThemedText themeColor="textSecondary">{state.reason}</ThemedText>
            <View style={styles.retryRow}>
              <Pressable
                onPress={loadDirectory}
                disabled={fetching}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView
                  type={fetching ? "backgroundElement" : "backgroundSelected"}
                  style={styles.retryButton}
                >
                  <ThemedText type="smallBold">Retry</ThemedText>
                </ThemedView>
              </Pressable>
              {fetching && <ActivityIndicator size="small" />}
            </View>
          </View>
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
  errorBlock: {
    gap: Spacing.three,
    alignItems: "flex-start",
  },
  retryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  retryButton: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
