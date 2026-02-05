
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Importación necesaria

export default function Plantilla({ players, setPlayers, onBack }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [role, setRole] = useState('Jugador'); 
  const [posicion, setPosicion] = useState('Ala'); 
  const [photo, setPhoto] = useState(null);

  const posiciones = ['Portero', 'Cierre', 'Ala', 'Pívot'];

  // Función REAL para subir foto desde el móvil
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería para subir fotos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return Alert.alert("Error", "El nombre es obligatorio");
    
    const playerData = { 
      id: editingId || Date.now().toString(), 
      name, 
      number: role === 'Jugador' ? number : '', 
      role,
      posicion: role === 'Jugador' ? posicion : 'Staff',
      photo 
    };

    if (editingId) {
      setPlayers(players.map(p => p.id === editingId ? playerData : p));
    } else {
      setPlayers([...players, playerData]);
    }
    resetForm();
  };

  const resetForm = () => {
    setName(''); setNumber(''); setRole('Jugador'); 
    setPosicion('Ala'); setPhoto(null);
    setEditingId(null); setModalVisible(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setNumber(p.number);
    setRole(p.role);
    setPosicion(p.posicion || 'Ala');
    setPhoto(p.photo || null);
    setModalVisible(true);
  };

  const deletePlayer = (id) => {
    Alert.alert("Eliminar", "¿Borrar a este miembro de la plantilla?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setPlayers(players.filter(p => p.id !== id)) }
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backTxt}>← VOLVER</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>MI PLANTILLA</Text>

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnTxt}>+ AÑADIR JUGADOR / MONITOR</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {players.map(p => (
          <View key={p.id} style={[styles.card, p.role === 'Monitor' && styles.cardMonitor]}>
            <View style={styles.cardInfo}>
              <View style={styles.miniPhotoContainer}>
                {p.photo ? (
                  <Image source={{ uri: p.photo }} style={styles.miniPhoto} />
                ) : (
                  <Text style={styles.photoPlaceholderTxt}>{p.name[0].toUpperCase()}</Text>
                )}
              </View>
              <View>
                <Text style={styles.pName}>{p.name}</Text>
                <Text style={styles.pRole}>
                  {p.role === 'Jugador' ? `${p.posicion} | Nº ${p.number}` : 'Monitor / Staff'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEdit(p)} style={styles.editBtn}>
                <Text style={styles.btnTxt}>EDITAR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deletePlayer(p.id)} style={styles.delBtn}>
                <Text style={styles.btnTxt}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCont}>
              <Text style={styles.modalTitle}>{editingId ? "EDITAR PERFIL" : "NUEVA FICHA"}</Text>
              
              <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.fullPhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.upTxt}>SUBIR</Text>
                    <Text style={styles.upTxt}>FOTO</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput style={styles.input} placeholder="Nombre completo" value={name} onChangeText={setName} placeholderTextColor="#999" />

              <View style={styles.roleRow}>
                {['Jugador', 'Monitor'].map(r => (
                  <TouchableOpacity key={r} style={[styles.roleBtn, role === r && styles.roleActive]} onPress={() => setRole(r)}>
                    <Text style={[styles.roleTxt, role === r && {color:'#FFF'}]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {role === 'Jugador' && (
                <View style={{width: '100%'}}>
                  <TextInput style={styles.input} placeholder="Dorsal / Número" value={number} onChangeText={setNumber} keyboardType="numeric" placeholderTextColor="#999" />
                  <Text style={styles.label}>POSICIÓN EN EL CAMPO:</Text>
                  <View style={styles.posRow}>
                    {posiciones.map(pos => (
                      <TouchableOpacity key={pos} style={[styles.posBtn, posicion === pos && styles.posActive]} onPress={() => setPosicion(pos)}>
                        <Text style={[styles.posTxt, posicion === pos && {color:'#FFF'}]}>{pos}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnTxt}>GUARDAR EN PLANTILLA</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.cancelTxt}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 15 }, 
  backTxt: { color: '#1565C0', fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900', marginBottom: 20 },
  addBtn: { backgroundColor: '#1565C0', padding: 16, borderRadius: 12, alignItems: 'center' },
  addBtnTxt: { color: '#FFF', fontWeight: 'bold' },
  list: { marginTop: 15 },
  card: { backgroundColor: '#012E57', padding: 12, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMonitor: { borderLeftWidth: 5, borderLeftColor: '#FF6D00' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  miniPhotoContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#001A33', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#1565C0' },
  miniPhoto: { width: 45, height: 45 },
  photoPlaceholderTxt: { color: '#1565C0', fontWeight: 'bold', fontSize: 18 },
  pName: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  pRole: { color: '#1565C0', fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row' },
  editBtn: { backgroundColor: '#2E7D32', padding: 10, borderRadius: 8, marginRight: 5 },
  delBtn: { backgroundColor: '#B71C1C', padding: 10, borderRadius: 8 },
  btnTxt: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  modalCont: { backgroundColor: '#FFF', width: '90%', padding: 25, borderRadius: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#001A33' },
  photoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#1565C0' },
  fullPhoto: { width: 100, height: 100 },
  photoPlaceholder: { alignItems: 'center' },
  upTxt: { fontSize: 10, color: '#1565C0', fontWeight: 'bold' },
  input: { borderBottomWidth: 1, borderColor: '#CCC', padding: 10, marginBottom: 20, color: '#000', width: '100%', fontSize: 16 },
  label: { alignSelf: 'flex-start', fontSize: 11, color: '#666', fontWeight: 'bold', marginBottom: 10 },
  roleRow: { flexDirection: 'row', marginBottom: 20 },
  roleBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#F0F0F0', marginHorizontal: 5, borderRadius: 10 },
  roleActive: { backgroundColor: '#1565C0' },
  roleTxt: { fontWeight: 'bold', fontSize: 12, color: '#666' },
  posRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  posBtn: { width: '48%', padding: 12, backgroundColor: '#F0F0F0', marginBottom: 10, borderRadius: 10, alignItems: 'center' },
  posActive: { backgroundColor: '#2E7D32' },
  posTxt: { fontSize: 11, fontWeight: 'bold', color: '#666' },
  saveBtn: { backgroundColor: '#1565C0', padding: 18, borderRadius: 15, alignItems: 'center', width: '100%', elevation: 5 },
  saveBtnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelTxt: { color: '#B71C1C', marginTop: 20, fontWeight: 'bold' }
});
