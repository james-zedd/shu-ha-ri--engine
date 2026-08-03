import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CodeTerminal, splitPrompt } from "@/components/code-terminal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export type MultipleChoiceQuestion = {
  id: string;
  type: "multiple-choice";
  prompt: string;
  choices: string[];
  correctIndex: number;
  language: string;
};

type MultipleChoiceModuleProps = {
  question: MultipleChoiceQuestion;
  onAnswer: (choiceIndex: number) => void;
};

export function MultipleChoiceModule({
  question,
  onAnswer,
}: MultipleChoiceModuleProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { prose, code } = splitPrompt(question.prompt);

  function handleSelect(index: number) {
    setSelectedIndex(index);
    onAnswer(index);
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.language}>
        {question?.language} question
      </ThemedText>
      <ThemedText style={styles.prompt}>{prose}</ThemedText>

      {code && <CodeTerminal code={code} />}

      <View style={styles.choices}>
        {question.choices.map((choice, index) => (
          <Pressable key={index} onPress={() => handleSelect(index)}>
            <ThemedView
              type={
                selectedIndex === index
                  ? "backgroundSelected"
                  : "backgroundElement"
              }
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
  language: {
    alignSelf: "flex-start",
    fontSize: 14,
    lineHeight: 18,
    borderColor: "#333",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  prompt: {
    fontSize: 18,
    lineHeight: 22,
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
