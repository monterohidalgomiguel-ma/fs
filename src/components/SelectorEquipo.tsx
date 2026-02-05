import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SelectorEquipo({ onConfirm }) {
  const [eq, setEq] = useState('Leganés Amas B');
  const [temp, setTemp] = useState('2025-26');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PIZARRA LEGANÉS</Text>
      
      <Text style={styles.label}>SELECCIONA EQUIPO:</Text>
      <TouchableOpacity style={styles.option} onPress={() => setEq('Leganés Amas B')}>
        <Text style={[styles.optText, eq === 'Leganés Amas B' && styles.selected]}>Leganés Amas B</Text>
      </TouchableOpacity>

      <Text style={styles.label}>TEMPORADA:</Text>
      <TouchableOpacity style={styles.option}>
        <Text style={styles.selected}>2025-26</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.btnEntrar} 
        onPress={() => onConfirm(eq, temp)}
      >
        <Text style={styles.btnText}>ENTRAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33', justifyContent: 'center', padding: 20 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  label: { color: '#00aaff', fontSize: 12, marginBottom: 10, fontWeight: 'bold' },
  option: { backgroundColor: '#00264d', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#003366' },
  selected: { color: '#00aaff', fontWeight: 'bold' },
  optText: { color: 'white' },
  btnEntrar: { backgroundColor: '#00aaff', padding: 18, borderRadius: 10, marginTop: 30 },
  btnText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});