import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Colors from '../constants/Colors';
import { fetchLogs } from '../api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const data = await fetchLogs('defaultuser');
      if (data && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const renderLog = ({ item }) => {
    const isDanger = item.status !== 'SAFE';
    return (
      <View style={styles.logCard}>
        <View style={[styles.colorBar, { backgroundColor: isDanger ? Colors.danger : Colors.primary }]} />
        
        <View style={styles.logContent}>
          <View style={styles.row}>
            <Text style={[styles.statusText, isDanger && { color: Colors.danger }]}>{item.status}</Text>
            <Text style={styles.dateText}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.detailText}>
              Risk Score: <Text style={{ color: isDanger ? Colors.danger : Colors.primary }}>{item.risk_score.toFixed(2)}%</Text>
            </Text>
            <Text style={styles.detailText}>
              Anomaly: {item.anomaly_score.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderLog}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No telemetry logs found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logCard: {
    flexDirection: 'row',
    backgroundColor: '#111',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  colorBar: {
    width: 6,
  },
  logContent: {
    flex: 1,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateText: {
    color: '#999',
    fontSize: 12,
  },
  detailText: {
    color: '#ccc',
    fontSize: 14,
  },
  emptyText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'monospace',
  }
});
