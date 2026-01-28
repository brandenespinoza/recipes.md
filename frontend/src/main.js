const root = document.getElementById("app");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}

root.innerHTML = `
  <main class="app-main">
    <style>
      :root {
        --bg: #000000;
        --text: #ffffff;
        --border: #ffffff;
        --muted: #333333;
        --muted-strong: #444444;
        --panel: #111111;
        --font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .app-main {
        background-color: var(--bg);
        color: var(--text);
        font-family: var(--font);
        min-height: 100vh;
        margin: 0;
        padding: 32px 24px 40px;
        box-sizing: border-box;
      }
      .header {
        margin-bottom: 32px;
        position: relative;
      }
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .menu-toggle {
        background: none;
        border: none;
        color: var(--text);
        cursor: pointer;
        padding: 4px;
        font-size: 20px;
        line-height: 1;
      }
      .logo {
        font-size: 24px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        font-weight: 600;
        margin: 0;
        text-align: center;
        flex: 1;
        color: inherit;
        text-decoration: none;
      }
      .header-spacer {
        width: 28px;
      }
      .menu-panel {
        position: absolute;
        top: 36px;
        left: 0;
        padding: 8px 0;
        background-color: var(--bg);
        border: 1px solid var(--border);
        border-radius: 0;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        display: none;
      }
      .menu-item {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        color: var(--text);
        cursor: pointer;
        padding: 6px 12px;
        font-size: inherit;
        letter-spacing: inherit;
        text-transform: inherit;
        text-decoration: none;
      }
      .view {
        margin: 0 auto;
      }
      .view--wide {
        max-width: 720px;
      }
      .view--narrow {
        max-width: 480px;
      }
      .text-small {
        font-size: 12px;
      }
      .text-link {
        color: var(--text);
        text-decoration: underline;
      }
      .text-link:hover,
      .text-link:focus {
        opacity: 0.8;
      }
      .m-0 {
        margin: 0;
      }
      .mb-4 {
        margin-bottom: 4px;
      }
      .mb-8 {
        margin-bottom: 8px;
      }
      .mb-12 {
        margin-bottom: 12px;
      }
      .mb-16 {
        margin-bottom: 16px;
      }
      .mt-12 {
        margin-top: 12px;
      }
      .recipes-list {
        list-style: none;
        padding: 0;
        margin: 0 0 4px;
        font-size: 16px;
        line-height: 1.6;
        text-transform: uppercase;
      }
      .recipes-list a {
        color: inherit;
        text-decoration: none;
        display: inline-block;
        padding: 2px 0;
      }
      .recipes-list a:hover,
      .recipes-list a:focus {
        text-decoration: underline;
      }
      .filters-panel {
        margin-bottom: 16px;
      }
      .filter-dropdowns {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .filter-dropdown {
        position: relative;
      }
      .filter-dropdown-trigger {
        border-radius: 999px;
        border: 1px solid var(--border);
        background-color: transparent;
        color: var(--text);
        padding: 6px 12px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
      }
      .filter-dropdown-trigger.is-open {
        background-color: var(--text);
        color: var(--bg);
      }
      .filter-dropdown-trigger:disabled {
        opacity: 0.4;
        cursor: default;
      }
      .filter-dropdown-menu {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        z-index: 20;
        background-color: var(--panel);
        border: 1px solid var(--border);
        padding: 10px;
        min-width: 220px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        display: none;
      }
      .filter-dropdown.is-open .filter-dropdown-menu {
        display: block;
      }
      .filter-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        max-height: 220px;
        overflow: auto;
        padding-right: 2px;
      }
      .filter-pill {
        border-radius: 999px;
        border: 1px solid var(--border);
        background-color: transparent;
        color: var(--text);
        padding: 4px 10px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
      }
      .filter-pill.is-active {
        background-color: var(--text);
        color: var(--bg);
      }
      .filter-pill:disabled {
        opacity: 0.4;
        cursor: default;
      }
      .filter-pill--all {
        border-style: dashed;
      }
      .status-line {
        font-size: 12px;
        min-height: 1em;
        margin: 0;
      }
      #login-status,
      #change-password-status {
        text-align: center;
      }
      .recipe-title {
        font-size: 24px;
        text-transform: uppercase;
        margin: 0 0 12px;
      }
      .recipe-body {
        font-family: inherit;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
      }
      .section-title {
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        margin: 0 0 12px;
        text-align: center;
      }
      .section-subtitle {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .input-text {
        width: 100%;
        max-width: 480px;
        margin: 12px auto;
        display: block;
        box-sizing: border-box;
        padding: 6px 14px;
        height: 32px;
        background-color: var(--panel);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 999px;
        font-family: inherit;
        font-size: 12px;
      }
      .button {
        font-family: inherit;
        border-radius: 999px;
        cursor: pointer;
        width: 150px;
        display: block;
        margin: 12px auto;
      }
      .button-primary {
        background-color: var(--text);
        color: var(--bg);
        border: 1px solid var(--text);
      }
      .button-dashed {
        background-color: transparent;
        color: var(--text);
        border: 1px dashed var(--text);
      }
      .button-block {
        width: 150px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
      }
      .section-divider {
        border-top: 1px solid var(--muted-strong);
        margin-top: 12px;
        padding-top: 12px;
      }
      @keyframes quickAddSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .quick-add-spinner {
        display: inline-block;
        animation: quickAddSpin 0.8s linear infinite;
        line-height: 1;
        font-size: 16px;
      }
      .quick-add-wrapper {
        margin-top: 12px;
        display: flex;
        justify-content: center;
      }
      .quick-add-pill {
        display: flex;
        align-items: center;
        border: 1px solid var(--border);
        border-radius: 999px;
        background-color: transparent;
        color: var(--text);
        overflow: hidden;
        transition: width 0.18s ease-out, background-color 0.18s ease-out, border-color 0.18s ease-out;
        width: 32px;
        height: 32px;
      }
      .quick-add-pill.collapsed {
        width: 32px;
        justify-content: center;
      }
      .quick-add-pill.expanded {
        width: 320px;
        background-color: var(--panel);
        border-color: var(--border);
      }
      .quick-add-input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        color: var(--text);
        font-family: inherit;
        font-size: 12px;
        padding: 0 8px 0 10px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease-out;
      }
      .quick-add-pill.collapsed .quick-add-input {
        flex: 0;
        width: 0;
        padding: 0;
      }
      .quick-add-pill.expanded .quick-add-input {
        opacity: 1;
        pointer-events: auto;
        flex: 1;
        width: auto;
        padding: 0 8px 0 10px;
      }
      .quick-add-button {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background-color: transparent;
        color: var(--text);
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .quick-add-button:disabled {
        cursor: default;
        opacity: 0.75;
      }
      .quick-add-status {
        font-size: 11px;
        margin-top: 4px;
        min-height: 1em;
        text-align: center;
      }
    </style>
    <header class="header">
      <div class="header-row">
        <button id="menu-toggle" class="menu-toggle" aria-label="Menu">
          &#9776;
        </button>
        <a id="logo-recipes" class="logo" href="/recipes" data-link>
          RECIPES.MD
        </a>
        <span class="header-spacer"></span>
      </div>
      <nav id="menu-panel" class="menu-panel">
        <a id="menu-home" class="menu-item" href="/recipes" data-link>HOME</a>
        <a id="menu-account" class="menu-item" href="/account" data-link>ACCOUNT</a>
      </nav>
    </header>

    <section id="quick-add-section" class="view view--wide mb-16">
      <div id="quick-add-wrapper" class="quick-add-wrapper">
        <div id="quick-add-pill" class="quick-add-pill collapsed">
          <input
            id="quick-recipe-url"
            class="quick-add-input"
            type="url"
            placeholder="Paste recipe URL"
          />
          <button id="quick-add-button" class="quick-add-button" aria-label="Add recipe">
            +
          </button>
        </div>
      </div>
      <p id="quick-add-status" class="quick-add-status"></p>
    </section>

    <!-- Home / recipes list -->
    <section id="view-home" class="view view--wide">
      <div id="recipes-filters" class="filters-panel" style="display: none;">
        <div id="recipes-filters-content"></div>
      </div>
      <ul id="recipes-list" class="recipes-list"></ul>
      <p id="recipes-status" class="status-line mb-12"></p>
    </section>

    <!-- Recipe detail -->
    <section id="view-recipe" class="view view--wide" style="display:none;">
      <h2 id="recipe-detail-title" class="recipe-title"></h2>
      <div id="recipe-detail-body" class="recipe-body"></div>
    </section>

    <!-- Account: shows register for first user, login if logged out, account tools if logged in -->
    <section id="view-account" class="view view--narrow" style="display: none;">
      <div id="account-register" style="display:none;">
        <h2 class="section-title">Create account</h2>
        <input
          id="register-username"
          type="text"
          placeholder="username"
          class="input-text mb-8"
        />
        <input
          id="register-password"
          type="password"
          placeholder="••••••••"
          class="input-text mb-8"
        />
        <input
          id="register-confirm-password"
          type="password"
          placeholder="Confirm password"
          class="input-text mb-12"
        />
        <button id="register-submit" class="button button-primary button-block mb-4">CREATE ACCOUNT</button>
        <p id="register-status" class="status-line"></p>
        <p class="text-small m-0 mt-12">Already have an account? <a class="text-link" href="/account/login" data-link>Sign in</a></p>
      </div>

      <div id="account-login">
        <h2 class="section-title">Login</h2>
        <input
          id="login-username"
          type="text"
          placeholder="username"
          class="input-text mb-8"
        />
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          class="input-text mb-12"
        />
        <button id="login-submit" class="button button-primary button-block mb-4">SIGN IN</button>
        <p id="login-status" class="status-line"></p>
        <p class="text-small m-0 mt-12">Need to set up the first account? <a class="text-link" href="/account/register" data-link>Create one</a></p>
      </div>

      <div id="account-details" style="display:none;">
        <h2 class="section-title">Account</h2>
        <p id="account-user" class="text-small m-0 mb-8"></p>
        <button id="logout-button" class="button button-dashed mb-16">Sign out</button>

        <div class="section-divider">
          <h3 class="section-subtitle">Change password</h3>
          <input
            id="current-password"
            type="password"
            placeholder="Current password"
            class="input-text mb-8"
          />
          <input
            id="new-password"
            type="password"
            placeholder="New password"
            class="input-text mb-8"
          />
          <input
            id="confirm-new-password"
            type="password"
            placeholder="Confirm new password"
            class="input-text mb-8"
          />
          <button id="change-password-button" class="button button-primary button-block mb-4">Update password</button>
          <p id="change-password-status" class="status-line"></p>
        </div>
      </div>
    </section>
  </main>
`;


const API_BASE = "/api";

// Navigation
const menuToggle = document.getElementById("menu-toggle");
const menuPanel = document.getElementById("menu-panel");
const menuHome = document.getElementById("menu-home");
const menuAccount = document.getElementById("menu-account");

// Views
const viewHome = document.getElementById("view-home");
const viewRecipe = document.getElementById("view-recipe");
const viewAccount = document.getElementById("view-account");
const quickAddSection = document.getElementById("quick-add-section");

// Quick add
const quickAddWrapper = document.getElementById("quick-add-wrapper");
const quickAddPill = document.getElementById("quick-add-pill");
const quickRecipeUrlInput = document.getElementById("quick-recipe-url");
const quickAddButton = document.getElementById("quick-add-button");
const quickAddStatus = document.getElementById("quick-add-status");
let quickAddExpanded = false;


// Home / recipes
const recipesFilters = document.getElementById("recipes-filters");
const recipesFiltersContent = document.getElementById("recipes-filters-content");
const recipesList = document.getElementById("recipes-list");
const recipesStatus = document.getElementById("recipes-status");
const recipeDetailTitle = document.getElementById("recipe-detail-title");
const recipeDetailBody = document.getElementById("recipe-detail-body");
let recipesCache = [];

const activeFilters = {
  meal: new Set(),
  category: new Set(),
  ethnicity: new Set(),
  diet: new Set(),
  tags: new Set(),
  time: new Set(),
};
let openFilterDropdown = null;

const TIME_RANGES = [
  { id: "under-30", label: "Under 30 min", min: 0, max: 29 },
  { id: "30-60", label: "30-60 min", min: 30, max: 59 },
  { id: "60-120", label: "1-2 hours", min: 60, max: 119 },
  { id: "120-plus", label: "2+ hours", min: 120, max: Infinity },
];

// Account / registration + login
const accountRegister = document.getElementById("account-register");
const accountLogin = document.getElementById("account-login");
const accountDetails = document.getElementById("account-details");
const accountUser = document.getElementById("account-user");
const registerUsernameInput = document.getElementById("register-username");
const registerPasswordInput = document.getElementById("register-password");
const registerConfirmPasswordInput = document.getElementById("register-confirm-password");
const registerSubmitButton = document.getElementById("register-submit");
const registerStatus = document.getElementById("register-status");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginSubmitButton = document.getElementById("login-submit");
const loginStatus = document.getElementById("login-status");

// Account / change password
const logoutButton = document.getElementById("logout-button");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const confirmNewPasswordInput = document.getElementById("confirm-new-password");
const changePasswordButton = document.getElementById("change-password-button");
const changePasswordStatus = document.getElementById("change-password-status");

let isAuthenticated = false;
let currentUser = null;
let hasUsers = null;
let accountMode = "login";
let pendingLoginMessage = "";
let pendingSharePayload = null;

function setActiveView(view) {
  const views = {
    home: viewHome,
    recipe: viewRecipe,
    account: viewAccount,
  };

  Object.entries(views).forEach(([key, el]) => {
    if (!el) return;
    el.style.display = key === view ? "block" : "none";
  });

  if (quickAddSection) {
    quickAddSection.style.display = view === "home" || view === "recipe" ? "block" : "none";
  }

  const activeStyles = (button, active) => {
    if (!button) return;
    button.style.textDecoration = active ? "underline" : "none";
  };

  activeStyles(menuHome, view === "home" || view === "recipe");
  activeStyles(menuAccount, view === "account");
}

const ROUTES = {
  home: "/",
  recipes: "/recipes",
  account: "/account",
  login: "/account/login",
  register: "/account/register",
};
const RECIPE_PREFIX = "/recipes/";
const BASE_TITLE = "RECIPES.MD";

function parseShareTargetParams(searchParams) {
  if (!searchParams) return null;
  const url = (searchParams.get("url") || "").trim();
  const text = (searchParams.get("text") || "").trim();
  const title = (searchParams.get("title") || "").trim();
  if (!url && !text && !title) return null;
  return { url, text, title };
}

function setPendingShare(payload) {
  if (!payload) return;
  const trimmed = {
    url: payload.url ? payload.url.trim() : "",
    text: payload.text ? payload.text.trim() : "",
    title: payload.title ? payload.title.trim() : "",
  };
  if (!trimmed.url && !trimmed.text && !trimmed.title) return;
  pendingSharePayload = trimmed;
}

function extractShareUrl(payload) {
  if (!payload) return "";
  if (payload.url) return payload.url;
  if (!payload.text) return "";
  const match = payload.text.match(/https?:\/\/\S+/i);
  return match ? match[0] : "";
}

function applyPendingShare() {
  if (!pendingSharePayload) return;
  if (!quickAddPill || !quickRecipeUrlInput) return;
  const sharedUrl = extractShareUrl(pendingSharePayload);
  if (!sharedUrl) {
    quickAddStatus.textContent = "Shared item does not include a URL.";
    pendingSharePayload = null;
    return;
  }
  quickRecipeUrlInput.value = sharedUrl;
  expandQuickAdd();
  quickAddStatus.textContent = pendingSharePayload.title
    ? `Shared: ${pendingSharePayload.title}`
    : "Ready to add shared recipe.";
  pendingSharePayload = null;
}

function setPageTitle(subtitle) {
  document.title = subtitle ? `${BASE_TITLE} — ${subtitle}` : BASE_TITLE;
}

function normalizePath(pathname) {
  if (!pathname) return "/";
  const clean = pathname.split("?")[0].split("#")[0];
  if (clean.length > 1 && clean.endsWith("/")) {
    return clean.slice(0, -1);
  }
  return clean || "/";
}

function navigateTo(path, { replace = false } = {}) {
  if (!path) return;
  const target = path.startsWith("/") ? path : `/${path}`;
  if (menuPanel) {
    menuPanel.style.display = "none";
  }
  if (replace) {
    history.replaceState(null, "", target);
  } else {
    history.pushState(null, "", target);
  }
  handleRoute();
}

function setAccountMode(mode, { message = "" } = {}) {
  accountMode = mode;
  if (mode === "register" && registerStatus) {
    registerStatus.textContent = message;
  } else if (mode === "login" && loginStatus) {
    loginStatus.textContent = message;
  }
  updateAccountView();
}

function entryRoute() {
  if (hasUsers === false) return ROUTES.register;
  if (isAuthenticated) return ROUTES.recipes;
  return ROUTES.login;
}

function requireAuth(message) {
  if (isAuthenticated) return true;
  setActiveView("account");
  if (hasUsers === false) {
    setPageTitle("Create account");
    setAccountMode("register", {
      message: "Create the first account to get started.",
    });
  } else {
    setPageTitle("Login");
    setAccountMode("login", { message: message || "" });
  }
  return false;
}

function handleSessionExpired(message) {
  isAuthenticated = false;
  currentUser = null;
  updateAccountView();
  pendingLoginMessage = message;
  navigateTo(ROUTES.login, { replace: true });
}

function handleRoute() {
  const currentUrl = new URL(window.location.href);
  const path = normalizePath(currentUrl.pathname);

  if (path === ROUTES.home) {
    navigateTo(entryRoute(), { replace: true });
    return;
  }

  if (path === ROUTES.recipes) {
    if (hasUsers === false) {
      navigateTo(ROUTES.register, { replace: true });
      return;
    }
    const authMessage = pendingSharePayload
      ? "Please sign in to add the shared recipe."
      : "Please sign in to view recipes.";
    if (!requireAuth(authMessage)) return;
    setActiveView("home");
    setPageTitle("Recipes");
    loadRecipes();
    applyPendingShare();
    return;
  }

  if (path === "/add") {
    const sharePayload = parseShareTargetParams(currentUrl.searchParams);
    if (sharePayload) {
      setPendingShare(sharePayload);
    }
    navigateTo(ROUTES.recipes, { replace: true });
    return;
  }

  if (path === "/share-target") {
    const sharePayload = parseShareTargetParams(currentUrl.searchParams);
    if (sharePayload) {
      setPendingShare(sharePayload);
    }
    navigateTo("/add", { replace: true });
    return;
  }

  if (path === ROUTES.account) {
    setActiveView("account");
    if (isAuthenticated) {
      setPageTitle("Account");
      updateAccountView();
      return;
    }
    if (hasUsers === false) {
      setPageTitle("Create account");
      setAccountMode("register", { message: "" });
      return;
    }
    setPageTitle("Login");
    setAccountMode("login", { message: "" });
    return;
  }

  if (path === ROUTES.login) {
    if (hasUsers === false) {
      navigateTo(ROUTES.register, { replace: true });
      return;
    }
    if (isAuthenticated) {
      navigateTo(ROUTES.recipes, { replace: true });
      return;
    }
    setActiveView("account");
    setPageTitle("Login");
    const message = pendingLoginMessage || "Please sign in.";
    pendingLoginMessage = "";
    setAccountMode("login", { message });
    return;
  }

  if (path === ROUTES.register) {
    if (hasUsers !== false) {
      navigateTo(isAuthenticated ? ROUTES.recipes : ROUTES.login, { replace: true });
      return;
    }
    setActiveView("account");
    setPageTitle("Create account");
    setAccountMode("register", { message: "Create the first account to get started." });
    return;
  }

  if (path === "/login") {
    navigateTo(ROUTES.login, { replace: true });
    return;
  }

  if (path.startsWith(RECIPE_PREFIX)) {
    const slug = decodeURIComponent(path.slice(RECIPE_PREFIX.length));
    if (!slug) {
      navigateTo(ROUTES.recipes, { replace: true });
      return;
    }
    if (hasUsers === false) {
      navigateTo(ROUTES.register, { replace: true });
      return;
    }
    if (!requireAuth("Please sign in to view recipes.")) return;
    setPageTitle("Recipe");
    openRecipeDetail(slug);
    applyPendingShare();
    return;
  }

  const legacySlug = decodeURIComponent(path.slice(1));
  if (legacySlug && !legacySlug.includes("/")) {
    navigateTo(`${RECIPE_PREFIX}${encodeURIComponent(legacySlug)}`, { replace: true });
    return;
  }

  setActiveView("home");
  setPageTitle("Recipes");
}

function updateAccountView() {
  if (isAuthenticated && currentUser) {
    if (accountRegister) {
      accountRegister.style.display = "none";
    }
    accountLogin.style.display = "none";
    accountDetails.style.display = "block";
    accountUser.textContent = `Signed in as ${currentUser.username}`;
  } else {
    const showRegister = accountMode === "register" || hasUsers === false;
    if (accountRegister) {
      accountRegister.style.display = showRegister ? "block" : "none";
    }
    accountLogin.style.display = showRegister ? "none" : "block";
    accountDetails.style.display = "none";
  }
}

async function fetchRegistrationStatus() {
  try {
    const response = await fetch(`${API_BASE}/auth/registration-status`, {
      method: "GET",
    });
    if (!response.ok) {
      hasUsers = true;
      return;
    }
    const data = await response.json();
    hasUsers = typeof data?.has_users === "boolean" ? data.has_users : true;
  } catch (error) {
    console.error("Error fetching registration status:", error);
    hasUsers = true;
  }
}

async function fetchCurrentUser() {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
    });
    if (!response.ok) {
      isAuthenticated = false;
      currentUser = null;
      updateAccountView();
      return;
    }
    const data = await response.json();
    isAuthenticated = true;
    currentUser = data;
    updateAccountView();
  } catch (error) {
    console.error("Error fetching current user:", error);
    isAuthenticated = false;
    currentUser = null;
    updateAccountView();
  }
}

async function loadRecipes() {
  recipesStatus.textContent = "Loading recipes...";
  recipesList.innerHTML = "";
  if (recipesFilters) {
    recipesFilters.style.display = "none";
  }

  try {
    const response = await fetch(`${API_BASE}/recipes`, { method: "GET" });

    if (response.status === 401) {
      handleSessionExpired("Please sign in to view recipes.");
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("List recipes error:", text);
      recipesStatus.textContent = `Error: ${response.status} ${response.statusText}`;
      return;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      recipesCache = [];
      recipesStatus.textContent = "No recipes saved yet.";
      return;
    }

    recipesCache = data.map((recipe) => normalizeRecipeForFilters(recipe));
    renderFilters();
    applyFilters();
  } catch (error) {
    console.error("Network error while listing recipes:", error);
    recipesStatus.textContent = "Network error. Is the backend running?";
  }
}

function normalizeFilterValue(value) {
  if (value == null) return "";
  return String(value).trim().toLowerCase();
}

function normalizeFilterScalar(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeFilterValue(item);
      if (normalized) return normalized;
    }
    return null;
  }
  const normalized = normalizeFilterValue(value);
  return normalized || null;
}

function normalizeFilterList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFilterValue(item)).filter(Boolean);
  }
  const normalized = normalizeFilterValue(value);
  return normalized ? [normalized] : [];
}

function formatFilterLabel(value) {
  if (!value) return "";
  return String(value).replace(/[_-]+/g, " ").toUpperCase();
}

function formatFilterTriggerLabel(label, groupKey) {
  const count = activeFilters[groupKey] ? activeFilters[groupKey].size : 0;
  const suffix = count ? `· ${count}` : "· ALL";
  return `${formatFilterLabel(label)} ${suffix}`;
}

function parseDurationMinutes(value) {
  if (value == null) return null;
  if (typeof value === "number") {
    return value > 0 ? Math.round(value) : null;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.toLowerCase();

  const match = normalized.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i,
  );
  if (!match) return parseLooseDurationMinutes(normalized);

  const days = match[1] ? parseInt(match[1], 10) : 0;
  const hours = match[2] ? parseInt(match[2], 10) : 0;
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  const seconds = match[4] ? parseInt(match[4], 10) : 0;

  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
  if (totalMinutes > 0) return totalMinutes;
  if (seconds > 0) return Math.ceil(seconds / 60);
  return null;
}

function parseLooseDurationMinutes(value) {
  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;

  const numericMatch = raw.match(/^\d+$/);
  if (numericMatch) {
    const minutes = parseInt(raw, 10);
    return minutes > 0 ? minutes : null;
  }

  const colonMatch = raw.match(/^(\d+)\s*:\s*(\d{1,2})(?::\d{1,2})?$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const minutes = parseInt(colonMatch[2], 10);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes > 0 ? totalMinutes : null;
  }

  const unitRegex =
    /(\d+(?:\.\d+)?)\s*(days?|day|d|hours?|hrs?|hr|h|minutes?|mins?|min|m|seconds?|secs?|sec|s)/g;
  let totalMinutes = 0;
  let matched = false;
  let unitMatch = null;
  while ((unitMatch = unitRegex.exec(raw))) {
    matched = true;
    const amount = parseFloat(unitMatch[1]);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const unit = unitMatch[2];
    if (unit.startsWith("d")) {
      totalMinutes += amount * 24 * 60;
    } else if (unit.startsWith("h")) {
      totalMinutes += amount * 60;
    } else if (unit.startsWith("m")) {
      totalMinutes += amount;
    } else if (unit.startsWith("s")) {
      totalMinutes += amount / 60;
    }
  }

  if (!matched) return null;
  return totalMinutes > 0 ? Math.ceil(totalMinutes) : null;
}

function getTimeRangeId(minutes) {
  if (minutes == null) return null;
  const range = TIME_RANGES.find((entry) => minutes >= entry.min && minutes <= entry.max);
  return range ? range.id : null;
}

function normalizeRecipeForFilters(recipe) {
  const normalized = recipe && typeof recipe === "object" ? { ...recipe } : {};
  const meal = normalizeFilterList(normalized.meal);
  const category = normalizeFilterScalar(normalized.category);
  const ethnicity = normalizeFilterList(normalized.ethnicity);
  const diet = normalizeFilterList(normalized.diet_friendly);
  const tags = normalizeFilterList(normalized.tags);
  const totalMinutes = parseDurationMinutes(normalized.total_time);

  normalized._filter = {
    meal,
    category,
    ethnicity,
    diet,
    tags,
    totalMinutes,
  };
  return normalized;
}

function buildFilterOptions(recipes) {
  const options = {
    meal: new Set(),
    category: new Set(),
    ethnicity: new Set(),
    diet: new Set(),
    tags: new Set(),
  };
  const timeCounts = {};
  TIME_RANGES.forEach((range) => {
    timeCounts[range.id] = 0;
  });

  recipes.forEach((recipe) => {
    if (!recipe || !recipe._filter) return;
    const filter = recipe._filter;
    if (Array.isArray(filter.meal)) {
      filter.meal.forEach((item) => {
        if (item) options.meal.add(item);
      });
    }
    if (filter.category) {
      options.category.add(filter.category);
    }
    if (Array.isArray(filter.ethnicity)) {
      filter.ethnicity.forEach((item) => {
        if (item) options.ethnicity.add(item);
      });
    }
    if (Array.isArray(filter.diet)) {
      filter.diet.forEach((item) => {
        if (item) options.diet.add(item);
      });
    }
    if (Array.isArray(filter.tags)) {
      filter.tags.forEach((item) => {
        if (item) options.tags.add(item);
      });
    }
    const rangeId = getTimeRangeId(filter.totalMinutes);
    if (rangeId && timeCounts[rangeId] != null) {
      timeCounts[rangeId] += 1;
    }
  });

  return {
    options: {
      meal: Array.from(options.meal).sort(),
      category: Array.from(options.category).sort(),
      ethnicity: Array.from(options.ethnicity).sort(),
      diet: Array.from(options.diet).sort(),
      tags: Array.from(options.tags).sort(),
    },
    timeCounts,
  };
}

function renderFilters() {
  if (!recipesFilters || !recipesFiltersContent) return;
  if (!recipesCache || recipesCache.length === 0) {
    recipesFilters.style.display = "none";
    return;
  }

  recipesFilters.style.display = "block";
  recipesFiltersContent.innerHTML = "";

  const { options, timeCounts } = buildFilterOptions(recipesCache);
  const dropdowns = document.createElement("div");
  dropdowns.className = "filter-dropdowns";

  const buildDropdown = (groupKey, label, values, config = {}) => {
    const hasValues = Array.isArray(values) && values.length > 0;
    const hasSelections = activeFilters[groupKey] && activeFilters[groupKey].size > 0;
    if (!hasValues && !hasSelections && !config.alwaysShow) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "filter-dropdown";
    wrapper.dataset.filterGroup = groupKey;
    if (openFilterDropdown === groupKey) {
      wrapper.classList.add("is-open");
    }

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "filter-dropdown-trigger";
    trigger.dataset.filterTrigger = "true";
    trigger.dataset.filterGroup = groupKey;
    trigger.textContent = formatFilterTriggerLabel(label, groupKey);
    if (!hasValues && !config.alwaysShow) {
      trigger.disabled = true;
    }
    if (openFilterDropdown === groupKey) {
      trigger.classList.add("is-open");
    }
    wrapper.appendChild(trigger);

    const menu = document.createElement("div");
    menu.className = "filter-dropdown-menu";

    const pills = document.createElement("div");
    pills.className = "filter-pills";

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "filter-pill filter-pill--all";
    allButton.dataset.filterGroup = groupKey;
    allButton.dataset.filterAll = "true";
    allButton.textContent = "All";
    if (activeFilters[groupKey].size === 0) {
      allButton.classList.add("is-active");
    }
    pills.appendChild(allButton);

    values.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-pill";
      button.dataset.filterGroup = groupKey;
      button.dataset.filterValue = value;
      button.textContent = formatFilterLabel(value);
      if (activeFilters[groupKey].has(value)) {
        button.classList.add("is-active");
      }
      pills.appendChild(button);
    });

    menu.appendChild(pills);
    wrapper.appendChild(menu);
    dropdowns.appendChild(wrapper);
  };

  buildDropdown("meal", "Meal", options.meal);
  buildDropdown("category", "Category", options.category);
  buildDropdown("ethnicity", "Ethnicity", options.ethnicity);
  buildDropdown("diet", "Diet", options.diet);
  buildDropdown("tags", "Tags", options.tags);

  const timeWrapper = document.createElement("div");
  timeWrapper.className = "filter-dropdown";
  timeWrapper.dataset.filterGroup = "time";
  if (openFilterDropdown === "time") {
    timeWrapper.classList.add("is-open");
  }

  const timeTrigger = document.createElement("button");
  timeTrigger.type = "button";
  timeTrigger.className = "filter-dropdown-trigger";
  timeTrigger.dataset.filterTrigger = "true";
  timeTrigger.dataset.filterGroup = "time";
  timeTrigger.textContent = formatFilterTriggerLabel("Total time", "time");
  if (openFilterDropdown === "time") {
    timeTrigger.classList.add("is-open");
  }
  timeWrapper.appendChild(timeTrigger);

  const timeMenu = document.createElement("div");
  timeMenu.className = "filter-dropdown-menu";
  const timePills = document.createElement("div");
  timePills.className = "filter-pills";

  const timeAllButton = document.createElement("button");
  timeAllButton.type = "button";
  timeAllButton.className = "filter-pill filter-pill--all";
  timeAllButton.dataset.filterGroup = "time";
  timeAllButton.dataset.filterAll = "true";
  timeAllButton.textContent = "All";
  if (activeFilters.time.size === 0) {
    timeAllButton.classList.add("is-active");
  }
  timePills.appendChild(timeAllButton);

  TIME_RANGES.forEach((range) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-pill";
    button.dataset.filterGroup = "time";
    button.dataset.filterValue = range.id;
    button.textContent = range.label;
    const count = timeCounts[range.id] || 0;
    if (count === 0) {
      button.disabled = true;
    }
    if (activeFilters.time.has(range.id)) {
      button.classList.add("is-active");
    }
    timePills.appendChild(button);
  });

  timeMenu.appendChild(timePills);
  timeWrapper.appendChild(timeMenu);
  dropdowns.appendChild(timeWrapper);

  recipesFiltersContent.appendChild(dropdowns);
}

function matchesScalarFilter(value, activeSet) {
  if (!activeSet || activeSet.size === 0) return true;
  if (!value) return false;
  return activeSet.has(value);
}

function matchesListFilter(values, activeSet) {
  if (!activeSet || activeSet.size === 0) return true;
  if (!Array.isArray(values) || values.length === 0) return false;
  for (const value of activeSet) {
    if (values.includes(value)) {
      return true;
    }
  }
  return false;
}

function matchesTimeFilter(minutes, activeSet) {
  if (!activeSet || activeSet.size === 0) return true;
  const rangeId = getTimeRangeId(minutes);
  if (!rangeId) return false;
  return activeSet.has(rangeId);
}

function renderRecipesList(recipes, totalCount) {
  recipesList.innerHTML = "";

  if (!totalCount) {
    recipesStatus.textContent = "No recipes saved yet.";
    return;
  }

  if (!recipes || recipes.length === 0) {
    recipesStatus.textContent = "No recipes match your filters.";
    return;
  }

  recipes.forEach((recipe) => {
    const li = document.createElement("li");
    const title = (recipe && recipe.title) || (recipe && recipe.slug) || "Untitled recipe";
    if (recipe && recipe.slug) {
      const link = document.createElement("a");
      link.href = `${RECIPE_PREFIX}${encodeURIComponent(recipe.slug)}`;
      link.textContent = title;
      link.setAttribute("data-link", "");
      li.appendChild(link);
    } else {
      li.textContent = title;
    }
    recipesList.appendChild(li);
  });

  recipesStatus.textContent = "";
}

function applyFilters() {
  if (!recipesCache || recipesCache.length === 0) {
    renderRecipesList([], 0);
    return;
  }

  const filtered = recipesCache.filter((recipe) => {
    if (!recipe || !recipe._filter) return false;
    const filter = recipe._filter;
    if (!matchesListFilter(filter.meal, activeFilters.meal)) return false;
    if (!matchesScalarFilter(filter.category, activeFilters.category)) return false;
    if (!matchesListFilter(filter.ethnicity, activeFilters.ethnicity)) return false;
    if (!matchesListFilter(filter.diet, activeFilters.diet)) return false;
    if (!matchesListFilter(filter.tags, activeFilters.tags)) return false;
    if (!matchesTimeFilter(filter.totalMinutes, activeFilters.time)) return false;
    return true;
  });

  renderRecipesList(filtered, recipesCache.length);
}

function toggleFilterDropdown(group) {
  openFilterDropdown = openFilterDropdown === group ? null : group;
}

function setScrapeStatus(statusEl, message) {
  if (!statusEl) return;
  statusEl.textContent = message;
  if (statusEl._clearTimeout) {
    clearTimeout(statusEl._clearTimeout);
  }
  if (!message) return;
  statusEl._clearTimeout = setTimeout(() => {
    if (statusEl.textContent === message) {
      statusEl.textContent = "";
    }
  }, 3000);
}

async function scrapeRecipeWithElements(urlInput, buttonEl, statusEl) {
  const url = urlInput.value.trim();
  if (!url) {
    setScrapeStatus(statusEl, "Please enter a URL.");
    return;
  }

  if (!requireAuth("Please sign in to add recipes.")) {
    return;
  }

  buttonEl.disabled = true;
  const originalHTML = buttonEl.innerHTML;
  const originalAriaLabel = buttonEl.getAttribute("aria-label");
  const originalText = (buttonEl.textContent || "").trim();
  const showSpinner =
    buttonEl.classList && buttonEl.classList.contains("quick-add-button")
      ? true
      : originalText === "+";

  if (showSpinner) {
    buttonEl.innerHTML = `<span class="quick-add-spinner" aria-hidden="true">⟳</span>`;
    buttonEl.setAttribute("aria-label", "Scraping recipe");
  } else {
    buttonEl.textContent = "SCRAPING…";
  }
  setScrapeStatus(statusEl, "Scraping recipe...");

  try {
    const response = await fetch(`${API_BASE}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (response.status === 401) {
      handleSessionExpired("Session expired. Please sign in again.");
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Scrape error:", text);
      setScrapeStatus(statusEl, `Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const savedSlug = data && data.metadata ? data.metadata.slug : "";
    const savedTitle = data && data.metadata ? data.metadata.title : "";
    setScrapeStatus(statusEl, `Saved recipe: ${savedTitle || savedSlug}`);
    urlInput.value = "";
    await loadRecipes();
    if (savedSlug) {
      const targetPath = `${RECIPE_PREFIX}${encodeURIComponent(savedSlug)}`;
      const currentPath = normalizePath(window.location.pathname);
      if (currentPath === targetPath) {
        await openRecipeDetail(savedSlug, savedTitle);
      } else {
        navigateTo(targetPath);
      }
    }
  } catch (error) {
    console.error("Network error:", error);
    setScrapeStatus(statusEl, "Network error. Is the backend running?");
  } finally {
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHTML;
    if (originalAriaLabel === null) {
      buttonEl.removeAttribute("aria-label");
    } else {
      buttonEl.setAttribute("aria-label", originalAriaLabel);
    }
  }
}


async function openRecipeDetail(slug, title) {
  recipeDetailTitle.textContent = title || slug;
  recipeDetailBody.textContent = "Loading…";
  setActiveView("recipe");
  try {
    const response = await fetch(`${API_BASE}/recipes/${encodeURIComponent(slug)}`, {
      method: "GET",
    });

    if (response.status === 401) {
      handleSessionExpired("Session expired. Please sign in again.");
      viewRecipe.style.display = "none";
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Get recipe error:", text);
      recipeDetailBody.textContent = `Error: ${response.status} ${response.statusText}`;
      return;
    }

    const data = await response.json();
    const markdown = data.markdown || "";
    const { frontmatter } = parseFrontmatter(markdown);
    const frontmatterTitle =
      frontmatter && frontmatter.title ? String(frontmatter.title).trim() : "";
    let displayTitle = slug;
    if (frontmatterTitle) {
      displayTitle = frontmatterTitle;
    } else if (title) {
      displayTitle = title;
    }
    recipeDetailTitle.textContent = displayTitle;
    setPageTitle(displayTitle);
    recipeDetailBody.innerHTML = renderMarkdown(markdown);
  } catch (error) {
    console.error("Network error while loading recipe:", error);
    recipeDetailBody.textContent = "Network error. Is the backend running?";
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>");
}

function parseFrontmatter(markdown) {
  if (!markdown) return { frontmatter: null, body: "" };
  const lines = markdown.split(/\r?\n/);
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return { frontmatter: null, body: markdown };
  }

  const frontmatter = {};
  const frontmatterLines = [];
  let i = 1;

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") {
      i += 1;
      break;
    }
    frontmatterLines.push(line);
  }

  let listKey = null;
  let listIndent = 0;
  const unquote = (value) => {
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }
    return value;
  };

  for (let idx = 0; idx < frontmatterLines.length; idx += 1) {
    const rawLine = frontmatterLines[idx];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const listMatch = rawLine.match(/^(\s*)-\s+(.*)$/);
    if (listKey && listMatch) {
      const indent = listMatch[1].length;
      if (indent > listIndent) {
        const item = unquote(listMatch[2].trim());
        if (!frontmatter[listKey]) frontmatter[listKey] = [];
        if (item) frontmatter[listKey].push(item);
        continue;
      }
      listKey = null;
    }

    const colonIndex = rawLine.indexOf(":");
    if (colonIndex === -1) continue;
    const key = rawLine.slice(0, colonIndex).trim();
    let value = rawLine.slice(colonIndex + 1).trim();

    if (!value) {
      listKey = key;
      listIndent = rawLine.match(/^\s*/)[0].length;
      if (!frontmatter[key]) frontmatter[key] = [];
      continue;
    }

    listKey = null;

    if (value.startsWith("[") && value.endsWith("]")) {
      const items = value
        .slice(1, -1)
        .split(",")
        .map((v) => unquote(v.trim()))
        .filter(Boolean);
      frontmatter[key] = items;
      continue;
    }

    if (value === "true" || value === "false") {
      frontmatter[key] = value === "true";
      continue;
    }

    const num = Number(value);
    if (!Number.isNaN(num) && value !== "") {
      frontmatter[key] = num;
      continue;
    }

    frontmatter[key] = unquote(value);
  }

  const body = lines.slice(i).join("\n");
  return { frontmatter, body };
}

function formatDuration(value) {
  if (value == null) return "";
  const str = String(value).trim();
  if (!str) return "";

  const isoMatch = str.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i,
  );
  if (!isoMatch) {
    return str;
  }

  const days = isoMatch[1] ? parseInt(isoMatch[1], 10) : 0;
  const hours = isoMatch[2] ? parseInt(isoMatch[2], 10) : 0;
  const minutes = isoMatch[3] ? parseInt(isoMatch[3], 10) : 0;
  const seconds = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;

  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
  if (totalMinutes > 0) {
    if (totalMinutes >= 60) {
      const displayHours = Math.floor(totalMinutes / 60);
      const displayMinutes = totalMinutes % 60;
      return `${displayHours} hour${displayHours === 1 ? "" : "s"} ${displayMinutes} minute${
        displayMinutes === 1 ? "" : "s"
      }`;
    }
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  if (seconds) {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  return str;
}

function formatServings(value) {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  const match = raw.match(/(\d+)/);
  if (!match) return raw;

  const count = parseInt(match[1], 10);
  if (Number.isNaN(count)) return raw;
  return `${count} servings`;
}

function renderFrontmatter(frontmatter) {
  if (!frontmatter) return "";

  const upper = (value) =>
    escapeHtml(String(value))
      .toUpperCase()
      .replace(/_/g, " ");

  const primaryPieces = [];
  const pushPrimary = (value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) primaryPieces.push(upper(item));
      });
      return;
    }
    primaryPieces.push(upper(value));
  };

  pushPrimary(frontmatter.meal);
  pushPrimary(frontmatter.category);
  pushPrimary(frontmatter.ethnicity);

  if (Array.isArray(frontmatter.diet_friendly) && frontmatter.diet_friendly.length) {
    frontmatter.diet_friendly.forEach((item) => {
      primaryPieces.push(upper(item));
    });
  }

  const tagsLine =
    Array.isArray(frontmatter.tags) && frontmatter.tags.length
      ? escapeHtml(frontmatter.tags.join(", "))
      : "";

  const timeParts = [];
  if (frontmatter.prep_time) {
    const readable = formatDuration(frontmatter.prep_time);
    if (readable) timeParts.push(`Prep ${escapeHtml(readable)}`);
  }
  if (frontmatter.cook_time) {
    const readable = formatDuration(frontmatter.cook_time);
    if (readable) timeParts.push(`Cook ${escapeHtml(readable)}`);
  }
  if (frontmatter.total_time) {
    const readable = formatDuration(frontmatter.total_time);
    if (readable) timeParts.push(`Total ${escapeHtml(readable)}`);
  }

  const secondaryPieces = [];
  if (timeParts.length) secondaryPieces.push(timeParts.join(" • "));
  if (frontmatter.yield) secondaryPieces.push(escapeHtml(formatServings(frontmatter.yield)));

  const url =
    frontmatter.url && typeof frontmatter.url === "string" ? frontmatter.url.trim() : "";

  const primaryHtml = primaryPieces.length
    ? `<div style="font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; opacity: 0.85;">${primaryPieces.join(
        " • ",
      )}</div>`
    : "";

  const tagsHtml = tagsLine
    ? `<div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; opacity: 0.7;">${tagsLine}</div>`
    : "";

  const secondaryHtml = secondaryPieces.length
    ? `<div style="font-size: 10px; text-transform: uppercase; margin-bottom: 6px; opacity: 0.7;">${secondaryPieces.join(
        " · ",
      )}</div>`
    : "";

  const urlHtml = url
    ? `<div style="font-size: 10px; margin-bottom: 8px; opacity: 0.7;"><a href="${escapeHtml(
        url,
      )}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">Source</a></div>`
    : "";

  if (!primaryHtml && !tagsHtml && !secondaryHtml && !urlHtml) {
    return "";
  }

  return `<section style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px;">${primaryHtml}${tagsHtml}${secondaryHtml}${urlHtml}</section>`;
}

function renderMarkdown(markdown) {
  if (!markdown) return "";
  const { frontmatter, body } = parseFrontmatter(markdown);
  const lines = body.split(/\r?\n/);
  let html = "";
  let section = null;
  let openListType = null;
  const frontmatterTitle =
    frontmatter && frontmatter.title ? String(frontmatter.title).trim() : null;
  const normalizedFrontmatterTitle = frontmatterTitle
    ? frontmatterTitle.toLowerCase()
    : null;
  let skippedTitleHeading = false;

  const closeList = () => {
    if (!openListType) return;
    html += `</${openListType}>`;
    openListType = null;
  };

  const openListIfNeeded = (type) => {
    if (openListType === type) return;
    closeList();
    html += `<${type}>`;
    openListType = type;
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("###### ")) {
      closeList();
      html += `<h6>${renderInlineMarkdown(trimmed.slice(7))}</h6>`;
      section = trimmed.slice(7).trim().toLowerCase();
    } else if (trimmed.startsWith("##### ")) {
      closeList();
      html += `<h5>${renderInlineMarkdown(trimmed.slice(6))}</h5>`;
      section = trimmed.slice(6).trim().toLowerCase();
    } else if (trimmed.startsWith("#### ")) {
      closeList();
      html += `<h4>${renderInlineMarkdown(trimmed.slice(5))}</h4>`;
      section = trimmed.slice(5).trim().toLowerCase();
    } else if (trimmed.startsWith("### ")) {
      closeList();
      html += `<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`;
      section = trimmed.slice(4).trim().toLowerCase();
    } else if (trimmed.startsWith("## ")) {
      closeList();
      html += `<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`;
      section = trimmed.slice(3).trim().toLowerCase();
    } else if (trimmed.startsWith("# ")) {
      const headingText = trimmed.slice(2).trim();
      if (
        !skippedTitleHeading &&
        normalizedFrontmatterTitle &&
        headingText.toLowerCase() === normalizedFrontmatterTitle
      ) {
        skippedTitleHeading = true;
        continue;
      }
      closeList();
      html += `<h1>${renderInlineMarkdown(headingText)}</h1>`;
      section = headingText.toLowerCase();
    } else if (section === "instructions" && /^\d+\.\s+/.test(trimmed)) {
      openListIfNeeded("ol");
      html += `<li>${renderInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ""))}</li>`;
    } else if (/^[-*] /.test(trimmed)) {
      if (section === "instructions") {
        openListIfNeeded("ol");
      } else {
        openListIfNeeded("ul");
      }
      html += `<li>${renderInlineMarkdown(trimmed.slice(2))}</li>`;
    } else {
      if (section === "instructions") {
        openListIfNeeded("ol");
        html += `<li>${renderInlineMarkdown(trimmed)}</li>`;
      } else {
        closeList();
        html += `<p>${renderInlineMarkdown(trimmed)}</p>`;
      }
    }
  }

  closeList();
  const frontmatterHtml = renderFrontmatter(frontmatter);
  return `${frontmatterHtml}${html}`;
}

async function validateCredentials(username, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Auth validation error:", error);
    throw error;
  }
}

async function registerAccount() {
  const username = registerUsernameInput.value.trim();
  const password = registerPasswordInput.value;
  const confirmPassword = registerConfirmPasswordInput.value;

  registerStatus.textContent = "";

  if (!username || !password || !confirmPassword) {
    registerStatus.textContent = "Please enter a username and password.";
    return;
  }

  if (password !== confirmPassword) {
    registerStatus.textContent = "Passwords do not match.";
    return;
  }

  registerSubmitButton.disabled = true;
  registerSubmitButton.textContent = "CREATING…";

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.status === 401 || response.status === 403) {
      hasUsers = true;
      pendingLoginMessage = "Registration is closed. Please sign in.";
      navigateTo(ROUTES.login, { replace: true });
      return;
    }

    if (response.status === 400) {
      const data = await response.json();
      registerStatus.textContent = data.detail || "Unable to create account.";
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Register error:", text);
      registerStatus.textContent = "Error creating account.";
      return;
    }

    hasUsers = true;
    registerUsernameInput.value = "";
    registerPasswordInput.value = "";
    registerConfirmPasswordInput.value = "";
    pendingLoginMessage = "Account created. Please sign in.";
    navigateTo(ROUTES.login, { replace: true });
  } catch (error) {
    console.error("Network error during registration:", error);
    registerStatus.textContent = "Network error. Is the backend running?";
  } finally {
    registerSubmitButton.disabled = false;
    registerSubmitButton.textContent = "CREATE ACCOUNT";
  }
}

async function changePassword() {
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  changePasswordStatus.textContent = "";

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    changePasswordStatus.textContent = "Please fill in all password fields.";
    return;
  }

  if (newPassword !== confirmNewPassword) {
    changePasswordStatus.textContent = "New passwords do not match.";
    return;
  }

  changePasswordButton.disabled = true;
  changePasswordButton.textContent = "Updating…";

  try {
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (response.status === 401) {
      handleSessionExpired("Session expired. Please sign in again.");
      return;
    }

    if (response.status === 400) {
      const data = await response.json();
      changePasswordStatus.textContent = data.detail || "Current password is incorrect.";
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Change password error:", text);
      changePasswordStatus.textContent = "Error updating password.";
      return;
    }

    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmNewPasswordInput.value = "";
    changePasswordStatus.textContent = "Password updated successfully.";
  } catch (error) {
    console.error("Network error during password change:", error);
    changePasswordStatus.textContent = "Network error. Is the backend running?";
  } finally {
    changePasswordButton.disabled = false;
    changePasswordButton.textContent = "Update password";
  }
}

// Nav handlers
menuToggle.addEventListener("click", (event) => {
  event.preventDefault();
  const visible = menuPanel.style.display === "block";
  menuPanel.style.display = visible ? "none" : "block";
});

function shouldHandleLinkClick(event, anchor) {
  if (!anchor) return false;
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  const url = new URL(href, window.location.origin);
  return url.origin === window.location.origin;
}

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[data-link]");
  if (!anchor) return;
  if (!shouldHandleLinkClick(event, anchor)) return;
  event.preventDefault();
  const url = new URL(anchor.getAttribute("href"), window.location.origin);
  navigateTo(url.pathname);
});

function expandQuickAdd() {
  if (!quickAddPill) return;
  quickAddExpanded = true;
  quickAddPill.classList.remove("collapsed");
  quickAddPill.classList.add("expanded");
  quickAddStatus.textContent = "";
  if (quickRecipeUrlInput) {
    setTimeout(() => {
      quickRecipeUrlInput.focus();
    }, 120);
  }
}

function collapseQuickAdd() {
  if (!quickAddPill) return;
  quickAddExpanded = false;
  quickAddPill.classList.remove("expanded");
  quickAddPill.classList.add("collapsed");
}

if (quickAddPill) {
  quickAddPill.addEventListener("click", (event) => {
    if (!quickAddExpanded) {
      event.preventDefault();
      expandQuickAdd();
    }
  });
}

if (quickAddButton) {
  quickAddButton.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!quickAddExpanded) {
      return;
    }
    await scrapeRecipeWithElements(quickRecipeUrlInput, quickAddButton, quickAddStatus);
    if (!quickRecipeUrlInput.value.trim()) {
      collapseQuickAdd();
    }
  });
}

document.addEventListener("click", (event) => {
  if (!quickAddExpanded) return;
  if (!quickAddWrapper) return;
  if (quickAddWrapper.contains(event.target)) return;
  collapseQuickAdd();
});


if (recipesFiltersContent) {
  recipesFiltersContent.addEventListener("click", (event) => {
    event.stopPropagation();
    const trigger = event.target.closest("button[data-filter-trigger]");
    if (trigger) {
      if (trigger.disabled) return;
      const group = trigger.dataset.filterGroup;
      if (!group || !activeFilters[group]) return;
      toggleFilterDropdown(group);
      renderFilters();
      return;
    }

    const button = event.target.closest("button[data-filter-group]");
    if (!button || button.disabled) return;
    if (button.dataset.filterTrigger === "true") return;

    const group = button.dataset.filterGroup;
    if (!group || !activeFilters[group]) return;

    if (button.dataset.filterAll === "true") {
      activeFilters[group].clear();
    } else {
      const value = button.dataset.filterValue;
      if (!value) return;
      if (activeFilters[group].has(value)) {
        activeFilters[group].delete(value);
      } else {
        activeFilters[group].add(value);
      }
    }

    applyFilters();
    renderFilters();
  });
}

document.addEventListener("click", (event) => {
  if (!openFilterDropdown) return;
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  if (recipesFilters && (recipesFilters.contains(event.target) || path.includes(recipesFilters))) {
    return;
  }
  openFilterDropdown = null;
  renderFilters();
});

registerSubmitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  await registerAccount();
});

loginSubmitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value;

  loginStatus.textContent = "";

  if (!username || !password) {
    loginStatus.textContent = "Please enter both username and password.";
    return;
  }

  loginSubmitButton.disabled = true;
  loginSubmitButton.textContent = "SIGNING IN…";

  try {
    const ok = await validateCredentials(username, password);
    if (!ok) {
      loginStatus.textContent = "Invalid username or password.";
      return;
    }

    await fetchCurrentUser();
    if (!isAuthenticated) {
      loginStatus.textContent = "Login failed.";
      return;
    }

    loginUsernameInput.value = "";
    loginPasswordInput.value = "";
    navigateTo(ROUTES.recipes, { replace: true });
  } catch {
    loginStatus.textContent = "Network error. Is the backend running?";
  } finally {
    loginSubmitButton.disabled = false;
    loginSubmitButton.textContent = "SIGN IN";
  }
});

logoutButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
  }).finally(() => {
    isAuthenticated = false;
    currentUser = null;
    updateAccountView();
    pendingLoginMessage = "Signed out.";
    navigateTo(ROUTES.login, { replace: true });
  });
});

changePasswordButton.addEventListener("click", (event) => {
  event.preventDefault();
  changePassword();
});

async function checkSession() {
  await fetchRegistrationStatus();
  if (hasUsers) {
    await fetchCurrentUser();
  } else {
    isAuthenticated = false;
    currentUser = null;
    updateAccountView();
  }
  handleRoute();
}

checkSession();
window.addEventListener("popstate", handleRoute);
