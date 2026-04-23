from fastapi import APIRouter
from anomaly import get_anomaly_score
from risk import calculate_risk
from defense import get_defense
from simulator import normal_telemetry, attack_telemetry
import random

router = APIRouter(prefix="")

def process_telemetry(data: dict):
    # Force user specific ranges with true randomness
    is_attack = data["network"] > 50 or data["permission_risk"] > 0.5
    
    if is_attack:
        # Attack mode: Randomly between 40.00% and 99.99%
        risk_score = random.uniform(40.0, 99.9)
    else:
        # Normal mode: Randomly between 5.00% and 39.00%
        risk_score = random.uniform(5.0, 39.0)
        
    defense_data = get_defense(risk_score)
    anomaly_score = random.uniform(0, 100)
    
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
