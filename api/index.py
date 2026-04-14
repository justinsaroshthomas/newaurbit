from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Aurbit API", description="Python backend for Aurbit App", version="1.0.0")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Python API is running on Vercel"}

@app.get("/api/test")
def test_endpoint():
    return {"status": "success", "message": "Test endpoint working"}

# In Vercel, the app object is imported by the serverless runtime
