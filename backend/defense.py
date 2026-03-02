def get_defense(risk_score) -> dict:
    if risk_score > 80:
        return {
            "status": "ANOMALY_DETECTED",
            "defense": True,
            "actions": [
                "Block Microphone Access",
                "Block Camera Access",
                "Limit Data Usage",
                "Restrict Network Traffic",
                "Enable Defense Mode"
            ]
        }
    elif 40 < risk_score <= 80:
        return {
            "status": "SUSPICIOUS_BEHAVIOR",
            "defense": False,
            "actions": [
                "Monitor Background Activity"
            ]
        }
    else:
        return {
            "status": "SAFE",
            "defense": False,
            "actions": []
        }
