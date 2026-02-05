import React, { useRef, useEffect } from "react";
import { View, Animated, PanResponder, StyleSheet } from "react-native";
import { Svg, Rect, Circle, Line } from "react-native-svg";

const FIELD_W = 300;
const FIELD_H = 500;

export default function Field({ players, setPlayers }: any) {
  const pos = useRef<any>({}); // Posiciones animadas
  const paths = useRef<any>({});

  // Inicializar posiciones
  useEffect(() => {
    if (!pos.current.ball) {
      pos.current.ball = new Animated.ValueXY({ x: FIELD_W/2, y: FIELD_H/2 });
      const ownPlayers = players.filter((p:any)=>p.roles!=='opponent');
      const oppPlayers = players.filter((p:any)=>p.roles==='opponent');
      ownPlayers.forEach((p,i)=>{
        pos.current[p.id] = new Animated.ValueXY({ x:50 + i*40, y:400 });
        paths.current[p.id] = [];
      });
      oppPlayers.forEach((p,i)=>{
        pos.current[p.id] = new Animated.ValueXY({ x:50 + i*40, y:100 });
        paths.current[p.id] = [];
      });
    }
  }, [players]);

  const createPan = (id:string) => PanResponder.create({
    onStartShouldSetPanResponder:()=>true,
    onMoveShouldSetPanResponder:()=>true,
    onPanResponderGrant:()=>{
      pos.current[id].setOffset({ x: pos.current[id].x._value, y: pos.current[id].y._value });
      pos.current[id].setValue({ x:0, y:0 });
    },
    onPanResponderMove: Animated.event([null, {dx:pos.current[id].x, dy:pos.current[id].y}], {useNativeDriver:false}),
    onPanResponderRelease: ()=>{
      pos.current[id].flattenOffset();
      paths.current[id] = [...(paths.current[id]||[]), { x: pos.current[id].x._value, y: pos.current[id].y._value }].slice(-25);
    }
  });

  const renderFicha = (p:any) => (
    <Animated.View
      key={p.id}
      {...createPan(p.id).panHandlers}
      style={[styles.pNode, { transform: pos.current[p.id]?.getTranslateTransform() || [] }]}
    >
      <View style={[styles.ficha, { backgroundColor: p.roles==='opponent' ? '#B71C1C' : '#0D47A1' }]}>
        <Animated.Text style={{color:'#fff', fontWeight:'bold'}}>{p.number||p.name||'R'}</Animated.Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.workArea}>
      <View style={styles.fieldWrap}>
        <Svg width={FIELD_W} height={FIELD_H}>
          <Rect width={FIELD_W} height={FIELD_H} fill="#1B5E20" stroke="#FFF" strokeWidth={2}/>
          <Line x1={0} y1={FIELD_H/2} x2={FIELD_W} y2={FIELD_H/2} stroke="#FFF"/>
          <Circle cx={FIELD_W/2} cy={FIELD_H/2} r={30} stroke="#FFF" fill="none"/>
        </Svg>
        <View style={[StyleSheet.absoluteFill, { top:0, left:0 }]}>
          {players.filter((p:any)=>p.onCourt).map(renderFicha)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workArea:{ flex:1, justifyContent:'center', alignItems:'center' },
  fieldWrap:{ position:'relative' },
  pNode:{ position:'absolute', zIndex:10 },
  ficha:{ width:40, height:40, borderRadius:20, justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'#fff' }
});
