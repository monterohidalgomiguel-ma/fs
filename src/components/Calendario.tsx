import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuración en castellano
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function Calendario({ entrenos, setEntrenos, partidos, setPartidos, players, onBack }: any) {
  const [tab, setTab] = useState<'CRONO' | 'LISTA' | 'PROG'>('CRONO');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Estados para formularios
  const [asistencia, setAsistencia] = useState<any>({});
  const [fechaEntreno, setFechaEntreno] = useState(new Date().toLocaleDateString('es-ES'));
  const [newProg, setNewProg] = useState({ rival: '', fecha: '', hora: '', tipo: 'Partido' });

  // Formatear fecha DD/MM/AAAA a YYYY-MM-DD para el componente Calendar
  const toISODate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  };

  // Generar marcas en el calendario (puntos de colores)
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    entrenos.forEach((e: any) => {
      const iso = toISODate(e.date);
      if (iso) marks[iso] = { marked: true, dotColor: '#E65100' };
    });

    partidos.forEach((p: any) => {
      const iso = toISODate(p.fecha);
      if (iso) marks[iso] = { marked: true, dotColor: p.pendiente ? '#888' : '#B71C1C', activeOpacity: 0 };
    });

    marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#1565C0' };
    return marks;
  }, [entrenos, partidos, selectedDate]);

  const saveEntreno = () => {
    if(!fechaEntreno) return Alert.alert("Error", "Indica una fecha");
    setEntrenos([{ id: Date.now().toString(), date: fechaEntreno, attendance: asistencia }, ...entrenos]);
    Alert.alert("Éxito", "Entrenamiento guardado");
    setTab('CRONO');
  };

  const programarEvento = () => {
    if(!newProg.rival || !newProg.fecha) return Alert.alert("Error", "Datos incompletos");
    setPartidos([{ id: Date.now().toString(), ...newProg, pendiente: true, asistencia: {}, goles: {} }, ...partidos]);
    setNewProg({ rival: '', fecha: '', hora: '', tipo: 'Partido' });
    setTab('CRONO');
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity onPress={onBack} style={styles.back}><Text style={styles.blue}>←</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setTab('CRONO')} style={[styles.tab, tab==='CRONO' && styles.tabA]}><Text style={styles.tabT}>CRONOGRAMA</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setTab('LISTA')} style={[styles.tab, tab==='LISTA' && styles.tabA]}><Text style={styles.tabT}>LISTA</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setTab('PROG')} style={[styles.tab, tab==='PROG' && styles.tabA]}><Text style={styles.tabT}>PROGRAMAR</Text></TouchableOpacity>
      </View>

      {tab === 'CRONO' && (
        <ScrollView>
          <Calendar
            theme={{
              backgroundColor: '#000',
              calendarBackground: '#111',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#1565C0',
              todayTextColor: '#1565C0',
              dayTextColor: '#fff',
              monthTextColor: '#fff',
              arrowColor: '#1565C0',
            }}
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}
          />
          
          <Text style={styles.listTitle}>EVENTOS DEL MES</Text>
          {[...entrenos, ...partidos].filter(ev => toISODate(ev.date || ev.fecha)?.startsWith(selectedDate.substring(0, 7))).map(ev => (
            <View key={ev.id} style={[styles.card, { borderLeftColor: ev.rival ? (ev.pendiente ? '#888' : '#B71C1C') : '#E65100' }]}>
              <View>
                <Text style={styles.dateText}>{ev.date || ev.fecha}</Text>
                <Text style={styles.label}>{ev.rival ? `VS ${ev.rival}` : 'ENTRENAMIENTO'}</Text>
              </View>
              <Text style={styles.sub}>{ev.pendiente ? 'PRÓXIMO' : (ev.golesFavor ? `${ev.golesFavor}-${ev.golesContra}` : 'OK')}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {tab === 'LISTA' && (
        <ScrollView>
          <Text style={styles.sectionTitle}>FECHA:</Text>
          <TextInput style={styles.input} value={fechaEntreno} onChangeText={setFechaEntreno} />
          {players.filter((p:any)=>p.role==='jugador').map((p:any) => (
            <View key={p.id} style={styles.row}>
              <Text style={styles.pName}>{p.name}</Text>
              <View style={styles.btnRow}>
                {['Asiste', 'Avisa', 'No'].map(o => (
                  <TouchableOpacity key={o} onPress={()=>setAsistencia({...asistencia, [p.id]: o==='No'?'No Avisa':o})} style={[styles.mBtn, (asistencia[p.id]===(o==='No'?'No Avisa':o)) && styles.active]}>
                    <Text style={styles.btnT}>{o[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.saveBtn} onPress={saveEntreno}><Text style={styles.saveBtnT}>GUARDAR</Text></TouchableOpacity>
        </ScrollView>
      )}

      {tab === 'PROG' && (
        <View style={styles.formCard}>
          <TextInput placeholder="Rival" placeholderTextColor="#666" style={styles.input} value={newProg.rival} onChangeText={v=>setNewProg({...newProg, rival:v})} />
          <TextInput placeholder="Fecha (DD/MM/AAAA)" placeholderTextColor="#666" style={styles.input} value={newProg.fecha} onChangeText={v=>setNewProg({...newProg, fecha:v})} />
          <TextInput placeholder="Hora" placeholderTextColor="#666" style={styles.input} value={newProg.hora} onChangeText={v=>setNewProg({...newProg, hora:v})} />
          <TouchableOpacity style={styles.saveBtn} onPress={programarEvento}><Text style={styles.saveBtnT}>PROGRAMAR</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  tabs: { flexDirection: 'row', marginTop: 40, marginBottom: 10, alignItems: 'center', backgroundColor: '#111', borderRadius: 10 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabA: { borderBottomWidth: 2, borderBottomColor: '#1565C0' },
  tabT: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  blue: { color: '#1565C0', fontSize: 20, marginRight: 10 },
  listTitle: { color: '#555', fontSize: 10, fontWeight: 'bold', marginTop: 20, marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#111', padding: 15, borderRadius: 10, marginBottom: 8, borderLeftWidth: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: '#555', fontSize: 10 },
  label: { color: '#fff', fontWeight: 'bold' },
  sub: { color: '#888', fontSize: 10 },
  input: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, backgroundColor: '#111', padding: 10, borderRadius: 10 },
  pName: { color: '#fff', flex: 1, fontSize: 12 },
  btnRow: { flexDirection: 'row' },
  mBtn: { width: 30, height: 30, backgroundColor: '#222', borderRadius: 15, marginLeft: 5, justifyContent: 'center', alignItems: 'center' },
  active: { backgroundColor: '#1565C0' },
  btnT: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnT: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { color: '#555', fontSize: 10, marginBottom: 5 },
  formCard: { backgroundColor: '#111', padding: 20, borderRadius: 15 }
});