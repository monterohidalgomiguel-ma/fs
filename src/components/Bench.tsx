import React from "react";
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";

export default function Bench({ players, setPlayers }: any) {
  const handleToggle = (p: any) => {
    const isPortero = p.roles?.toLowerCase().includes("portero");
    const onCourtPorteros = players.filter((x:any)=>x.onCourt && x.roles?.toLowerCase().includes("portero")).length;
    const onCourtField = players.filter((x:any)=>x.onCourt && !x.roles?.toLowerCase().includes("portero")).length;

    if (!p.onCourt) {
      if (isPortero && onCourtPorteros >= 1) { Alert.alert("Aviso", "Ya hay un portero."); return; }
      if (!isPortero && onCourtField >= 5) { Alert.alert("Aviso", "Ya hay 5 jugadores."); return; }
      setPlayers(players.map((x:any)=> x.id===p.id ? {...x, onCourt:true} : x));
    } else {
      setPlayers(players.map((x:any)=> x.id===p.id ? {...x, onCourt:false} : x));
    }
  };

  return (
    <View style={styles.sideBench}>
      <ScrollView>
        {players.map((p:any)=>(
          <TouchableOpacity key={p.id} style={styles.benchItem} onPress={()=>handleToggle(p)}>
            <Text style={{color:'#fff'}}>{p.number || p.name || 'R'}</Text>
            {p.onCourt && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sideBench:{ width:75, backgroundColor:'#111', paddingTop:20, alignItems:'center' },
  benchItem:{ marginBottom:15, alignItems:'center' },
  dot:{ position:'absolute', top:0, right:0, width:14, height:14, borderRadius:7, backgroundColor:'#4CAF50', borderWidth:2, borderColor:'#FFF' },
});
