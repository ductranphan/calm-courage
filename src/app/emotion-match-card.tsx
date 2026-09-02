/**
 * Emotion Match card route — lazy-loads the heavy card deck screen.
 */

import LazyRouteScreen from "@/components/routing/LazyRouteScreen";

export default function EmotionMatchCardRoute() {
  return (
    <LazyRouteScreen
      loader={() =>
        import("@/screens/EmotionMatchCardScreen")
      }
    />
  );
}
