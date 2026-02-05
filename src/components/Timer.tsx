import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Timer({ onBack }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggle = () => setIsActive(!isActive);
  
  const reset = () => {
    setSeconds(0);
    setIsActive(false);
  };

  // NUEVA FUNCIÓN: Guardar el tiempo actual para uso posterior
  const saveTimeSession = async () => {
    if (seconds === 0) return Alert.alert("Error", "No hay tiempo grabado");

    try {
      const existingSessions = await AsyncStorage.getItem('@saved_times');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      
      const newSession = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleString(),
        segundos: seconds,
        formateado: formatTime(seconds)
      };

      await AsyncStorage.setItem('@saved_times', JSON.stringify([newSession, ...sessions]));
      Alert.alert("Éxito", "Sesión de tiempo guardada. Podrás usarla al grabar un partido.");
      reset();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la sesión");
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRONÓMETRO TÁCTICO</Text>
      
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, isActive ? styles.btnPause : styles.btnStart]} onPress={toggle}>
          <Text style={styles.btnText}>{isActive ? 'PAUSA' : 'INICIAR'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.btnReset]} onPress={reset}>
          <Text style={styles.btnText}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/* Botón para guardar la sesión y usarla después en partidos */}
      <TouchableOpacity style={styles.btnSave} onPress={saveTimeSession}>
        <Text style={styles.btnText}>💾 GUARDAR PARA PARTIDO</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnBack} onPress={onBack}>
        <Text style={styles.btnBackText}>VOLVER AL MENÚ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#00aaff', fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  timerCircle: { width: 250, height: 250, borderRadius: 125, borderWidth: 8, borderColor: '#00aaff', justifyContent: 'center', alignItems: 'center', marginBottom: 50 },
  timerText: { color: '#FFF', fontSize: 60, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 20 },
  btn: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  btnStart: { backgroundColor: '#28a745' },
  btnPause: { backgroundColor: '#ffc107' },
  btnReset: { backgroundColor: '#dc3545' },
  btnSave: { backgroundColor: '#1565C0', padding: 18, borderRadius: 15, marginTop: 30, width: '80%', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnBack: { marginTop: 40 },
  btnBackText: { color: '#666', fontSize: 16, textDecorationLine: 'underline' }
});