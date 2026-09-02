/**
 * Scenario card route — lazy-loads the heavy card deck screen.
 */

import LazyRouteScreen from "@/components/routing/LazyRouteScreen";

export default function ScenarioCardRoute() {
  return (
    <LazyRouteScreen
      loader={() =>
        import("@/screens/ScenarioCardScreen")
      }
    />
  );
}
