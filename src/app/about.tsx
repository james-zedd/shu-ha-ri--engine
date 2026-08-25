import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Spacing } from "@/constants/theme";

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Collapsible title="About Shu Ha Ri">
            <ThemedText type="default">
              Shu Ha Ri is a Japanese concept that describes three separate
              stages of learning. Widely attributed to Japanese tea ceremony
              master Sen no Rikyū, the concept has been applied to various
              disciplines, including martial arts, software development, SCRUM
              practices, and other areas of skill acquisition. The term is often
              used to describe the progression of a student from beginner to
              advanced to formless/intuitive.
            </ThemedText>
            <ThemedText type="default">
              The three stages of Shu Ha Ri are:
            </ThemedText>
            <ThemedText type="subtitle">Shu (守)</ThemedText>
            <ThemedText type="default">
              In the Shu stage, the student learns the fundamentals and adheres
              to the rules and teachings of tradition. The focus is on imitation
              and repetition, with an emphasis on core principles.
            </ThemedText>
            <ThemedText type="subtitle">Ha (破)</ThemedText>
            <ThemedText type="default">
              In the Ha stage, the student begins to break away from strict
              adherence to tradition and starts to explore their own
              understanding and interpretation of the teachings. This is more of
              a scientific approach to learning - focusing on experimentation
              and innovation while still respecting the core principles.
            </ThemedText>
            <ThemedText type="subtitle">Ri (離)</ThemedText>
            <ThemedText type="default">
              In the Ri stage, a student has reached a level of understanding
              that no longer requires adherence or experimentation. The student
              has internalized the teachings and can now express their own
              unique style and approach, transcending the traditional forms and
              rules.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Goals of this App">
            <ThemedText type="default">
              This app is designed to help you practice and improve any area of
              study or skill. It utilizes the Shu Ha Ri approach to learning,
              but this approach is not mandated. You ultimately determine your
              own path to learning and understanding.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Uploading Questions">
            <ThemedText type="default">
              You can upload your own questions to the app by creating a JSON
              file that follows the structure of the example questions provided
              in the app. The JSON file should contain an array of question
              objects, each with a question, answer, and optional metadata such
              as category, difficulty, and language. Once you have created your
              JSON file, you can upload it to the app in the Storage Data and
              Settings section. (To be implemented).
            </ThemedText>
          </Collapsible>

          <Collapsible title="Privacy">
            <ThemedText type="default">
              This app was designed with a privacy-first approach. It does not
              collect any personal data or track your usage. All data is stored
              locally on your device, and you have full control over your data
              and settings.
            </ThemedText>
            <ThemedText type="default">
              The app only requires an internet connection to download,
              initialize and/or update questions. All other functionality is
              available offline. You can use the app without creating an account
              or providing any personal information.
            </ThemedText>
            <ThemedText type="default">
              This app is provided free of charge. There is no user
              registration, no ads, in-app purchases, or subscriptions.
              Education and learning should be accessible to everyone.
            </ThemedText>
          </Collapsible>
        </ScrollView>
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
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.three,
  },
});
