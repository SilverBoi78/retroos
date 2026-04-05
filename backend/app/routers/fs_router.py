from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models import User, FsNode, utcnow
from ..schemas import (
    WriteFileRequest, RenameRequest, FsEntryResponse,
    FileContentResponse, NodeTypeResponse, ExistsResponse, OkResponse,
)

router = APIRouter()


def get_root(db: Session, user_id: int) -> FsNode:
    root = db.query(FsNode).filter(
        FsNode.user_id == user_id, FsNode.parent_id == None, FsNode.name == "/"
    ).first()
    if not root:
        raise HTTPException(status_code=500, detail="User filesystem not initialized")
    return root


def resolve_path(db: Session, user_id: int, path: str) -> FsNode | None:
    """Walk the path from root and return the target node, or None."""
    parts = [p for p in path.split("/") if p]
    node = get_root(db, user_id)

    for part in parts:
        child = db.query(FsNode).filter(
            FsNode.user_id == user_id,
            FsNode.parent_id == node.id,
            FsNode.name == part,
        ).first()
        if child is None:
            return None
        node = child

    return node


def resolve_parent_and_name(db: Session, user_id: int, path: str) -> tuple[FsNode, str]:
    """Resolve the parent directory and extract the target name from a path."""
    parts = [p for p in path.split("/") if p]
    if not parts:
        raise HTTPException(status_code=400, detail="Invalid path")

    name = parts[-1]
    parent_path = "/" + "/".join(parts[:-1])
    parent = resolve_path(db, user_id, parent_path)

    if parent is None:
        raise HTTPException(status_code=404, detail=f"Parent directory not found: {parent_path}")
    if parent.node_type != "directory":
        raise HTTPException(status_code=400, detail="Parent is not a directory")

    return parent, name


def build_tree(db: Session, node: FsNode) -> dict:
    """Recursively build the nested tree structure matching the frontend format."""
    if node.node_type == "file":
        return {
            "type": "file",
            "content": node.content or "",
            "createdAt": node.created_at.isoformat() if node.created_at else None,
            "modifiedAt": node.modified_at.isoformat() if node.modified_at else None,
        }

    children = db.query(FsNode).filter(
        FsNode.parent_id == node.id
    ).all()

    children_dict = {}
    for child in children:
        children_dict[child.name] = build_tree(db, child)

    return {"type": "directory", "children": children_dict}


@router.get("/tree")
def get_tree(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Load the entire filesystem as a nested tree (used on initial mount)."""
    root = get_root(db, user.id)
    return build_tree(db, root)


@router.get("/read-dir", response_model=list[FsEntryResponse])
def read_dir(path: str = Query("/"), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    node = resolve_path(db, user.id, path)
    if node is None:
        raise HTTPException(status_code=404, detail="Directory not found")
    if node.node_type != "directory":
        raise HTTPException(status_code=400, detail="Not a directory")

    children = db.query(FsNode).filter(FsNode.parent_id == node.id).all()
    return [
        FsEntryResponse(
            name=c.name,
            type=c.node_type,
            modifiedAt=c.modified_at,
            size=len(c.content) if c.content else None,
        )
        for c in children
    ]


@router.get("/read-file", response_model=FileContentResponse)
def read_file(path: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    node = resolve_path(db, user.id, path)
    if node is None:
        raise HTTPException(status_code=404, detail="File not found")
    if node.node_type != "file":
        raise HTTPException(status_code=400, detail="Not a file")
    return FileContentResponse(content=node.content or "")


@router.put("/write-file", response_model=OkResponse)
def write_file(body: WriteFileRequest, path: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    node = resolve_path(db, user.id, path)

    if node and node.node_type == "directory":
        raise HTTPException(status_code=400, detail="Path is a directory")

    if node:
        node.content = body.content
        node.modified_at = utcnow()
    else:
        parent, name = resolve_parent_and_name(db, user.id, path)
        node = FsNode(
            user_id=user.id,
            parent_id=parent.id,
            name=name,
            node_type="file",
            content=body.content,
        )
        db.add(node)

    db.commit()
    return OkResponse()


@router.post("/create-dir", response_model=OkResponse)
def create_dir(path: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = resolve_path(db, user.id, path)
    if existing:
        raise HTTPException(status_code=409, detail="Already exists")

    parent, name = resolve_parent_and_name(db, user.id, path)
    db.add(FsNode(user_id=user.id, parent_id=parent.id, name=name, node_type="directory"))
    db.commit()
    return OkResponse()


@router.delete("/delete", response_model=OkResponse)
def delete_node(path: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if path == "/" or path == "":
        raise HTTPException(status_code=400, detail="Cannot delete root")

    node = resolve_path(db, user.id, path)
    if node is None:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(node)
    db.commit()
    return OkResponse()


@router.patch("/rename", response_model=OkResponse)
def rename_node(body: RenameRequest, path: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    node = resolve_path(db, user.id, path)
    if node is None:
        raise HTTPException(status_code=404, detail="Not found")
    if node.parent_id is None:
        raise HTTPException(status_code=400, detail="Cannot rename root")

    conflict = db.query(FsNode).filter(
        FsNode.user_id == user.id,
        FsNode.parent_id == node.parent_id,
        FsNode.name == body.newName,
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="Name already exists")

    node.name = body.newName
    node.modified_at = utcnow()
    db.commit()
    return OkResponse()


@router.get("/exists", response_model=ExistsResponse)
def exists(path: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    node = resolve_path(db, user.id, path)
    return ExistsResponse(exists=node is not None)


@router.get("/node-type", response_model=NodeTypeResponse)
def node_type(path: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    node = resolve_path(db, user.id, path)
    return NodeTypeResponse(type=node.node_type if node else None)
