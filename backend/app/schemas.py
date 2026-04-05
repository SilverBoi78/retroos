from datetime import datetime
from pydantic import BaseModel, Field


# ── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=4, max_length=128)

class LoginRequest(BaseModel):
    username: str
    password: str
    sessionDuration: str = "7d"  # "session", "7d", "30d", "never"

class UserResponse(BaseModel):
    id: int
    username: str
    createdAt: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_user(cls, user):
        return cls(id=user.id, username=user.username, createdAt=user.created_at)


# ── File System ─────────────────────────────────────────────────────────────

class WriteFileRequest(BaseModel):
    content: str

class RenameRequest(BaseModel):
    newName: str = Field(min_length=1, max_length=255)

class FsEntryResponse(BaseModel):
    name: str
    type: str
    modifiedAt: datetime | None = None
    size: int | None = None

class FileContentResponse(BaseModel):
    content: str

class NodeTypeResponse(BaseModel):
    type: str | None

class ExistsResponse(BaseModel):
    exists: bool

class OkResponse(BaseModel):
    ok: bool = True


# ── Settings ────────────────────────────────────────────────────────────────

class SettingsResponse(BaseModel):
    themeId: str

class SettingsUpdateRequest(BaseModel):
    themeId: str | None = None
