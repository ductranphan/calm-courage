/**
 * Defers loading a screen module until the route is opened.
 *
 * Keeps heavy asset graphs (large SVG card decks, etc.) out of the
 * initial Expo Router bundle so Expo Go can start on lower-memory devices.
 */

import {
  lazy,
  Suspense,
  type ComponentType,
} from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";

type LazyRouteScreenProps = {
  loader: () => Promise<{
    default: ComponentType;
  }>;
};

export default function LazyRouteScreen({
  loader,
}: LazyRouteScreenProps) {
  const Screen = lazy(loader);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Screen />
    </Suspense>
  );
}
