import { createFileRoute } from "@tanstack/react-router";
import { ExplorePage } from "@/web/pages/ExplorePage";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/explore")({
  head: () =>
    webHead(
      "პროგრამების ძიება",
      "აღმოაჩინე დემო სასწავლო პროგრამები, მოთხოვნები და შენს ქულებზე მორგებული შეფასებები.",
    ),
  component: ExplorePage,
});
