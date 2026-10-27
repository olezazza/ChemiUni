import { createFileRoute } from "@tanstack/react-router";
import { ListPage } from "@/web/pages/ListPage";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/my-list")({
  head: () =>
    webHead("ჩემი სია და პორტფოლიო", "შენი უნივერსიტეტების სია, განაცხადები და ბიუჯეტის გეგმა."),
  component: ListPage,
});
