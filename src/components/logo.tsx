import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// Proportions below were measured off assets/images/shuhari-engine-logo__01.png
// (1080x1080) and are scaled relative to the ENGINE row, the widest line in the lockup.
const REFERENCE_WIDTH = 434;

export type LogoProps = ViewProps & {
  /** Rendered width of the ENGINE row, in points. Everything else scales from this. */
  size?: number;
  themeColor?: ThemeColor;
  /** Literal color override, bypassing the light/dark theme lookup entirely. */
  color?: string;
};

export function Logo({
  size = 260,
  themeColor,
  color: colorOverride,
  style,
  ...rest
}: LogoProps) {
  const theme = useTheme();
  const color = colorOverride ?? theme[themeColor ?? "text"];
  const scale = size / REFERENCE_WIDTH;

  return (
    <View style={[styles.container, style]} {...rest}>
      <Text
        style={{
          fontFamily: "NotoSansJP_400Regular",
          color,
          fontSize: 152 * scale,
          lineHeight: 172 * scale,
          letterSpacing: 13 * scale,
          marginBottom: -18 * scale,
        }}
      >
        守破離
      </Text>
      <Text
        style={{
          fontFamily: "NotoSansJP_400Regular",
          color: "#c42828",
          fontSize: 38 * scale,
          lineHeight: 42 * scale,
          letterSpacing: 13 * scale,
        }}
      >
        SHU HA RI
      </Text>
      <Text
        style={{
          fontFamily: "NotoSansJP_900Black",
          color,
          fontSize: 128 * scale,
          lineHeight: 138 * scale,
        }}
      >
        ENGINE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    minWidth: 200,
    minHeight: 200,
  },
});
