# Mafia Signs

Interactive gesture dictionary for competitive Sports Mafia (Спортивная мафия). Pick a gesture, watch a 3D avatar demonstrate it — in English, Ukrainian, Russian, or German.

> This is a fork of [linuxscout/algerianSignLanguage-avatar](https://github.com/linuxscout/algerianSignLanguage-avatar), repurposed from an Arabic Sign Language avatar into a Sports Mafia hand-signal reference. It reuses the original project's 3D avatar rendering and SiGML animation pipeline; only the dictionary content, UI, and translations are new. See [`CREDITS`](CREDITS) for full attribution.

Gesture conventions vary between Mafia clubs and tournament organizations — see [`GESTURES.md`](GESTURES.md) for the full gesture list and known limitations.

---

## How It Works

**1. Selection.** The user searches or browses categories (Roles, Information, Actions, Strategy) and picks a gesture. Gesture IDs are language-independent, so switching the UI language never changes what's selected.

**2. Lookup.** Each gesture in `data/gestures/gestures.json` either references a [SiGML](https://vh.cmp.uea.ac.uk/index.php/SiGML) file in `data/sigml/`, or has `animation: null` if no animation has been authored yet.

**3. Rendering.** The [CWASA](https://vh.cmp.uea.ac.uk/index.php/CWA_Signing_Avatars) JavaScript library (`web-simulator/cwa/allcsa.js`) renders the SiGML on a 3D avatar. Selecting a gesture plays it immediately and loops it continuously until another gesture is selected — there are no separate play/pause/speed controls to operate. Camera rotate/zoom (drag / shift-drag or pinch on the avatar) is built into CWASA itself.

```
search/category selection → gesture lookup → SiGML file → CWASA renderer → 3D avatar animation
```

Translations are a separate layer: `data/i18n/{en,uk,ru,de}.json` hold only display text (names, descriptions, UI labels). The same animation plays regardless of language.

### Embed iframe (`/embed`) and Playground (`/playground`)

These bypass the dictionary entirely — the caller provides raw SiGML content directly and CWASA renders it immediately. Useful for testing new gestures or embedding the bare avatar in another page. See [Embed Iframe Endpoint](#embed-iframe-endpoint) below.

---

## Requirements

| Requirement | Notes |
|-------------|-------|
| Python 3.9+ | FastAPI + uvicorn (used for local dev and the static build script only) |
| A modern web browser | Chrome, Firefox, Safari, or Edge — no backend required to run the built site |

---

## Running Locally

### Setup

```bash
# Install Poetry if you don't have it
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Copy the env template and edit if needed
cp .env.example .env
```

### Start the server

```bash
poetry run python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

| URL | Description |
|-----|-------------|
| `http://localhost:8000/` | Mafia Signs — full gesture dictionary |
| `http://localhost:8000/embed` | Avatar-only iframe endpoint |
| `http://localhost:8000/playground` | SiGML playground — paste raw SiGML and watch the avatar sign it |

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGIN` | `*` | Origin of the parent page embedding `/embed`. Set to your frontend URL in production (e.g. `https://your-frontend.com`). |

---

## Configuring the Avatar

Runtime timing lives in **`web-simulator/avatar.json`**:

```json
{
  "signDuration": 1000
}
```

`signDuration` (ms) is the fallback duration used to detect "done" after starting playback (and so when to loop back to the start), for gestures that don't explicitly signal completion.

Avatar list, canvas size, and default camera angle live in `web-simulator/cwa/cwacfg.json` — part of the bundled CWASA engine.

---

## Adding a Gesture

Gestures live in **`data/gestures/gestures.json`** — a flat array, each entry:

```json
{
  "id": "citizen",
  "category": "roles",
  "animation": "sigml/citizen.sigml"
}
```

| Field | Meaning |
|-------|---------|
| `id` | Language-independent, used as the SiGML filename stem and the i18n key suffix. Never change an existing id — it's also the deep-link slug (`#/gesture/<id>`). |
| `category` | One of `roles`, `information`, `actions`, `strategy` (must have a matching `categories.<category>` i18n key). |
| `animation` | Path under `data/sigml/`, or `null` if no animation has been authored yet. The UI never substitutes another gesture's animation when this is `null`. |

To add a new gesture:

1. Add the entry to `data/gestures/gestures.json` (`animation: null` if you don't have one yet).
2. Add `gestures.<id>.name` and `gestures.<id>.description` keys to **all four** `data/i18n/*.json` files (see [Adding or Modifying Translations](#adding-or-modifying-translations)).
3. If you have an animation, author the SiGML file (see below) and set `animation`.
4. Update [`GESTURES.md`](GESTURES.md) with the meaning and any caveats.

---

## Adding an Animation

SiGML files live in **`data/sigml/<id>.sigml`**, symlinked into `web-simulator/sigml/` automatically. See [`sigml-reference.md`](sigml-reference.md) for the full, tested HamNoSys/SiGML tag reference used in this build (handshapes, orientation, location, movement, sequencing, and the two-hand `hamsymmlr`/`hamsymmpar` primitives) and [`docs/`](docs/) for the underlying HamNoSys/eSIGN specifications.

Use `/playground` to test a new SiGML snippet live before committing it — paste it into the textarea and press Play (or Ctrl+Enter).

A `<sigml>` document can contain multiple `<hns_sign>` blocks, which play back-to-back — useful for multi-step gestures (see `data/sigml/who_is_sheriff.sigml` or any `player_number_6`–`10` file for examples).

---

## Adding or Modifying Translations

Translations are flat key→string JSON files in **`data/i18n/`**: `en.json`, `uk.json`, `ru.json`, `de.json`. Every file must have **exactly the same keys** — `poetry run python -m pytest tests/test_i18n.py` checks this.

- UI chrome strings use the `ui.*` and `categories.*` prefixes.
- Every gesture needs `gestures.<id>.name` and `gestures.<id>.description` in all four files.
- The language switcher in the header persists the choice to `localStorage` and detects the browser's preferred language on first visit (falling back to English). Switching languages re-renders text in place — it never reloads the page or resets the avatar/selected gesture.

---

## Embed Iframe Endpoint

`GET /embed` serves a full-viewport, controls-free page designed to be embedded as an iframe in another frontend. The caller drives the avatar by sending raw SiGML directly — no dictionary lookup happens inside the iframe.

### Embedding

```html
<iframe
  id="avatar"
  src="http://localhost:8000/embed"
  width="400"
  height="500"
  style="border: none; background: transparent;"
></iframe>
```

### Sending commands (`parent → iframe`)

```js
const avatar = document.getElementById('avatar').contentWindow;

avatar.postMessage({ type: 'sign', sigml: '<sigml>...</sigml>' }, '*');
avatar.postMessage({ type: 'stop' }, '*');
```

### Receiving status events (`iframe → parent`)

```js
window.addEventListener('message', (event) => {
  const { type, ...payload } = event.data;
  switch (type) {
    case 'ready':   break; // Avatar initialised
    case 'signing': break; // Animation started
    case 'done':    break; // Animation finished
    case 'error':   break; // payload: { reason: 'no sigml provided' }
  }
});
```

### Origin security

In development `ALLOWED_ORIGIN=*` allows any parent page to send commands. In production set it to your frontend's exact origin in `.env`. The iframe silently ignores `postMessage` events from any other origin.

---

## Deploying to GitHub Pages

```bash
python build.py            # outputs to pages/, ALLOWED_ORIGIN=*
python build.py --origin "https://your-frontend.com"   # restrict the embed's allowed origin
```

1. Go to your repository **Settings → Pages**, set the source to **GitHub Actions**.
2. Push to `master` — `.github/workflows/deploy.yml` runs `build.py` and deploys `pages/`.

All asset references use relative paths, so the site works both at a domain root and under a repository subdirectory (`https://<user>.github.io/<repo>/`). The app is fully static — no database, no server-side rendering, no backend required to run it once built.

---

## Running Tests

```bash
poetry run python -m pytest -v
```

| Test file | What it covers |
|-----------|---------------|
| `tests/test_api.py` | FastAPI routes — `/`, `/embed`, `/playground`, static assets (including `gestures/gestures.json`, `i18n/*.json`, `sigml/*.sigml`), CORS, origin injection, 404 behaviour |
| `tests/test_gestures.py` | Gesture ids are unique, every referenced `.sigml` file exists, no two gestures share one animation file |
| `tests/test_i18n.py` | All four language files exist and have **identical** keys; no empty translations; every gesture and category has translations in all four languages |

---

## Project Structure

```
.
├── app.py                        # FastAPI dev server
├── build.py                      # Static site build script for GitHub Pages
├── .github/workflows/
│   └── deploy.yml                # CI/CD — deploys to GitHub Pages on push to master
├── templates/
│   ├── embed.html                # Iframe-only embed page (/embed)
│   └── playground.html           # SiGML playground page (/playground)
├── web-simulator/
│   ├── index.html                # Mafia Signs — full gesture dictionary UI (/)
│   ├── avatar.js                 # Avatar.playURL/signSiGML/stop — thin wrapper over CWASA
│   ├── avatar.json               # Runtime timing config
│   ├── js/
│   │   ├── i18n.js               # Language detection/persistence, data-i18n binding
│   │   ├── gestures.js           # Loads gestures.json, exposes lookup helpers
│   │   └── app.js                # Search, categories, selection, hash routing, playback controls
│   ├── sigml -> ../data/sigml              # Symlink — canonical SiGML files live in data/
│   ├── gestures -> ../data/gestures        # Symlink — canonical gesture definitions live in data/
│   ├── i18n -> ../data/i18n                # Symlink — canonical translations live in data/
│   ├── cwa/
│   │   ├── allcsa.js             # CWASA avatar rendering library (bundled, do not edit)
│   │   └── cwacfg.json           # Avatar list and renderer config
│   ├── avatars/                  # 3D avatar models
│   ├── shaders/
│   ├── cwaclientcfg.json         # CWASA client config
│   ├── h2s.xsl                   # HamNoSys → SiGML XSLT transform
│   └── favicon.svg
├── data/
│   ├── gestures/gestures.json    # Gesture definitions — single source of truth (id/category/animation)
│   ├── i18n/{en,uk,ru,de}.json   # Translations — identical keys in every file
│   └── sigml/                    # SiGML animation files, one per animated gesture id
├── tests/
│   ├── test_api.py
│   ├── test_gestures.py
│   └── test_i18n.py
├── sigml-reference.md            # SiGML format reference — verified tokens, ordering rules, working examples
├── GESTURES.md                   # Gesture meanings and known limitations
├── docs/                         # Reference documents for HamNoSys and the eSIGN editor
├── CREDITS                       # Attribution to the original ArSL avatar project
├── .env.example
├── Makefile
├── pyproject.toml
└── LICENSE
```

### How the build works

`build.py` copies `web-simulator/` into `pages/` (resolving all symlinks into real files), then injects `__ALLOWED_ORIGIN__` into the embed template and copies the playground template. `pages/` is .gitignored — generated output only. The FastAPI dev server (`app.py`) serves `web-simulator/` directly with `follow_symlink=True`, so no build step is needed during development.

---

## Resources

- [HamNoSys Notation System](https://www.sign-lang.uni-hamburg.de/hamnosys.html)
- [SiGML (Signing Gesture Markup Language)](https://vh.cmp.uea.ac.uk/index.php/SiGML)
- [CWASA Signing Avatars](https://vh.cmp.uea.ac.uk/index.php/CWA_Signing_Avatars)
- [`sigml-reference.md`](sigml-reference.md) — verified SiGML token reference with working examples
- [`GESTURES.md`](GESTURES.md) — gesture list and known limitations
- [`docs/`](docs/) — local copies of the HamNoSys and eSIGN editor reference documents

## Attribution & Licensing

This project builds on [linuxscout/algerianSignLanguage-avatar](https://github.com/linuxscout/algerianSignLanguage-avatar) — see [`CREDITS`](CREDITS) for the original authors and contributors, who remain unchanged by this rebrand. The bundled CWASA engine (`web-simulator/cwa/`) is third-party and unmodified; see its own licensing terms upstream.

**Note:** `pyproject.toml` and this README declare `CC-BY-NC-4.0`, but the committed [`LICENSE`](LICENSE) file currently contains the full GPLv3 text. This inconsistency predates this rebrand and hasn't been resolved here — confirm the intended license with the repository owner before reusing this code.

## License

[CC BY-NC-4.0](LICENSE) (see note above)
