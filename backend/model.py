import numpy as np
from sklearn.ensemble import IsolationForest

# Train an IsolationForest on 500 synthetic "normal" samples at import time
# Features: [battery, network, mic, permission_risk]
# Normal ranges: battery 1-5, network 1-20, mic 0-1, permission_risk 5-30

np.random.seed(42)
battery_data = np.random.uniform(1, 5, 500)
network_data = np.random.uniform(1, 20, 500)
mic_data = np.random.uniform(0, 1, 500)
permission_risk_data = np.random.uniform(5, 30, 500)

X_train = np.column_stack((battery_data, network_data, mic_data, permission_risk_data))

model = IsolationForest(contamination=0.05, random_state=42)
model.fit(X_train)

def predict(features_array):
    """
    Expects features_array to be a 2D array: [[battery, network, mic, permission_risk]]
    Returns the prediction from IsolationForest: 1 for normal, -1 for anomaly
    """
    return model.predict(features_array)
