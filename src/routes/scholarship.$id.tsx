import { createFileRoute } from "@tanstack/react-router";
import { ScholarshipPage } from "@/web/pages/ScholarshipPage";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/scholarship/$id")({
  head: ({ params }) =>
    webHead(
      "სტიპენდიის დეტალები " + params.id,
      "ChemiUni დემო ინფორმაცია, მოთხოვნები და სასწავლო დაგეგმვა.",
    ),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ScholarshipPage id={id} />;
}
