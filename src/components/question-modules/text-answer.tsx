import { StyleSheet, TextInput, View } from "react-native";

import { FormattedText } from "@/components/code-terminal";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type TextAnswerQuestion = {
  id: string;
  type: "text-answer";
  prompt: string;
  correctAnswer: string;
  language: string;
  explanation: string;
  source: string;
};

const PUNCTUATION_REPLACEMENTS: [RegExp, string][] = [
  [/…/g, "..."], // ellipsis → three periods
  [/[‘’]/g, "'"], // curly single quotes → straight
  [/[“”]/g, '"'], // curly double quotes → straight
  [/[–—]/g, "-"], // en/em dash → hyphen
];

function normalizeAnswer(value: string): string {
  const folded = PUNCTUATION_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  );
  return folded.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isCorrectTextAnswer(
  question: TextAnswerQuestion,
  value: string,
): boolean {
  return normalizeAnswer(value) === normalizeAnswer(question.correctAnswer);
}

type TextAnswerModuleProps = {
  question: TextAnswerQuestion;
  value: string;
  onChange: (value: string) => void;
};

export function TextAnswerModule({
  question,
  value,
  onChange,
}: TextAnswerModuleProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <FormattedText text={question.prompt} style={styles.prompt} />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Type your answer"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement },
        ]}
      />
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
  input: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
