import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/analytics/dashboard";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Dashboard />;
}
