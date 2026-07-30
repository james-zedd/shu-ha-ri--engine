import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type MultipleChoiceQuestion = {
  id: string;
  type: 'multiple-choice';
  prompt: string;
  choices: string[];
  correctIndex: number;
};

type MultipleChoiceModuleProps = {
  question: MultipleChoiceQuestion;
  onAnswer: (choiceIndex: number) => void;
};

export function MultipleChoiceModule({ question, onAnswer }: MultipleChoiceModuleProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function handleSelect(index: number) {
    setSelectedIndex(index);
    onAnswer(index);
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{question.prompt}</ThemedText>

      <View style={styles.choices}>
        {question.choices.map((choice, index) => (
          <Pressable key={index} onPress={() => handleSelect(index)}>
            <ThemedView
              type={selectedIndex === index ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.choice}
            >
              <ThemedText>{choice}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  choices: {
    gap: Spacing.two,
  },
  choice: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
