from fastapi import HTTPException, status
from app.core.config import get_allowed_config, is_email_authorized

def verify_email_access(email: str) -> dict:
    """
    Validates if an email is permitted access to the platform.
    Raises HTTP 403 Forbidden if the email is not in the authorized list.
    """
    authorized, user_info = is_email_authorized(email)
    if not authorized or not user_info:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Access Denied: '{email}' is not on the authorized learner list. "
                "This platform is private. Please contact Administrator Swapna Aleti (swapnaaleti4206@gmail.com) for access."
            )
        )
    return user_info

def check_can_add_user():
    """
    Checks if a new user can be added under the current maximum user limit.
    """
    cfg = get_allowed_config()
    current_count = len(cfg.get("allowed_users", []))
    max_count = cfg.get("max_allowed_users", 2)
    if current_count >= max_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Maximum allowed users limit reached ({current_count}/{max_count}). "
                "Only Admin Swapna Aleti can increase user limits in Admin settings."
            )
        )

def require_admin_role(user: dict):
    """
    Enforces that the authenticated user possesses the 'admin' role.
    Only administrator (Swapna Aleti) can modify settings, add/remove users, or export data.
    """
    role = user.get("role", "user")
    email = user.get("email", "").lower()
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required. Only Admin (Swapna Aleti) is authorized to make system modifications."
        )
