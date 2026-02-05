import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuración del calendario en Castellano
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene.','Feb.','Mar','Abr','May','Jun','Jul.','Ago','Sep.','Oct.','Nov.','Dic.'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarioPartidos({ partidos, setPartidos, onBack }: any) {
  const [selectedDay, setSelectedDay] = useState(''); // Formato YYYY-MM-DD
  const [showModal, setShowModal] = useState(false);
  const [nuevoPartido, setNuevoPartido] = useState({ rival: '', hora: '', tipo: 'Liga' });

  // Marcamos los días que tienen partidos en la cuadrícula
  const markedDates: any = {};
  partidos.forEach((p: any) => {
    // Intentamos convertir la fecha guardada a formato ISO si no lo está
    // Importante: Para que el punto aparezca, la fecha debe ser YYYY-MM-DD
    if (p.fecha_iso) {
      markedDates[p.fecha_iso] = { marked: true, dotColor: '#1565C0', activeOpacity: 0 };
    }
  });

  // Resaltar el día seleccionado por el usuario
  if (selectedDay) {
    markedDates[selectedDay] = { 
      ...markedDates[selectedDay], 
      selected: true, 
      selectedColor: '#1565C0' 
    };
  }

  const handleAddEvent = () => {
    const evento = {
      ...nuevoPartido,
      id: Date.now().toString(),
      fecha_iso: selectedDay,
      fecha: new Date(selectedDay).toLocaleDateString('es-ES'),
      golesF: '0',
      golesC: '0',
      capitanName: 'N/A'
    };
    setPartidos([evento, ...partidos]);
    setShowModal(false);
    setNuevoPartido({ rival: '', hora: '', tipo: 'Liga' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backBtn}>← VOLVER</Text></TouchableOpacity>
        <Text style={styles.title}>CALENDARIO DE PARTIDOS</Text>
      </View>

      {/* Cuadrícula Full Calendar */}
      <Calendar
        theme={{
          backgroundColor: '#000',
          calendarBackground: '#111',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#1565C0',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2E7D32',
          dayTextColor: '#fff',
          textDisabledColor: '#444',
          monthTextColor: '#fff',
          arrowColor: '#1565C0',
        }}
        onDayPress={day => setSelectedDay(day.dateString)}
        markedDates={markedDates}
      />

      {/* Lista de partidos del día seleccionado */}
      <View style={styles.detailsPane}>
        <Text style={styles.dateLabel}>Partidos para: {selectedDay || 'Selecciona un día'}</Text>
        <ScrollView style={{flex: 1}}>
          {partidos.filter((p: any) => p.fecha_iso === selectedDay).map((p: any) => (
            <View key={p.id} style={styles.matchCard}>
              <Text style={styles.matchText}>{p.hora} - VS {p.rival}</Text>
              <Text style={styles.matchSub}>{p.tipo}</Text>
            </View>
          ))}
          
          {selectedDay !== '' && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.addBtnText}>+ AGENDAR PRÓXIMO PARTIDO</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Modal para añadir partido rápido */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agendar para {selectedDay}</Text>
            <TextInput 
              placeholder="Rival" 
              placeholderTextColor="#666" 
              style={styles.input} 
              onChangeText={v => setNuevoPartido({...nuevoPartido, rival: v})} 
            />
            <TextInput 
              placeholder="Hora (ej: 11:30)" 
              placeholderTextColor="#666" 
              style={styles.input} 
              onChangeText={v => setNuevoPartido({...nuevoPartido, hora: v})} 
            />
            
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddEvent}>
              <Text style={styles.btnText}>GUARDAR EN CALENDARIO</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.btnText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 20 },
  backBtn: { color: '#1565C0', fontWeight: 'bold', marginRight: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  detailsPane: { flex: 1, marginTop: 20 },
  dateLabel: { color: '#888', fontWeight: 'bold', marginBottom: 15 },
  matchCard: { backgroundColor: '#111', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#1565C0' },
  matchText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  matchSub: { color: '#666', fontSize: 12 },
  addBtn: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#111', padding: 25, borderRadius: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#222', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15 },
  saveBtn: { backgroundColor: '#1565C0', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  cancelBtn: { backgroundColor: '#444', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});