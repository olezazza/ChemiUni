<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# ChemiUni rules
- The phone app remains under expo/ unchanged by website presentation work; the TanStack website uses browser-native controls and imports pure catalog, scoring and proposal modules from expo/lib — why: full web parity without duplicating domain logic or coupling native screens to DOM.
- Website-only code lives in src/web (pages, components, layout, lib) with one file per screen; src/routes files only point to pages — why: beginners can find and edit a screen in one place.
- Website state persists separately per mode in browser storage; counselor PIN tokens live only in memory and web calls use the existing authenticated public endpoints — why: preserve local-only profiles and the phone backend security contract.
- Estimates remain deterministic in expo/lib/engine.ts; authenticated public routes call the Gateway SDK — why: AI must not change scoring or expose secrets.
- Accepted counselor changes opt into an explicit approvedList snapshot; legacy buildList ranking is unchanged otherwise — why: approved removals must not refill and replacements must preserve their slot.
- Conversation and decisions persist atomically with the profile in AsyncStorage; optional fields preserve older saves — why: no detached approvals or lost student data.
- Native chat uses React Native controls and markdown instead of AI Elements DOM primitives (registry uses div and HTMLAttributes) — why: iOS and Android require native rendering.
- Appearance uses the existing provider, theme tokens and bundled Georgian fonts — why: preserve light/dark identity and immediate switching.
- Onboarding enters scores with a single replacement; saved forms use the shared empty-stack fallback before dispatching back — why: reloads and deep links have no prior screen.
- Expo tsconfig extends the committed local expo/tsconfig.base.json, never the expo package path — why: Expo tooling re-adds a package extends when none exists, and publishing builds without expo/node_modules.
- The counselor gets a silent anonymous guest session per device; backend routes still verify the signed JWT — why: no separate account while keeping the AI endpoint authenticated.
- Counselor requests send a bounded grounded context (listed programs plus top candidates, recent turns only) and the server accepts proposals only for supplied rows — why: keeps AI cost low without letting the model cite unseen programs.
- Two modes share the app: Georgia (chemiuni.profile.v1) and Abroad (chemiuni.abroad.v1), with the mode flag in chemiuni.mode.v1; setMode writes only the mode key — why: switching modes must never read or overwrite the other mode's data.
- Abroad records live in expo/lib/abroad-data.ts with deterministic estimates in expo/lib/abroad-engine.ts and proposal safety in expo/lib/abroad-counselor.ts, mirroring the Georgia modules — why: same invariants, independent datasets.
- Launch choice uses each mode's own completion flag; generated Abroad portfolios are explicit saved snapshots with separate tuition and application-fee constraints — why: old saves remain readable and accepted removals cannot silently refill.
- Abroad score improvements use single-score counterfactuals from the same deterministic engine; scholarship checklists and coastal metadata remain grounded demo information — why: no invented percentage gains or guaranteed funding.
- Abroad theming uses the same token names via AbroadThemeScope (NativeWind vars()) plus mode-aware useThemeColors in expo/lib/theme.ts; Georgia palettes stay byte-identical — why: one component set, two palettes, works on web and native.
- The tabs layout hides each mode's tab set with href: null rather than separate navigators — why: one router, no remounts, Georgia tabs unchanged when Georgia is active.
- The counselor endpoint branches on body mode: "abroad" runs runAbroadCounselor (src/lib/counselor-abroad.server.ts) grounded in the abroad catalog; both modes keep the same guest JWT + X-Counselor-Token PIN gate — why: one authenticated endpoint, no second secret surface.
- Language: Georgian is the source text; English comes from a Georgian→English dictionary (src/web/lib/english-text.json for the website, expo/lib/english-text.json for the phone app). The website translates rendered text in src/web/lib/language.tsx; the phone app translates through Text/TextInput from expo/lib/translated-text.tsx. Mark content that must stay as written (AI replies) with data-no-translate on web — why: one switch covers screens and demo data without rewriting every string.
