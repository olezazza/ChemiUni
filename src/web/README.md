# ChemiUni website — where things live

The website reuses the phone app's data and scoring from `expo/lib/` (never edit
those just for the website). Everything website-only is in this folder:

| Folder        | What is inside                                              |
|---------------|-------------------------------------------------------------|
| `pages/`      | One file per screen (Home, Explore, My List, Counselor ...) |
| `components/` | Pieces used on several pages (program card, profile form)   |
| `layout/`     | The frame around every page: header, side/bottom menu       |
| `lib/`        | Saved browser data (`store.tsx`), AI counselor calls, page titles |

- Change a page's look/text: open `pages/<Name>Page.tsx`.
- Change colors, spacing, rounding: `src/styles.css` (last section matches the app).
- Add a new page: create the screen in `pages/`, then a small file in
  `src/routes/` that points to it (see `src/routes/home.tsx`).
