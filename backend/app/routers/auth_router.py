from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models import User, UserSettings, FsNode, utcnow
from ..schemas import RegisterRequest, LoginRequest, UserResponse, OkResponse
from ..auth import hash_password, verify_password, create_access_token, COOKIE_NAME

router = APIRouter()

DEFAULT_DIRS = ["Documents", "Desktop", "Pictures", "Games", "Music"]


def seed_user_data(db: Session, user: User):
    """Create default settings and filesystem for a new user."""
    db.add(UserSettings(user_id=user.id))

    root = FsNode(user_id=user.id, parent_id=None, name="/", node_type="directory")
    db.add(root)
    db.flush()

    for dirname in DEFAULT_DIRS:
        db.add(FsNode(user_id=user.id, parent_id=root.id, name=dirname, node_type="directory"))

    db.commit()


def set_token_cookie(response: Response, user_id: int, duration: str = "7d"):
    token, max_age = create_access_token(user_id, duration)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,  # Set to True when using HTTPS
        samesite="lax",
        path="/api",
        max_age=max_age,  # None = session cookie
    )


@router.post("/register", response_model=UserResponse, status_code=201)
def register(body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")

    user = User(username=body.username, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    seed_user_data(db, user)
    set_token_cookie(response, user.id, "7d")

    return UserResponse.from_user(user)


@router.post("/login", response_model=UserResponse)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    set_token_cookie(response, user.id, body.sessionDuration)

    return UserResponse.from_user(user)


@router.post("/logout", response_model=OkResponse)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/api")
    return OkResponse()


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return UserResponse.from_user(user)
