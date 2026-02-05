import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Partidos({ players = [], partidos, setPartidos, editItem, onBack }) {
  const [rival, setRival] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('LOCAL');
  const [tipo, setTipo] = useState('LIGA');
  const [golesFavor, setGolesFavor] = useState('0');
  const [golesContra, setGolesContra] = useState('0');
  const [convocatoria, setConvocatoria] = useState([]);

  // Cargar datos al iniciar o al editar
  useEffect(() => {
    if (editItem) {
      // MODO EDICIÓN: Recupera todo lo guardado
      setRival(editItem.rival || '');
      setFecha(editItem.fecha || '');
      setLugar(editItem.lugar || 'LOCAL');
      setTipo(editItem.tipo || 'LIGA');
      setGolesFavor(editItem.golesFavor?.toString() || '0');
      setGolesContra(editItem.golesContra?.toString() || '0');
      setConvocatoria(editItem.convocatoria || []);
    } else {
      // MODO NUEVO
      setRival('');
      setFecha(new Date().toLocaleDateString());
      setLugar('LOCAL');
      setTipo('LIGA');
      setGolesFavor('0');
      setGolesContra('0');
      setConvocatoria(players.map(p => ({
        id: p.id, 
        name: p.name, 
        estado: 'AS', 
        goles: 0, 
        esCapitan: false, 
        minutos: '0:00'
      })));
    }
  }, [editItem, players]);

  const importarTiempos = async () => {
    try {
      const data = await AsyncStorage.getItem('@saved_sessions');
      if (!data) return Alert.alert("Aviso", "No hay datos grabados.");
      const sesiones = JSON.parse(data);
      const encontrada = sesiones.find(s => s.rival?.toLowerCase() === rival.toLowerCase());

      if (encontrada) {
        const nuevaConvocatoria = convocatoria.map(p => {
          const s = encontrada.desglose[p.id] || 0;
          const m = Math.floor(s / 60);
          const sc = s % 60;
          const tiempoFormateado = `${m}:${sc < 10 ? '0' : ''}${sc}`;
          return { ...p, minutos: tiempoFormateado, estado: s > 0 ? 'AS' : p.estado };
        });
        setConvocatoria(nuevaConvocatoria);
        Alert.alert("Éxito", "Tiempos importados correctamente.");
      } else {
        Alert.alert("No encontrado", "Asegúrate de que el nombre del Rival coincida exactamente.");
      }
    } catch (e) {
      Alert.alert("Error", "Error al acceder a los datos.");
    }
  };

  const handleSave = () => {
    if (!rival.trim()) return Alert.alert("Error", "Rival obligatorio");

    const data = {
      id: editItem?.id || Date.now().toString(),
      rival,
      fecha,
      lugar,
      tipo,
      golesFavor: parseInt(golesFavor) || 0,
      golesContra: parseInt(golesContra) || 0,
      convocatoria
    };

    if (editItem) {
      const actualizados = partidos.map(p => p.id === editItem.id ? data : p);
      setPartidos(actualizados);
    } else {
      setPartidos([...partidos, data]);
    }
    onBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ACTA DE PARTIDO</Text>
      
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Rival" value={rival} onChangeText={setRival} placeholderTextColor="#666" />
        
        <View style={styles.row}>
          <TextInput style={[styles.input, {flex:1.5}]} placeholder="Fecha" value={fecha} onChangeText={setFecha} />
          <TouchableOpacity style={[styles.tab, lugar==='LOCAL' && styles.activeTab]} onPress={()=>setLugar('LOCAL')}><Text style={styles.tabTxt}>LOCAL</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tab, lugar==='VISITANTE' && styles.activeTab]} onPress={()=>setLugar('VISITANTE')}><Text style={styles.tabTxt}>VISIT.</Text></TouchableOpacity>
        </View>

        <Text style={styles.labelComp}>COMPETICIÓN:</Text>
        <View style={[styles.row, {flexWrap: 'wrap', marginBottom: 10}]}>
          {['LIGA', 'COPA', 'PLAY-OFF', 'AMISTOSO', 'OTRO'].map(t => (
            <TouchableOpacity key={t} style={[styles.typeBtn, tipo===t && styles.activeType]} onPress={()=>setTipo(t)}>
              <Text style={styles.typeTxt}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{flex:1}}><Text style={styles.label}>GOLES +</Text><TextInput style={styles.input} keyboardType="numeric" value={golesFavor} onChangeText={setGolesFavor}/></View>
          <View style={{flex:1}}><Text style={styles.label}>GOLES -</Text><TextInput style={styles.input} keyboardType="numeric" value={golesContra} onChangeText={setGolesContra}/></View>
          <TouchableOpacity style={styles.btnImport} onPress={importarTiempos}><Text style={styles.btnImportTxt}>🕒 IMPORTAR</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerTable}>
        <Text style={[styles.hLab, {flex: 2}]}>JUGADOR</Text>
        <Text style={[styles.hLab, {flex: 2.5}]}>ASIST.</Text>
        <Text style={[styles.hLab, {flex: 0.8}]}>C</Text>
        <Text style={[styles.hLab, {flex: 1}]}>G</Text>
        <Text style={[styles.hLab, {flex: 1.2}]}>MIN</Text>
      </View>

      {convocatoria.map((p, idx) => (
        <View key={p.id} style={styles.pRow}>
          <Text style={styles.pName} numberOfLines={1}>{p.name}</Text>
          <View style={styles.asistContainer}>
            {['AS','AV','NA'].map(e => (
              <TouchableOpacity key={e} onPress={()=>{
                const nc = [...convocatoria]; nc[idx].estado = e; setConvocatoria(nc);
              }} style={[styles.miniBtn, p.estado===e && styles[`btn${e}`]]}><Text style={styles.miniBtnTxt}>{e}</Text></TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={()=>{
            const nc = convocatoria.map(j => ({ ...j, esCapitan: j.id === p.id ? !p.esCapitan : false }));
            setConvocatoria(nc);
          }} style={[styles.capBtn, p.esCapitan && styles.capActive]}><Text style={styles.capTxt}>C</Text></TouchableOpacity>
          <TextInput style={styles.gInput} keyboardType="numeric" value={p.goles.toString()} onChangeText={(v)=>{
            const nc = [...convocatoria]; nc[idx].goles = v; setConvocatoria(nc);
          }} />
          <Text style={styles.pMin}>{p.minutos}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
        <Text style={styles.btnSaveTxt}>GUARDAR ACTA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancel} onPress={onBack}>
        <Text style={styles.btnCancelTxt}>CANCELAR Y VOLVER</Text>
      </TouchableOpacity>

      <View style={{height:60}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33', padding: 15 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 30, marginBottom: 15 },
  card: { backgroundColor: '#012E57', padding: 12, borderRadius: 12, marginBottom: 15 },
  input: { backgroundColor: '#001A33', color: '#FFF', padding: 10, borderRadius: 8, marginBottom: 8, fontSize: 13 },
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tab: { padding: 10, borderRadius: 8, backgroundColor: '#001A33', borderWidth: 1, borderColor: '#1565C0' },
  activeTab: { backgroundColor: '#1565C0' },
  tabTxt: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  label: { color: '#00aaff', fontSize: 8, fontWeight: 'bold', marginBottom: 2 },
  labelComp: { color: '#00aaff', fontSize: 8, fontWeight: 'bold', marginBottom: 5, marginTop: 5 },
  typeBtn: { paddingVertical: 6, paddingHorizontal: 4, borderRadius: 6, backgroundColor: '#001A33', borderWidth: 1, borderColor: '#1565C0', flex: 1, minWidth: '18%', alignItems: 'center', marginBottom: 5 },
  activeType: { backgroundColor: '#1565C0' },
  typeTxt: { color: '#FFF', fontSize: 7, fontWeight: 'bold' },
  btnImport: { backgroundColor: '#2E7D32', padding: 12, borderRadius: 8, flex: 1.2, alignItems: 'center', height: 45, justifyContent: 'center' },
  btnImportTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 9 },
  headerTable: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 5 },
  hLab: { color: '#1565C0', fontSize: 9, fontWeight: 'bold' },
  pRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#012E57', padding: 8, borderRadius: 8, marginBottom: 4 },
  pName: { color: '#FFF', fontSize: 11, fontWeight: 'bold', flex: 2 },
  asistContainer: { flexDirection: 'row', gap: 2, flex: 2.5 },
  miniBtn: { padding: 5, backgroundColor: '#001A33', borderRadius: 4, width: 28, alignItems: 'center' },
  miniBtnTxt: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  btnAS: { backgroundColor: '#2E7D32' }, btnAV: { backgroundColor: '#E65100' }, btnNA: { backgroundColor: '#C62828' },
  capBtn: { width: 25, height: 25, backgroundColor: '#001A33', borderRadius: 12, justifyContent: 'center', alignItems: 'center', flex: 0.8 },
  capActive: { backgroundColor: '#FFD700' },
  capTxt: { fontWeight: 'bold', fontSize: 10, color: '#FFF' },
  gInput: { backgroundColor: '#001A33', color: '#FFF', width: 30, textAlign: 'center', borderRadius: 4, padding: 4, fontSize: 11, flex: 1 },
  pMin: { color: '#00aaff', fontSize: 10, fontWeight: 'bold', flex: 1.2, textAlign: 'right' },
  btnSave: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  btnSaveTxt: { color: '#FFF', fontWeight: 'bold' },
  btnCancel: { backgroundColor: '#C62828', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnCancelTxt: { color: '#FFF', fontWeight: 'bold' }
});