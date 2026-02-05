import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuración de idioma
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarioEventos({ entrenos = [], partidos = [], setEntrenos, setPartidos, onBack, onEditP, onEditE, onSelect }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipo, setTipo] = useState('PARTIDO'); 
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); 
  const [rival, setRival] = useState('');

  // 1. Unificar marcas en el mapa del calendario
  const markedDates: any = {};
  
  entrenos.forEach((e: any) => {
    const f = e.fecha || e.date;
    if (f && f.includes('/')) {
      const formatted = f.split('/').reverse().join('-');
      markedDates[formatted] = { marked: true, dotColor: '#1565C0' };
    }
  });

  partidos.forEach((p: any) => {
    const f = p.fecha || p.date;
    if (f && f.includes('/')) {
      const formatted = f.split('/').reverse().join('-');
      markedDates[formatted] = { marked: true, dotColor: '#B71C1C' };
    }
  });

  // Resaltar día seleccionado
  markedDates[fecha] = { ...markedDates[fecha], selected: true, selectedColor: '#1565C0' };

  const agregarEventoFuturo = () => {
    if (tipo === 'PARTIDO' && !rival) return Alert.alert("Error", "Escribe el nombre del rival");
    
    // De formato YYYY-MM-DD a DD/MM/YYYY para tus otros componentes
    const nuevaFechaFormateada = fecha.split('-').reverse().join('/'); 
    
    if (tipo === 'PARTIDO') {
      const nuevo = { id: Date.now().toString(), fecha: nuevaFechaFormateada, rival, golesFavor: '?', golesContra: '?', pdt: true };
      setPartidos([nuevo, ...partidos]);
    } else {
      const nuevo = { id: Date.now().toString(), fecha: nuevaFechaFormateada, tipo: 'Entrenamiento Planificado', attendance: {} };
      setEntrenos([nuevo, ...entrenos]);
    }

    setModalVisible(false);
    setRival('');
    Alert.alert("Éxito", "Evento guardado");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backTxt}>← VOLVER AL MENÚ</Text>
      </TouchableOpacity>

      <Text style={styles.title}>PLANIFICACIÓN</Text>

      <Calendar
        theme={{
          calendarBackground: '#012E57',
          textSectionTitleColor: '#fff',
          selectedDayBackgroundColor: '#1565C0',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#1565C0',
        }}
        markedDates={markedDates}
       onDayPress={(dia) => {
    setFecha(dia.dateString);
    // Añade esta validación:
    if (typeof onSelect === 'function') {
      onSelect(dia.dateString);
    }
  }}
/>
      />

      <TouchableOpacity style={styles.addEventBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addEventBtnTxt}>+ PLANIFICAR NUEVO EVENTO</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list}>
        <Text style={styles.listTitle}>PRÓXIMOS EVENTOS</Text>
        {[...partidos, ...entrenos]
          .filter(ev => ev.pdt || (ev.attendance && Object.keys(ev.attendance).length === 0))
          .sort((a,b) => b.id - a.id)
          .map((ev, i) => (
            <TouchableOpacity 
              key={ev.id || i} 
              style={styles.item}
              onPress={() => ev.rival ? onEditP(ev) : onEditE(ev)}
            >
              <View>
                <Text style={styles.itemFecha}>{ev.fecha}</Text>
                <Text style={styles.itemDesc}>{ev.rival ? `VS ${ev.rival}` : 'ENTRENAMIENTO'}</Text>
              </View>
              <Text style={{color: '#1565C0'}}>Editar ✎</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NUEVO EVENTO</Text>
            <Text style={styles.modalLabel}>Día: {fecha.split('-').reverse().join('/')}</Text>
            
            <View style={styles.tipoRow}>
              <TouchableOpacity style={[styles.tipoBtn, tipo === 'PARTIDO' && styles.tipoActive]} onPress={() => setTipo('PARTIDO')}>
                <Text style={styles.tipoTxt}>PARTIDO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tipoBtn, tipo === 'ENTRENO' && styles.tipoActive]} onPress={() => setTipo('ENTRENO')}>
                <Text style={styles.tipoTxt}>ENTRENO</Text>
              </TouchableOpacity>
            </View>

            {tipo === 'PARTIDO' && (
              <TextInput 
                style={styles.input} 
                placeholder="Nombre del Rival" 
                placeholderTextColor="#555" 
                value={rival} 
                onChangeText={setRival} 
              />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={agregarEventoFuturo}>
              <Text style={styles.saveBtnTxt}>CONFIRMAR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelTxt}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 15 },
  backTxt: { color: '#1565C0', fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 20 },
  addEventBtn: { backgroundColor: '#1565C0', padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  addEventBtnTxt: { color: '#fff', fontWeight: 'bold' },
  list: { marginTop: 25 },
  listTitle: { color: '#1565C0', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  item: { backgroundColor: '#012E57', padding: 15, borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemFecha: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  itemDesc: { color: '#1565C0', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#012E57', width: '85%', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#1565C0' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalLabel: { color: '#1565C0', fontSize: 12, marginBottom: 15, textAlign: 'center' },
  tipoRow: { flexDirection: 'row', marginBottom: 20 },
  tipoBtn: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#001A33', borderRadius: 10, marginHorizontal: 5 },
  tipoActive: { backgroundColor: '#1565C0' },
  tipoTxt: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  input: { backgroundColor: '#001A33', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 20 },
  saveBtn: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  saveBtnTxt: { color: '#fff', fontWeight: 'bold' },
  cancelTxt: { color: '#B71C1C', textAlign: 'center', fontWeight: 'bold' }
});