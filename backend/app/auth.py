from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .db import User, get_db
from .security import decode_access_token


def get_current_user(
  access_token: str | None = Cookie(default=None),
  db: Session = Depends(get_db),
) -> User:
  """
  Resolve the current user from an HttpOnly cookie-based JWT.
  """
  if access_token is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Not authenticated",
    )

  user_id = decode_access_token(access_token)
  user = db.query(User).filter(User.id == int(user_id)).first()
  if user is None or not user.is_active:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="User not found or inactive",
    )
  return user
