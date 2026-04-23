import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ImageBackground } from 'react-native';
import Colors from '../constants/Colors';
import { UserPlus, Phone, ClipboardList } from 'lucide-react-native';
import { API_URL } from '../api';

export default function Register() {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const saveContact = async () => {
    if (!newName || !newPhone) return Alert.alert("Error", "Please enter name and number");
    try {
        const response = await fetch(`${API_URL}/register-contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, phone: newPhone })
        });
        Alert.alert("Success", "Registered: " + newName);
        setNewName('');
        setNewPhone('');
    } catch (err) {
        console.error(err);
        Alert.alert("Error", "Server Connection Failed");
    }
  };

  return (
    <ImageBackground 
        source={require('../assets/register_bg.png')} 
        style={styles.bgContainer}
        resizeMode="cover"
        imageStyle={{ opacity: 0.15 }}
    >
        <ScrollView style={styles.container}>
          <Text style={styles.header}>SOS Registry</Text>
          
          <View style={styles.card}>
            <View style={styles.iconRow}>
                <UserPlus color={Colors.primary} size={32} />
            </View>
            <Text style={styles.cardTitle}>Register Civil Services</Text>
            <Text style={styles.cardInfo}>Details saved here will be notified automatically during a Red Alert SOS Pulse.</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Contact Name (e.g. Police HQ)" 
              placeholderTextColor="#444"
              onChangeText={setNewName}
              value={newName}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Emergency Number" 
              placeholderTextColor="#444"
              keyboardType="phone-pad"
              onChangeText={setNewPhone}
              value={newPhone}
            />
            
            <TouchableOpacity style={styles.button} onPress={saveContact}>
              <Text style={styles.buttonText}>Confirm Registration</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <ClipboardList color="#666" size={16} />
            <Text style={styles.infoText}>Numbers are encrypted and stored in your local tactical vault.</Text>
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
  card: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: '#222',
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardInfo: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  infoText: {
    color: '#555',
    fontSize: 11,
    marginLeft: 8,
  }
});
