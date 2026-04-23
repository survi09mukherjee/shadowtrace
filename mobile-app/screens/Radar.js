import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Colors from '../constants/Colors';
import { Activity } from 'lucide-react-native';
import { fetchLogs } from '../api';

const { width } = Dimensions.get('window');

export default function Radar() {
  const [riskScore, setRiskScore] = useState(0);
  const [dataPoints, setDataPoints] = useState(new Array(20).fill(50));
  const [modeHistory, setModeHistory] = useState(new Array(40).fill(0));
  const rotation = useRef(new Animated.Value(0)).current;

  // Real-time Graph Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const isEmergency = riskScore >= 40;
      
      // Update Pulse Curve
      setDataPoints(prev => {
        const newPoint = isEmergency 
          ? 20 + Math.random() * 60 
          : 40 + Math.random() * 20;
        return [...prev.slice(1), newPoint];
      });

      // Update Digital Mode Log
      setModeHistory(prev => {
        const mode = isEmergency ? 1 : 0;
        return [...prev.slice(1), mode];
      });

    }, 200);
    return () => clearInterval(interval);
  }, [riskScore]);

  // Poll for latest risk score 

  // Poll for latest risk score to update radar color
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await fetchLogs('defaultuser');
        if (data && data.logs && data.logs.length > 0) {
          setRiskScore(data.logs[0].risk_score);
        }
      } catch (err) {
        console.warn('Radar poll failed:', err.message);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const isEmergency = riskScore >= 40;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isEmergency && { color: Colors.danger }]}>
        {isEmergency ? 'EMERGENCY MONITORING' : 'LIVE MONITORING'}
      </Text>
      
      <View style={[styles.radarContainer, isEmergency && { borderColor: Colors.danger, shadowColor: Colors.danger }]}>
        {/* Radar Rings */}
        <View style={[styles.ring, { width: 150, height: 150 }]} />
        <View style={[styles.ring, { width: 100, height: 100 }]} />
        <View style={[styles.ring, { width: 50, height: 50 }]} />
        
        {/* Crosshairs */}
        <View style={[styles.horizontalLine, isEmergency && { backgroundColor: 'rgba(255, 0, 0, 0.3)' }]} />
        <View style={[styles.verticalLine, isEmergency && { backgroundColor: 'rgba(255, 0, 0, 0.3)' }]} />

        {/* Sweeper */}
        <Animated.View
          style={[
            styles.sweeper,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <View style={[styles.sweeperLine, isEmergency && { backgroundColor: Colors.danger }]} />
          <View style={[styles.sweeperGradient, isEmergency && { backgroundColor: 'rgba(255, 0, 0, 0.2)' }]} />
        </Animated.View>

        {/* Dynamic Threat Blips (Show only in emergency) */}
        {isEmergency && (
          <>
            <View style={[styles.blip, { top: '30%', left: '70%' }]} />
            <View style={[styles.blip, { top: '70%', left: '20%' }]} />
          </>
        )}
      </View>

      <View style={[styles.statusBox, isEmergency && { borderColor: Colors.danger }]}>
        <Activity color={isEmergency ? Colors.danger : Colors.primary} size={24} style={{ marginRight: 10 }} />
        <Text style={[styles.statusText, isEmergency && { color: Colors.danger }]}>
            {isEmergency ? 'SITUATION: CRITICAL_THREAT' : 'SITUATION: SYSTEM_SAFE'}
        </Text>
      </View>

      {/* Live Tactical Graph */}
      <View style={styles.graphContainer}>
        <Text style={[styles.graphTitle, isEmergency && { color: Colors.danger }]}>
          PULSE TELEMETRY STREAM
        </Text>
        <Svg height="60" width={width * 0.9}>
          <Path
            d={`M 0 30 ${dataPoints.map((p, i) => `L ${(width * 0.9 / 19) * i} ${p/2}`).join(' ')}`}
            fill="none"
            stroke={isEmergency ? Colors.danger : Colors.primary}
            strokeWidth="2"
          />
        </Svg>

        <View style={{ height: 1, backgroundColor: '#222', width: '100%', marginVertical: 10 }} />

        <Text style={[styles.graphTitle, { marginTop: 0 }]}>
          DIGITAL MODE LOG (HISTORY)
        </Text>
        <Svg height="40" width={width * 0.9}>
          <Path
            d={`M 0 35 ${modeHistory.map((m, i) => `L ${(width * 0.9 / 39) * i} ${m === 1 ? 5 : 35}`).join(' ')}`}
            fill="none"
            stroke={isEmergency ? Colors.danger : '#00ff41'}
            strokeWidth="2"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: Colors.primary,
    fontFamily: 'monospace',
    marginBottom: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  radarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#050c05',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  ring: {
    position: 'absolute',
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.2)',
  },
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
  },
  verticalLine: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
  },
  sweeper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sweeperLine: {
    width: 2,
    height: '50%',
    backgroundColor: Colors.primary,
  },
  sweeperGradient: {
    position: 'absolute',
    top: 0,
    right: '50%',
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(0, 255, 65, 0.15)',
    borderTopRightRadius: 75,
  },
  blip: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  statusBox: {
    flexDirection: 'row',
    marginTop: 50,
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 250,
    justifyContent: 'center',
  },
  statusText: {
    color: Colors.textMuted,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
  },
  graphContainer: {
    marginTop: 40,
    width: width * 0.9,
    alignItems: 'center',
    backgroundColor: '#050505',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#111',
  },
  graphTitle: {
    color: Colors.primary,
    fontSize: 9,
    fontFamily: 'monospace',
    marginBottom: 10,
    fontWeight: 'bold',
  }
});
