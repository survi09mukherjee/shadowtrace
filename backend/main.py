from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from test_routes import router as test_router
from test_routes import process_telemetry
from database import init_db, log_activity, get_user_logs, add_contact, get_contacts

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
    return {"status": "ShadowTrace Backend Online", "version": "1.0.0"}

class TelemetryData(BaseModel):
    battery: float
    network: float
    mic: float
    permission_risk: float
    night_mode: bool
    latitude: float = 0.0
    longitude: float = 0.0

@app.post("/analyze")
def analyze(data: TelemetryData):
    telemetry_dict = {
        "battery": data.battery,
        "network": data.network,
        "mic": data.mic,
        "permission_risk": data.permission_risk,
        "night_mode": data.night_mode
    }
    result = process_telemetry(telemetry_dict)
    
    # NEW: Automated SOS Protocol (Tactical Simulation)
    if result["risk_score"] > 80:
        contacts = get_contacts()
        details = f"TAC_SIM: SOS BROADCAST SIMULATED to civil services. LOC: {data.latitude}, {data.longitude}. Contacts: " + ", ".join([c['name'] for c in contacts])
        log_activity(
            user_id="defaultuser",
            risk_score=result["risk_score"],
            status="PROTO_SIM_SOS",
            anomaly_score=result["anomaly_score"],
            details=details
        )
    else:
        log_activity(
            user_id="defaultuser",
            risk_score=result["risk_score"],
            status=result["status"],
            anomaly_score=result["anomaly_score"],
            details=f"Secure Scan - LOC: {data.latitude}, {data.longitude} - Defense: {result['defense']}"
        )
    
    return result

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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "ShadowTrace Tactical API",
        "version": "1.2.0",
        "mission_control": "ACTIVE"
    }

@app.get("/logs/{user_id}")
def fetch_logs(user_id: str):
    logs = get_user_logs(user_id)
    return {"logs": logs}

class ContactData(BaseModel):
    name: str
    phone: str

@app.post("/register-contact")
def register(entry: ContactData):
    add_contact(entry.name, entry.phone)
    return {"status": "success"}

@app.get("/contacts")
def list_contacts():
    return {"contacts": get_contacts()}
