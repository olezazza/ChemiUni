# Roadmap — Full ChemiUni website

- [x] Add browser-local independent profiles, appearance and mode selection using shared app data and deterministic logic
- [x] Build desktop/mobile website screens: chooser, onboarding, Home, Explore, My List/Portfolio, Scholarships, Profile and details
- [x] Connect website counselor to existing guest authentication and PIN-protected endpoint; preserve approval safety
- [x] Verify website workflows, persistence, themes, tests and native-source preservation

# Completed Abroad Mode updates

- [x] Launch mode chooser and separate first-time onboarding
- [x] Annual tuition budget and deterministic balanced portfolio generation
- [x] Counselor refinement grounded in budget, coastal cities and demo scholarship options
- [x] Tappable scholarship details with coverage, documents, eligibility and guidance
- [x] Program-card improvement tips and richer Abroad dark tokens
- [x] Regression tests and Quick view end-to-end verification (fresh profile → generated portfolio → PIN gate; both themes and saved data)

- [x] Abroad data layer: types, ~48 universities / ~130 programs / ~24 scholarships (demo-labeled)
- [x] Abroad engine: deterministic chance estimates, tips, portfolio/budget helpers
- [x] Store: mode + independent abroad persistence (separate AsyncStorage keys; Georgia data untouched)
- [x] Theme: abroad palettes (warm sunny light, midnight neon dark) via vars() scope + mode-aware useThemeColors
- [x] Tabs: conditional 5-tab abroad layout (Home, Explore, Scholarships, Portfolio, Profile); Georgia tabs unchanged
- [x] Screens: abroad home, explore, scholarships, portfolio, setup form, program detail
- [x] Profile: mode switcher + abroad profile summary
- [x] Abroad AI counselor: reuse PIN gate + guest auth; server mode:"abroad" branch grounded in abroad catalog
- [x] Tests: abroad data/engine/counselor (bun), server abroad (vitest); run all + typecheck + build
- [x] Verify in Quick view: mode switch, both themes, portfolio, counselor PIN flow

- [x] English language switch in the phone app (Georgian default)
