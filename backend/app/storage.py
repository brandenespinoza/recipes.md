from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import HTTPException, status
import re

from .config import get_settings
from .models import RecipeMetadata, RecipeResponse


_DURATION_LINE_RE = re.compile(r"^(\s*)(prep_time|cook_time|total_time)\s*:\s*(.*?)\s*$")
_YIELD_LINE_RE = re.compile(r"^(\s*)yield\s*:\s*(.*?)\s*$")
_TITLE_LINE_RE = re.compile(r"^(\s*)title\s*:\s*(.*?)\s*$", re.I)
_SLUG_LINE_RE = re.compile(r"^(\s*)slug\s*:\s*(.*?)\s*$", re.I)
_FRONTMATTER_LINE_RE = re.compile(r"^(\s*)([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$")
_FRONTMATTER_LIST_ITEM_RE = re.compile(r"^(\s*)-\s*(.*?)\s*$")
_ISO_DURATION_RE = re.compile(r"^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$", re.I)
_RECIPE_WORD_RE = re.compile(r"\brecipe\b", re.I)


def _strip_recipe_word(value: str) -> str:
    if not value:
        return value
    cleaned = _RECIPE_WORD_RE.sub("", value)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    cleaned = cleaned.strip(" -–—:")
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned.strip()


def _strip_recipe_from_slug(slug: str) -> str:
    if not slug:
        return slug
    cleaned = _RECIPE_WORD_RE.sub("", slug)
    cleaned = re.sub(r"-{2,}", "-", cleaned)
    cleaned = cleaned.strip("-")
    return cleaned


def _parse_frontmatter_scalar(raw_value: str) -> tuple[str, str | None]:
    raw_value = raw_value.strip()
    if not raw_value:
        return "", None
    if (raw_value.startswith('"') and raw_value.endswith('"')) or (
        raw_value.startswith("'") and raw_value.endswith("'")
    ):
        return raw_value[1:-1], raw_value[0]
    return raw_value, None


def _parse_frontmatter(markdown: str) -> dict[str, object]:
    lines = markdown.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}

    frontmatter: dict[str, object] = {}
    list_key: str | None = None
    list_indent = 0

    for line in lines[1:]:
        if line.strip() == "---":
            break
        if not line.strip() or line.lstrip().startswith("#"):
            continue

        list_match = _FRONTMATTER_LIST_ITEM_RE.match(line)
        if list_key and list_match:
            indent = len(list_match.group(1))
            if indent > list_indent:
                raw_value = list_match.group(2).strip()
                value, _ = _parse_frontmatter_scalar(raw_value)
                if value:
                    frontmatter.setdefault(list_key, []).append(value)
                continue
            list_key = None

        match = _FRONTMATTER_LINE_RE.match(line)
        if not match:
            continue

        indent, key, raw_value = match.groups()
        raw_value = raw_value.strip()
        if raw_value == "":
            list_key = key
            list_indent = len(indent)
            frontmatter.setdefault(key, [])
            continue

        list_key = None

        if raw_value.startswith("[") and raw_value.endswith("]"):
            items: list[str] = []
            for piece in raw_value[1:-1].split(","):
                piece = piece.strip()
                if not piece:
                    continue
                value, _ = _parse_frontmatter_scalar(piece)
                if value:
                    items.append(value)
            frontmatter[key] = items
            continue

        value, _ = _parse_frontmatter_scalar(raw_value)
        frontmatter[key] = value

    return frontmatter


def _normalize_frontmatter_text(value: object | None) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _normalize_frontmatter_single(value: object | None) -> str | None:
    if value is None:
        return None
    if isinstance(value, list):
        for item in value:
            text = _normalize_frontmatter_text(item)
            if text:
                return text
        return None
    return _normalize_frontmatter_text(value)


def _normalize_frontmatter_list(value: object | None) -> list[str] | None:
    if value is None:
        return None
    if isinstance(value, list):
        items = [str(item).strip() for item in value if str(item).strip()]
        return items or None
    raw = str(value).strip()
    if not raw:
        return None
    return [raw]


def _normalize_markdown_title_and_slug(markdown: str) -> str:
    lines = markdown.splitlines()
    if not lines or lines[0].strip() != "---":
        return markdown

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return markdown

    changed = False
    frontmatter = lines[1:end_idx]
    normalized_frontmatter: list[str] = []
    original_title: str | None = None
    cleaned_title: str | None = None

    for line in frontmatter:
        title_match = _TITLE_LINE_RE.match(line)
        if title_match:
            indent, raw_value = title_match.groups()
            value, quote = _parse_frontmatter_scalar(raw_value)
            original_title = value
            if value:
                cleaned_title = _strip_recipe_word(value) or "Untitled"
            else:
                cleaned_title = value
            if cleaned_title != value:
                changed = True
            output_value = cleaned_title
            if quote is not None and output_value != "":
                output_value = f"{quote}{output_value}{quote}"
            normalized_frontmatter.append(f"{indent}title: {output_value}")
            continue

        slug_match = _SLUG_LINE_RE.match(line)
        if slug_match:
            indent, raw_value = slug_match.groups()
            value, quote = _parse_frontmatter_scalar(raw_value)
            cleaned_slug = _strip_recipe_from_slug(value) if value else value
            if value and not cleaned_slug:
                cleaned_slug = f"untitled-{int(datetime.utcnow().timestamp())}"
            if cleaned_slug != value:
                changed = True
            output_value = cleaned_slug
            if quote is not None and output_value != "":
                output_value = f"{quote}{output_value}{quote}"
            normalized_frontmatter.append(f"{indent}slug: {output_value}")
            continue

        normalized_frontmatter.append(line)

    if not changed and not cleaned_title:
        return markdown

    rebuilt_lines = [lines[0], *normalized_frontmatter, lines[end_idx], *lines[end_idx + 1 :]]

    if cleaned_title:
        for i in range(end_idx + 1, len(rebuilt_lines)):
            if rebuilt_lines[i].startswith("# "):
                heading_text = rebuilt_lines[i][2:].strip()
                if original_title and heading_text.lower() == original_title.lower():
                    rebuilt_lines[i] = f"# {cleaned_title}"
                elif _RECIPE_WORD_RE.search(heading_text):
                    rebuilt_lines[i] = f"# {cleaned_title}"
                break

    rebuilt = "\n".join(rebuilt_lines)
    if markdown.endswith("\n"):
        rebuilt += "\n"
    return rebuilt


def _normalize_iso_duration_hours_minutes(value: str) -> str:
    raw = value.strip()
    if not raw:
        return value

    match = _ISO_DURATION_RE.match(raw)
    if not match:
        return value

    days = int(match.group(1) or 0)
    hours = int(match.group(2) or 0)
    minutes = int(match.group(3) or 0)
    seconds = int(match.group(4) or 0)

    # If seconds are present and not a clean minute, preserve the original.
    if seconds % 60 != 0:
        return value

    total_minutes = (days * 24 * 60) + (hours * 60) + minutes + (seconds // 60)
    if total_minutes >= 60:
        normalized_hours = total_minutes // 60
        normalized_minutes = total_minutes % 60
        return f"PT{normalized_hours}H{normalized_minutes}M"

    # Under an hour: keep as minutes-only (e.g., PT20M).
    if total_minutes:
        return f"PT{total_minutes}M"
    return value


def _normalize_yield_to_number(value: str) -> str:
    raw = value.strip()
    if not raw:
        return value

    match = re.search(r"(\d+)", raw)
    if not match:
        return value

    return match.group(1)


def _normalize_markdown_durations(markdown: str) -> str:
    lines = markdown.splitlines()
    if not lines or lines[0].strip() != "---":
        return markdown

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return markdown

    changed = False
    frontmatter = lines[1:end_idx]
    normalized_frontmatter: list[str] = []

    for line in frontmatter:
        match = _DURATION_LINE_RE.match(line)
        if not match:
            yield_match = _YIELD_LINE_RE.match(line)
            if not yield_match:
                normalized_frontmatter.append(line)
                continue

            indent, raw_value = yield_match.groups()
            raw_value = raw_value.strip()

            # Preserve empty values as-is.
            if not raw_value:
                normalized_frontmatter.append(line)
                continue

            quote = None
            if (raw_value.startswith('"') and raw_value.endswith('"')) or (
                raw_value.startswith("'") and raw_value.endswith("'")
            ):
                quote = raw_value[0]
                raw_value = raw_value[1:-1]

            normalized_value = _normalize_yield_to_number(raw_value)
            if normalized_value != raw_value:
                changed = True

            # Prefer quoting yields for consistency if we parsed a number.
            if quote is None and normalized_value.isdigit():
                quote = '"'

            if quote is not None:
                normalized_value = f"{quote}{normalized_value}{quote}"

            normalized_frontmatter.append(f"{indent}yield: {normalized_value}")
            continue

        indent, key, raw_value = match.groups()
        raw_value = raw_value.strip()

        # Preserve empty values as-is.
        if not raw_value:
            normalized_frontmatter.append(line)
            continue

        quote = None
        if (raw_value.startswith('"') and raw_value.endswith('"')) or (
            raw_value.startswith("'") and raw_value.endswith("'")
        ):
            quote = raw_value[0]
            raw_value = raw_value[1:-1]

        normalized_value = _normalize_iso_duration_hours_minutes(raw_value)
        if normalized_value != raw_value:
            changed = True

        if quote is not None:
            normalized_value = f"{quote}{normalized_value}{quote}"

        normalized_frontmatter.append(f"{indent}{key}: {normalized_value}")

    if not changed:
        return markdown

    rebuilt = "\n".join(
        [lines[0], *normalized_frontmatter, lines[end_idx], *lines[end_idx + 1 :]]
    )
    if markdown.endswith("\n"):
        rebuilt += "\n"
    return rebuilt


def _slug_from_markdown(markdown: str) -> str:
    for line in markdown.splitlines():
        if line.startswith("slug:"):
            value = line.split(":", 1)[1].strip().strip('"').strip("'")
            if value:
                return value
    # Fallback slug if not found in YAML (will be refined later).
    return f"untitled-{int(datetime.utcnow().timestamp())}"


def extract_url_from_markdown(markdown: str) -> str | None:
    for line in markdown.splitlines():
        if line.startswith("url:"):
            return line.split(":", 1)[1].strip().strip('"').strip("'")
    return None


def save_recipe_markdown(markdown: str) -> RecipeResponse:
    settings = get_settings()
    output_dir: Path = settings.output_dir

    markdown = _normalize_markdown_durations(markdown)
    markdown = _normalize_markdown_title_and_slug(markdown)
    slug = _slug_from_markdown(markdown)
    filename = f"{slug}.md"
    path = output_dir / filename

    path.write_text(markdown, encoding="utf-8")

    frontmatter = _parse_frontmatter(markdown)
    title = _normalize_frontmatter_text(frontmatter.get("title")) or slug.replace("-", " ").title()
    url = _normalize_frontmatter_text(frontmatter.get("url"))
    meal = _normalize_frontmatter_list(frontmatter.get("meal"))
    category = _normalize_frontmatter_single(frontmatter.get("category"))
    ethnicity = _normalize_frontmatter_list(frontmatter.get("ethnicity"))
    diet_friendly = _normalize_frontmatter_list(frontmatter.get("diet_friendly"))
    tags = _normalize_frontmatter_list(frontmatter.get("tags"))
    total_time = _normalize_frontmatter_text(frontmatter.get("total_time"))

    metadata = RecipeMetadata(
        title=title,
        slug=slug,
        url=url,
        meal=meal,
        category=category,
        ethnicity=ethnicity,
        diet_friendly=diet_friendly,
        tags=tags,
        total_time=total_time,
    )

    return RecipeResponse(metadata=metadata, markdown=markdown)


def list_recipes() -> List[RecipeMetadata]:
    settings = get_settings()
    output_dir: Path = settings.output_dir

    if not output_dir.exists():
        return []

    recipes: List[RecipeMetadata] = []
    for file in sorted(output_dir.glob("*.md")):
        markdown = file.read_text(encoding="utf-8")
        frontmatter = _parse_frontmatter(markdown)
        title = _normalize_frontmatter_text(frontmatter.get("title")) or file.stem.replace("-", " ").title()
        url = _normalize_frontmatter_text(frontmatter.get("url"))
        meal = _normalize_frontmatter_list(frontmatter.get("meal"))
        category = _normalize_frontmatter_single(frontmatter.get("category"))
        ethnicity = _normalize_frontmatter_list(frontmatter.get("ethnicity"))
        diet_friendly = _normalize_frontmatter_list(frontmatter.get("diet_friendly"))
        tags = _normalize_frontmatter_list(frontmatter.get("tags"))
        total_time = _normalize_frontmatter_text(frontmatter.get("total_time"))
        recipes.append(
            RecipeMetadata(
                title=title,
                slug=file.stem,
                url=url,
                meal=meal,
                category=category,
                ethnicity=ethnicity,
                diet_friendly=diet_friendly,
                tags=tags,
                total_time=total_time,
            )
        )
    return recipes


def load_recipe(slug: str) -> RecipeResponse:
    settings = get_settings()
    output_dir: Path = settings.output_dir
    path = output_dir / f"{slug}.md"

    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found"
        )

    markdown = path.read_text(encoding="utf-8")
    frontmatter = _parse_frontmatter(markdown)
    title = _normalize_frontmatter_text(frontmatter.get("title")) or slug.replace("-", " ").title()
    url = _normalize_frontmatter_text(frontmatter.get("url"))
    meal = _normalize_frontmatter_list(frontmatter.get("meal"))
    category = _normalize_frontmatter_single(frontmatter.get("category"))
    ethnicity = _normalize_frontmatter_list(frontmatter.get("ethnicity"))
    diet_friendly = _normalize_frontmatter_list(frontmatter.get("diet_friendly"))
    tags = _normalize_frontmatter_list(frontmatter.get("tags"))
    total_time = _normalize_frontmatter_text(frontmatter.get("total_time"))

    metadata = RecipeMetadata(
        title=title,
        slug=slug,
        url=url,
        meal=meal,
        category=category,
        ethnicity=ethnicity,
        diet_friendly=diet_friendly,
        tags=tags,
        total_time=total_time,
    )

    return RecipeResponse(metadata=metadata, markdown=markdown)


def update_recipe(slug: str, markdown: str) -> RecipeResponse:
    settings = get_settings()
    output_dir: Path = settings.output_dir
    path = output_dir / f"{slug}.md"

    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found"
        )

    markdown = _normalize_markdown_durations(markdown)
    markdown = _normalize_markdown_title_and_slug(markdown)
    path.write_text(markdown, encoding="utf-8")
    frontmatter = _parse_frontmatter(markdown)
    title = _normalize_frontmatter_text(frontmatter.get("title")) or slug.replace("-", " ").title()
    url = _normalize_frontmatter_text(frontmatter.get("url"))
    meal = _normalize_frontmatter_list(frontmatter.get("meal"))
    category = _normalize_frontmatter_single(frontmatter.get("category"))
    ethnicity = _normalize_frontmatter_list(frontmatter.get("ethnicity"))
    diet_friendly = _normalize_frontmatter_list(frontmatter.get("diet_friendly"))
    tags = _normalize_frontmatter_list(frontmatter.get("tags"))
    total_time = _normalize_frontmatter_text(frontmatter.get("total_time"))

    metadata = RecipeMetadata(
        title=title,
        slug=slug,
        url=url,
        meal=meal,
        category=category,
        ethnicity=ethnicity,
        diet_friendly=diet_friendly,
        tags=tags,
        total_time=total_time,
    )

    return RecipeResponse(metadata=metadata, markdown=markdown)
