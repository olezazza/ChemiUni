import { type Scholarship } from "./abroad-data";

// Illustrative planning checklists only, not verified terms of named providers.
const GUIDES: Record<string, string> = {
  daad: "https://www.daad.de/en/",
  deutschland: "https://www.deutschlandstipendium.de/",
  hungaricum: "https://stipendiumhungaricum.hu/",
  erasmus: "https://erasmus-plus.ec.europa.eu/",
  "italy-dsu": "https://www.universitaly.it/",
  "nawa-banach": "https://nawa.gov.pl/en/",
  fulbright: "https://foreign.fulbrightonline.org/",
  mext: "https://www.studyinjapan.go.jp/en/",
  gks: "https://www.studyinkorea.go.kr/",
};

export function scholarshipDetails(s: Scholarship) {
  return {
    coverage: [
      { label: "სწავლის საფასური", value: s.awardType === "full-ride" ? "სრული დაფარვა (დემო)" : s.awardType === "tuition" ? "საფასურის შეღავათი ჯილდოს ოდენობის ფარგლებში (დემო)" : "არ შედის ამ დემო სტიპენდიაში" },
      { label: "სტიპენდია / საცხოვრებელი", value: s.awardType === "tuition" ? "არ შედის ამ დემო შეთავაზებაში" : "ფინანსური დახმარება მითითებული დემო ჯილდოს ფარგლებში; საცხოვრებლის ცალკე ოდენობა უცნობია" },
      { label: "მგზავრობა", value: s.id === "chemiuni-travel" ? "მგზავრობის ხარჯები — დემო გრანტის ფარგლებში" : "დაფარვა არ არის მითითებული — გადაამოწმე პირობები" },
      { label: "დაზღვევა", value: "დაფარვა არ არის მითითებული — გადაამოწმე პირობები" },
    ],
    eligibility: [s.eligibility, s.forGeorgians ? "საქართველოს მოქალაქეები ამ დემო მაგალითის სამიზნე ჯგუფში შედიან; რეალური ქვეყნის, ასაკისა და საფეხურის შეზღუდვები ოფიციალურად გადაამოწმე." : "საქართველოს მოქალაქეების უფლებამოსილება ამ დემო მაგალითში არ არის დადასტურებული."],
    documents: ["პასპორტი / მოქალაქეობის დამადასტურებელი საბუთი", "ატესტატი ან მიმდინარე ნიშნების ამონაწერი და საჭირო თარგმანი", "მოტივაციის წერილი და CV", "ენის გამოცდის ქულა, თუ პროგრამა მოითხოვს", ...(s.id.includes("need") || s.id === "italy-dsu" ? ["ოჯახის შემოსავლისა და ფინანსური საჭიროების საბუთები"] : ["რეკომენდაცია ან ნომინაცია, თუ კონკურსი მოითხოვს"])],
    steps: ["ჯერ გადაამოწმე ოფიციალურ განცხადებაში საქართველოს მოქალაქეობა და სასწავლო საფეხური.", "განაცხადის პორტალზე დააზუსტე ვადა, თარგმანები და დაფინანსების მოცულობა.", "ცალ-ცალკე გადაამოწმე უნივერსიტეტისა და სტიპენდიის განაცხადები; მიღება დაფინანსებას არ ნიშნავს."],
    url: GUIDES[s.id] ?? null,
  };
}