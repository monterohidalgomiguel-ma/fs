import React from "react";
import { View, Animated, PanResponder, StyleSheet } from "react-native";

const FIELD_W = 300;
const FIELD_H = 500;

export default function Field({ players, pos, paths }: any) {
  const createPan = (id: string) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      if (!pos.current[id]) return;
      pos.current[id].offset = { x: pos.current[id].x, y: pos.current[id].y };
    },
    onPanResponderMove: (_, gesture) => {
      if (!pos.current[id]) return;
      pos.current[id].x = pos.current[id].offset.x + gesture.dx;
      pos.current[id].y = pos.current[id].offset.y + gesture.dy;
      paths.current[id] = [...(paths.current[id]||[]), { x: pos.current[id].x, y: pos.current[id].y }];
    },
    onPanResponderRelease: () => {}
  });

  return (
    <View style={styles.fieldWrap}>
      {players.filter((p:any)=>p.onCourt).map((p:any) => {
        const pan = createPan(p.id);
        return (
          <Animated.View
            key={p.id}
            {...pan.panHandlers}
            style={[styles.pNode, { left: pos.current[p.id]?.x, top: pos.current[p.id]?.y }]}
          >
            <View style={[styles.ficha, { backgroundColor: p.roles?.toLowerCase().includes("portero") ? "#FF9800" : "#0D47A1" }]}/>
          </Animated.View>
        )
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { flex:1, backgroundColor:'#1B5E20', margin:10 },
  pNode: { position:'absolute', width:50, height:50, borderRadius:25, zIndex:10 },
  ficha: { width:50, height:50, borderRadius:25, borderWidth:2, borderColor:'#FFF' }
});
