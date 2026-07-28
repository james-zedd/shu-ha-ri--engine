# Shu Ha Ri - Engine

An adaptable educational tool.

## Concept and Explanation

Shu Ha Ri is a Japanese learning concept and discipline. The earliest attribution of Shu Ha Ri is given to Sen No Rikyū, a 16th century Japanese tea ceremony master and poet.

Shu Ha Ri embodies the idea that learning comes in three stages:

Shu (守) - Fundamentals, traditional wisdom, heuristics

Ha (破) - Detachment from traditional rules, finding new approaches, application in new ways

Ri (離) - No fundamentals, no rules, everything is a natural response

## Goals

This application should be used in tandem with a JSON file that will have questions and/or challenges for the user. It is recommended to make the most of this, the user should open the application daily and complete an assignment they define for their learning.

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
