import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/web/pages/HomePage";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/home")({
  head: () => webHead("მთავარი", "შენი პერსონალური სასწავლო გზა საქართველოში ან უცხოეთში."),
  component: HomePage,
});
