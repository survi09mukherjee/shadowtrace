def calculate_risk(anomaly_score, permission_risk, night_mode, network) -> float:
    # Formula: 0.4*anomaly_score + 0.3*permission_risk + 0.2*(20 if night_mode else 0) + 0.1*network
    night_mode_penalty = 20 if night_mode else 0
    score = 0.4 * anomaly_score + 0.3 * permission_risk + 0.2 * night_mode_penalty + 0.1 * network
    
    if score > 100.0:
        score = 100.0
        
    return round(score, 2)
