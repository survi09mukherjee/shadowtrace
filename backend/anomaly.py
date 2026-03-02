from model import predict

def get_anomaly_score(battery, network, mic, permission_risk) -> int:
    result = predict([[battery, network, mic, permission_risk]])
    if result[0] == -1:
        return 70
    return 10
