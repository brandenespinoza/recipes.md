from pathlib import Path
from urllib.parse import urlencode

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session

from . import auth, storage
from .config import get_settings
from .db import User, get_db, init_db
from .llm import generate_recipe_markdown
from .models import (
    HealthStatus,
    LoginRequest,
    PasswordChangeRequest,
    RecipeCreateRequest,
    RecipeResponse,
    RecipeMetadata,
    RegistrationStatus,
    Token,
    UserCreate,
    UserOut,
    UserUpdate,
)
from .security import create_access_token, hash_password, verify_password


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            response = await super().get_response(path, scope)
        except HTTPException as exc:
            if exc.status_code != status.HTTP_404_NOT_FOUND:
                raise
            response = None

        if response is not None and response.status_code != status.HTTP_404_NOT_FOUND:
            return response

        # Avoid swallowing API 404s or missing asset files with extensions.
        if path.startswith("api/") or Path(path).suffix:
            if response is not None:
                return response
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return await super().get_response("index.html", scope)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    # Ensure database tables exist on startup
    init_db()

    if settings.frontend_origin:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(settings.frontend_origin)],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    api = settings.api_prefix

    @app.get("/health", response_model=HealthStatus)
    async def health() -> HealthStatus:
        fs_ok = settings.output_dir.exists() and settings.output_dir.is_dir()
        llm_ok = settings.openai_api_key is not None
        return HealthStatus(
            status="ok" if fs_ok else "degraded",
            filesystem_writable=fs_ok,
            llm_configured=llm_ok,
        )

    @app.post("/share-target")
    async def share_target(request: Request) -> RedirectResponse:
        form = await request.form()
        url = str(form.get("url") or "").strip()
        title = str(form.get("title") or "").strip()
        text = str(form.get("text") or "").strip()

        params = {}
        if url:
            params["url"] = url
        if title:
            params["title"] = title
        if text:
            params["text"] = text

        query = urlencode(params)
        redirect_url = "/add"
        if query:
            redirect_url = f"{redirect_url}?{query}"

        return RedirectResponse(url=redirect_url, status_code=status.HTTP_303_SEE_OTHER)

    @app.get("/share-target")
    async def share_target_get() -> RedirectResponse:
        return RedirectResponse(url="/add", status_code=status.HTTP_303_SEE_OTHER)

    @app.post(f"{api}/recipes", response_model=RecipeResponse)
    async def create_recipe(
        payload: RecipeCreateRequest,
        _: User = Depends(auth.get_current_user),
    ) -> RecipeResponse:
        markdown = await generate_recipe_markdown(url=str(payload.url))
        return storage.save_recipe_markdown(markdown)

    @app.get(f"{api}/recipes", response_model=list[RecipeMetadata])
    async def list_recipes_endpoint(_: User = Depends(auth.get_current_user)) -> list[RecipeMetadata]:
        return storage.list_recipes()

    @app.get(f"{api}/recipes/{{slug}}", response_model=RecipeResponse)
    async def get_recipe(slug: str, _: User = Depends(auth.get_current_user)) -> RecipeResponse:
        return storage.load_recipe(slug)

    @app.put(f"{api}/recipes/{{slug}}", response_model=RecipeResponse)
    async def update_recipe_endpoint(
        slug: str, markdown: str, _: User = Depends(auth.get_current_user)
    ) -> RecipeResponse:
        return storage.update_recipe(slug, markdown)

    @app.post(f"{api}/recipes/{{slug}}/rescrape", response_model=RecipeResponse)
    async def rescrape_recipe(
        slug: str,
        _: User = Depends(auth.get_current_user),
    ) -> RecipeResponse:
        existing = storage.load_recipe(slug)
        url = storage.extract_url_from_markdown(existing.markdown)
        if not url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Recipe does not have a source URL in frontmatter.",
            )

        markdown = await generate_recipe_markdown(url=url)
        return storage.update_recipe(slug, markdown)

    @app.post(f"{api}/auth/change-password")
    async def change_password(
        payload: PasswordChangeRequest,
        current_user: User = Depends(auth.get_current_user),
        db: Session = Depends(get_db),
    ) -> dict[str, str]:
        user = db.query(User).filter(User.id == current_user.id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        user.password_hash = hash_password(payload.new_password)
        db.add(user)
        db.commit()

        return {"detail": "Password updated"}

    @app.get(f"{api}/auth/registration-status", response_model=RegistrationStatus)
    async def registration_status(db: Session = Depends(get_db)) -> RegistrationStatus:
        total_users = db.query(User).count()
        return RegistrationStatus(has_users=total_users > 0)

    @app.post(f"{api}/auth/register", response_model=UserOut)
    async def register_user(
        payload: UserCreate,
        request: Request,
        db: Session = Depends(get_db),
    ) -> UserOut:
        existing = db.query(User).filter(User.username == payload.username).first()
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this username already exists",
            )

        total_users = db.query(User).count()

        # First user can be created without authentication and becomes admin.
        acting_user: User | None = None
        if total_users > 0:
            token = request.cookies.get("access_token")
            if not token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required to create users",
                )
            user_id = auth.decode_access_token(token)
            acting_user = db.query(User).filter(User.id == int(user_id)).first()
            if acting_user is None or not acting_user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive",
                )
            if not acting_user.is_admin:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admin users can create new accounts",
                )

        user = User(
            username=payload.username,
            password_hash=hash_password(payload.password),
            is_active=True,
            is_admin=total_users == 0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return UserOut(
            id=user.id,
            username=user.username,
            is_active=user.is_active,
            is_admin=user.is_admin,
        )

    @app.post(f"{api}/auth/login", response_model=Token)
    async def login(
        payload: LoginRequest,
        response: Response,
        db: Session = Depends(get_db),
    ) -> Token:
        user = db.query(User).filter(User.username == payload.username).first()
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        access_token = create_access_token(str(user.id))
        cookie_max_age = settings.access_token_expire_minutes * 60

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.cookie_secure,
            samesite="lax",
            max_age=cookie_max_age,
            path="/",
        )

        return Token(access_token=access_token)

    @app.post(f"{api}/auth/logout")
    async def logout(response: Response) -> dict[str, str]:
        response.delete_cookie(key="access_token", path="/")
        return {"detail": "Logged out"}

    @app.get(f"{api}/auth/me", response_model=UserOut)
    async def get_me(current_user: User = Depends(auth.get_current_user)) -> UserOut:
        return UserOut(
            id=current_user.id,
            username=current_user.username,
            is_active=current_user.is_active,
            is_admin=current_user.is_admin,
        )

    # Admin user management
    @app.get(f"{api}/admin/users", response_model=list[UserOut])
    async def admin_list_users(
        current_user: User = Depends(auth.get_current_user),
        db: Session = Depends(get_db),
    ) -> list[UserOut]:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )
        users = db.query(User).order_by(User.id.asc()).all()
        return [
            UserOut(
                id=u.id,
                username=u.username,
                is_active=u.is_active,
                is_admin=u.is_admin,
            )
            for u in users
        ]

    @app.put(f"{api}/admin/users/{{user_id}}", response_model=UserOut)
    async def admin_update_user(
        user_id: int,
        payload: UserUpdate,
        current_user: User = Depends(auth.get_current_user),
        db: Session = Depends(get_db),
    ) -> UserOut:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if payload.username is not None and payload.username != user.username:
            existing = db.query(User).filter(User.username == payload.username).first()
            if existing is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this username already exists",
                )
            user.username = payload.username

        if payload.is_active is not None:
            # Prevent deactivating the last active admin
            if user.is_admin and payload.is_active is False:
                admin_count = db.query(User).filter(User.is_admin == True, User.is_active == True).count()
                if admin_count <= 1:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Cannot deactivate the last active admin user",
                    )
            user.is_active = payload.is_active

        if payload.is_admin is not None and payload.is_admin != user.is_admin:
            if user.id == current_user.id and payload.is_admin is False:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You cannot remove your own admin status",
                )
            if user.is_admin and payload.is_admin is False:
                admin_count = db.query(User).filter(User.is_admin == True, User.is_active == True).count()
                if admin_count <= 1:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Cannot remove the last admin user",
                    )
            user.is_admin = payload.is_admin

        db.add(user)
        db.commit()
        db.refresh(user)

        return UserOut(
            id=user.id,
            username=user.username,
            is_active=user.is_active,
            is_admin=user.is_admin,
        )

    @app.delete(f"{api}/admin/users/{{user_id}}")
    async def admin_delete_user(
        user_id: int,
        current_user: User = Depends(auth.get_current_user),
        db: Session = Depends(get_db),
    ) -> dict[str, str]:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account",
            )

        if user.is_admin:
            admin_count = db.query(User).filter(User.is_admin == True, User.is_active == True).count()
            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete the last admin user",
                )

        db.delete(user)
        db.commit()
        return {"detail": "User deleted"}

    return app


app = create_app()

# Serve frontend assets from the same app (single container, same origin)
frontend_root = Path(__file__).resolve().parents[2] / "frontend"
frontend_dist = frontend_root / "dist"
frontend_dir = frontend_dist if frontend_dist.exists() else frontend_root

if not frontend_root.exists():
    raise RuntimeError(
        "Frontend assets are missing. Ensure the Docker image includes /app/frontend "
        "or provide frontend/dist for production builds."
    )

if not frontend_dir.exists():
    raise RuntimeError(
        "Frontend assets directory is missing. Ensure the Docker image includes "
        "the frontend source or a built frontend/dist directory."
    )

app.state.frontend_dir = frontend_dir
app.mount("/", SPAStaticFiles(directory=frontend_dir, html=True), name="frontend")
