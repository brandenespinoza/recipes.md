# RECIPES.MD

Self-hosted recipe capture: paste a recipe URL, the app uses the OpenAI Responses API (with web search) to extract the recipe and save it as a Markdown file with YAML front matter. Everything is stored locally on disk.

## Contents

- Features
- Architecture
- Quick start (Docker)
- Configuration
- Data & storage
- Usage
- API
- Development
- Deployment & security
- Troubleshooting
- Contributing
- License

## Product Summary

**RECIPES.MD** is a self-hosted web app that takes a recipe URL, asks the OpenAI API to extract the recipe, and saves the result as a Markdown file with YAML front matter in a local folder. A minimal web UI lets users log in, add recipes, and browse saved recipes.

Core flow:
1. User logs in (cookie-based JWT).
2. User pastes a recipe URL.
3. Backend calls OpenAI Responses API (with web search tool) to generate a Markdown recipe.
4. The Markdown is saved to `/recipes/<slug>.md`.
5. The UI lists saved recipes and renders the Markdown for reading.

## Features

- URL → clean Markdown with YAML front matter
- Local filesystem storage for recipes (`/recipes/*.md`)
- SQLite auth database (`/data/auth.db` by default, no override)
- Minimal single-page UI for list + read (dark theme)
- Multi-user auth with admin bootstrap
- Rescrape endpoint to refresh a saved recipe
- Docker-first setup

## Architecture

- **Backend:** FastAPI + SQLAlchemy
- **Auth:** JWT stored in HttpOnly cookies
- **Storage:** Markdown files on disk + SQLite user DB
- **LLM:** OpenAI Responses API with `web_search` tool
- **Frontend:** Minimal SPA served by the backend (static assets, dark theme with system fonts)

### UI/UX Details

- **Visual Language:** Dark theme (black background, white text), system sans-serif, minimal borders, uppercase labels
- **Views:**
  - **Header:** Hamburger menu (HOME, ACCOUNT), logo/title, quick-add pill for pasting URLs
  - **Home (Recipes List):** Lists saved recipes by slug, click to open detail view
  - **Recipe Detail:** Renders Markdown with minimal formatting, parses front matter for metadata (meal/category/tags/time/yield/source URL)
  - **Add Recipe:** URL input with SCRAPE button, status line for feedback
  - **Account:** Login form, sign out, change password form

### LLM Recipe Extraction

The backend calls the OpenAI Responses API with:
- `model`: Configurable via `OPENAI_MODEL` env var (e.g., `gpt-5.2`)
- `tools`: `[{"type": "web_search"}]`
- `temperature`: `0`
- `timeout`: `60s`

The system prompt instructs the model to visit the URL, extract the recipe, and return Markdown with YAML front matter including title, slug, url, meal/category/tags, and time fields.

## Quick start (Docker)

```bash
git clone https://github.com/brandenespinoza/recipes.md
cd recipes.md
docker compose up
```

1. Set required values in `.env`:

```env
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-5.2
SECRET_KEY=change-me-to-a-long-random-string
```

2. Start the app:

```bash
docker compose up --build
```

3. Open the UI:

```
http://localhost:8000
```

4. Create the first user (admin) from the **Account** screen.

## Configuration

Environment variables are read at startup (case-insensitive). For Docker, values
are sourced from `.env` via `docker-compose.yml`.

- `OPENAI_API_KEY` (required) — OpenAI API key
- `OPENAI_MODEL` (required)
- `SECRET_KEY` (required) — JWT signing key
- Other settings are hard-coded defaults in `backend/app/config.py`.

## Data & storage

- Recipe Markdown files live in `./recipes/*.md`
- User database lives in `./data/auth.db` by default (exposed as `/data/auth.db` in Docker).

To back up everything, copy the `recipes/` directory.

## Usage

- Paste a recipe URL in the header quick-add or the Add view.
- Recipes are saved immediately after extraction.
- Open any recipe from the list to read the Markdown rendering.
- Updating/rescraping is available via the API (no UI editor yet).

## API

Base path: `/api`

**Health**
- `GET /health`

**Recipes**
- `POST /api/recipes` — create from URL
- `GET /api/recipes` — list recipes
- `GET /api/recipes/{slug}` — fetch Markdown + metadata
- `PUT /api/recipes/{slug}` — update Markdown (raw string body)
- `POST /api/recipes/{slug}/rescrape` — re-run extraction using stored URL

**Auth**
- `POST /api/auth/register` — first user allowed without auth, becomes admin
- `GET /api/auth/registration-status` — whether any user accounts exist
- `POST /api/auth/login` — sets HttpOnly cookie
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

**Admin**
- `GET /api/admin/users`
- `PUT /api/admin/users/{user_id}`
- `DELETE /api/admin/users/{user_id}`

## Development

### Backend (local)

Requirements: Python 3.11+

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
set -a
source .env
set +a
uvicorn backend.app.main:app --reload --port 8000
```

### Frontend (optional dev server)

The frontend is plain ES modules in `frontend/` and can be served by the backend.

If you want hot reload, run Vite from the `frontend` directory:

```bash
cd frontend
vite
```

This uses `frontend/vite.config.js` (default port 5173). You may need to install Vite (`npm i -g vite` or `npx vite`).

## Deployment & security

- **Set `SECRET_KEY`** to a strong value in production.
- **Enable HTTPS** and set `cookie_secure=True` in `backend/app/config.py` when behind TLS.
- Use a reverse proxy (Caddy / Nginx) if exposing to the internet.
- Treat your OpenAI API key as a secret; rotate if exposed.

## Troubleshooting

- `GET /health` reports:
  - `filesystem_writable` — `/recipes` is writable
  - `llm_configured` — `OPENAI_API_KEY` is set
- If recipes aren’t saving, check volume mounts and permissions.

## Contributing

Issues and PRs are welcome. Please describe the problem clearly and include repro steps when possible.

## License

No license file is currently included. Add a `LICENSE` to clarify usage and distribution terms.
