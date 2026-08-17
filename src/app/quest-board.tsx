import { Redirect } from "expo-router";

export default function QuestBoardDisabledRoute() {
  return (
    <Redirect href="/child-dashboard" />
  );
}