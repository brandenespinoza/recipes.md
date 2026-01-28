from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import HTTPException, status

from .config import get_settings


def hash_password(password: str) -> str:
  """
  Hash a password using bcrypt.
  """
  if not isinstance(password, str):
    raise TypeError("password must be a string")
  salt = bcrypt.gensalt()
  hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
  return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
  """
  Verify a password against its bcrypt hash.
  """
  try:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
  except Exception:
    return False


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
  """
  Create a signed JWT access token for the given subject (user id).
  """
  settings = get_settings()
  secret_key = settings.secret_key
  algorithm = settings.jwt_algorithm

  now = datetime.now(timezone.utc)
  if expires_delta is None:
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
  exp = now + expires_delta

  to_encode = {"sub": subject, "iat": now.timestamp(), "exp": exp.timestamp()}
  return jwt.encode(to_encode, secret_key, algorithm=algorithm)


def decode_access_token(token: str) -> str:
  """
  Decode and validate a JWT access token.
  Returns the subject (user id) or raises HTTPException if invalid/expired.
  """
  settings = get_settings()
  secret_key = settings.secret_key
  algorithm = settings.jwt_algorithm

  try:
    payload = jwt.decode(token, secret_key, algorithms=[algorithm])
  except jwt.ExpiredSignatureError:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Token has expired",
    )
  except jwt.InvalidTokenError:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid authentication token",
    )

  subject = payload.get("sub")
  if subject is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid authentication token",
    )
  return str(subject)

