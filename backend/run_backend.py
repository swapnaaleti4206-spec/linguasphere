import os
import uvicorn
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"==================================================")
    print(f"Starting Supernova English AI Backend on http://{host}:{port}")
    print(f"API Docs available at: http://{host}:{port}/docs")
    print(f"==================================================")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
