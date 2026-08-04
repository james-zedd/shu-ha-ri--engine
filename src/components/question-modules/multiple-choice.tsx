import { Pressable, StyleSheet, View } from "react-native";

import { FormattedText } from "@/components/code-terminal";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export type MultipleChoiceQuestion = {
  id: string;
  type: "multiple-choice";
  prompt: string;
  choices: string[];
  correctIndex: number;
  language: string;
  explanation: string;
  source: string;
};

type MultipleChoiceModuleProps = {
  question: MultipleChoiceQuestion;
  selectedIndex: number | null;
  onSelect: (choiceIndex: number) => void;
};

export function MultipleChoiceModule({
  question,
  selectedIndex,
  onSelect,
}: MultipleChoiceModuleProps) {
  return (
    <View style={styles.container}>
      <FormattedText text={question.prompt} style={styles.prompt} />

      <View style={styles.choices}>
        {question.choices.map((choice, index) => (
          <Pressable key={index} onPress={() => onSelect(index)}>
            <ThemedView
              type={
                selectedIndex === index
                  ? "backgroundSelected"
                  : "backgroundElement"
              }
              style={styles.choice}
            >
              <FormattedText text={choice} />
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
    paddingVertical: Spacing.four,
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
