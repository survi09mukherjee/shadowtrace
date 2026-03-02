import random

def normal_telemetry() -> dict:
    return {
        "battery": round(random.uniform(1.0, 5.0), 2),
        "network": round(random.uniform(1.0, 10.0), 2),
        "mic": round(random.uniform(0.0, 2.0), 2),
        "permission_risk": round(random.uniform(10.0, 30.0), 2),
        "night_mode": False
    }

def attack_telemetry() -> dict:
    return {
        "battery": round(random.uniform(10.0, 25.0), 2),
        "network": round(random.uniform(120.0, 250.0), 2),
        "mic": round(random.uniform(5.0, 10.0), 2),
        "permission_risk": round(random.uniform(70.0, 95.0), 2),
        "night_mode": True
    }
