import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Stats({ onBack }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🚧</Text>
        <Text style={styles.title}>MÓDULO EN RECONSTRUCCIÓN</Text>
        <Text style={styles.sub}>
          Estamos trabajando para ofrecerte las mejores estadísticas de tu equipo.
        </Text>

        <TouchableOpacity style={styles.btnBack} onPress={onBack}>
          <Text style={styles.btnText}>VOLVER AL MENÚ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#001A33' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30 
  },
  icon: { 
    fontSize: 80, 
    marginBottom: 20 
  },
  title: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  sub: { 
    color: '#1565C0', 
    fontSize: 14, 
    textAlign: 'center', 
    marginTop: 10, 
    marginBottom: 40 
  },
  btnBack: { 
    backgroundColor: '#1565C0', 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 30 
  },
  btnText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});