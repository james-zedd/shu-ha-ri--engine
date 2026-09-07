import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { listInstalledPacks } from "@/data/install-pack";
import { filterQuestions, getCategories } from "@/data/questions";
import type { Pack } from "@/data/validate-pack";
import { useTheme } from "@/hooks/use-theme";

type Language = "all" | "javascript" | "typescript";

const LANGUAGE_OPTIONS: { label: string; value: Language }[] = [
  { label: "All", value: "all" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
];

const DIFFICULTY_OPTIONS: { label: string; value: number }[] = [
  { label: "Easy", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Hard", value: 3 },
];

const COUNT_OPTIONS = [5, 10, 15, 20, 25];

function formatCategoryLabel(category: string) {
  return category
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function FilterPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView
        type={selected ? "backgroundSelected" : "backgroundElement"}
        style={styles.pill}
      >
        <ThemedText
          type="small"
          themeColor={selected ? "text" : "textSecondary"}
        >
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function TrainingScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [packMenuOpen, setPackMenuOpen] = useState(false);

  const [language, setLanguage] = useState<Language>("all");
  const [difficulties, setDifficulties] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [count, setCount] = useState(10);

  // Re-read the installed packs every time the screen regains focus so a pack
  // installed from the Packs view shows up without a reload.
  useFocusEffect(
    useCallback(() => {
      const installed = listInstalledPacks();
      setPacks(installed);
      setSelectedPackId((prev) =>
        prev && installed.some((p) => p.id === prev)
          ? prev
          : (installed[0]?.id ?? null),
      );
    }, []),
  );

  const selectedPack = useMemo(
    () => packs.find((p) => p.id === selectedPackId) ?? null,
    [packs, selectedPackId],
  );

  const baseQuestions = useMemo(
    () => selectedPack?.questions ?? [],
    [selectedPack],
  );

  const categoryOptions = useMemo(
    () => getCategories(baseQuestions),
    [baseQuestions],
  );

  function selectPack(packId: string) {
    setSelectedPackId(packId);
    setPackMenuOpen(false);
    // Categories are pack-specific; drop any that the new pack doesn't have.
    setCategories([]);
  }

  function toggleDifficulty(value: number) {
    setDifficulties((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  }

  function toggleCategory(value: string) {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  }

  const matchCount = useMemo(
    () =>
      filterQuestions(baseQuestions, { language, difficulties, categories })
        .length,
    [baseQuestions, language, difficulties, categories],
  );

  const sessionCount = Math.min(count, matchCount);
  const canStart = selectedPackId !== null && matchCount > 0;

  function startSession() {
    if (!canStart) return;
    router.push({
      pathname: "/session",
      params: {
        pack: selectedPackId,
        language,
        difficulties: difficulties.join(","),
        categories: categories.join(","),
        count: String(sessionCount),
      },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Training</ThemedText>

          <View style={styles.section}>
            <ThemedText type="smallBold">Pack</ThemedText>
            {packs.length === 0 ? (
              <ThemedText themeColor="textSecondary" type="small">
                No packs installed yet. Open Storage Data and Settings and tap
                “View all packs” to install one.
              </ThemedText>
            ) : (
              <View>
                <Pressable
                  onPress={() => setPackMenuOpen((open) => !open)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView
                    type="backgroundElement"
                    style={styles.dropdownTrigger}
                  >
                    <ThemedText type="small">
                      {selectedPack?.name ?? "Select a pack"}
                    </ThemedText>
                    <SymbolView
                      name={{
                        ios: "chevron.down",
                        android: "expand_more",
                        web: "expand_more",
                      }}
                      size={16}
                      weight="bold"
                      tintColor={theme.text}
                      style={{
                        transform: [
                          { rotate: packMenuOpen ? "180deg" : "0deg" },
                        ],
                      }}
                    />
                  </ThemedView>
                </Pressable>

                {packMenuOpen && (
                  <ThemedView
                    type="backgroundElement"
                    style={styles.dropdownList}
                  >
                    {packs.map((pack) => (
                      <Pressable
                        key={pack.id}
                        onPress={() => selectPack(pack.id)}
                        style={({ pressed }) => pressed && styles.pressed}
                      >
                        <ThemedView
                          type={
                            pack.id === selectedPackId
                              ? "backgroundSelected"
                              : "backgroundElement"
                          }
                          style={styles.dropdownOption}
                        >
                          <ThemedText
                            type="small"
                            themeColor={
                              pack.id === selectedPackId
                                ? "text"
                                : "textSecondary"
                            }
                          >
                            {pack.name}
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {pack.questions.length}
                          </ThemedText>
                        </ThemedView>
                      </Pressable>
                    ))}
                  </ThemedView>
                )}
              </View>
            )}
          </View>

          {selectedPack && (
            <>
              <View style={styles.section}>
                <ThemedText type="smallBold">Language</ThemedText>
                <View style={styles.pillRow}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value}
                      label={option.label}
                      selected={language === option.value}
                      onPress={() => setLanguage(option.value)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="smallBold">Difficulty</ThemedText>
                <View style={styles.pillRow}>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value}
                      label={option.label}
                      selected={difficulties.includes(option.value)}
                      onPress={() => toggleDifficulty(option.value)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="smallBold">Category</ThemedText>
                {categoryOptions.length === 0 ? (
                  <ThemedText themeColor="textSecondary" type="small">
                    This pack has no categories.
                  </ThemedText>
                ) : (
                  <View style={styles.pillRow}>
                    {categoryOptions.map((category) => (
                      <FilterPill
                        key={category}
                        label={formatCategoryLabel(category)}
                        selected={categories.includes(category)}
                        onPress={() => toggleCategory(category)}
                      />
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <ThemedText type="smallBold">Question Count</ThemedText>
                <View style={styles.pillRow}>
                  {COUNT_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      label={String(option)}
                      selected={count === option}
                      onPress={() => setCount(option)}
                    />
                  ))}
                </View>
              </View>

              <ThemedText themeColor="textSecondary" type="small">
                {matchCount} question{matchCount === 1 ? "" : "s"} match your
                filters
              </ThemedText>
            </>
          )}
        </ScrollView>

        <Pressable
          disabled={!canStart}
          onPress={startSession}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedView
            type={canStart ? "text" : "backgroundElement"}
            style={styles.startButton}
          >
            <ThemedText
              themeColor={canStart ? "background" : "textSecondary"}
              style={styles.startButtonLabel}
            >
              Start Session
            </ThemedText>
          </ThemedView>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  scrollContent: {
    gap: Spacing.four,
    paddingVertical: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  pill: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  dropdownList: {
    marginTop: Spacing.one,
    borderRadius: Spacing.two,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  startButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
