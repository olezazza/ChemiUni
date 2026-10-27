// Centralized DEMO dataset for Abroad Mode. All tuition, acceptance rates, requirements,
// deadlines and scholarship figures are fictional and illustrative — not official university,
// government or scholarship-provider data.

import type { FieldId } from "./data";

export type AbroadCountry = { id: string; name: string; flag: string };

export const ABROAD_COUNTRIES: AbroadCountry[] = [
  { id: "de", name: "გერმანია", flag: "🇩🇪" },
  { id: "nl", name: "ნიდერლანდები", flag: "🇳🇱" },
  { id: "it", name: "იტალია", flag: "🇮🇹" },
  { id: "hu", name: "უნგრეთი", flag: "🇭🇺" },
  { id: "pl", name: "პოლონეთი", flag: "🇵🇱" },
  { id: "uk", name: "დიდი ბრიტანეთი", flag: "🇬🇧" },
  { id: "us", name: "აშშ", flag: "🇺🇸" },
  { id: "ca", name: "კანადა", flag: "🇨🇦" },
  { id: "jp", name: "იაპონია", flag: "🇯🇵" },
  { id: "kr", name: "სამხრეთ კორეა", flag: "🇰🇷" },
  { id: "sg", name: "სინგაპური", flag: "🇸🇬" },
];
export type AbroadCountryId = (typeof ABROAD_COUNTRIES)[number]["id"];

export const countryById = (id: string): AbroadCountry =>
  ABROAD_COUNTRIES.find((c) => c.id === id) ?? { id, name: id, flag: "🌍" };

export type AbroadUniversity = { id: string; name: string; short: string; countryId: AbroadCountryId; city: string };

export const ABROAD_UNIVERSITIES: AbroadUniversity[] = [
  // Germany
  { id: "tum", name: "მიუნხენის ტექნიკური უნივერსიტეტი", short: "TUM", countryId: "de", city: "მიუნხენი" },
  { id: "lmu", name: "მიუნხენის ლუდვიგ-მაქსიმილიანის უნივერსიტეტი", short: "LMU", countryId: "de", city: "მიუნხენი" },
  { id: "rwth", name: "აქენის ტექნიკური უნივერსიტეტი", short: "RWTH", countryId: "de", city: "აქენი" },
  { id: "heidelberg", name: "ჰაიდელბერგის უნივერსიტეტი", short: "Heidelberg", countryId: "de", city: "ჰაიდელბერგი" },
  { id: "tuberlin", name: "ბერლინის ტექნიკური უნივერსიტეტი", short: "TU Berlin", countryId: "de", city: "ბერლინი" },
  { id: "humboldt", name: "ბერლინის ჰუმბოლდტის უნივერსიტეტი", short: "Humboldt", countryId: "de", city: "ბერლინი" },
  { id: "kit", name: "კარლსრუეს ტექნოლოგიური ინსტიტუტი", short: "KIT", countryId: "de", city: "კარლსრუე" },
  { id: "mannheim", name: "მანჰაიმის უნივერსიტეტი", short: "Mannheim", countryId: "de", city: "მანჰაიმი" },
  // Netherlands
  { id: "tudelft", name: "დელფტის ტექნიკური უნივერსიტეტი", short: "TU Delft", countryId: "nl", city: "დელფტი" },
  { id: "uva", name: "ამსტერდამის უნივერსიტეტი", short: "UvA", countryId: "nl", city: "ამსტერდამი" },
  { id: "utrecht", name: "უტრექტის უნივერსიტეტი", short: "Utrecht", countryId: "nl", city: "უტრექტი" },
  { id: "maastricht", name: "მაასტრიხტის უნივერსიტეტი", short: "Maastricht", countryId: "nl", city: "მაასტრიხტი" },
  { id: "leiden", name: "ლეიდენის უნივერსიტეტი", short: "Leiden", countryId: "nl", city: "ლეიდენი" },
  // Italy
  { id: "bologna", name: "ბოლონიის უნივერსიტეტი", short: "Unibo", countryId: "it", city: "ბოლონია" },
  { id: "sapienza", name: "რომის საპიენცას უნივერსიტეტი", short: "Sapienza", countryId: "it", city: "რომი" },
  { id: "polimi", name: "მილანის პოლიტექნიკური უნივერსიტეტი", short: "PoliMi", countryId: "it", city: "მილანი" },
  { id: "padua", name: "პადუის უნივერსიტეტი", short: "Padua", countryId: "it", city: "პადუა" },
  { id: "unimi", name: "მილანის უნივერსიტეტი", short: "UniMi", countryId: "it", city: "მილანი" },
  // Hungary
  { id: "elte", name: "ბუდაპეშტის ეტვიშ ლორანდის უნივერსიტეტი", short: "ELTE", countryId: "hu", city: "ბუდაპეშტი" },
  { id: "bme", name: "ბუდაპეშტის ტექნოლოგიისა და ეკონომიკის უნივერსიტეტი", short: "BME", countryId: "hu", city: "ბუდაპეშტი" },
  { id: "debrecen", name: "დებრეცენის უნივერსიტეტი", short: "Debrecen", countryId: "hu", city: "დებრეცენი" },
  { id: "szeged", name: "სეგედის უნივერსიტეტი", short: "Szeged", countryId: "hu", city: "სეგედი" },
  // Poland
  { id: "uw", name: "ვარშოვის უნივერსიტეტი", short: "UW", countryId: "pl", city: "ვარშოვა" },
  { id: "jagiellonian", name: "კრაკოვის იაგელონების უნივერსიტეტი", short: "UJ", countryId: "pl", city: "კრაკოვი" },
  { id: "warsawtech", name: "ვარშოვის ტექნიკური უნივერსიტეტი", short: "PW", countryId: "pl", city: "ვარშოვა" },
  { id: "agh", name: "კრაკოვის სამთო-მეტალურგიული აკადემია", short: "AGH", countryId: "pl", city: "კრაკოვი" },
  // UK
  { id: "oxford", name: "ოქსფორდის უნივერსიტეტი", short: "Oxford", countryId: "uk", city: "ოქსფორდი" },
  { id: "cambridge", name: "კემბრიჯის უნივერსიტეტი", short: "Cambridge", countryId: "uk", city: "კემბრიჯი" },
  { id: "imperial", name: "ლონდონის იმპერიალ კოლეჯი", short: "Imperial", countryId: "uk", city: "ლონდონი" },
  { id: "ucl", name: "ლონდონის უნივერსიტეტური კოლეჯი", short: "UCL", countryId: "uk", city: "ლონდონი" },
  { id: "edinburgh", name: "ედინბურგის უნივერსიტეტი", short: "Edinburgh", countryId: "uk", city: "ედინბურგი" },
  { id: "manchester", name: "მანჩესტერის უნივერსიტეტი", short: "Manchester", countryId: "uk", city: "მანჩესტერი" },
  // US
  { id: "mit", name: "მასაჩუსეტსის ტექნოლოგიური ინსტიტუტი", short: "MIT", countryId: "us", city: "კემბრიჯი" },
  { id: "stanford", name: "სტენფორდის უნივერსიტეტი", short: "Stanford", countryId: "us", city: "სტენფორდი" },
  { id: "harvard", name: "ჰარვარდის უნივერსიტეტი", short: "Harvard", countryId: "us", city: "კემბრიჯი" },
  { id: "berkeley", name: "კალიფორნიის უნივერსიტეტი ბერკლიში", short: "UC Berkeley", countryId: "us", city: "ბერკლი" },
  { id: "gatech", name: "ჯორჯიის ტექნოლოგიური ინსტიტუტი", short: "Georgia Tech", countryId: "us", city: "ატლანტა" },
  { id: "utaustin", name: "ტეხასის უნივერსიტეტი ოსტინში", short: "UT Austin", countryId: "us", city: "ოსტინი" },
  // Canada
  { id: "toronto", name: "ტორონტოს უნივერსიტეტი", short: "UofT", countryId: "ca", city: "ტორონტო" },
  { id: "ubc", name: "ბრიტანეთის კოლუმბიის უნივერსიტეტი", short: "UBC", countryId: "ca", city: "ვანკუვერი" },
  { id: "mcgill", name: "მაკგილის უნივერსიტეტი", short: "McGill", countryId: "ca", city: "მონრეალი" },
  { id: "waterloo", name: "ვოტერლოს უნივერსიტეტი", short: "Waterloo", countryId: "ca", city: "ვოტერლო" },
  { id: "alberta", name: "ალბერტას უნივერსიტეტი", short: "Alberta", countryId: "ca", city: "ედმონტონი" },
  // Asia
  { id: "utokyo", name: "ტოკიოს უნივერსიტეტი", short: "UTokyo", countryId: "jp", city: "ტოკიო" },
  { id: "kyoto", name: "კიოტოს უნივერსიტეტი", short: "Kyoto", countryId: "jp", city: "კიოტო" },
  { id: "snu", name: "სეულის ეროვნული უნივერსიტეტი", short: "SNU", countryId: "kr", city: "სეული" },
  { id: "kaist", name: "კორეის მეცნიერებისა და ტექნოლოგიის ინსტიტუტი", short: "KAIST", countryId: "kr", city: "ტეჯონი" },
  { id: "nus", name: "სინგაპურის ეროვნული უნივერსიტეტი", short: "NUS", countryId: "sg", city: "სინგაპური" },
];

const uniMap = new Map(ABROAD_UNIVERSITIES.map((u) => [u.id, u]));
export const abroadUniversityById = (id: string): AbroadUniversity =>
  uniMap.get(id) ?? { id, name: "უცნობი უნივერსიტეტი", short: id, countryId: "de", city: "" };

/** Minimum exam requirements. english: any ONE of the listed tests satisfies it. */
export type AbroadReqs = {
  english?: { ielts?: number; toefl?: number; duolingo?: number };
  sat?: number;
  act?: number;
  gpa?: number;
};

export type AbroadProgram = {
  id: string;
  universityId: string;
  name: string;
  field: FieldId;
  degree: string;
  /** 100% English-taught. */
  english: boolean;
  /** Demo annual tuition, USD. */
  tuitionUsd: number;
  years: number;
  /** Demo acceptance rate, percent. */
  acceptanceRate: number;
  reqs: AbroadReqs;
  /** Demo application fee, USD. */
  appFeeUsd: number;
  /** Demo application deadline, ISO date. */
  deadline: string;
  blurb: string;
};

const FIELD_BLURB: Record<FieldId, string> = {
  cs: "პროგრამირება, ალგორითმები და პრაქტიკული პროექტები.",
  business: "მენეჯმენტი, ფინანსები და საერთაშორისო ბიზნესკეისები.",
  medicine: "ბიომედიცინური საფუძვლები და კლინიკური პრაქტიკა.",
  law: "საერთაშორისო და შედარებითი სამართლის კურსები.",
  engineering: "ინჟინერული დიზაინი და ლაბორატორიული მუშაობა.",
  psychology: "ქცევის მეცნიერება და კვლევითი მეთოდები.",
  ir: "დიპლომატია, პოლიტიკური ანალიზი და გლობალური პროცესები.",
  math: "მათემატიკური ანალიზი, სტატისტიკა და მონაცემთა მეცნიერება.",
  design: "არქიტექტურული და ვიზუალური დიზაინის სტუდიები.",
  science: "ექსპერიმენტული მეცნიერება და კვლევითი ლაბორატორიები.",
  education: "პედაგოგიკა და საგანმანათლებლო კვლევა.",
  social: "სოციალური კვლევა და საზოგადოებრივი პოლიტიკა.",
  agriculture: "აგროტექნოლოგიები და მდგრადი წარმოება.",
  environment: "კლიმატი, ეკოლოგია და მდგრადი განვითარება.",
  media: "მედიაწარმოება, ჟურნალისტიკა და ვიზუალური ხელოვნება.",
};

const p = (
  id: string,
  universityId: string,
  name: string,
  field: FieldId,
  english: boolean,
  tuitionUsd: number,
  years: number,
  acceptanceRate: number,
  reqs: AbroadReqs,
  appFeeUsd: number,
  deadline: string,
): AbroadProgram => ({
  id,
  universityId,
  name,
  field,
  degree: "ბაკალავრი",
  english,
  tuitionUsd,
  years,
  acceptanceRate,
  reqs,
  appFeeUsd,
  deadline,
  blurb: FIELD_BLURB[field],
});

const EN_TOP = { ielts: 7, toefl: 100, duolingo: 130 };
const EN_MID = { ielts: 6.5, toefl: 90, duolingo: 115 };
const EN_LOW = { ielts: 6, toefl: 80, duolingo: 105 };

export const ABROAD_PROGRAMS: AbroadProgram[] = [
  // ── Germany ──
  p("tum-cs", "tum", "კომპიუტერული მეცნიერებები", "cs", true, 600, 3, 12, { english: EN_MID, gpa: 3.5 }, 75, "2027-03-15"),
  p("tum-eng", "tum", "ელექტროინჟინერია", "engineering", true, 600, 3, 15, { english: EN_MID, gpa: 3.4 }, 75, "2027-03-15"),
  p("tum-math", "tum", "მათემატიკა და მონაცემთა მეცნიერება", "math", true, 600, 3, 18, { english: EN_MID, gpa: 3.3 }, 75, "2027-03-15"),
  p("lmu-psych", "lmu", "ფსიქოლოგია", "psychology", true, 300, 3, 20, { english: EN_MID, gpa: 3.2 }, 75, "2027-04-30"),
  p("lmu-ir", "lmu", "საერთაშორისო ურთიერთობები", "ir", true, 300, 3, 22, { english: EN_MID, gpa: 3.1 }, 75, "2027-04-30"),
  p("lmu-sci", "lmu", "ბიოლოგია", "science", false, 300, 3, 25, { gpa: 3.0 }, 75, "2027-04-30"),
  p("rwth-eng", "rwth", "მექანიკური ინჟინერია", "engineering", true, 500, 3, 22, { english: EN_MID, gpa: 3.2 }, 75, "2027-03-01"),
  p("rwth-cs", "rwth", "გამოთვლითი მეცნიერება", "cs", true, 500, 3, 18, { english: EN_MID, gpa: 3.3 }, 75, "2027-03-01"),
  p("heidelberg-med", "heidelberg", "ბიომედიცინა", "medicine", true, 500, 3, 8, { english: EN_TOP, gpa: 3.7 }, 75, "2027-02-28"),
  p("heidelberg-sci", "heidelberg", "ფიზიკა", "science", false, 500, 3, 30, { gpa: 3.0 }, 75, "2027-02-28"),
  p("tuberlin-cs", "tuberlin", "კომპიუტერული ინჟინერია", "cs", true, 400, 3, 25, { english: EN_LOW, gpa: 3.0 }, 75, "2027-04-15"),
  p("tuberlin-design", "tuberlin", "არქიტექტურა", "design", true, 400, 3, 20, { english: EN_MID, gpa: 3.1 }, 75, "2027-04-15"),
  p("humboldt-law", "humboldt", "სამართალი", "law", false, 300, 3, 15, { gpa: 3.4 }, 75, "2027-05-31"),
  p("humboldt-social", "humboldt", "სოციალური მეცნიერებები", "social", true, 300, 3, 28, { english: EN_LOW, gpa: 3.0 }, 75, "2027-05-31"),
  p("kit-cs", "kit", "ინფორმატიკა", "cs", true, 500, 3, 24, { english: EN_MID, gpa: 3.1 }, 75, "2027-03-31"),
  p("kit-eng", "kit", "სამშენებლო ინჟინერია", "engineering", true, 500, 3, 30, { english: EN_LOW, gpa: 2.9 }, 75, "2027-03-31"),
  p("mannheim-bus", "mannheim", "ბიზნესის ადმინისტრირება", "business", true, 500, 3, 18, { english: EN_MID, gpa: 3.3 }, 75, "2027-04-30"),
  p("mannheim-econ", "mannheim", "ეკონომიკა", "business", true, 500, 3, 22, { english: EN_MID, gpa: 3.2 }, 75, "2027-04-30"),
  // ── Netherlands ──
  p("tudelft-eng", "tudelft", "საავიაციო ინჟინერია", "engineering", true, 15500, 3, 14, { english: EN_MID, gpa: 3.4 }, 100, "2027-01-15"),
  p("tudelft-cs", "tudelft", "კომპიუტერული მეცნიერება და ინჟინერია", "cs", true, 15500, 3, 16, { english: EN_MID, gpa: 3.4 }, 100, "2027-01-15"),
  p("tudelft-design", "tudelft", "ინდუსტრიული დიზაინი", "design", true, 15500, 3, 20, { english: EN_MID, gpa: 3.2 }, 100, "2027-01-15"),
  p("uva-psych", "uva", "ფსიქოლოგია", "psychology", true, 13500, 3, 25, { english: EN_MID, gpa: 3.1 }, 100, "2027-02-01"),
  p("uva-media", "uva", "მედია და კომუნიკაცია", "media", true, 13000, 3, 30, { english: EN_LOW, gpa: 3.0 }, 100, "2027-02-01"),
  p("uva-bus", "uva", "ეკონომიკა და ბიზნესი", "business", true, 13500, 3, 22, { english: EN_MID, gpa: 3.2 }, 100, "2027-02-01"),
  p("utrecht-cs", "utrecht", "კომპიუტერული მეცნიერებები", "cs", true, 14000, 3, 24, { english: EN_MID, gpa: 3.1 }, 100, "2027-02-01"),
  p("utrecht-sci", "utrecht", "მოლეკულური ბიოლოგია", "science", true, 14000, 3, 26, { english: EN_MID, gpa: 3.1 }, 100, "2027-02-01"),
  p("maastricht-med", "maastricht", "ბიომედიცინური მეცნიერებები", "medicine", true, 14500, 3, 15, { english: EN_MID, gpa: 3.4 }, 100, "2027-01-15"),
  p("maastricht-ir", "maastricht", "ევროპული კვლევები", "ir", true, 13000, 3, 32, { english: EN_LOW, gpa: 2.9 }, 100, "2027-02-01"),
  p("leiden-law", "leiden", "საერთაშორისო სამართალი", "law", true, 14500, 3, 20, { english: EN_MID, gpa: 3.3 }, 100, "2027-01-15"),
  p("leiden-ir", "leiden", "პოლიტიკური მეცნიერება", "ir", true, 14000, 3, 26, { english: EN_MID, gpa: 3.1 }, 100, "2027-02-01"),
  // ── Italy ──
  p("bologna-bus", "bologna", "ბიზნესი და ეკონომიკა", "business", true, 3500, 3, 35, { english: EN_LOW, gpa: 2.8 }, 50, "2027-05-15"),
  p("bologna-media", "bologna", "კომუნიკაცია და მედია", "media", true, 3200, 3, 40, { english: EN_LOW, gpa: 2.7 }, 50, "2027-05-15"),
  p("sapienza-design", "sapienza", "არქიტექტურა", "design", true, 3000, 3, 30, { english: EN_LOW, gpa: 2.9 }, 50, "2027-04-30"),
  p("sapienza-sci", "sapienza", "გამოყენებითი ფიზიკა", "science", true, 3000, 3, 38, { english: EN_LOW, gpa: 2.8 }, 50, "2027-04-30"),
  p("polimi-eng", "polimi", "ინდუსტრიული ინჟინერია", "engineering", true, 3900, 3, 28, { english: EN_LOW, gpa: 3.0 }, 50, "2027-03-31"),
  p("polimi-design", "polimi", "დიზაინი", "design", true, 3900, 3, 25, { english: EN_LOW, gpa: 3.0 }, 50, "2027-03-31"),
  p("padua-psych", "padua", "ფსიქოლოგია", "psychology", true, 2800, 3, 32, { english: EN_LOW, gpa: 2.9 }, 50, "2027-05-31"),
  p("padua-agri", "padua", "აგრარული მეცნიერებები", "agriculture", true, 2600, 3, 45, { english: EN_LOW, gpa: 2.6 }, 50, "2027-05-31"),
  p("unimi-med", "unimi", "საერთაშორისო მედიცინა", "medicine", true, 4200, 6, 10, { english: EN_MID, gpa: 3.5 }, 50, "2027-03-15"),
  p("unimi-law", "unimi", "სამართალი", "law", false, 2800, 3, 35, { gpa: 2.9 }, 50, "2027-05-31"),
  // ── Hungary ──
  p("elte-cs", "elte", "კომპიუტერული მეცნიერებები", "cs", true, 6800, 3, 35, { english: EN_LOW, gpa: 2.8 }, 100, "2027-01-31"),
  p("elte-psych", "elte", "ფსიქოლოგია", "psychology", true, 6800, 3, 30, { english: EN_LOW, gpa: 2.9 }, 100, "2027-01-31"),
  p("elte-ir", "elte", "საერთაშორისო ურთიერთობები", "ir", true, 6500, 3, 38, { english: EN_LOW, gpa: 2.7 }, 100, "2027-01-31"),
  p("bme-eng", "bme", "ელექტროინჟინერია", "engineering", true, 7200, 3, 32, { english: EN_LOW, gpa: 2.8 }, 100, "2027-01-31"),
  p("bme-cs", "bme", "პროგრამული უზრუნველყოფა", "cs", true, 7200, 3, 28, { english: EN_LOW, gpa: 2.9 }, 100, "2027-01-31"),
  p("debrecen-med", "debrecen", "მედიცინა", "medicine", true, 16000, 6, 18, { english: EN_MID, gpa: 3.2 }, 100, "2027-01-31"),
  p("debrecen-bus", "debrecen", "ბიზნესის ადმინისტრირება", "business", true, 6500, 3, 42, { english: EN_LOW, gpa: 2.6 }, 100, "2027-01-31"),
  p("szeged-sci", "szeged", "ბიოტექნოლოგია", "science", true, 6200, 3, 40, { english: EN_LOW, gpa: 2.7 }, 100, "2027-01-31"),
  p("szeged-edu", "szeged", "განათლების მეცნიერებები", "education", true, 5800, 3, 48, { english: EN_LOW, gpa: 2.5 }, 100, "2027-01-31"),
  // ── Poland ──
  p("uw-ir", "uw", "საერთაშორისო ურთიერთობები", "ir", true, 4500, 3, 30, { english: EN_LOW, gpa: 2.9 }, 75, "2027-04-15"),
  p("uw-cs", "uw", "ინფორმატიკა", "cs", true, 4800, 3, 26, { english: EN_LOW, gpa: 3.0 }, 75, "2027-04-15"),
  p("jagiellonian-sci", "jagiellonian", "ბიოლოგია", "science", true, 4000, 3, 38, { english: EN_LOW, gpa: 2.7 }, 75, "2027-04-30"),
  p("jagiellonian-law", "jagiellonian", "საერთაშორისო სამართალი", "law", true, 4200, 3, 28, { english: EN_MID, gpa: 3.0 }, 75, "2027-04-30"),
  p("warsawtech-eng", "warsawtech", "მექანიკური ინჟინერია", "engineering", true, 4600, 3, 30, { english: EN_LOW, gpa: 2.9 }, 75, "2027-04-15"),
  p("warsawtech-cs", "warsawtech", "კომპიუტერული ინჟინერია", "cs", true, 4800, 3, 24, { english: EN_LOW, gpa: 3.0 }, 75, "2027-04-15"),
  p("agh-eng", "agh", "სამთო ინჟინერია", "engineering", true, 3800, 3, 42, { english: EN_LOW, gpa: 2.6 }, 75, "2027-04-30"),
  p("agh-env", "agh", "გარემოსდაცვითი ინჟინერია", "environment", true, 3800, 3, 45, { english: EN_LOW, gpa: 2.5 }, 75, "2027-04-30"),
  // ── United Kingdom ──
  p("oxford-cs", "oxford", "კომპიუტერული მეცნიერებები", "cs", true, 39000, 3, 7, { english: EN_TOP, gpa: 3.9 }, 90, "2027-01-14"),
  p("oxford-law", "oxford", "სამართალი", "law", true, 38000, 3, 8, { english: EN_TOP, gpa: 3.9 }, 90, "2027-01-14"),
  p("cambridge-eng", "cambridge", "ინჟინერია", "engineering", true, 39000, 3, 9, { english: EN_TOP, gpa: 3.9 }, 90, "2027-01-14"),
  p("cambridge-sci", "cambridge", "საბუნებისმეტყველო მეცნიერებები", "science", true, 39000, 3, 10, { english: EN_TOP, gpa: 3.8 }, 90, "2027-01-14"),
  p("imperial-cs", "imperial", "გამოთვლითი მეცნიერება", "cs", true, 39000, 3, 11, { english: EN_TOP, gpa: 3.8 }, 90, "2027-01-14"),
  p("imperial-med", "imperial", "ბიომედიცინა", "medicine", true, 39000, 3, 12, { english: EN_TOP, gpa: 3.7 }, 90, "2027-01-14"),
  p("ucl-design", "ucl", "არქიტექტურა", "design", true, 31000, 3, 18, { english: EN_MID, gpa: 3.5 }, 90, "2027-01-14"),
  p("ucl-psych", "ucl", "ფსიქოლოგია", "psychology", true, 32000, 3, 16, { english: EN_TOP, gpa: 3.6 }, 90, "2027-01-14"),
  p("edinburgh-cs", "edinburgh", "ხელოვნური ინტელექტი", "cs", true, 34000, 4, 20, { english: EN_MID, gpa: 3.4 }, 60, "2027-01-14"),
  p("edinburgh-env", "edinburgh", "გარემოს მეცნიერებები", "environment", true, 30000, 4, 30, { english: EN_MID, gpa: 3.2 }, 60, "2027-01-14"),
  p("manchester-bus", "manchester", "ბიზნესი და მენეჯმენტი", "business", true, 28000, 3, 28, { english: EN_MID, gpa: 3.2 }, 60, "2027-01-14"),
  p("manchester-eng", "manchester", "მატერიალთმცოდნეობა", "engineering", true, 29000, 3, 32, { english: EN_MID, gpa: 3.1 }, 60, "2027-01-14"),
  // ── United States ──
  p("mit-cs", "mit", "კომპიუტერული მეცნიერება და ინჟინერია", "cs", true, 62000, 4, 4, { english: EN_TOP, sat: 1520, gpa: 3.9 }, 75, "2027-01-01"),
  p("mit-eng", "mit", "მექანიკური ინჟინერია", "engineering", true, 62000, 4, 5, { english: EN_TOP, sat: 1500, gpa: 3.9 }, 75, "2027-01-01"),
  p("stanford-cs", "stanford", "კომპიუტერული მეცნიერებები", "cs", true, 65000, 4, 4, { english: EN_TOP, sat: 1520, gpa: 3.9 }, 90, "2027-01-05"),
  p("stanford-sci", "stanford", "ბიოინჟინერია", "science", true, 65000, 4, 5, { english: EN_TOP, sat: 1500, gpa: 3.8 }, 90, "2027-01-05"),
  p("harvard-social", "harvard", "სოციალური მეცნიერებები", "social", true, 63000, 4, 4, { english: EN_TOP, sat: 1500, gpa: 3.9 }, 85, "2027-01-01"),
  p("harvard-math", "harvard", "მათემატიკა", "math", true, 63000, 4, 5, { english: EN_TOP, sat: 1520, gpa: 3.9 }, 85, "2027-01-01"),
  p("berkeley-cs", "berkeley", "ელექტროინჟინერია და კომპიუტერული მეცნიერებები", "cs", true, 58000, 4, 11, { english: EN_MID, sat: 1450, gpa: 3.7 }, 80, "2026-11-30"),
  p("berkeley-env", "berkeley", "გარემოს მეცნიერებები", "environment", true, 56000, 4, 18, { english: EN_MID, gpa: 3.5 }, 80, "2026-11-30"),
  p("gatech-cs", "gatech", "კომპიუტერული მეცნიერებები", "cs", true, 52000, 4, 16, { english: EN_MID, sat: 1420, gpa: 3.6 }, 85, "2027-01-04"),
  p("gatech-eng", "gatech", "საინდუსტრიო ინჟინერია", "engineering", true, 52000, 4, 20, { english: EN_MID, sat: 1380, gpa: 3.5 }, 85, "2027-01-04"),
  p("utaustin-cs", "utaustin", "კომპიუტერული მეცნიერებები", "cs", true, 54000, 4, 18, { english: EN_MID, sat: 1400, gpa: 3.5 }, 90, "2026-12-01"),
  p("utaustin-bus", "utaustin", "ბიზნესი", "business", true, 54000, 4, 22, { english: EN_MID, sat: 1350, gpa: 3.4 }, 90, "2026-12-01"),
  // ── Canada ──
  p("toronto-cs", "toronto", "კომპიუტერული მეცნიერებები", "cs", true, 58000, 4, 18, { english: EN_MID, gpa: 3.6 }, 130, "2027-01-15"),
  p("toronto-eng", "toronto", "ინჟინერია", "engineering", true, 58000, 4, 20, { english: EN_MID, gpa: 3.5 }, 130, "2027-01-15"),
  p("ubc-sci", "ubc", "ტყის მეცნიერებები", "environment", true, 52000, 4, 30, { english: EN_MID, gpa: 3.3 }, 120, "2027-01-15"),
  p("ubc-cs", "ubc", "კომპიუტერული მეცნიერებები", "cs", true, 54000, 4, 22, { english: EN_MID, gpa: 3.5 }, 120, "2027-01-15"),
  p("mcgill-psych", "mcgill", "ფსიქოლოგია", "psychology", true, 46000, 4, 28, { english: EN_MID, gpa: 3.4 }, 110, "2027-01-15"),
  p("mcgill-law", "mcgill", "სამართლის საფუძვლები", "law", true, 48000, 4, 20, { english: EN_TOP, gpa: 3.6 }, 110, "2027-01-15"),
  p("waterloo-cs", "waterloo", "კომპიუტერული მეცნიერებები (კოოპ)", "cs", true, 56000, 4, 15, { english: EN_MID, gpa: 3.6 }, 125, "2027-02-01"),
  p("waterloo-math", "waterloo", "მათემატიკა", "math", true, 54000, 4, 20, { english: EN_MID, gpa: 3.5 }, 125, "2027-02-01"),
  p("alberta-eng", "alberta", "ნავთობის ინჟინერია", "engineering", true, 38000, 4, 35, { english: EN_LOW, gpa: 3.1 }, 100, "2027-03-01"),
  p("alberta-agri", "alberta", "აგრარული მეცნიერებები", "agriculture", true, 36000, 4, 45, { english: EN_LOW, gpa: 2.8 }, 100, "2027-03-01"),
  // ── Asia ──
  p("utokyo-eng", "utokyo", "ინჟინერია (ინგლისური პროგრამა)", "engineering", true, 5000, 4, 12, { english: EN_TOP, gpa: 3.6 }, 60, "2027-02-28"),
  p("utokyo-sci", "utokyo", "საბუნებისმეტყველო მეცნიერებები", "science", true, 5000, 4, 15, { english: EN_MID, gpa: 3.5 }, 60, "2027-02-28"),
  p("kyoto-cs", "kyoto", "ინფორმატიკა", "cs", true, 5000, 4, 18, { english: EN_MID, gpa: 3.4 }, 60, "2027-02-28"),
  p("kyoto-ir", "kyoto", "აზიის კვლევები", "ir", true, 5000, 4, 25, { english: EN_MID, gpa: 3.2 }, 60, "2027-02-28"),
  p("snu-cs", "snu", "კომპიუტერული ინჟინერია", "cs", true, 7000, 4, 15, { english: EN_MID, gpa: 3.5 }, 70, "2027-03-10"),
  p("snu-bus", "snu", "ბიზნესის ადმინისტრირება", "business", true, 7000, 4, 20, { english: EN_MID, gpa: 3.4 }, 70, "2027-03-10"),
  p("kaist-cs", "kaist", "კომპიუტერული მეცნიერებები", "cs", true, 8000, 4, 18, { english: EN_MID, gpa: 3.4 }, 80, "2027-03-31"),
  p("kaist-eng", "kaist", "რობოტიკა", "engineering", true, 8000, 4, 20, { english: EN_MID, gpa: 3.4 }, 80, "2027-03-31"),
  p("nus-cs", "nus", "კომპიუტერული მეცნიერებები", "cs", true, 38000, 4, 10, { english: EN_TOP, gpa: 3.7 }, 50, "2027-02-21"),
  p("nus-bus", "nus", "ბიზნესი", "business", true, 38000, 4, 14, { english: EN_TOP, gpa: 3.6 }, 50, "2027-02-21"),
  p("nus-design", "nus", "არქიტექტურა", "design", true, 36000, 4, 16, { english: EN_MID, gpa: 3.5 }, 50, "2027-02-21"),
];

ABROAD_PROGRAMS.push(
  // ── Germany: second wave ──
  p("tum-env", "tum", "გარემოსდაცვითი ინჟინერია", "environment", true, 600, 3, 20, { english: EN_MID, gpa: 3.2 }, 75, "2027-03-15"),
  p("lmu-media", "lmu", "კომუნიკაციის მეცნიერებები", "media", true, 300, 3, 28, { english: EN_LOW, gpa: 3.0 }, 75, "2027-04-30"),
  p("rwth-math", "rwth", "გამოყენებითი მათემატიკა", "math", true, 500, 3, 26, { english: EN_MID, gpa: 3.1 }, 75, "2027-03-01"),
  p("heidelberg-psych", "heidelberg", "ფსიქოლოგია", "psychology", true, 500, 3, 14, { english: EN_MID, gpa: 3.5 }, 75, "2027-02-28"),
  p("tuberlin-env", "tuberlin", "ენერგეტიკა და გარემო", "environment", true, 400, 3, 28, { english: EN_LOW, gpa: 2.9 }, 75, "2027-04-15"),
  p("humboldt-edu", "humboldt", "განათლების მეცნიერებები", "education", true, 300, 3, 35, { english: EN_LOW, gpa: 2.8 }, 75, "2027-05-31"),
  p("kit-math", "kit", "მათემატიკა", "math", true, 500, 3, 28, { english: EN_LOW, gpa: 3.0 }, 75, "2027-03-31"),
  p("mannheim-social", "mannheim", "სოციოლოგია", "social", true, 500, 3, 26, { english: EN_LOW, gpa: 3.0 }, 75, "2027-04-30"),
  // ── Netherlands: second wave ──
  p("tudelft-math", "tudelft", "გამოყენებითი მათემატიკა", "math", true, 15500, 3, 22, { english: EN_MID, gpa: 3.3 }, 100, "2027-01-15"),
  p("uva-law", "uva", "საერთაშორისო და ევროპული სამართალი", "law", true, 14000, 3, 18, { english: EN_MID, gpa: 3.4 }, 100, "2027-02-01"),
  p("utrecht-env", "utrecht", "გლობალური მდგრადობა", "environment", true, 14000, 3, 30, { english: EN_MID, gpa: 3.0 }, 100, "2027-02-01"),
  p("maastricht-bus", "maastricht", "საერთაშორისო ბიზნესი", "business", true, 13500, 3, 28, { english: EN_MID, gpa: 3.0 }, 100, "2027-02-01"),
  p("leiden-sci", "leiden", "ასტრონომია", "science", true, 14500, 3, 22, { english: EN_MID, gpa: 3.3 }, 100, "2027-02-01"),
  // ── Italy: second wave ──
  p("bologna-agri", "bologna", "აგრარული მეცნიერებები", "agriculture", true, 3000, 3, 42, { english: EN_LOW, gpa: 2.6 }, 50, "2027-05-15"),
  p("sapienza-med", "sapienza", "ჯანდაცვის მეცნიერებები", "medicine", true, 3200, 3, 20, { english: EN_MID, gpa: 3.2 }, 50, "2027-04-30"),
  p("polimi-math", "polimi", "მათემატიკური ინჟინერია", "math", true, 3900, 3, 26, { english: EN_LOW, gpa: 3.0 }, 50, "2027-03-31"),
  p("padua-media", "padua", "კომუნიკაცია", "media", true, 2600, 3, 44, { english: EN_LOW, gpa: 2.6 }, 50, "2027-05-31"),
  p("unimi-social", "unimi", "სოციალური მეცნიერებები", "social", true, 2800, 3, 40, { english: EN_LOW, gpa: 2.7 }, 50, "2027-05-31"),
  // ── Hungary: second wave ──
  p("elte-edu", "elte", "განათლება", "education", true, 5800, 3, 45, { english: EN_LOW, gpa: 2.5 }, 100, "2027-01-31"),
  p("bme-math", "bme", "მათემატიკა", "math", true, 6800, 3, 34, { english: EN_LOW, gpa: 2.8 }, 100, "2027-01-31"),
  p("debrecen-agri", "debrecen", "აგრარული მეცნიერებები", "agriculture", true, 6000, 3, 46, { english: EN_LOW, gpa: 2.5 }, 100, "2027-01-31"),
  p("szeged-med", "szeged", "მედიცინა", "medicine", true, 15500, 6, 16, { english: EN_MID, gpa: 3.3 }, 100, "2027-01-31"),
  // ── Poland: second wave ──
  p("uw-media", "uw", "ჟურნალისტიკა", "media", true, 4200, 3, 36, { english: EN_LOW, gpa: 2.7 }, 75, "2027-04-15"),
  p("jagiellonian-psych", "jagiellonian", "ფსიქოლოგია", "psychology", true, 4200, 3, 30, { english: EN_LOW, gpa: 2.9 }, 75, "2027-04-30"),
  // ── UK: second wave ──
  p("oxford-ir", "oxford", "პოლიტიკა, ფილოსოფია და ეკონომიკა", "ir", true, 39000, 3, 8, { english: EN_TOP, gpa: 3.9 }, 90, "2027-01-14"),
  p("cambridge-math", "cambridge", "მათემატიკა", "math", true, 39000, 3, 10, { english: EN_TOP, gpa: 3.8 }, 90, "2027-01-14"),
  p("imperial-eng", "imperial", "საავიაციო ინჟინერია", "engineering", true, 39000, 3, 13, { english: EN_TOP, gpa: 3.7 }, 90, "2027-01-14"),
  p("ucl-media", "ucl", "მედია", "media", true, 30000, 3, 22, { english: EN_MID, gpa: 3.4 }, 90, "2027-01-14"),
  p("edinburgh-edu", "edinburgh", "განათლება", "education", true, 28000, 4, 34, { english: EN_MID, gpa: 3.1 }, 60, "2027-01-14"),
  p("manchester-sci", "manchester", "ქიმია", "science", true, 29000, 3, 30, { english: EN_MID, gpa: 3.1 }, 60, "2027-01-14"),
  // ── US: second wave ──
  p("mit-math", "mit", "მათემატიკა", "math", true, 62000, 4, 5, { english: EN_TOP, sat: 1540, gpa: 3.9 }, 75, "2027-01-01"),
  p("stanford-design", "stanford", "დიზაინი", "design", true, 65000, 4, 6, { english: EN_TOP, sat: 1480, gpa: 3.8 }, 90, "2027-01-05"),
  p("harvard-law", "harvard", "სამართლის საფუძვლები", "law", true, 63000, 4, 5, { english: EN_TOP, sat: 1500, gpa: 3.9 }, 85, "2027-01-01"),
  p("berkeley-media", "berkeley", "მედიასწავლება", "media", true, 56000, 4, 20, { english: EN_MID, gpa: 3.4 }, 80, "2026-11-30"),
  p("gatech-math", "gatech", "გამოყენებითი მათემატიკა", "math", true, 52000, 4, 22, { english: EN_MID, sat: 1380, gpa: 3.5 }, 85, "2027-01-04"),
  p("utaustin-eng", "utaustin", "ელექტროინჟინერია", "engineering", true, 54000, 4, 24, { english: EN_MID, sat: 1350, gpa: 3.4 }, 90, "2026-12-01"),
  // ── Canada: second wave ──
  p("toronto-life", "toronto", "ცხოვრების მეცნიერებები", "science", true, 58000, 4, 24, { english: EN_MID, gpa: 3.5 }, 130, "2027-01-15"),
  p("ubc-bus", "ubc", "ბიზნესი", "business", true, 52000, 4, 26, { english: EN_MID, gpa: 3.4 }, 120, "2027-01-15"),
  p("mcgill-sci", "mcgill", "ნეირომეცნიერება", "science", true, 47000, 4, 22, { english: EN_MID, gpa: 3.5 }, 110, "2027-01-15"),
  p("waterloo-eng", "waterloo", "პროგრამული ინჟინერია", "engineering", true, 56000, 4, 12, { english: EN_MID, gpa: 3.7 }, 125, "2027-02-01"),
);

const programMap = new Map(ABROAD_PROGRAMS.map((x) => [x.id, x]));
export const abroadProgramById = (id: string): AbroadProgram | undefined => programMap.get(id);

export type AwardType = "full-ride" | "tuition" | "stipend";
export const AWARD_TYPE_LABEL: Record<AwardType, string> = {
  "full-ride": "სრული დაფინანსება",
  tuition: "სწავლის საფასური",
  stipend: "ყოველთვიური სტიპენდია",
};

export type Scholarship = {
  id: string;
  name: string;
  /** Country id or "global". */
  countryId: string;
  awardType: AwardType;
  /** Demo annual award value, USD; null when variable. */
  amountUsd: number | null;
  deadline: string;
  eligibility: string;
  forGeorgians: boolean;
};

const s = (
  id: string,
  name: string,
  countryId: string,
  awardType: AwardType,
  amountUsd: number | null,
  deadline: string,
  eligibility: string,
  forGeorgians = true,
): Scholarship => ({ id, name, countryId, awardType, amountUsd, deadline, eligibility, forGeorgians });

export const SCHOLARSHIPS: Scholarship[] = [
  s("daad", "DAAD სასწავლო სტიპენდია (დემო)", "de", "stipend", 11000, "2027-01-15", "ძლიერი აკადემიური შედეგები და მოტივაციის წერილი გერმანულ პროგრამაზე."),
  s("deutschland", "Deutschlandstipendium (დემო)", "de", "stipend", 3900, "2027-03-31", "ჩარიცხული სტუდენტები გერმანულ უნივერსიტეტებში, მაღალი GPA."),
  s("hungaricum", "Stipendium Hungaricum (დემო)", "hu", "full-ride", null, "2027-01-31", "სრული დაფინანსება უნგრეთში: სწავლა, საცხოვრებელი და ყოველთვიური შეღავათი."),
  s("erasmus", "Erasmus+ მობილობის გრანტი (დემო)", "global", "stipend", 6000, "2027-02-15", "სემესტრის ან წლის გაცვლა ევროპის პარტნიორ უნივერსიტეტებში."),
  s("holland", "Holland Scholarship (დემო)", "nl", "tuition", 5500, "2027-02-01", "არა-ევროკავშირის სტუდენტები ნიდერლანდების ბაკალავრიატში."),
  s("maastricht-hp", "Maastricht High Potential (დემო)", "nl", "full-ride", null, "2027-01-15", "სრული დაფინანსება გამორჩეული აკადემიური პროფილით."),
  s("utrecht-ex", "Utrecht Excellence (დემო)", "nl", "tuition", 12000, "2027-02-01", "საუკეთესო 10% შესაბამისი სკოლის ქულებით."),
  s("italy-dsu", "იტალიის რეგიონული DSU გრანტი (დემო)", "it", "stipend", 6500, "2027-05-31", "ფინანსური საჭიროების მტკიცებულებით, იტალიის საჯარო უნივერსიტეტები."),
  s("unibo-grant", "Unibo Action Grant (დემო)", "it", "tuition", 3000, "2027-04-30", "ბოლონიის უნივერსიტეტის საერთაშორისო სტუდენტები."),
  s("polimi-merit", "PoliMi Merit Scholarship (დემო)", "it", "tuition", 3900, "2027-03-31", "ინჟინერიისა და დიზაინის ძლიერი კანდიდატები."),
  s("nawa-banach", "NAWA Banach Programme (დემო)", "pl", "full-ride", null, "2027-03-15", "აღმოსავლეთ პარტნიორობის ქვეყნების სტუდენტები პოლონეთში."),
  s("uw-rector", "ვარშოვის რექტორის სტიპენდია (დემო)", "pl", "stipend", 2400, "2027-04-15", "აკადემიური მიღწევები პირველ სემესტრამდე."),
  s("great-uk", "GREAT Britain Scholarship (დემო)", "uk", "tuition", 11000, "2027-04-30", "ქართველი სტუდენტები შერჩეულ ბრიტანულ უნივერსიტეტებში."),
  s("edinburgh-global", "Edinburgh Global Undergraduate (დემო)", "uk", "tuition", 8000, "2027-03-31", "საერთაშორისო ბაკალავრები აკადემიური ღირსებით."),
  s("oxford-reach", "Oxford Reach-style Grant (დემო)", "uk", "full-ride", null, "2027-01-14", "დაბალი შემოსავლის ფონის გამორჩეული კანდიდატები."),
  s("fulbright", "Fulbright Foreign Student (დემო)", "us", "full-ride", null, "2027-05-01", "სრული დაფინანსება აშშ-ში; კონკურსი მოტივაციითა და ლიდერობით."),
  s("us-need", "აშშ-ის კერძო უნივერსიტეტების need-based დახმარება (დემო)", "us", "full-ride", null, "2027-01-05", "სრული ფინანსური მხარდაჭერა ოჯახის შემოსავლის მიხედვით."),
  s("pearson", "Lester B. Pearson Scholarship (დემო)", "ca", "full-ride", null, "2026-11-30", "ტორონტოს უნივერსიტეტი; ნომინაცია სკოლიდან."),
  s("ubc-scholars", "UBC International Scholars (დემო)", "ca", "full-ride", null, "2027-01-15", "აკადემიური ღირსება და ფინანსური საჭიროება."),
  s("mcgill-entrance", "McGill Entrance Scholarship (დემო)", "ca", "stipend", 5000, "2027-01-15", "მაღალი სასკოლო შედეგები პირველ წელს."),
  s("mext", "MEXT სამთავრობო სტიპენდია (დემო)", "jp", "full-ride", null, "2027-02-28", "იაპონიის მთავრობის სრული დაფინანსება ბაკალავრიატში."),
  s("gks", "Global Korea Scholarship (დემო)", "kr", "full-ride", null, "2027-03-10", "სრული დაფინანსება სამხრეთ კორეაში, ენის კურსით."),
  s("nus-merit", "NUS Merit Scholarship (დემო)", "sg", "tuition", 15000, "2027-02-21", "გამორჩეული აკადემიური პროფილი აზიაში."),
  s("chemiuni-travel", "ChemiUni Travel Grant (გამოგონილი)", "global", "stipend", 1500, "2027-06-01", "გამოგონილი დემო გრანტი გამგზავრების ხარჯებისთვის."),
];

export const formatUsd = (n: number) => `$${n.toLocaleString("en-US")}`;
export const formatDeadline = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" });
