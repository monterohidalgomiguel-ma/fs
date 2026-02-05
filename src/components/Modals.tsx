import React, { useState } from "react";
import { View, Modal, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";

export default function Modals({
  sisModal, setSisModal,
  stratModal, setStratModal,
  libModal, setLibModal,
  players, library, setLibrary,
  onSaveToLibrary, onDeletePlay
}: any) {

  const [playName, setPlayName] = useState("");

  const handleSave = () => {
    if (!playName.trim()) { Alert.alert("Nombre requerido"); return; }
    onSaveToLibrary({ name: playName, steps: [] });
    setPlayName("");
    setLibModal(true);
  };

  const handleDelete = (idx:number) => { Alert.alert("Confirmar","Eliminar?",[{text:"Si",onPress:()=>onDeletePlay(idx)},{text:"No"}]) };

  return (
    <>
      <Modal visible={libModal} transparent animationType="slide">
        <View style={styles.mBg}>
          <View style={styles.mCt}>
            <Text style={styles.mT}>JUGADAS GUARDADAS</Text>
            <TextInput
              placeholder="Nombre jugada"
              style={styles.input}
              value={playName}
              onChangeText={setPlayName}
            />
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={{color:'#fff'}}>Guardar Jugada</Text>
            </TouchableOpacity>
            <ScrollView>
              {library.map((p:any,i:number)=>(
                <View key={i} style={styles.sItem}>
                  <Text>{p.name || `Jugada ${i+1}`}</Text>
                  <TouchableOpacity onPress={()=>handleDelete(i)}>
                    <Text style={styles.delete}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={()=>setLibModal(false)}>
              <Text style={styles.close}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mBg:{ flex:1, backgroundColor:'rgba(0,0,0,0.9)', justifyContent:'center' },
  mCt:{ backgroundColor:'#FFF', margin:20, borderRadius:15, padding:20, maxHeight:'80%' },
  mT:{ fontSize:18, fontWeight:'bold', textAlign:'center', marginBottom:15 },
  sItem:{ padding:15, borderBottomWidth:1, borderBottomColor:'#EEE', flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  close:{ color:'red', textAlign:'center', marginTop:15, fontWeight:'bold' },
  delete:{ color:'red' },
  input:{ borderWidth:1, borderColor:'#999', borderRadius:8, padding:8, marginBottom:10 },
  btnSave:{ backgroundColor:'#0D47A1', padding:10, borderRadius:8, alignItems:'center', marginBottom:10 }
});
