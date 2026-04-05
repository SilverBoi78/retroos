from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError

from .config import settings

SESSION_DURATIONS = {
    "session": None,
    "7d": 7 * 86400,
    "30d": 30 * 86400,
    "never": 10 * 365 * 86400,
}

COOKIE_NAME = "retroos_token"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: int, duration: str = "7d") -> tuple[str, int | None]:
    max_age = SESSION_DURATIONS.get(duration, 7 * 86400)
    expire_seconds = max_age if max_age is not None else 7 * 86400
    expire = datetime.now(timezone.utc) + timedelta(seconds=expire_seconds)
    payload = {"sub": str(user_id), "exp": expire}
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, max_age


def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
        return user_id
    except (JWTError, ValueError, TypeError):
        return None
