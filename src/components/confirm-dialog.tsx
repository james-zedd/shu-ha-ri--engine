import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A themed yes/no dialog. Works the same on web and native, unlike
 * `Alert.alert`, whose web implementation is a no-op.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        {/* Swallow taps on the card so they don't dismiss via the backdrop. */}
        <Pressable
          style={styles.cardWrap}
          onPress={(event) => event.stopPropagation()}
        >
          <ThemedView type="background" style={styles.card}>
            <ThemedText type="subtitle">{title}</ThemedText>
            {message ? (
              <ThemedText themeColor="textSecondary">{message}</ThemedText>
            ) : null}

            <View style={styles.buttons}>
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView type="backgroundElement" style={styles.button}>
                  <ThemedText type="smallBold">{cancelLabel}</ThemedText>
                </ThemedView>
              </Pressable>

              <Pressable
                onPress={onConfirm}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView
                  type={destructive ? "error" : "text"}
                  style={[
                    styles.button,
                    destructive && {
                      borderWidth: 1,
                      borderColor: theme.errorBorder,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    themeColor={destructive ? "text" : "background"}
                  >
                    {confirmLabel}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  cardWrap: {
    width: "100%",
    maxWidth: MaxContentWidth / 2,
  },
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
