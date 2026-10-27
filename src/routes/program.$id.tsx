import { createFileRoute } from "@tanstack/react-router";
import { ProgramPage } from "@/web/pages/ProgramPage";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/program/$id")({
  head: ({ params }) =>
    webHead(
      "პროგრამის დეტალები " + params.id,
      "ChemiUni დემო ინფორმაცია, მოთხოვნები და სასწავლო დაგეგმვა.",
    ),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ProgramPage id={id} />;
}
