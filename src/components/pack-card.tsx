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
  border: ThemeColor;
  text: ThemeColor;
};

// The card's whole surface takes on the status colour once a pack is
// installed; "not installed" keeps the neutral element background.
const CARD_BACKGROUND: Record<PackCardStatus, ThemeColor> = {
  "not-installed": "backgroundElement",
  "up-to-date": "success",
  "update-available": "selected",
  error: "error",
};

const STATUS_PRESENTATION: Record<PackCardStatus, StatusPresentation> = {
  "not-installed": {
    label: "Not installed",
    border: "backgroundSelected",
    text: "textSecondary",
  },
  "up-to-date": {
    label: "Installed, up to date",
    border: "successBorder",
    text: "text",
  },
  "update-available": {
    label: "Update available",
    border: "selectedBorder",
    text: "text",
  },
  error: {
    label: "Error",
    border: "errorBorder",
    text: "text",
  },
};

function StatusBadge({ status }: { status: PackCardStatus }) {
  const presentation = STATUS_PRESENTATION[status];

  return (
    <ThemedView
      // Sits on the base background so the label stays legible against the
      // card's now status-tinted surface.
      type="background"
      style={styles.badge}
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
  const theme = useTheme();
  const presentation = STATUS_PRESENTATION[status];

  return (
    <ThemedView
      type={CARD_BACKGROUND[status]}
      style={[styles.card, { borderColor: theme[presentation.border] }]}
    >
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
    borderWidth: 1,
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
