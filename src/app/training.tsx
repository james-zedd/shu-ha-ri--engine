import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { categories as CATEGORY_OPTIONS, filterQuestions } from '@/data/questions';

type Language = 'all' | 'javascript' | 'typescript';

const LANGUAGE_OPTIONS: { label: string; value: Language }[] = [
  { label: 'All', value: 'all' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
];

const DIFFICULTY_OPTIONS: { label: string; value: number }[] = [
  { label: 'Easy', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Hard', value: 3 },
];

const COUNT_OPTIONS = [5, 10, 15, 20, 25];

function formatCategoryLabel(category: string) {
  return category
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
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
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.pill}>
        <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function TrainingScreen() {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>('all');
  const [difficulties, setDifficulties] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [count, setCount] = useState(10);

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

  const matchCount = useMemo(() => {
    return filterQuestions({ language, difficulties, categories }).length;
  }, [language, difficulties, categories]);

  const sessionCount = Math.min(count, matchCount);

  function startSession() {
    router.push({
      pathname: '/session',
      params: {
        language,
        difficulties: difficulties.join(','),
        categories: categories.join(','),
        count: String(sessionCount),
      },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle">Training</ThemedText>

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
            <View style={styles.pillRow}>
              {CATEGORY_OPTIONS.map((category) => (
                <FilterPill
                  key={category}
                  label={formatCategoryLabel(category)}
                  selected={categories.includes(category)}
                  onPress={() => toggleCategory(category)}
                />
              ))}
            </View>
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
            {matchCount} question{matchCount === 1 ? '' : 's'} match your filters
          </ThemedText>
        </ScrollView>

        <Pressable
          disabled={matchCount === 0}
          onPress={startSession}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedView
            type={matchCount === 0 ? 'backgroundElement' : 'text'}
            style={styles.startButton}
          >
            <ThemedText
              themeColor={matchCount === 0 ? 'textSecondary' : 'background'}
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
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  startButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
