import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BACKEND_DIR / ".env")

CONFIG_FILE_PATH = Path(os.getenv("ALLOWED_USERS_FILE", BACKEND_DIR / "config" / "allowed_users.json"))

JWT_SECRET = os.getenv("JWT_SECRET", "linguasphere-secret-jwt-key-2026-auth-multilingual")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_allowed_config() -> dict:
    """Reads the allowed users configuration JSON file."""
    if not CONFIG_FILE_PATH.exists():
        default_cfg = {
            "max_allowed_users": 2,
            "platform_name": "LinguaSphere AI",
            "allowed_users": [
                {
                    "email": "swapnaaleti4206@gmail.com",
                    "name": "Swapna Aleti",
                    "role": "admin",
                    "level": "intermediate"
                },
                {
                    "email": "mounikasavitri371@gmail.com",
                    "name": "Mounika Savitri",
                    "role": "user",
                    "level": "beginner"
                }
            ],
            "security_settings": {
                "default_passcode": "swapp@123",
                "require_passcode": True,
                "allow_demo_one_click": True
            }
        }
        save_allowed_config(default_cfg)
        return default_cfg

    try:
        with open(CONFIG_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Config] Error reading {CONFIG_FILE_PATH}: {e}")
        return {"max_allowed_users": 2, "allowed_users": []}

def save_allowed_config(data: dict) -> bool:
    """Safely saves configuration data back to the JSON file."""
    try:
        CONFIG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"[Config] Error writing {CONFIG_FILE_PATH}: {e}")
        return False

def is_email_authorized(email: str) -> tuple[bool, dict | None]:
    """
    Checks if an email is present in the authorized users list.
    Returns (True, user_dict) if authorized, else (False, None).
    """
    cfg = get_allowed_config()
    allowed_list = cfg.get("allowed_users", [])
    norm_email = email.strip().lower()

    for u in allowed_list:
        if u.get("email", "").strip().lower() == norm_email:
            return True, u
    return False, None
