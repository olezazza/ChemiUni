import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  Compass,
  Globe2,
  GraduationCap,
  Home,
  ListChecks,
  Moon,
  Sun,
  User,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebStore, useWebStore } from "@/web/lib/store";
import type { ReactNode } from "react";
import { LanguageProvider, LanguageToggle } from "@/web/lib/language";
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <WebStore>
      <LanguageProvider>{children}</LanguageProvider>
    </WebStore>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const s = useWebStore(),
    path = useLocation().pathname;
  const entry = path === "/";
  const nav = [
    { to: "/home", label: "მთავარი", icon: Home },
    { to: "/explore", label: "აღმოაჩინე", icon: Compass },
    ...(s.mode === "abroad" ? [{ to: "/scholarships", label: "სტიპენდიები", icon: Award }] : []),
    { to: "/my-list", label: s.mode === "abroad" ? "პორტფოლიო" : "ჩემი სია", icon: ListChecks },
    { to: "/profile", label: "პროფილი", icon: User },
  ] as const;
  return (
    <div className="web-app min-h-screen bg-background text-foreground">
      <header className="web-header border-b border-border bg-background">
        <Link to="/" className="brand">
          <GraduationCap aria-hidden="true" />
          <span>
            ChemiUni<span className="brand-sub">შენი შემდეგი ნაბიჯი</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {!entry && (
            <Button variant="ghost" asChild>
              <Link to="/">
                <Globe2 />
                <span className="hidden sm:inline">
                  {s.mode === "abroad" ? "უცხოეთში სწავლა" : "საქართველოში სწავლა"}
                </span>
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="შეცვალე თემა"
            onClick={() => s.setAppearance(s.appearance === "dark" ? "light" : "dark")}
          >
            {s.appearance === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>
      {!entry && (
        <nav className="web-nav" aria-label="მთავარი ნავიგაცია">
          {nav.map((n) => (
            <Button
              key={n.to}
              variant={path === n.to ? "secondary" : "ghost"}
              asChild
              className="nav-link"
            >
              <Link to={n.to}>
                <n.icon />
                <span>{n.label}</span>
              </Link>
            </Button>
          ))}
          <div className="nav-note">
            <span>DEMO</span>
            <p>მონაცემები და შეფასებები სიმულირებულია.</p>
          </div>
        </nav>
      )}
      <main className={entry ? "entry-main" : "web-main"}>
        {s.saveError && (
          <p role="alert" className="mb-4 text-destructive">
            შენახვა ვერ მოხერხდა. დაუშვი ბრაუზერში მონაცემების შენახვა.
          </p>
        )}
        {s.ready ? (
          children
        ) : (
          <div aria-label="იტვირთება" className="space-y-4 py-20">
            <div className="h-12 w-2/3 animate-pulse bg-muted" />
            <div className="h-40 animate-pulse bg-muted" />
          </div>
        )}
      </main>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
export function DemoNote() {
  return (
    <p className="demo-note">
      საჩვენებელი მონაცემები · შეფასებები არ არის ოფიციალური სტატისტიკა ან მიღების გარანტია.
    </p>
  );
}
export function BackLink() {
  return (
    <Button variant="ghost" asChild className="mb-4">
      <Link to="/explore">
        <ArrowLeft />
        აღმოაჩინე
      </Link>
    </Button>
  );
}
