import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, GraduationCap } from "lucide-react";
import { useWebStore } from "@/web/lib/store";
import { DemoNote } from "@/web/layout/AppShell";

export function WelcomePage() {
  const s = useWebStore();
  return (
    <>
      <div className="welcome-intro">
        <p className="eyebrow">CHEMIUNI · შენი სასწავლო გზა</p>
        <h1>
          სად იწყება შენი
          <br />
          <span className="text-primary">შემდეგი თავი?</span>
        </h1>
        <p>აირჩიე, სად გინდა სწავლა.</p>
      </div>
      <div className="mode-grid">
        {(["georgia", "abroad"] as const).map((mode) => (
          <Link
            key={mode}
            to={
              (mode === "georgia" ? s.profile.onboarded : s.abroad.setupDone) ? "/home" : "/setup"
            }
            onClick={() => s.setMode(mode)}
            className={`mode-panel mode-${mode}`}
          >
            <div className="mode-top">
              <span className="mode-number">0{mode === "georgia" ? "1" : "2"}</span>
              {mode === "georgia" ? <GraduationCap /> : <Globe2 />}
            </div>
            <div>
              <span className="text-3xl">{mode === "georgia" ? "🇬🇪" : "🌍"}</span>
              <h2>{mode === "georgia" ? "საქართველოში სწავლა" : "უცხოეთში სწავლა"}</h2>
              <p>
                {mode === "georgia"
                  ? "ეროვნული გამოცდები · NAEC"
                  : "გლობალური უნივერსიტეტები · განაცხადები"}
              </p>
            </div>
            <div className="mode-bottom">
              <span>
                {(mode === "georgia" ? s.profile.onboarded : s.abroad.setupDone)
                  ? "გააგრძელე შენი გზა"
                  : "დაიწყე აქ"}
              </span>
              <ArrowRight />
            </div>
          </Link>
        ))}
      </div>
      <div className="welcome-footer">
        <DemoNote />
        <span>საქართველო & მსოფლიო</span>
      </div>
    </>
  );
}
