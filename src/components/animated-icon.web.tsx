/**
 * Web has no native splash screen to hand off from, so the overlay renders
 * nothing. The export exists to satisfy the import in `_layout.tsx`, which is
 * shared across platforms.
 */
export function AnimatedSplashOverlay() {
  return null;
}
