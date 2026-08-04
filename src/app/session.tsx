import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormattedText } from "@/components/code-terminal";
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

function shuffleChoices(question: Question): Question {
  const order = shuffle(question.choices.map((_, i) => i));
  return {
    ...question,
    choices: order.map((i) => question.choices[i]),
    correctIndex: order.indexOf(question.correctIndex),
  };
}

function QuestionModule({
  question,
  selectedIndex,
  onSelect,
}: {
  question: Question;
  selectedIndex: number | null;
  onSelect: (choiceIndex: number) => void;
}) {
  switch (question.type) {
    case "multiple-choice":
      return (
        <MultipleChoiceModule
          question={question}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
        />
      );
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
    return shuffle(matches).slice(0, count).map(shuffleChoices);
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [revealed, setRevealed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const total = sessionQuestions.length;
  const current = sessionQuestions[index];
  const isFinished = total > 0 && index >= total;
  const score = Object.values(answers).filter((a) => a.correct).length;

  function handleSubmit() {
    if (!current || revealed || selectedIndex === null) return;
    setAnswers((prev) => ({
      ...prev,
      [current.id]: {
        choiceIndex: selectedIndex,
        correct: selectedIndex === current.correctIndex,
      },
    }));
    setRevealed(true);
  }

  function handleNext() {
    setRevealed(false);
    setSelectedIndex(null);
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <ThemedText themeColor="textSecondary" type="small">
              Question {index + 1} of {total}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {current.language.charAt(0).toUpperCase() +
                current.language.slice(1)}{" "}
              Question
            </ThemedText>
          </View>

          <View style={styles.questionArea}>
            {revealed && answer ? (
              <View style={styles.feedback}>
                <FormattedText text={current.prompt} style={styles.prompt} />

                <ThemedView
                  type={
                    answer.correct ? "backgroundSelected" : "backgroundElement"
                  }
                  style={styles.feedbackBanner}
                >
                  <ThemedText type="smallBold">
                    {answer.correct ? "Correct!" : "Incorrect"}
                  </ThemedText>
                </ThemedView>

                <View style={styles.feedbackSection}>
                  <ThemedText type="smallBold">Your answer</ThemedText>
                  <FormattedText text={current.choices[answer.choiceIndex]} />
                </View>

                {!answer.correct && (
                  <View style={styles.feedbackSection}>
                    <ThemedText type="smallBold">Correct answer</ThemedText>
                    <FormattedText
                      text={current.choices[current.correctIndex]}
                    />
                  </View>
                )}

                <View style={styles.feedbackSection}>
                  <ThemedText type="smallBold">Explanation</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {current.explanation}
                  </ThemedText>
                </View>

                <View style={styles.feedbackSection}>
                  <ThemedText type="smallBold">Reference</ThemedText>
                  <Pressable onPress={() => Linking.openURL(current.source)}>
                    <ThemedText type="linkPrimary">{current.source}</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <QuestionModule
                question={current}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            )}
          </View>
        </ScrollView>

        {revealed ? (
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
        ) : (
          <Pressable
            onPress={handleSubmit}
            disabled={selectedIndex === null}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView
              type="text"
              style={[
                styles.actionButton,
                selectedIndex === null && styles.actionButtonDisabled,
              ]}
            >
              <ThemedText
                themeColor="background"
                style={styles.actionButtonLabel}
              >
                Submit
              </ThemedText>
            </ThemedView>
          </Pressable>
        )}
      </SafeAreaView>
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
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: Spacing.two,
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
    paddingVertical: Spacing.four,
  },
  feedbackBanner: {
    alignSelf: "flex-start",
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  feedbackSection: {
    gap: Spacing.two,
  },
  actionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
