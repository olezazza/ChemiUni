import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "@/web/components/ProfileForm";
import { useWebStore } from "@/web/lib/store";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/profile")({
  head: () =>
    webHead("შენი პროფილი", "ქულები, სასწავლო ინტერესები, ბიუჯეტი და ChemiUni პარამეტრები."),
  component: Page,
});
function Page() {
  const s = useWebStore();
  return <ProfileForm key={s.mode} setup={false} />;
}
