import { createFileRoute } from "@tanstack/react-router";
import { ShareBoard } from "@/components/analytics/share-board";

export const Route = createFileRoute("/s/$token")({
  component: SharePage,
});

function SharePage() {
  const { token } = Route.useParams();
  return <ShareBoard token={token} />;
}
