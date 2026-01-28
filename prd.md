# PRD: RECIPES.MD (Current State)

**"A self-hosted recipe capture tool that saves LLM-generated Markdown to disk."**

This document reflects what exists in the repo today (backend + frontend + Docker setup), not the aspirational roadmap.

---

## 1. Product Summary (As Built)

**RECIPES.MD** is a self-hosted web app that takes a recipe URL, asks the OpenAI API to extract the recipe, and saves the result as a Markdown file with YAML front matter in a local folder. A minimal web UI lets users log in, add recipes, and browse saved recipes.

Core flow:
1. User logs in (cookie-based JWT).
2. User pastes a recipe URL.
3. Backend calls OpenAI Responses API (with web search tool) to generate a Markdown recipe.
4. The Markdown is saved to `/recipes/<slug>.md`.
5. The UI lists saved recipes and renders the Markdown for reading.

---

## 2. User & Use Cases (Current)

- **Primary user:** A self-hosting individual who wants to save recipes as local Markdown files.
- **Primary use case:** Save a recipe from a URL into a local folder and view it in a minimalist UI.

## 3. UI/UX (Implemented)

### 3.1 Visual Language
- Dark theme only (black background, white text).
- System sans-serif (`system-ui`, `-apple-system`, etc.).
- No decorative elements, minimal borders, uppercase labels.

### 3.2 Views & Navigation
The frontend is a single-page app served by FastAPI as static files.

- **Header:**
  - Hamburger menu (`HOME`, `ACCOUNT`).
  - Logo/title `RECIPES.MD`.
  - Quick-add pill input for pasting URLs.

- **Home (Recipes List):**
  - Lists saved recipes (title derived from slug; not parsed from front matter).
  - Click a recipe to open detail view.

- **Recipe Detail:**
  - Renders Markdown with minimal formatting.
  - Front matter is parsed client-side to show metadata (meal/category/tags/time/yield/source URL) if present.

- **Add Recipe:**
  - URL input + `SCRAPE` button.
  - Status line (success/error).


- **Account:**
  - Login form (username + password).
  - Logged-in view with "Sign out" + change password form.

### 3.3 What is *not* in the UI
- No recipe editing UI (even though an API endpoint exists).
- No two-pane library/editor layout.
- No search, filters, or sorting.
- No review/confirmation state before saving.

---

## 4. Backend & API (Implemented)

### 4.1 Tech Stack
- **Backend:** FastAPI (Python)
- **Auth:** JWT stored in HttpOnly cookies
- **Database:** SQLite (`/recipes/auth.db`) for user accounts
- **Storage:** Markdown files written to `/recipes`
- **LLM:** OpenAI Responses API (model configurable via env)

### 4.2 API Endpoints
**Health**
- `GET /health` -> filesystem and LLM config status

**Recipes**
- `POST /api/recipes` -> create recipe from URL
- `GET /api/recipes` -> list recipes (metadata from filenames)
- `GET /api/recipes/{slug}` -> fetch Markdown
- `PUT /api/recipes/{slug}` -> update Markdown (raw string body)
- `POST /api/recipes/{slug}/rescrape` -> re-run extraction using stored URL

**Auth**
- `POST /api/auth/register` -> create user (first user allowed without auth; first user becomes admin)
- `POST /api/auth/login` -> sets HttpOnly cookie
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

**Admin (requires admin)**
- `GET /api/admin/users`
- `PUT /api/admin/users/{user_id}`
- `DELETE /api/admin/users/{user_id}`

---

## 5. LLM Recipe Extraction (Current Behavior)

The backend calls the OpenAI Responses API with:
- `model`: `OPENAI_MODEL` env var (default `gpt-5.1` in code, `gpt-5.2` in docker-compose)
- `tools`: `[{"type": "web_search"}]`
- `temperature`: `0`
- `timeout`: `60s`

The system prompt instructs the model to visit the URL, extract the recipe, and return a Markdown file that includes YAML front matter with keys like title, slug, url, meal/category/tags, and time fields.
