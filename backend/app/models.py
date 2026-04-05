from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime, nullable=False, default=utcnow)

    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    fs_nodes = relationship("FsNode", back_populates="user", cascade="all, delete-orphan")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme_id = Column(String(64), nullable=False, default="retro-classic")
    settings_json = Column(Text, nullable=True, default="{}")

    user = relationship("User", back_populates="settings")


class FsNode(Base):
    __tablename__ = "fs_nodes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("fs_nodes.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    node_type = Column(String(16), nullable=False)  # 'file' or 'directory'
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=utcnow)
    modified_at = Column(DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="fs_nodes")
    children = relationship("FsNode", backref="parent", remote_side=[id], cascade="all, delete-orphan", single_parent=True)

    __table_args__ = (
        UniqueConstraint("user_id", "parent_id", "name", name="uq_user_parent_name"),
    )
