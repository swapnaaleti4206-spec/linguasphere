import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.core.security import get_current_user
from app.core.access_control import require_admin_role
from app.core.config import get_allowed_config, save_allowed_config
from app.database.db import query_all, query_one, execute_commit

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

class AddUserRequest(BaseModel):
    email: EmailStr
    name: str
    role: str = "user"
    level: str = "intermediate"
    notes: Optional[str] = "Added via Admin Panel"

class UpdateMaxUsersRequest(BaseModel):
    max_allowed_users: int

@router.get("/config")
def get_admin_config(current_user: dict = Depends(get_current_user)):
    """Admin endpoint to view allowed users configuration and limits."""
    require_admin_role(current_user)
    cfg = get_allowed_config()
    return cfg

@router.post("/update-max-users")
def update_max_users(req: UpdateMaxUsersRequest, current_user: dict = Depends(get_current_user)):
    """
    Adjusts the maximum allowed users limit.
    Persists to config/allowed_users.json.
    """
    require_admin_role(current_user)
    if req.max_allowed_users < 1:
        raise HTTPException(status_code=400, detail="Maximum users limit must be at least 1.")

    cfg = get_allowed_config()
    cfg["max_allowed_users"] = req.max_allowed_users
    save_allowed_config(cfg)

    return {
        "status": "success",
        "message": f"Maximum allowed users updated to {req.max_allowed_users}.",
        "max_allowed_users": req.max_allowed_users
    }

@router.post("/add-user")
async def add_authorized_user(req: AddUserRequest, current_user: dict = Depends(get_current_user)):
    """
    Adds a new authorized email. Rejects if max user limit is exceeded
    or if user is already present.
    """
    require_admin_role(current_user)
    normalized_email = req.email.strip().lower()

    cfg = get_allowed_config()
    allowed_list = cfg.get("allowed_users", [])
    max_count = cfg.get("max_allowed_users", 2)

    # Check if already exists
    for u in allowed_list:
        if u.get("email", "").strip().lower() == normalized_email:
            raise HTTPException(status_code=400, detail=f"User with email '{normalized_email}' is already authorized.")

    # Check limit
    if len(allowed_list) >= max_count:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot add user: limit of {max_count} allowed users reached. Increase 'max_allowed_users' in settings first."
        )

    # Add to config list
    new_user_entry = {
        "email": normalized_email,
        "name": req.name.strip(),
        "role": req.role,
        "level": req.level,
        "added_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "notes": req.notes
    }
    allowed_list.append(new_user_entry)
    cfg["allowed_users"] = allowed_list
    save_allowed_config(cfg)

    # Also sync into SQLite database if not present
    existing_in_db = await query_one("SELECT id FROM users WHERE email = ?", (normalized_email,))
    if not existing_in_db:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        new_id = await execute_commit(
            "INSERT INTO users (email, name, role, level, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)",
            (normalized_email, req.name.strip(), req.role, req.level, now, now)
        )
        await execute_commit(
            "INSERT INTO learning_stats (user_id, streak_days, last_active_date) VALUES (?, 1, ?)",
            (new_id, now)
        )

    return {
        "status": "success",
        "message": f"Successfully authorized user '{normalized_email}'.",
        "user": new_user_entry,
        "total_authorized": len(allowed_list),
        "max_allowed": max_count
    }

@router.delete("/remove-user")
def remove_authorized_user(email: str, current_user: dict = Depends(get_current_user)):
    """Removes an email from the authorized users configuration."""
    require_admin_role(current_user)
    normalized_email = email.strip().lower()

    if normalized_email == current_user.get("email", "").lower():
        raise HTTPException(status_code=400, detail="Administrators cannot revoke their own active authorization.")

    cfg = get_allowed_config()
    allowed_list = cfg.get("allowed_users", [])

    filtered_list = [u for u in allowed_list if u.get("email", "").strip().lower() != normalized_email]
    if len(filtered_list) == len(allowed_list):
        raise HTTPException(status_code=404, detail=f"Email '{normalized_email}' was not found in authorized list.")

    cfg["allowed_users"] = filtered_list
    save_allowed_config(cfg)

    return {
        "status": "success",
        "message": f"Revoked authorization for '{normalized_email}'.",
        "total_authorized": len(filtered_list),
        "max_allowed": cfg.get("max_allowed_users", 2)
    }

@router.get("/activity-stats")
async def get_all_activity_stats(current_user: dict = Depends(get_current_user)):
    """Provides platform-wide activity logs and learning statistics."""
    require_admin_role(current_user)

    users = await query_all("""
        SELECT u.id, u.email, u.name, u.role, u.level, u.created_at, u.last_login,
               COALESCE(s.streak_days, 1) as streak_days,
               COALESCE(s.lessons_completed, 0) as lessons_completed,
               COALESCE(s.words_learned, 0) as words_learned
        FROM users u
        LEFT JOIN learning_stats s ON u.id = s.user_id
        ORDER BY u.id ASC
    """)

    total_chats = await query_one("SELECT COUNT(*) as cnt FROM chat_history")
    total_mistakes = await query_one("SELECT COUNT(*) as cnt FROM grammar_mistakes")
    total_sessions = await query_one("SELECT COUNT(*) as cnt FROM practice_sessions")
    total_vocab = await query_one("SELECT COUNT(*) as cnt FROM vocabulary")

    return {
        "registered_users": users,
        "total_chat_messages": total_chats["cnt"] if total_chats else 0,
        "total_grammar_mistakes_logged": total_mistakes["cnt"] if total_mistakes else 0,
        "total_speaking_sessions": total_sessions["cnt"] if total_sessions else 0,
        "total_saved_vocabulary": total_vocab["cnt"] if total_vocab else 0
    }

@router.get("/export-data")
async def export_all_user_data(current_user: dict = Depends(get_current_user)):
    """Exports complete database backup as formatted JSON file."""
    require_admin_role(current_user)

    users = await query_all("SELECT * FROM users")
    stats = await query_all("SELECT * FROM learning_stats")
    vocab = await query_all("SELECT * FROM vocabulary")
    mistakes = await query_all("SELECT * FROM grammar_mistakes")
    sessions = await query_all("SELECT * FROM practice_sessions")
    writings = await query_all("SELECT * FROM writing_submissions")

    cfg = get_allowed_config()

    export_payload = {
        "exported_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "config_snapshot": cfg,
        "users": users,
        "learning_stats": stats,
        "vocabulary_bank": vocab,
        "grammar_mistakes": mistakes,
        "practice_sessions": sessions,
        "writing_submissions": writings
    }

    json_str = json.dumps(export_payload, indent=2, default=str)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=english_ai_export_backup.json"}
    )

@router.get("/learning-report")
async def download_learning_report(current_user: dict = Depends(get_current_user)):
    """Generates a downloadable CSV summary report of user learning achievements."""
    require_admin_role(current_user)

    users = await query_all("""
        SELECT u.id, u.email, u.name, u.role, u.level, u.last_login,
               COALESCE(s.streak_days, 1) as streak,
               COALESCE(s.lessons_completed, 0) as lessons,
               COALESCE(s.words_learned, 0) as words
        FROM users u
        LEFT JOIN learning_stats s ON u.id = s.user_id
    """)

    csv_lines = ["User ID,Email,Name,Role,Level,Streak Days,Lessons Completed,Words Learned,Last Active"]
    for u in users:
        csv_lines.append(f"{u['id']},{u['email']},{u['name']},{u['role']},{u['level']},{u['streak']},{u['lessons']},{u['words']},{u['last_login']}")

    csv_data = "\n".join(csv_lines)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=english_ai_learning_report.csv"}
    )
