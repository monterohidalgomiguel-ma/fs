import React, { useState } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";

export default function Modals({
  players, sisModal, setSisModal, stratModal, setStratModal, libModal, setLibModal,
  library, setLibrary, onSaveToLibrary, onDeletePlay,
  pos, paths,
  SISTEMAS_POS, ESTRATEGIAS_FULL
}: any) {
  const [newPlayName, setNewPlayName] = useState("");

  const guardarJugada = () => {
    if (!newPlayName) return Alert.alert("Nombre requerido");
    onSaveToLibrary({ id: Date.now().toString(), name: newPlayName, steps: [] });
    setNewPlayName("");
    setLibModal(false);
  };

  return (
    <>
      {/* SISTEMAS */}
      <Modal visible={sisModal} transparent animationType="slide">
        <View style={styles.mBg}>
          <View style={styles.mCt}>
            <Text style={styles.mT}>SISTEMAS TÁCTICOS</Text>
            <ScrollView>
              {Object.keys(SISTEMAS_POS).map(nombre => (
                <TouchableOpacity key={nombre} style={styles.sItem} onPress={() => {
                  const s = SISTEMAS_POS[nombre];
                  ['r1','r2','r3','r4','r5'].forEach((id,i)=>{
                    pos.current[id].x = s.r[i]?.x || pos.current[id].x;
                    pos.current[id].y = s.r[i]?.y || pos.current[id].y;
                  });
                  players.filter(p=>p.onCourt).forEach((p,i)=>{
                    const coord = s.p[i] || {x: pos.current[p.id].x, y: pos.current[p.id].y};
                    pos.current[p.id].x = coord.x; pos.current[p.id].y = coord.y;
                  });
                  setSisModal(false);
                }}>
                  <Text style={styles.sName}>{nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={()=>setSisModal(false)}><Text style={styles.close}>CERRAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ESTRATEGIAS */}
      <Modal visible={stratModal} transparent animationType="slide">
        <View style={styles.mBg}>
          <View style={styles.mCt}>
            <Text style={styles.mT}>ESTRATEGIAS</Text>
            <ScrollView>
              {ESTRATEGIAS_FULL.map((st:any, i:number)=>(
                <TouchableOpacity key={i} style={styles.sItem} onPress={()=>Alert.alert("Estrategia ejecutada")}>
                  <Text style={styles.sName}>{st.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={()=>setStratModal(false)}><Text style={styles.close}>CERRAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BIBLIOTECA */}
      <Modal visible={libModal} transparent animationType="slide">
        <View style={styles.mBg}>
          <View style={styles.mCt}>
            <Text style={styles.mT}>JUGADAS GUARDADAS</Text>
            <ScrollView>
              {library.map((p:any,i:number)=>(
                <View key={p.id} style={styles.sItem}>
                  <TextInput value={p.name} onChangeText={(text)=>{const l=[...library]; l[i].name=text; setLibrary(l)}}/>
                  <TouchableOpacity onPress={()=>onDeletePlay(i)}><Text style={{color:'red'}}>Eliminar</Text></TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TextInput placeholder="Nombre de jugada" value={newPlayName} onChangeText={setNewPlayName} style={{borderWidth:1,padding:5,marginVertical:10}}/>
            <TouchableOpacity onPress={guardarJugada}><Text style={{color:'green',textAlign:'center'}}>Guardar Jugada</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setLibModal(false)}><Text style={styles.close}>CERRAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mBg:{ flex:1, backgroundColor:'rgba(0,0,0,0.9)', justifyContent:'center' },
  mCt:{ backgroundColor:'#FFF', margin:20, borderRadius:15, padding:20, maxHeight:'80%' },
  mT:{ fontSize:18,fontWeight:'bold',textAlign:'center',marginBottom:15 },
  sItem:{ padding:15, borderBottomWidth:1, borderBottomColor:'#EEE' },
  sName:{ color:'#1B5E20', fontWeight:'bold' },
  close:{ color:'red',textAlign:'center',marginTop:15,fontWeight:'bold' }
});
