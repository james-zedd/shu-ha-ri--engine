import { useRef, useState, type ReactNode } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SectionId = "concept" | "app-usage" | "contributing" | "privacy";

const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "concept", title: "Concept" },
  { id: "app-usage", title: "App Usage" },
  { id: "contributing", title: "Contributing" },
  { id: "privacy", title: "Privacy" },
];

// Breathing room left above a section's heading when it's scrolled to.
const HEADER_OFFSET = Spacing.three;
// Lets even the last section scroll up near the top of the viewport.
const BOTTOM_SPACER = Dimensions.get("window").height * 0.7;

function Section({
  id,
  title,
  onMeasure,
  children,
}: {
  id: SectionId;
  title: string;
  onMeasure: (id: SectionId, y: number) => void;
  children: ReactNode;
}) {
  return (
    <View
      style={styles.section}
      onLayout={(event: LayoutChangeEvent) =>
        onMeasure(id, event.nativeEvent.layout.y)
      }
    >
      <ThemedText type="title">{title}</ThemedText>
      {children}
    </View>
  );
}

export default function AboutScreen() {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const navRef = useRef<ScrollView>(null);
  const sectionTops = useRef<Partial<Record<SectionId, number>>>({});
  const chipOffsets = useRef<Partial<Record<SectionId, number>>>({});
  const [activeId, setActiveId] = useState<SectionId>(SECTIONS[0].id);

  function revealChip(id: SectionId) {
    const x = chipOffsets.current[id];
    if (x != null) {
      navRef.current?.scrollTo({ x: Math.max(x - Spacing.three, 0), animated: true });
    }
  }

  function goToSection(id: SectionId) {
    const top = sectionTops.current[id];
    if (top == null) return;
    scrollRef.current?.scrollTo({
      y: Math.max(top - HEADER_OFFSET, 0),
      animated: true,
    });
    setActiveId(id);
    revealChip(id);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = event.nativeEvent.contentOffset.y + HEADER_OFFSET + 1;
    let current: SectionId = SECTIONS[0].id;
    for (const { id } of SECTIONS) {
      const top = sectionTops.current[id];
      if (top != null && top <= y) current = id;
    }
    if (current !== activeId) {
      setActiveId(current);
      revealChip(current);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View
          style={[styles.navBar, { borderBottomColor: theme.backgroundSelected }]}
        >
          <ScrollView
            ref={navRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navContent}
          >
            {SECTIONS.map((section) => {
              const active = section.id === activeId;
              return (
                <Pressable
                  key={section.id}
                  accessibilityRole="button"
                  onPress={() => goToSection(section.id)}
                  onLayout={(event: LayoutChangeEvent) => {
                    chipOffsets.current[section.id] = event.nativeEvent.layout.x;
                  }}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView
                    type={active ? "backgroundSelected" : "backgroundElement"}
                    style={styles.chip}
                  >
                    <ThemedText
                      type="small"
                      themeColor={active ? "text" : "textSecondary"}
                    >
                      {section.title}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Section
            id="concept"
            title="Concept"
            onMeasure={(id, y) => (sectionTops.current[id] = y)}
          >
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
          </Section>

          <Section
            id="app-usage"
            title="App Usage"
            onMeasure={(id, y) => (sectionTops.current[id] = y)}
          >
            <ThemedText type="default">
              This app is designed to help you improve any area of study you
              would like to improve upon. It utilizes the Shu Ha Ri approach to
              learning, which is to practice the fundamentals and core
              principles of a subject on a regular basis. There are no rewards
              for consistent progress in this app, other than becoming more
              fluent in your area of study. There are no streaks, no goals to
              obtain, no trophies, and your correct or incorrect answers are not
              recorded.
            </ThemedText>
            <ThemedText type="default">
              A suggestion for success with this app is that you practice by
              logging in once a day and practicing as much as you can that day.
            </ThemedText>
          </Section>

          <Section
            id="contributing"
            title="Contributing"
            onMeasure={(id, y) => (sectionTops.current[id] = y)}
          >
            <ThemedText type="default">
              To have your pack included in the list of curated packs, you can
              create your own question pack and post it publicly on a github
              gist. Afterward please submit a pull request to the
              curated-packs-list.ts file in this repository. Please ensure that
              your pack is well-tested and follows the guidelines for creating
              question packs. A sample pack is included in the
              curated-packs-list.ts file for reference.
            </ThemedText>
          </Section>

          <Section
            id="privacy"
            title="Privacy"
            onMeasure={(id, y) => (sectionTops.current[id] = y)}
          >
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
            </ThemedText>
          </Section>

          <View style={{ height: BOTTOM_SPACER }} />
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
  },
  navBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navContent: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chip: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
