import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

export default function Entrenamientos({ players, entrenos, setEntrenos, editItem, onBack }) {
  // Estado para la fecha: si editamos, carga la del entreno; si no, la de hoy
  const [fecha, setFecha] = useState(editItem?.fecha || new Date().toLocaleDateString());
  const [asistencia, setAsistencia] = useState([]);

  // Sincronización de la lista al cargar el componente
  useEffect(() => {
    if (editItem && editItem.asistencia) {
      // Si estamos editando, cargamos los datos ya guardados
      setAsistencia(editItem.asistencia);
    } else {
      // Si es nuevo, generamos la lista basada en la plantilla actual
      setAsistencia(players.map(p => ({ 
        id: p.id, 
        name: p.name, 
        role: p.role, 
        estado: 'AS' // Por defecto marcamos que asisten
      })));
    }
  }, [editItem, players]);

  // Función para cambiar el estado (AS, AV, NA) de un jugador/monitor
  const updateEstado = (id, nuevoEstado) => {
    setAsistencia(asistencia.map(a => a.id === id ? { ...a, estado: nuevoEstado } : a));
  };

const handleSave = () => {
  if (!fecha.trim()) return Alert.alert("Error", "Debes indicar una fecha");

  const data = {
    // Si estamos editando, mantenemos el ID original; si es nuevo, creamos uno.
    id: editItem?.id || Date.now().toString(),
    fecha: fecha,
    asistencia: asistencia,
  };

  if (editItem) {
    // CASO EDICIÓN: Buscamos por ID y reemplazamos los datos antiguos por los nuevos
    const nuevosEntrenos = entrenos.map(e => e.id === editItem.id ? data : e);
    setEntrenos(nuevosEntrenos);
  } else {
    // CASO NUEVO: Simplemente añadimos al array
    setEntrenos([...entrenos, data]);
  }

  Alert.alert("Éxito", "Entrenamiento guardado correctamente");
  onBack();
};

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}><Text style={styles.backTxt}>← VOLVER / CANCELAR</Text></TouchableOpacity>
      
      <Text style={styles.title}>{editItem ? "EDITAR ENTRENAMIENTO" : "NUEVA LISTA DE ASISTENCIA"}</Text>
      
      {/* CAMPO DE FECHA EDITABLE */}
      <View style={styles.dateSection}>
        <Text style={styles.label}>FECHA DEL ENTRENAMIENTO:</Text>
        <TextInput 
          style={styles.dateInput} 
          value={fecha} 
          onChangeText={setFecha} 
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.secLabel}>PASA LISTA (AS: ASISTE, AV: AVISA, NA: NO AVISA):</Text>
        
        {asistencia.map(a => (
          <View key={a.id} style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{a.name}</Text>
              <Text style={styles.role}>{a.role.toUpperCase()}</Text>
            </View>

            <View style={styles.selector}>
              {['AS', 'AV', 'NA'].map(s => (
                <TouchableOpacity 
                  key={s} 
                  onPress={() => updateEstado(a.id, s)} 
                  style={[styles.miniBtn, a.estado === s && styles['btn' + s]]}
                >
                  <Text style={styles.miniBtnTxt}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnTxt}>{editItem ? "GUARDAR CAMBIOS" : "FINALIZAR Y GUARDAR"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33', padding: 20, paddingTop: 50 },
  backTxt: { color: '#1565C0', fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  dateSection: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#012E57', paddingBottom: 15 },
  label: { color: '#1565C0', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  dateInput: { backgroundColor: '#012E57', color: '#FFF', padding: 12, borderRadius: 10, fontSize: 16, fontWeight: 'bold' },
  scroll: { flex: 1 },
  secLabel: { color: '#1565C0', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  row: { 
    backgroundColor: '#012E57', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 8, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  info: { flex: 1 },
  name: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  role: { color: '#1565C0', fontSize: 9, fontWeight: 'bold' },
  selector: { flexDirection: 'row' },
  miniBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    backgroundColor: '#001A33', 
    borderRadius: 8, 
    marginLeft: 6 
  },
  miniBtnTxt: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  // Colores dinámicos
  btnAS: { backgroundColor: '#2E7D32' }, // Verde
  btnAV: { backgroundColor: '#FF8F00' }, // Naranja
  btnNA: { backgroundColor: '#B71C1C' }, // Rojo
  saveBtn: { 
    backgroundColor: '#1565C0', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  },
  saveBtnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});