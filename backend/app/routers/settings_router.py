from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models import User, UserSettings
from ..schemas import SettingsResponse, SettingsUpdateRequest, OkResponse

router = APIRouter()


def get_or_create_settings(db: Session, user_id: int) -> UserSettings:
    s = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not s:
        s = UserSettings(user_id=user_id)
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("", response_model=SettingsResponse)
def get_settings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = get_or_create_settings(db, user.id)
    return SettingsResponse(themeId=s.theme_id)


@router.put("", response_model=OkResponse)
def update_settings(body: SettingsUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = get_or_create_settings(db, user.id)
    if body.themeId is not None:
        s.theme_id = body.themeId
    db.commit()
    return OkResponse()
