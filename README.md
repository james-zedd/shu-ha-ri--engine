# Shu Ha Ri - Engine

An adaptable educational tool.

## Concept

Shu Ha Ri is a Japanese concept that describes three separate stages of learning. Widely attributed to Japanese tea ceremony master Sen no Rikyū, the concept has been applied to various disciplines, including martial arts, software development, SCRUM practices, and other areas of skill acquisition. The term is often used to describe the progression of a student from beginner to advanced to formless/intuitive.

The three stages of Shu Ha Ri are:

**Shu (守)** — In the Shu stage, the student learns the fundamentals and adheres to the rules and teachings of tradition. The focus is on imitation and repetition, with an emphasis on core principles.

**Ha (破)** — In the Ha stage, the student begins to break away from strict adherence to tradition and starts to explore their own understanding and interpretation of the teachings. This is more of a scientific approach to learning - focusing on experimentation and innovation while still respecting the core principles.

**Ri (離)** — In the Ri stage, a student has reached a level of understanding that no longer requires adherence or experimentation. The student has internalized the teachings and can now express their own unique style and approach, transcending the traditional forms and rules.

## App Usage

This app is designed to help you improve any area of study you would like to improve upon. It utilizes the Shu Ha Ri approach to learning, which is to practice the fundamentals and core principles of a subject on a regular basis. There are no rewards for consistent progress in this app, other than becoming more fluent in your area of study. There are no streaks, no goals to obtain, no trophies, and your correct or incorrect answers are not recorded.

A suggestion for success with this app is that you practice by logging in once a day and practicing as much as you can that day.

## Contributing Packs

To have your pack included in the list of curated packs, you can create your own question pack and post it publicly on a GitHub gist. Afterward please submit a pull request to the `curated-packs-list.ts` file in this repository. Please ensure that your pack is well-tested and follows the guidelines for creating question packs. A sample pack is included in the `curated-packs-list.ts` file for reference.

## Privacy

This app was designed with a privacy-first approach. It does not collect any personal data or track your usage. All data is stored locally on your device, and you have full control over your data and settings.

The app only requires an internet connection to download, initialize and/or update questions. All other functionality is available offline. You can use the app without creating an account or providing any personal information.

This app is provided free of charge. There is no user registration, no ads, in-app purchases, or subscriptions.

## Runtime Environment

- **Expo SDK 57**, **Node.js v22+**, and **npm** (this repo uses `package-lock.json`, not yarn/pnpm).
- **Expo Go is not supported.** This app depends on `expo-dev-client` and native-only APIs (`@expo/ui`, `expo-router/unstable-native-tabs`, Reanimated 4 + Worklets), so you'll need a custom development build via `npx expo run:ios` / `npx expo run:android`, or an EAS development build.
- **iOS:** latest Xcode. CocoaPods is only needed if you build the dev client locally via `npx expo run:ios` (it runs `pod install` as part of that); not needed if you install a dev client built via EAS Build instead.
- **Android:** latest Android Studio / SDK.
- **EAS CLI ≥ 21.2.0** if running cloud builds (pinned in `eas.json`).
- **Watchman** recommended on macOS for Metro's file watching.

## Contributions

Pull requests or direct merges to the main branch are not allowed. To contribute, please clone the repository, create your branch and submit a pull request to the dev branch for review.

## License

This software is under the MIT license. Please see the LICENSE file in this repository.
