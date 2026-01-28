from typing import List, Optional

from pydantic import BaseModel, HttpUrl


class RecipeMetadata(BaseModel):
  title: str
  slug: str
  url: Optional[HttpUrl] = None
  meal: Optional[List[str]] = None
  category: Optional[str] = None
  ethnicity: Optional[List[str]] = None
  diet_friendly: Optional[List[str]] = None
  tags: Optional[List[str]] = None
  total_time: Optional[str] = None


class RecipeCreateRequest(BaseModel):
  url: HttpUrl


class RecipeResponse(BaseModel):
  metadata: RecipeMetadata
  markdown: str


class HealthStatus(BaseModel):
  status: str
  filesystem_writable: bool
  llm_configured: bool


class PasswordChangeRequest(BaseModel):
  current_password: str
  new_password: str


class UserCreate(BaseModel):
  username: str
  password: str


class UserOut(BaseModel):
  id: int
  username: str
  is_active: bool
  is_admin: bool


class UserUpdate(BaseModel):
  username: Optional[str] = None
  is_active: Optional[bool] = None
  is_admin: Optional[bool] = None


class Token(BaseModel):
  access_token: str
  token_type: str = "bearer"


class LoginRequest(BaseModel):
  username: str
  password: str


class RegistrationStatus(BaseModel):
  has_users: bool
