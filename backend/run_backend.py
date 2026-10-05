import os
import uvicorn
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"==================================================")
    print(f"Starting LinguaSphere AI Backend on http://{host}:{port}")
    print(f"==================================================")
    env = os.getenv("ENVIRONMENT", "development").lower()
    is_dev = env != "production"
    uvicorn.run("app.main:app", host=host, port=port, reload=is_dev)
