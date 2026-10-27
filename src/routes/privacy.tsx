import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeading } from "@/web/layout/AppShell";
import { webHead } from "@/web/lib/page-head";
export const Route = createFileRoute("/privacy")({
  head: () =>
    webHead(
      "კონფიდენციალურობა",
      "როგორ ინახავს ChemiUni შენს პროფილს და იყენებს კონსულტანტის კონტექსტს.",
    ),
  component: Privacy,
});
function Privacy() {
  return (
    <>
      <PageHeading title="კონფიდენციალურობა" />
      <section className="max-w-2xl space-y-6 leading-relaxed">
        <p>
          ქულები, პრიორიტეტები, სიები და საუბრები ინახება ამ ბრაუზერში. ტელეფონის აპთან ავტომატური
          სინქრონიზაცია არ ხდება.
        </p>
        <p>
          AI კონსულტანტთან შეტყობინების გაგზავნისას შენი ქულები, სასწავლო პრიორიტეტები, სია და ბოლო
          საუბრის კონტექსტი იგზავნება დაცულ სერვისში. კავშირისთვის იქმნება ანონიმური სტუმრის სესია.
        </p>
        <p>
          დემო PIN და კონსულტანტის წვდომის დროებითი ნიშნული არ ინახება პროფილში ან ბრაუზერის მუდმივ
          მეხსიერებაში.
        </p>
        <p>
          შენახული მონაცემების წაშლა შეგიძლია{" "}
          <Link to="/profile" className="text-primary underline">
            პროფილიდან
          </Link>
          . ბრაუზერის მონაცემების წაშლაც წაშლის შენს ადგილობრივ პროფილს.
        </p>
        <p>
          უნივერსიტეტები, სტიპენდიები და შეფასებები გამოიყენება დემონსტრაციისთვის; მიღების ან
          დაფინანსების გარანტიას არ წარმოადგენს.
        </p>
      </section>
    </>
  );
}
