import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/web/pages/WelcomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChemiUni · შენი სასწავლო გზა" },
      {
        name: "description",
        content:
          "პერსონალური უნივერსიტეტების სია საქართველოში და უცხოეთში, სტიპენდიები და სასწავლო დაგეგმვა.",
      },
      { property: "og:title", content: "ChemiUni · შენი სასწავლო გზა" },
      {
        property: "og:description",
        content: "აირჩიე სწავლა საქართველოში ან უცხოეთში და დაგეგმე შენი შემდეგი ნაბიჯი.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WelcomePage,
});
