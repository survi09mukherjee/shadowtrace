import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator, Dimensions, ScrollView, RefreshControl, Animated, Easing } from 'react-native';
import Colors from '../constants/Colors';
import { AlertTriangle, Fingerprint, MapPin } from 'lucide-react-native';
import { fetchLogs, analyzeSystem } from '../api';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const [nightMode, setNightMode] = useState(false);
  const [nativeDefense, setNativeDefense] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [riskScore, setRiskScore] = useState(12.05);
  const [logs, setLogs] = useState([]);
  const [location, setLocation] = useState(null);
  
  // Real-Time GPS Tracking
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);
  
  const [showEmergency, setShowEmergency] = useState(false);

  // Radar Animation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const loadData = async () => {
    try {
      const data = await fetchLogs('defaultuser');
      if (data && data.logs) {
        setLogs(data.logs.slice(0, 5));
        if (data.logs.length > 0) {
          setRiskScore(data.logs[0].risk_score);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAction = async (isAttack) => {
    setLoading(true);
    try {
      const telemetry = {
        battery: isAttack ? 25 : 85,
        network: isAttack ? 90 : 5,
        mic: isAttack ? 0.9 : 0.05,
        permission_risk: isAttack ? 0.8 : 0.1,
        night_mode: nightMode,
        latitude: location ? location.latitude : 0,
        longitude: location ? location.longitude : 0
      };
      
      const result = await analyzeSystem(telemetry);
      if (result) {
        setRiskScore(result.risk_score);
        loadData(); 
        
        if (result.risk_score > 80) {
          setShowEmergency(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetSystem = () => {
    setShowEmergency(false);
    handleAction(false); 
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.title}>Shadow Trace Dashboard</Text>
        
        {/* Risk Center Display (No stick) */}
        <View style={styles.radarSection}>
           <View style={[styles.radarCircle, riskScore >= 40 && { borderColor: Colors.danger, shadowColor: Colors.danger }]}>
              <Text style={[styles.radarStatus, riskScore >= 40 && { color: Colors.danger }]}>
                {riskScore >= 40 ? 'SITUATION: EMERGENCY' : 'SITUATION: SAFE'}
              </Text>
              <Text style={[styles.radarScore, riskScore >= 40 && { color: Colors.danger }]}>
                {riskScore.toFixed(2)}%
              </Text>
           </View>
        </View>

        {/* Active GPS Tracking Section */}
        <View style={styles.trackingSection}>
          <MapPin color={Colors.primary} size={16} />
          <Text style={styles.trackingText}>
            {location ? `LAT: ${location.latitude.toFixed(4)} | LON: ${location.longitude.toFixed(4)}` : 'ACQUIRING GPS SIGNAL...'}
          </Text>
          <View style={styles.liveDot} />
        </View>

        {/* Emergency Modal Overlay */}
        {showEmergency && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>RED ALERT</Text>
              <Text style={styles.modalText}>TACTICAL SOS SIMULATION</Text>
              <Text style={{ color: '#00ff41', fontSize: 10, marginBottom: 10 }}>
                COORD: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'UKNOWN'}
              </Text>
              
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ color: '#ff2a2a', fontWeight: 'bold' }}>
                  TAC_SIM: NOTIFYING SERVICES...
                </Text>
                <Text style={{ color: '#555', fontSize: 9, marginTop: 5 }}>
                  (SOCIETY PROTOCOL MOCK-UP)
                </Text>
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={resetSystem}>
                <Text style={styles.modalButtonText}>RETURN TO NORMAL</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      
      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.normalButton} 
          onPress={() => handleAction(false)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Normal Mode</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.simulateButton} 
          onPress={() => handleAction(true)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>PANIC MODE (REAL)</Text>}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.defenseButton, nativeDefense && { backgroundColor: Colors.primary }]}
        onPress={() => {
          const newState = !nativeDefense;
          setNativeDefense(newState);
          if (newState) {
            handleAction(true); // Trigger tactical alert when entering high defense mode
          }
        }}
      >
        <Text style={styles.defenseText}>
          {nativeDefense ? 'Native Defense Active' : 'Enable Native Defense (Admin)'}
        </Text>
      </TouchableOpacity>
      
      {/* Active Defense Alert */}
      {nativeDefense ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>⚠ NATIVE DEFENSE ACTIVE</Text>
          <Text style={styles.alertSubtitle}>• Monitor Background Activity</Text>
        </View>
      ) : (
        <View style={styles.inactiveBox}>
          <Text style={styles.inactiveText}>Defense Inactive</Text>
        </View>
      )}

      {/* Threat Logs Section Header */}
      <Text style={styles.logsHeader}>Recent Activity</Text>
      <View style={styles.logList}>
        {logs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <Text style={[styles.logText, log.status !== 'SAFE' && { color: Colors.danger }]}>
              {log.timestamp.split('T')[1].split('.')[0]} - {log.status} - {log.risk_score.toFixed(2)}%
            </Text>
          </View>
        ))}
        {logs.length === 0 && <Text style={styles.logText}>No activity recorded yet.</Text>}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  radarSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  radarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  scanner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  scannerLine: {
    width: 2,
    height: '50%',
    backgroundColor: Colors.primary,
  },
  radarStatus: {
    color: Colors.primary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 10,
  },
  radarScore: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: '#000',
    padding: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#ff2a2a',
    alignItems: 'center',
    width: '85%',
    shadowColor: '#ff2a2a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  modalTitle: {
    color: '#ff2a2a',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 3,
  },
  modalText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  toggleText: {
    color: '#fff',
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  normalButton: {
    backgroundColor: '#0055ff', 
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  simulateButton: {
    backgroundColor: '#cc0000', 
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  defenseButton: {
    backgroundColor: '#ff9900', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  defenseText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertBox: {
    backgroundColor: 'rgba(200, 0, 0, 0.2)',
    borderColor: Colors.danger,
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  alertTitle: {
    color: Colors.danger,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  alertSubtitle: {
    color: '#aaa',
    fontSize: 14,
  },
  inactiveBox: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  inactiveText: {
    color: '#555',
    fontWeight: 'bold',
  },
  logsHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logList: {
    marginBottom: 40,
  },
  logItem: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 4,
    marginBottom: 5,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  logText: {
    color: '#999',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  hardwareSection: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  hardwareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hwItem: {
    alignItems: 'center',
    flex: 1,
  },
  hwLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hwStatus: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  registerSection: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 5,
    padding: 12,
    color: '#fff',
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  registerButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  trackingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a1a0a',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.2)',
    marginBottom: 20,
    width: '90%',
    alignSelf: 'center',
  },
  trackingText: {
    color: Colors.primary,
    fontSize: 10,
    fontFamily: 'monospace',
    marginHorizontal: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff41',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
});
