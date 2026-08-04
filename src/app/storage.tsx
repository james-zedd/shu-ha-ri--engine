import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDayCounter } from '@/hooks/use-day-counter';

export default function StorageScreen() {
  const { count } = useDayCounter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Storage Data</ThemedText>

        <ThemedView style={styles.statCard}>
          <ThemedText type="title">{count ?? '—'}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {count === 1 ? 'day used' : 'days used'}
          </ThemedText>
        </ThemedView>
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  statCard: {
    alignItems: 'center',
    gap: Spacing.one,
  },
});
