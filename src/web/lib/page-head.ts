export function webHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} · ChemiUni` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} · ChemiUni` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
