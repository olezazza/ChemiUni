import { createFileRoute } from "@tanstack/react-router";
import { ScholarshipsPage } from "@/web/pages/ScholarshipsPage";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/scholarships")({
  head: () =>
    webHead("სტიპენდიები", "საერთაშორისო დაფინანსების დემო კატალოგი და განაცხადის დოკუმენტები."),
  component: ScholarshipsPage,
});
