import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/**
 * The install status of a curated pack, derived by comparing the directory
 * entry's version against the locally installed pack (see issue #35). No
 * per-pack network call is involved. `error` is reserved for the case where
 * the directory fetch itself failed.
 */
export type PackCardStatus =
  | "not-installed"
  | "up-to-date"
  | "update-available"
  | "error";

type StatusPresentation = {
  label: string;
  background: ThemeColor;
  border: ThemeColor;
  text: ThemeColor;
};

const STATUS_PRESENTATION: Record<PackCardStatus, StatusPresentation> = {
  "not-installed": {
    label: "Not installed",
    background: "backgroundSelected",
    border: "backgroundSelected",
    text: "textSecondary",
  },
  "up-to-date": {
    label: "Installed, up to date",
    background: "success",
    border: "successBorder",
    text: "text",
  },
  "update-available": {
    label: "Update available",
    background: "selected",
    border: "selectedBorder",
    text: "text",
  },
  error: {
    label: "Error",
    background: "error",
    border: "errorBorder",
    text: "text",
  },
};

function StatusBadge({ status }: { status: PackCardStatus }) {
  const theme = useTheme();
  const presentation = STATUS_PRESENTATION[status];

  return (
    <ThemedView
      type={presentation.background}
      style={[styles.badge, { borderColor: theme[presentation.border] }]}
    >
      <ThemedText type="smallBold" themeColor={presentation.text}>
        {presentation.label}
      </ThemedText>
    </ThemedView>
  );
}

export type PackCardProps = {
  name: string;
  description: string;
  author: string;
  status: PackCardStatus;
  /**
   * Slot for the install / update / retry / delete controls added in #36.
   * Rendered below the description when present; the card stays view-only
   * when omitted.
   */
  children?: ReactNode;
};

export function PackCard({
  name,
  description,
  author,
  status,
  children,
}: PackCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.name}>
          {name}
        </ThemedText>
        <StatusBadge status={status} />
      </View>

      <ThemedText themeColor="textSecondary">{description}</ThemedText>

      <ThemedText type="small" themeColor="textSecondary">
        By {author}
      </ThemedText>

      {children ? <View style={styles.actions}>{children}</View> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
  },
  badge: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
