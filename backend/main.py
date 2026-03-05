from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from test_routes import router as test_router
from test_routes import process_telemetry
from database import init_db, log_activity, get_user_logs

# Initialize SQLite database
init_db()

app = FastAPI(title="ShadowTrace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_router)

@app.get("/")
def health_check():
    return {"status": "ShadowTrace Backend Online", "ip": "192.168.31.138"}

class TelemetryData(BaseModel):
    battery: float
    network: float
    mic: float
    permission_risk: float
    night_mode: bool

@app.post("/analyze")
def analyze(data: TelemetryData):
    telemetry_dict = {
        "battery": data.battery,
        "network": data.network,
        "mic": data.mic,
        "permission_risk": data.permission_risk,
        "night_mode": data.night_mode
    }
    return process_telemetry(telemetry_dict)

class LogEntry(BaseModel):
    user_id: str
    risk_score: float
    status: str
    anomaly_score: float
    details: str = ""

@app.post("/log_activity")
def save_log(entry: LogEntry):
    log_activity(
        user_id=entry.user_id,
        risk_score=entry.risk_score,
        status=entry.status,
        anomaly_score=entry.anomaly_score,
        details=entry.details
    )
    return {"status": "success", "message": "Log saved"}

@app.get("/logs/{user_id}")
def fetch_logs(user_id: str):
    logs = get_user_logs(user_id)
    return {"logs": logs}
