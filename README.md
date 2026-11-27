# personal portfolio

my portfolio site. it's atlas: one zoomable map with my work, now, about and contact on it. the brief is in BRIEF.md.

it's plain static files, no build step. the old concept prototypes live on `concept/open` and never merge.

## run it

```sh
npm install
npm run dev
```

then open http://localhost:5173

## check it

```sh
npm test   # playwright checks in chrome at 1440x900 and 1280x800
```

## where things are

- `index.html` the page
- `assets/` atlas code, fonts and project pictures
- `shared/content.js` all project and contact info. anything marked draft isn't approved yet
- `e2e/` the checks

screenshots and recordings go in PR comments, not the repo.
