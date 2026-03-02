from fastapi import APIRouter
from anomaly import get_anomaly_score
from risk import calculate_risk
from defense import get_defense
from simulator import normal_telemetry, attack_telemetry

router = APIRouter(prefix="")

def process_telemetry(data: dict):
    anomaly_score = get_anomaly_score(
        battery=data["battery"],
        network=data["network"],
        mic=data["mic"],
        permission_risk=data["permission_risk"]
    )
    risk_score = calculate_risk(
        anomaly_score=anomaly_score,
        permission_risk=data["permission_risk"],
        night_mode=data["night_mode"],
        network=data["network"]
    )
    defense_data = get_defense(risk_score)
    
    return {
        "risk_score": risk_score,
        "status": defense_data["status"],
        "defense": defense_data["defense"],
        "actions": defense_data["actions"],
        "anomaly_score": anomaly_score
    }

@router.get("/test-normal")
def test_normal():
    data = normal_telemetry()
    return process_telemetry(data)

@router.get("/test-attack")
def test_attack():
    data = attack_telemetry()
    return process_telemetry(data)
