// Import each weight by subpath, not from the package root. The root index.js
// require()s all nine weights, and Metro bundles every require()d asset whether
// or not it is referenced — collapsing these adds ~37MB of unused fonts.
import { NotoSansJP_400Regular } from "@expo-google-fonts/noto-sans-jp/400Regular";
import { NotoSansJP_900Black } from "@expo-google-fonts/noto-sans-jp/900Black";
import { useFonts } from "@expo-google-fonts/noto-sans-jp/useFonts";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useTheme } from "@/hooks/use-theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    NotoSansJP_400Regular,
    NotoSansJP_900Black,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerTintColor: theme.text,
          headerStyle: { backgroundColor: theme.background },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="training" options={{ title: "Training" }} />
        <Stack.Screen
          name="session"
          options={{ title: "Session", headerBackVisible: false }}
        />
        <Stack.Screen name="storage" options={{ title: "Storage Data" }} />
        <Stack.Screen name="packs" options={{ title: "Packs" }} />
        <Stack.Screen name="about" options={{ title: "About" }} />
      </Stack>
    </ThemeProvider>
  );
}
