import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(r'c:\Users\DELL\Desktop\shadowtrace\backend'))

from simulator import normal_telemetry, attack_telemetry
from test_routes import process_telemetry

def test_randomization():
    print("Testing Normal Telemetry Randomization:")
    for i in range(3):
        data = normal_telemetry()
        result = process_telemetry(data)
        print(f"  Run {i+1}: Risk Score: {result['risk_score']}%, Status: {result['status']}")
        assert 1.0 <= data['battery'] <= 5.0
        assert 1.0 <= data['network'] <= 10.0

    print("\nTesting Attack Telemetry Randomization:")
    attack_triggered = False
    for i in range(10): # Run multiple times to see varying High risks
        data = attack_telemetry()
        result = process_telemetry(data)
        print(f"  Run {i+1}: Risk Score: {result['risk_score']}%, Status: {result['status']}")
        if result['risk_score'] > 80:
            attack_triggered = True
            print(f"    [DEFENSE TRIGGERED] Actions: {result['actions']}")
            assert "Block Microphone Access" in result['actions']
            assert "Block Camera Access" in result['actions']
            assert "Limit Data Usage" in result['actions']
        
        assert 10.0 <= data['battery'] <= 25.0
        assert 120.0 <= data['network'] <= 250.0

    if attack_triggered:
        print("\nVerification Succesful: Defense logic triggered correctly above 80 risk.")
    else:
        print("\nVerification Warn: Defense logic not triggered in 10 runs. Values might be on the lower end of attack range.")

if __name__ == "__main__":
    test_randomization()
