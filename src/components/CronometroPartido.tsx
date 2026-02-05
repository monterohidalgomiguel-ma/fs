import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CronometroPartido({ config, rotacion, players, onBack }: any) {
  // 1. Estados principales
  const duracionInicial = parseInt(config?.duracionParte || '20') * 60;
  const [seconds, setSeconds] = useState(duracionInicial);
  const [isActive, setIsActive] = useState(false);
  const [showResumen, setShowResumen] = useState(false); // Nuevo: Controla el modal de fin
  
  const [enPista, setEnPista] = useState(rotacion?.enPista || []);
  const [enBanquillo, setEnBanquillo] = useState(
    rotacion?.convocados?.filter((id: string) => !rotacion.enPista.includes(id)) || []
  );
  const [jugadorSaliendo, setJugadorSaliendo] = useState<string | null>(null);

  const [tiemposJugadores, setTiemposJugadores] = useState(() => {
    const inicial: any = {};
    rotacion?.convocados?.forEach((id: string) => inicial[id] = 0);
    return inicial;
  });

  // 2. Lógica del Cronómetro y Tiempos
  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
        setTiemposJugadores((prev: any) => {
          const nuevo = { ...prev };
          enPista.forEach((id: string) => {
            nuevo[id] = (nuevo[id] || 0) + 1;
          });
          return nuevo;
        });
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      Alert.alert("Fin del tiempo", "La parte ha terminado.");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, enPista]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // 3. Persistencia de datos para "Partidos"
  const finalizarYGuardar = async () => {
    try {
      const sesionActual = {
        id: Date.now().toString(),
        rival: config.rival || 'Rival Desconocido',
        fecha: new Date().toLocaleDateString(),
        desglose: tiemposJugadores // { "id1": 120, "id2": 450... }
      };

      // Recuperar sesiones anteriores
      const dataExistente = await AsyncStorage.getItem('@saved_sessions');
      const sesiones = dataExistente ? JSON.parse(dataExistente) : [];
      
      // Guardar incluyendo la nueva
      await AsyncStorage.setItem('@saved_sessions', JSON.stringify([...sesiones, sesionActual]));
      
      Alert.alert("Éxito", "Datos de la sesión guardados correctamente.");
      onBack(); // Volver al menú
    } catch (e) {
      Alert.alert("Error", "No se pudieron guardar las estadísticas.");
    }
  };

  const realizarCambio = (idEntra: string) => {
    if (!jugadorSaliendo) return;
    setEnPista(enPista.map((id: string) => id === jugadorSaliendo ? idEntra : id));
    setEnBanquillo(enBanquillo.map((id: string) => id === idEntra ? jugadorSaliendo : id));
    setJugadorSaliendo(null);
  };

  const getPlayerData = (id: string) => {
    return players.find((p: any) => p.id === id) || { name: 'Desconocido' };
  };

  if (!rotacion) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* CABECERA */}
      <View style={styles.timerBox}>
        <Text style={styles.rivalTxt}>vs {config.rival || 'Rival'}</Text>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => setIsActive(!isActive)} style={[styles.btn, isActive ? styles.btnPause : styles.btnPlay]}>
            <Text style={styles.btnTxt}>{isActive ? 'PAUSA' : 'VAMOS'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowResumen(true)} style={styles.btnFinish}>
            <Text style={styles.btnTxt}>FINALIZAR</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <Text style={styles.sec}>EN PISTA</Text>
        <View style={styles.grid}>
          {enPista.map((id: string) => {
            const p = getPlayerData(id);
            return (
              <TouchableOpacity 
                key={id} 
                style={[styles.pCard, styles.pPista, jugadorSaliendo === id && styles.pSelected]}
                onPress={() => setJugadorSaliendo(id)}
              >
                <Text style={styles.pName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.pTime}>{formatTime(tiemposJugadores[id] || 0)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sec}>BANQUILLO (Toca para entrar)</Text>
        <View style={styles.grid}>
          {enBanquillo.map((id: string) => {
            const p = getPlayerData(id);
            return (
              <TouchableOpacity 
                key={id} 
                style={[styles.pCard, styles.pBank]}
                onPress={() => jugadorSaliendo ? realizarCambio(id) : Alert.alert("Cambio", "Selecciona primero quién sale")}
              >
                <Text style={styles.pName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.pTime}>{formatTime(tiemposJugadores[id] || 0)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* MODAL DE RESUMEN FINAL */}
      <Modal visible={showResumen} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalCont}>
            <Text style={styles.modalTitle}>RESUMEN DE TIEMPOS</Text>
            <ScrollView style={{ width: '100%', maxHeight: 300 }}>
              {Object.keys(tiemposJugadores).map(id => (
                <View key={id} style={styles.resumenRow}>
                  <Text style={styles.resName}>{getPlayerData(id).name}</Text>
                  <Text style={styles.resTime}>{formatTime(tiemposJugadores[id])}</Text>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.btnSaveFinal} onPress={finalizarYGuardar}>
              <Text style={styles.btnTxt}>GUARDAR Y SALIR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowResumen(false)}>
              <Text style={styles.cancelTxt}>VOLVER AL CRONÓMETRO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33' },
  timerBox: { padding: 20, alignItems: 'center', backgroundColor: '#012E57' },
  rivalTxt: { color: '#00aaff', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
  timerText: { fontSize: 65, fontWeight: 'bold', color: '#FFF', fontFamily: 'monospace' },
  controls: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 30 },
  btnPlay: { backgroundColor: '#2E7D32' },
  btnPause: { backgroundColor: '#D32F2F' },
  btnFinish: { backgroundColor: '#FF6D00', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30 },
  btnTxt: { color: '#FFF', fontWeight: 'bold' },
  sec: { color: '#1565C0', textAlign: 'center', marginVertical: 10, fontSize: 11, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, padding: 10 },
  pCard: { width: '30%', padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  pPista: { backgroundColor: '#004d40', borderColor: '#2E7D32' },
  pBank: { backgroundColor: '#012E57', borderColor: '#1565C0' },
  pSelected: { borderColor: '#FFD700', borderWidth: 2 },
  pName: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  pTime: { color: '#00aaff', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  // Estilos Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalCont: { backgroundColor: '#FFF', width: '85%', padding: 20, borderRadius: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#001A33', marginBottom: 15 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  resName: { color: '#333', fontWeight: '600' },
  resTime: { color: '#1565C0', fontWeight: 'bold' },
  btnSaveFinal: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 20 },
  cancelTxt: { color: '#D32F2F', marginTop: 15, fontWeight: 'bold' }
});