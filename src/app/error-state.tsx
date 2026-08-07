/**
 * Temporary route used to preview the reusable child-mode error screen.
 *
 * The real Rewards and Workbook pages render ErrorStateScreen directly
 * when their Firebase requests fail.
 */

import { router } from "expo-router";

import ErrorStateScreen from "@/components/ui/ErrorStateScreen";

export default function ErrorStatePage() {
  return (
    <ErrorStateScreen
      activeTab="rewards"
      onRetry={() => {
        router.replace("/rewards");
      }}
    />
  );
}