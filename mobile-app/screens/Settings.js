import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Dimensions, ImageBackground } from 'react-native';
import Colors from '../constants/Colors';
import { Shield, Moon, Camera, Mic } from 'lucide-react-native';
import { fetchLogs } from '../api';

export default function Settings() {
  const [stealthMode, setStealthMode] = useState(false);
  const [riskScore, setRiskScore] = useState(0);

  // Poll for risk score to update privacy shield status
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchLogs('defaultuser');
      if (data && data.logs && data.logs.length > 0) {
        setRiskScore(data.logs[0].risk_score);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground 
        source={require('../assets/settings_bg.png')} 
        style={styles.bgContainer}
        resizeMode="cover"
        imageStyle={{ opacity: 0.15 }}
    >
        <ScrollView style={styles.container}>
          <Text style={styles.header}>Settings & Privacy</Text>
          
          {/* Hardware Privacy Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Shield color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>Hardware Privacy Shield</Text>
            </View>
            <Text style={styles.description}>Real-time monitoring of hardware access and physical sensor locks.</Text>
            
            <View style={styles.hwBox}>
              <View style={styles.hwItem}>
                <Camera color={riskScore >= 40 ? Colors.danger : Colors.primary} size={24} />
                <Text style={styles.hwLabel}>CAMERA</Text>
                <Text style={[styles.hwStatus, riskScore >= 40 && { color: Colors.danger }]}>
                    {riskScore >= 40 ? 'LOCKED' : 'ACTIVE'}
                </Text>
              </View>
              <View style={styles.hwItem}>
                <Mic color={riskScore >= 40 ? Colors.danger : Colors.primary} size={24} />
                <Text style={styles.hwLabel}>MICROPHONE</Text>
                <Text style={[styles.hwStatus, riskScore >= 40 && { color: Colors.danger }]}>
                    {riskScore >= 40 ? 'DISABLED' : 'ACTIVE'}
                </Text>
              </View>
            </View>
          </View>

          {/* PRIVACY SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Moon color={Colors.primary} size={20} />
                <Text style={styles.sectionTitle}>Operational Stealth</Text>
            </View>
            
            <View style={styles.row}>
                <View>
                    <Text style={styles.rowLabel}>Stealth Mode</Text>
                    <Text style={styles.rowSub}>Optimize UI for low visibility</Text>
                </View>
                <Switch 
                    value={stealthMode}
                    onValueChange={setStealthMode}
                    trackColor={{ false: '#222', true: Colors.warning }}
                    thumbColor={stealthMode ? Colors.warning : '#f4f3f4'}
                />
            </View>
          </View>
        </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 20,
  },
  section: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  description: {
    color: '#888',
    fontSize: 12,
    marginBottom: 20,
  },
  hwBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  hwItem: {
    alignItems: 'center',
  },
  hwLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 10,
  },
  hwStatus: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  rowLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rowSub: {
    color: '#666',
    fontSize: 11,
  }
});
