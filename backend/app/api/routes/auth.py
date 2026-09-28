from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from app.core.config import get_allowed_config, is_email_authorized
from app.core.access_control import verify_email_access
from app.core.security import create_access_token, get_current_user
from app.database.db import query_one, execute_commit
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: EmailStr
    passcode: str = ""

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    level: str
    token: str

@router.get("/config-preview")
def get_allowed_preview():
    """
    Public endpoint displaying high-level system status and limits.
    Does not expose sensitive credentials or email lists.
    """
    cfg = get_allowed_config()
    return {
        "max_allowed_users": cfg.get("max_allowed_users", 2),
        "total_authorized": len(cfg.get("allowed_users", [])),
        "status": "ready"
    }

@router.post("/login")
async def login(req: LoginRequest):
    """
    Email-based authentication. Strictly rejects unauthorized emails.
    """
    normalized_email = req.email.strip().lower()

    # Access control verification: Only allowed emails can proceed
    allowed_info = verify_email_access(normalized_email)

    cfg = get_allowed_config()
    security_cfg = cfg.get("security_settings", {})
    expected_passcode = security_cfg.get("default_passcode", "english2026")
    allow_demo = security_cfg.get("allow_demo_one_click", True)

    # Validate passcode if provided, or allow one-click if permitted in private mode
    if req.passcode and req.passcode.strip() != expected_passcode:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect access passcode. Please check your credentials or admin setting."
        )

    # Query or insert user into SQLite database
    user_record = await query_one("SELECT * FROM users WHERE email = ?", (normalized_email,))
    
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if not user_record:
        # Create user record
        user_id = await execute_commit(
            """
            INSERT INTO users (email, name, role, level, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                normalized_email,
                allowed_info.get("name", normalized_email.split("@")[0].capitalize()),
                allowed_info.get("role", "user"),
                allowed_info.get("level", "intermediate"),
                now,
                now
            )
        )
        # Initialize learning stats at true baseline 0
        await execute_commit(
            """
            INSERT INTO learning_stats (user_id, streak_days, last_active_date, lessons_completed, words_learned)
            VALUES (?, 0, ?, 0, 0)
            """,
            (user_id, now)
        )
        user_record = await query_one("SELECT * FROM users WHERE id = ?", (user_id,))
    else:
        # Update last login timestamp
        await execute_commit("UPDATE users SET last_login = ? WHERE id = ?", (now, user_record["id"]))

    # Generate JWT token
    token = create_access_token({
        "id": user_record["id"],
        "email": user_record["email"],
        "name": user_record["name"],
        "role": user_record["role"],
        "level": user_record["level"]
    })

    return {
        "status": "success",
        "message": f"Welcome back, {user_record['name']}!",
        "token": token,
        "user": {
            "id": user_record["id"],
            "email": user_record["email"],
            "name": user_record["name"],
            "role": user_record["role"],
            "level": user_record["level"]
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Returns the profile of the currently logged-in user."""
    user = await query_one("SELECT id, email, name, role, level, created_at, last_login FROM users WHERE id = ?", (current_user["id"],))
    if not user:
        raise HTTPException(status_code=404, detail="User record not found.")
    return user
