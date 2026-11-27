# personal portfolio concepts

this branch is where I'm trying out concept prototypes for my portfolio. nothing is chosen yet, these are just options for me to click through and compare. the brief is in BRIEF.md and the discussion is in issue #1.

it's all plain static files, no build step.

## run it

```sh
npm install
npm run dev
```

then open http://localhost:5173. any static server works too, like `python3 -m http.server 5173`. the launcher links to each prototype.

## check it

```sh
npm test        # playwright checks in chrome at 1440x900
npm run shots   # screenshots of ready prototypes go in shots/
```

each prototype lives in `prototypes/<name>/` and is listed in `e2e/prototypes.json`. its checks only run once its `expectReady` is true. project and contact info all comes from `shared/content.js`.
