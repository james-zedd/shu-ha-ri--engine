import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { PackCardStatus } from "@/components/pack-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { CuratedPack } from "@/data/curated-packs-list";
import { fetchPackContent } from "@/data/fetch-pack-content";
import { deletePack, installPack } from "@/data/install-pack";

type Verb = "Install" | "Update" | "Delete";

type ActionState =
  | { phase: "idle" }
  | { phase: "working"; verb: Verb }
  | { phase: "error"; verb: Verb; reason: string };

const WORKING_LABEL: Record<Verb, string> = {
  Install: "Installing…",
  Update: "Updating…",
  Delete: "Removing…",
};

function ActionButton({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView
        type={danger ? "error" : "backgroundSelected"}
        style={styles.button}
      >
        <ThemedText type="smallBold">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/**
 * The install / update / retry / delete controls for one curated pack card
 * (#36). Rendered into PackCard's `children` slot so the card itself stays
 * presentational. `status` comes from the card's local version comparison
 * (#35); after any successful action this calls `onChanged` so the parent
 * re-derives it.
 */
export function PackActions({
  pack,
  status,
  onChanged,
}: {
  pack: CuratedPack;
  status: PackCardStatus;
  onChanged: () => void;
}) {
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  async function runInstall(verb: "Install" | "Update") {
    setState({ phase: "working", verb });

    const fetched = await fetchPackContent(pack.url);
    if (!mounted.current) return;
    if (!fetched.ok) {
      setState({ phase: "error", verb, reason: fetched.reason });
      return;
    }

    const result = installPack(fetched.jsonText);
    if (!mounted.current) return;
    if (!result.installed) {
      setState({ phase: "error", verb, reason: result.reason });
      return;
    }

    setState({ phase: "idle" });
    onChanged();
  }

  function runDelete() {
    const result = deletePack(pack.id);
    if (!result.deleted) {
      setState({ phase: "error", verb: "Delete", reason: result.reason });
      return;
    }
    setState({ phase: "idle" });
    onChanged();
  }

  function retry() {
    if (state.phase !== "error") return;
    if (state.verb === "Delete") runDelete();
    else runInstall(state.verb);
  }

  return (
    <>
      {state.phase === "working" ? (
        <View style={styles.row}>
          <ActivityIndicator />
          <ThemedText type="small" themeColor="textSecondary">
            {WORKING_LABEL[state.verb]}
          </ThemedText>
        </View>
      ) : state.phase === "error" ? (
        <View style={styles.column}>
          <View style={styles.row}>
            <ActionButton label="Retry" onPress={retry} />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {state.reason}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.row}>
          {status === "not-installed" && (
            <ActionButton
              label="Install"
              onPress={() => runInstall("Install")}
            />
          )}
          {status === "update-available" && (
            <ActionButton label="Update" onPress={() => runInstall("Update")} />
          )}
          {(status === "update-available" || status === "up-to-date") && (
            <ActionButton
              label="Delete"
              danger
              onPress={() => setConfirmingDelete(true)}
            />
          )}
        </View>
      )}

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete pack?"
        message={`“${pack.name}” will be removed. You'll need to download it again to reinstall.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmingDelete(false);
          runDelete();
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.two,
  },
  column: {
    gap: Spacing.two,
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
