import { createFileRoute } from "@tanstack/react-router";
import { CounselorPage } from "@/web/pages/CounselorPage";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/counselor")({
  head: () =>
    webHead(
      "AI კონსულტანტი",
      "PIN-ით დაცული პერსონალური კონსულტაცია და ინდივიდუალურად დასამტკიცებელი სასწავლო შეთავაზებები.",
    ),
  component: CounselorPage,
});
