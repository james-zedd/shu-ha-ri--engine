import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CodeTerminal, splitPrompt } from "@/components/code-terminal";
import { MultipleChoiceModule } from "@/components/question-modules/multiple-choice";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { filterQuestions, Question } from "@/data/questions";

type SessionParams = {
  language?: string;
  difficulties?: string;
  categories?: string;
  count?: string;
};

type Answer = {
  choiceIndex: number;
  correct: boolean;
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function QuestionModule({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (choiceIndex: number) => void;
}) {
  switch (question.type) {
    case "multiple-choice":
      return <MultipleChoiceModule question={question} onAnswer={onAnswer} />;
    default:
      return (
        <ThemedText themeColor="textSecondary">
          Unsupported question type.
        </ThemedText>
      );
  }
}

export default function SessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<SessionParams>();

  const [sessionQuestions] = useState<Question[]>(() => {
    const matches = filterQuestions({
      language: params.language,
      difficulties: params.difficulties
        ? params.difficulties.split(",").map(Number)
        : [],
      categories: params.categories
        ? params.categories.split(",").filter(Boolean)
        : [],
    });
    const count = params.count ? Number(params.count) : matches.length;
    return shuffle(matches).slice(0, count);
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [revealed, setRevealed] = useState(false);

  const total = sessionQuestions.length;
  const current = sessionQuestions[index];
  const isFinished = total > 0 && index >= total;
  const score = Object.values(answers).filter((a) => a.correct).length;

  function handleAnswer(choiceIndex: number) {
    if (!current || revealed) return;
    setAnswers((prev) => ({
      ...prev,
      [current.id]: {
        choiceIndex,
        correct: choiceIndex === current.correctIndex,
      },
    }));
    setRevealed(true);
  }

  function handleNext() {
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  if (total === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centeredSafeArea}>
          <ThemedText type="subtitle">No questions found</ThemedText>
          <ThemedText themeColor="textSecondary">
            No questions matched the filters you selected.
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="text" style={styles.actionButton}>
              <ThemedText
                themeColor="background"
                style={styles.actionButtonLabel}
              >
                Back to Training
              </ThemedText>
            </ThemedView>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isFinished) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centeredSafeArea}>
          <ThemedText type="subtitle">Session Complete!</ThemedText>
          <ThemedText themeColor="textSecondary">
            You scored {score} out of {total}
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="text" style={styles.actionButton}>
              <ThemedText
                themeColor="background"
                style={styles.actionButtonLabel}
              >
                Back to Training
              </ThemedText>
            </ThemedView>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const answer = answers[current.id];
  const isLastQuestion = index === total - 1;
  const { prose, code } = splitPrompt(current.prompt);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
          <ThemedText themeColor="textSecondary" type="small">
            Question {index + 1} of {total}
          </ThemedText>

          <View style={styles.questionArea}>
            {revealed && answer ? (
              <View style={styles.feedback}>
                <ThemedText style={styles.prompt}>{prose}</ThemedText>
                {code && <CodeTerminal code={code} />}
                <ThemedView
                  type={
                    answer.correct ? "backgroundSelected" : "backgroundElement"
                  }
                  style={styles.feedbackBanner}
                >
                  <ThemedText type="smallBold">
                    {answer.correct ? "Correct!" : "Incorrect — correct answer:"}
                  </ThemedText>
                  {!answer.correct && (
                    <CodeTerminal code={current.choices[current.correctIndex]} />
                  )}
                </ThemedView>
              </View>
            ) : (
              <QuestionModule question={current} onAnswer={handleAnswer} />
            )}
          </View>

          {revealed && (
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="text" style={styles.actionButton}>
                <ThemedText
                  themeColor="background"
                  style={styles.actionButtonLabel}
                >
                  {isLastQuestion ? "Finish" : "Next Question"}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "flex-start",
  },
  container: {
    flex: 1,
    alignItems: "flex-start",
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  centeredSafeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  questionArea: {
    flex: 1,
    justifyContent: "flex-start",
  },
  prompt: {
    fontSize: 18,
    lineHeight: 22,
  },
  feedback: {
    gap: Spacing.four,
  },
  feedbackBanner: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  actionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
