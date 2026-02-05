import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfigurarPartido({ players, onStartMatch, onBack }: any) {
  const [partido, setPartido] = useState({
    rival: '',
    fecha: new Date().toLocaleDateString(),
    numPartes: '2',          
    duracionParte: '20',     
    jugadoresEnPista: '5' 
  });
  
  const [convocados, setConvocados] = useState<string[]>([]); 
  const [enPista, setEnPista] = useState<string[]>([]); 

  const limitePista = parseInt(partido.jugadoresEnPista) || 5;

  const moverJugador = (id: string) => {
    if (enPista.includes(id)) {
      setEnPista(enPista.filter(p => p !== id));
    } else {
      if (enPista.length < limitePista) {
        setEnPista([...enPista, id]);
      } else {
        Alert.alert("Límite", `Ya hay ${limitePista} jugadores para el inicio.`);
      }
    }
  };

  const toggleConvocado = (id: string) => {
    if (convocados.includes(id)) {
      setConvocados(convocados.filter(p => p !== id));
      setEnPista(enPista.filter(p => p !== id));
    } else {
      setConvocados([...convocados, id]);
    }
  };

  const handleStart = () => {
    if (!partido.rival.trim()) {
      return Alert.alert("Falta información", "Escribe el nombre del equipo rival.");
    }
    if (enPista.length !== limitePista) {
      return Alert.alert("Equipo incompleto", `Selecciona a los ${limitePista} jugadores que empezarán.`);
    }

    const dataRotacion = {
      enPista: enPista,
      convocados: convocados.length > 0 ? convocados : enPista
    };

    onStartMatch(partido, dataRotacion);
  };

  // Función para renderizar el avatar de forma consistente
  const renderAvatar = (p: any, size = 34) => (
    <View style={[styles.avatarBase, { width: size, height: size, borderRadius: size / 2 }]}>
      {p.photo ? (
        <Image source={{ uri: p.photo }} style={styles.avatarImg} />
      ) : (
        <Text style={[styles.avatarInitial, { fontSize: size / 2.5 }]}>
          {p.name[0].toUpperCase()}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.btnBack}>
          <Text style={styles.btnBackTxt}>← VOLVER</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CONFIGURACIÓN DE PARTIDO</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.cardForm}>
          <Text style={styles.label}>EQUIPO RIVAL</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nombre del rival" 
            placeholderTextColor="#555"
            value={partido.rival}
            onChangeText={(t) => setPartido({...partido, rival: t})}
          />
          
          <View style={styles.row}>
            <View style={{ width: '22%' }}>
              <Text style={styles.label}>PARTES</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={partido.numPartes}
                onChangeText={(t) => setPartido({...partido, numPartes: t})}
              />
            </View>
            <View style={{ width: '22%' }}>
              <Text style={styles.label}>MINUTOS</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={partido.duracionParte}
                onChangeText={(t) => setPartido({...partido, duracionParte: t})}
              />
            </View>
            <View style={{ width: '22%' }}>
              <Text style={styles.label}>PISTA</Text>
              <TextInput 
                style={[styles.input, { borderColor: '#00aaff', borderWidth: 1 }]} 
                keyboardType="numeric"
                value={partido.jugadoresEnPista}
                onChangeText={(t) => {
                   setPartido({...partido, jugadoresEnPista: t});
                   setEnPista([]); 
                }}
              />
            </View>
            <View style={{ width: '28%' }}>
              <Text style={styles.label}>FECHA</Text>
              <TextInput 
                style={styles.input} 
                value={partido.fecha}
                onChangeText={(t) => setPartido({...partido, fecha: t})}
              />
            </View>
          </View>
        </View>

        <Text style={styles.subTitle}>1. SELECCIONAR CONVOCADOS ({convocados.length})</Text>
        <View style={styles.fullList}>
          {players.map((p: any) => (
            <TouchableOpacity 
              key={p.id} 
              style={[styles.miniChip, convocados.includes(p.id) && styles.chipActive]} 
              onPress={() => toggleConvocado(p.id)}
            >
              {renderAvatar(p, 24)}
              <Text style={styles.chipText}>{p.number}. {p.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {convocados.length > 0 && (
          <>
            <Text style={styles.subTitle}>2. EQUIPO INICIAL ({enPista.length}/{limitePista})</Text>
            <View style={styles.rotationGrid}>
              {players.filter((p: any) => convocados.includes(p.id)).map((p: any) => (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.playerCard, enPista.includes(p.id) && styles.playerPista]} 
                  onPress={() => moverJugador(p.id)}
                >
                  <View style={styles.cardTop}>
                    {renderAvatar(p, 45)}
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{p.number}</Text>
                    </View>
                  </View>
                  <Text style={styles.playerText} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.playerStatus}>
                    {enPista.includes(p.id) ? 'TITULAR' : 'SUPLENTE'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
          <Text style={styles.btnStartText}>COMENZAR CRONÓMETRO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#012E57' },
  btnBack: { marginRight: 15 },
  btnBackTxt: { color: '#00aaff', fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardForm: { backgroundColor: '#012E57', padding: 15, borderRadius: 15, marginBottom: 20 },
  label: { color: '#1565C0', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#001A33', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#003366' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  subTitle: { color: '#00aaff', fontSize: 13, fontWeight: 'bold', marginBottom: 15, marginTop: 10, textTransform: 'uppercase' },
  fullList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  miniChip: { backgroundColor: '#012E57', padding: 6, borderRadius: 10, borderWidth: 1, borderColor: '#1565C0', flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: '#1565C0', borderColor: '#00aaff' },
  chipText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  rotationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  playerCard: { backgroundColor: '#012E57', padding: 12, borderRadius: 15, width: '31%', borderWidth: 1, borderColor: '#1565C0', alignItems: 'center' },
  playerPista: { backgroundColor: '#1B5E20', borderColor: '#4CAF50' },
  cardTop: { position: 'relative', marginBottom: 8 },
  badge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#FFD600', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' },
  badgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  playerText: { color: '#FFF', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  playerStatus: { color: 'rgba(255,255,255,0.5)', fontSize: 8, marginTop: 4, fontWeight: 'bold' },
  btnStart: { backgroundColor: '#1565C0', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 40, elevation: 5 },
  btnStartText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  // Estilos del Avatar
  avatarBase: { backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { color: '#FFF', fontWeight: 'bold' }
});