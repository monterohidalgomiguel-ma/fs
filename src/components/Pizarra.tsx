import React, { useRef, useState, useEffect } from "react";
import {
  View, Dimensions, StyleSheet, Animated, Text, TouchableOpacity,
  ScrollView, PanResponder, Modal, Alert, TextInput, Image
} from "react-native";
import Svg, { Rect, Line, Circle, Path } from "react-native-svg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const BENCH_W = 75;
const FIELD_W = SCREEN_W - BENCH_W - 10;
const FIELD_H = SCREEN_H * 0.70; 
const m = FIELD_W / 20;

const SEIS_METROS = 6 * m;
const DIEZ_METROS = 10 * m;
const OCHO_METROS = 8 * m;

// --- DATA: 11 SISTEMAS DE JUEGO --- [cite: 2026-01-01]
const SISTEMAS_POS: any = {
  "1-3-1 (Rombo)": {
    situacion: "Ataque posicional clásico.",
    estructura: "1 cierre, 2 alas, 1 pívot.",
    roles: "Cierres: 1. Alas: 2. Pívots: 1.",
    cuando: "Para dominar la posesión. Contra defensa media o baja. Ideal si tienes pívot dominante.",
    coords: { p:[{x:0.5,y:0.9},{x:0.5,y:0.7},{x:0.2,y:0.6},{x:0.8,y:0.6},{x:0.5,y:0.35}], r:[{x:0.5,y:0.1},{x:0.5,y:0.3},{x:0.3,y:0.45},{x:0.7,y:0.45},{x:0.5,y:0.6}] }
  },
  "1-4-0 (Línea)": {
    situacion: "Ataque dinámico sin referencia fija.",
    estructura: "1 cierre, 3–4 alas móviles. Sin pívot fijo.",
    roles: "Cierres: 1. Alas: 3–4. Pívots: 0.",
    cuando: "Para generar desajustes. Contra defensas cerradas. Requiere alta comprensión táctica.",
    coords: { p:[{x:0.5,y:0.9},{x:0.2,y:0.6},{x:0.4,y:0.6},{x:0.6,y:0.6},{x:0.8,y:0.6}], r:[{x:0.5,y:0.1},{x:0.2,y:0.4},{x:0.4,y:0.4},{x:0.6,y:0.4},{x:0.8,y:0.4}] }
  },
  "1-2-2 (Cuadrado)": {
    situacion: "Salida de presión organizada.",
    estructura: "2 jugadores base, 2 jugadores avanzados.",
    roles: "Cierres: 1–2. Alas: 1–2. Pívots: 0–1.",
    cuando: "Ante presión alta rival. Para progresar por pases cortos. Muy estable tácticamente.",
    coords: { p:[{x:0.5,y:0.9},{x:0.3,y:0.8},{x:0.7,y:0.8},{x:0.3,y:0.55},{x:0.7,y:0.55}], r:[{x:0.5,y:0.1},{x:0.3,y:0.35},{x:0.7,y:0.35},{x:0.3,y:0.6},{x:0.7,y:0.6}] }
  },
  "2-1-1 (Triángulo)": {
    situacion: "Seguridad defensiva y contraataque.",
    estructura: "2 cierres, 1 ala/conector, 1 pívot.",
    roles: "Cierres: 2. Alas: 1. Pívots: 1.",
    cuando: "Proteger marcador. Contra rivales superiores. Ideal para transiciones rápidas.",
    coords: { p:[{x:0.5,y:0.9},{x:0.35,y:0.8},{x:0.65,y:0.8},{x:0.5,y:0.65},{x:0.5,y:0.4}], r:[{x:0.5,y:0.1},{x:0.35,y:0.25},{x:0.65,y:0.25},{x:0.5,y:0.45},{x:0.5,y:0.7}] }
  },
  "Y de Salida": {
    situacion: "Saque de meta bajo presión.",
    estructura: "Portero + 2 alas abiertos + 1 apoyo + 1 pívot.",
    roles: "Cierres: 0–1. Alas: 2. Pívots: 1.",
    cuando: "Para atraer presión y superarla. Si el portero juega bien con los pies.",
    coords: { p:[{x:0.5,y:0.95},{x:0.5,y:0.85},{x:0.15,y:0.75},{x:0.85,y:0.75},{x:0.5,y:0.5}], r:[{x:0.5,y:0.1},{x:0.5,y:0.65},{x:0.2,y:0.6},{x:0.8,y:0.6},{x:0.5,y:0.4}] }
  },
  "Defensa en I": {
    situacion: "Defensa específica del carril central.",
    estructura: "4 jugadores alineados en eje central.",
    roles: "Cierres: 2. Alas: 2. Pívots: 0.",
    cuando: "Contra equipos con buen tiro exterior. Para obligar a jugar por banda.",
    coords: { p:[{x:0.5,y:0.9},{x:0.5,y:0.8},{x:0.5,y:0.65},{x:0.5,y:0.5},{x:0.5,y:0.35}], r:[{x:0.5,y:0.1},{x:0.3,y:0.3},{x:0.7,y:0.3},{x:0.2,y:0.6},{x:0.8,y:0.6}] }
  },
  "Embudo Defensivo": {
    situacion: "Defensa de resultado.",
    estructura: "Bloque bajo muy cerrado.",
    roles: "Cierres: 2. Alas: 2. Pívots: 0.",
    cuando: "Últimos minutos con ventaja. Requiere concentración máxima.",
    coords: { p:[{x:0.5,y:0.95},{x:0.3,y:0.9},{x:0.7,y:0.9},{x:0.4,y:0.8},{x:0.6,y:0.8}], r:[{x:0.5,y:0.1},{x:0.2,y:0.5},{x:0.8,y:0.5},{x:0.4,y:0.65},{x:0.6,y:0.65}] }
  },
  "5v4 (Portero-Jugador)": {
    situacion: "Inferioridad en el marcador.",
    estructura: "1 portero-jugador, 3 alas, 1 pívot.",
    roles: "Cierres: 0. Alas: 3. Pívots: 1.",
    cuando: "Últimos minutos perdiendo. Alto riesgo / alta recompensa.",
    coords: { p:[{x:0.5,y:0.55},{x:0.1,y:0.45},{x:0.9,y:0.45},{x:0.3,y:0.2},{x:0.7,y:0.2}], r:[{x:0.5,y:0.1},{x:0.5,y:0.25},{x:0.35,y:0.35},{x:0.65,y:0.35},{x:0.5,y:0.45}] }
  },
  "Presión 2-2": {
    situacion: "Robo en campo rival.",
    estructura: "2 presionan, 2 anticipan.",
    roles: "Cierres: 1. Alas: 2. Pívots: 1.",
    cuando: "Tras saque rival. Para forzar errores en salida.",
    coords: { p:[{x:0.5,y:0.95},{x:0.3,y:0.35},{x:0.7,y:0.35},{x:0.3,y:0.15},{x:0.7,y:0.15}], r:[{x:0.5,y:0.05},{x:0.25,y:0.2},{x:0.75,y:0.2},{x:0.35,y:0.35},{x:0.65,y:0.35}] }
  },
  "Doble Pívot": {
    situacion: "Juego directo.",
    estructura: "2 pívots, 2 jugadores de apoyo, 1 cierre.",
    roles: "Cierres: 1. Alas: 1–2. Pívots: 2.",
    cuando: "Contra presión alta. Si tienes pívots físicos dominantes.",
    coords: { p:[{x:0.5,y:0.9},{x:0.3,y:0.7},{x:0.7,y:0.7},{x:0.3,y:0.35},{x:0.7,y:0.35}], r:[{x:0.5,y:0.1},{x:0.4,y:0.25},{x:0.6,y:0.25},{x:0.3,y:0.5},{x:0.7,y:0.5}] }
  },
  "Caja Estática": {
    situacion: "Defensa zonal pasiva.",
    estructura: "Bloque en cuadrado.",
    roles: "Cierres: 2. Alas: 2. Pívots: 0.",
    cuando: "Para enfriar el partido. Contra equipos impacientes.",
    coords: { p:[{x:0.5,y:0.9},{x:0.2,y:0.7},{x:0.8,y:0.7},{x:0.2,y:0.45},{x:0.8,y:0.45}], r:[{x:0.5,y:0.1},{x:0.5,y:0.3},{x:0.2,y:0.5},{x:0.8,y:0.5},{x:0.5,y:0.6}] }
  }
};

const ESTRATEGIAS_FULL = [
  {
    name: "Córner Corto",
    situacion: "Saque de esquina ofensivo en campo rival.",
    estructura: "1 sacador, 1 apoyo cercano, 1 cierre de seguridad, 1 pívot, 1 segundo palo.",
    roles: "Cierres: 1. Alas: 2. Pívots: 1.",
    cuando: "Contra defensas zonales o si el rival protege en exceso el primer palo.",
    coords: { p:[{x:0.95,y:0.05},{x:0.85,y:0.15},{x:0.5,y:0.2},{x:0.3,y:0.4},{x:0.5,y:0.9}], r:[{x:0.5,y:0.02},{x:0.88,y:0.08},{x:0.7,y:0.18},{x:0.5,y:0.3},{x:0.3,y:0.4}] }
  },
  {
    name: "Saque de Banda",
    situacion: "Banda ofensiva en campo rival.",
    estructura: "1 sacador, 1 bloqueador, 1 receptor lejano, 1 apoyo interior, 1 cierre.",
    roles: "Cierres: 1. Alas: 2–3. Pívots: 0–1.",
    cuando: "Para desorganizar marcas individuales y defensas agresivas.",
    coords: { p:[{x:0.98,y:0.5},{x:0.8,y:0.4},{x:0.8,y:0.6},{x:0.5,y:0.3},{x:0.5,y:0.9}], r:[{x:0.5,y:0.12},{x:0.8,y:0.45},{x:0.8,y:0.55},{x:0.6,y:0.4},{x:0.6,y:0.6}] }
  },
  {
    name: "Falta de 10 metros (Barrera)",
    situacion: "Falta directa o indirecta tras 5ª falta.",
    estructura: "1 ejecutor, 2 para engaño, 1 segundo palo, 1 portero atento.",
    roles: "Cierres: 1. Alas: 1–2. Pívots: 1.",
    cuando: "Si tienes especialista en golpeo. Útil para forzar rechaces.",
    coords: { p:[{x:0.5,y:0.35},{x:0.3,y:0.2},{x:0.7,y:0.2},{x:0.5,y:0.55},{x:0.5,y:0.9}], r:[{x:0.5,y:0.1},{x:0.45,y:0.22},{x:0.55,y:0.22},{x:0.3,y:0.28},{x:0.7,y:0.28}] }
  },
  {
    name: "Falta Frontal (Barrera de 3)",
    situacion: "Falta frontal cercana al área con barrera amplia.",
    estructura: "1 ejecutor, 2 señuelos, 1 bloqueador, 1 cierre.",
    roles: "Cierres: 1. Alas: 2. Pívots: 1.",
    cuando: "Jugadas de laboratorio. Ideal con pívot fuerte para pantalla.",
    coords: { p:[{x:0.5,y:0.28},{x:0.4,y:0.3},{x:0.6,y:0.3},{x:0.5,y:0.5},{x:0.5,y:0.9}], r:[{x:0.5,y:0.02},{x:0.4,y:0.18},{x:0.5,y:0.18},{x:0.6,y:0.18},{x:0.2,y:0.3}] }
  },
  {
    name: "Salida 3-1",
    situacion: "Inicio de juego ante presión alta.",
    estructura: "1 pívot alto, 3 jugadores por detrás escalonados.",
    roles: "Cierres: 1–2. Alas: 1–2. Pívots: 1.",
    cuando: "Superar presión individual. Requiere cierre con calidad de pase.",
    coords: { p:[{x:0.5,y:0.95},{x:0.15,y:0.8},{x:0.85,y:0.8},{x:0.5,y:0.7},{x:0.5,y:0.4}], r:[{x:0.5,y:0.1},{x:0.3,y:0.6},{x:0.7,y:0.6},{x:0.3,y:0.45},{x:0.7,y:0.45}] }
  },
  {
    name: "Presión Total",
    situacion: "Defensa adelantada en todo el campo.",
    estructura: "Marca individual pura. Ajustes constantes.",
    roles: "Cierres: 1. Alas: 2. Pívots: 1 (primer defensor).",
    cuando: "Tras pérdida o necesidad de robar rápido. Riesgosa ante balones largos.",
    coords: { 
      p:[{x:0.5,y:0.75},{x:0.2,y:0.3},{x:0.8,y:0.3},{x:0.3,y:0.15},{x:0.7,y:0.15}], 
      r:[{x:0.5,y:0.08},{x:0.2,y:0.12},{x:0.8,y:0.12},{x:0.5,y:0.25},{x:0.5,y:0.4}] 
    }
  }
];

export default function PizarraPro({ players, setPlayers, onBack }: any) {
  // --- SEGURIDAD: Evitar errores de carga inicial ---
  if (!players || players.length === 0) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF', marginBottom: 20 }}>Cargando plantilla...</Text>
        <TouchableOpacity style={styles.btnAction} onPress={onBack}><Text style={styles.btnText}>VOLVER</Text></TouchableOpacity>
      </View>
    );
  }
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sisModal, setSisModal] = useState(false);
  const [stratModal, setStratModal] = useState(false);
  const [frames, setFrames] = useState<any[]>([]);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [nombreJugada, setNombreJugada] = useState('');
  const [saveModal, setSaveModal] = useState(false);
  const [biblioModal, setBiblioModal] = useState(false);
  const [modoReproduccion, setModoReproduccion] = useState(false);
  const [bucle, setBucle] = useState(false);
  const [jugadasGuardadas, setJugadasGuardadas] = useState<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [pausado, setPausado] = useState(false);
  const pausadoRef = useRef(false);
  const abortarRef = useRef(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const pos = useRef<any>({
    ball: new Animated.ValueXY({ x: FIELD_W / 2, y: FIELD_H / 2 }),
    rival0: new Animated.ValueXY({ x: 20, y: 20 }),
    rival1: new Animated.ValueXY({ x: 60, y: 20 }),
    rival2: new Animated.ValueXY({ x: 100, y: 20 }),
    rival3: new Animated.ValueXY({ x: 140, y: 20 }),
    rival4: new Animated.ValueXY({ x: 180, y: 20 }),
  });

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const res = await AsyncStorage.getItem('plays_v4');
        if (res) setJugadasGuardadas(JSON.parse(res));
      } catch (e) { console.log(e); }
    };
    cargarTodo();
  }, []);

    const resetPizarra = () => {
    setFrames([]);
    setFrameIndex(0);
    Animated.spring(pos.current['ball'], {
      toValue: { x: FIELD_W / 2, y: FIELD_H / 2 },
      useNativeDriver: false
    }).start();

    players.forEach((p: any, i: number) => {
      if (pos.current[p.id]) {
        Animated.spring(pos.current[p.id], {
          toValue: { x: 30 + (i * 25), y: FIELD_H + 10 },
          useNativeDriver: false
        }).start();
      }
    });
  };

  const eliminarJugada = (nombre: string) => {
    Alert.alert("Eliminar", `¿Borrar "${nombre}"?`, [
      { text: "No" },
      { text: "Sí", onPress: async () => {
          const nueva = jugadasGuardadas.filter(j => j.nombre !== nombre);
          await AsyncStorage.setItem('plays_v4', JSON.stringify(nueva));
          setJugadasGuardadas(nueva);
      }}
    ]);
  };

   const playJugada = () => {
  return new Promise(async (resolve) => {
    // Si no hay pasos guardados, no hace nada
    if (frames.length === 0) return resolve(true);

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (abortarRef.current) return resolve(false);

      // Si el usuario pulsa pausa, esperamos aquí
      while (pausadoRef.current) {
        if (abortarRef.current) return resolve(false);
        await new Promise(r => setTimeout(r, 100)); 
      }

      const anims = Object.keys(frame).map(id => {
        if (pos.current[id]) {
          return Animated.timing(pos.current[id], {
            toValue: { x: frame[id].x, y: frame[id].y },
            duration: 1000 / velocidad,
            useNativeDriver: false,
          });
        }
        return null;
      }).filter(a => a !== null);

      if (anims.length > 0) {
        await new Promise(r => Animated.parallel(anims).start(r));
        if (abortarRef.current) return resolve(false);
        await new Promise(r => setTimeout(r, 200 / velocidad));
      }
    }
    resolve(true);
  });
};

  const aplicarFrame = (frame: any) => {
    if (!frame) return;
    Object.keys(frame).forEach(id => {
      if (pos.current[id]) {
        pos.current[id].setValue({ x: frame[id].x, y: frame[id].y });
      }
    });
  };

  // Función mejorada para renderizar la ficha con foto o número
useEffect(() => {
    players.forEach((p: any) => {
      if (!pos.current[p.id]) {
        pos.current[p.id] = new Animated.ValueXY({ x: 30, y: FIELD_H + 10 });
        offset.current[p.id] = { x: 0, y: 0 };
      }
    });
  }, [players]);
  const offset = useRef<any>({});
  const renderFicha = (p: any, size = 40, rival = false) => (
    <View style={[styles.fichaBase, {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: rival ? '#B71C1C' : '#1565C0',
          borderWidth: 2, borderColor: '#FFF',
        }]}>
      {!rival && p.photo ? (
        <Image 
          source={{ uri: p.photo }} 
          style={{ width: '100%', height: '100%', borderRadius: size / 2 }} 
        />
      ) : (
        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: size * 0.4 }}>
          {rival ? 'R' : p.number ?? p.idx ?? ''}
        </Text>
      )}
    </View>
  );

  // PanResponder mejorado para un arrastre más fino y natural
  const createPan = (id: string) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      const val: any = pos.current[id];
      val.setOffset({ x: val.x._value, y: val.y._value });
      val.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pos.current[id].x, dy: pos.current[id].y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pos.current[id].flattenOffset();
      
    }
  });

  const capturarFrame = () => {
    const frame: any = {};
    Object.keys(pos.current).forEach(id => {
      frame[id] = { x: pos.current[id].x._value, y: pos.current[id].y._value };
    });
    setFrames(prev => [...prev, frame]);
  };

  const guardarEnBiblioteca = async () => {
    if (!nombreJugada) { 
      Alert.alert("Error", "Pon un nombre"); 
      return; 
    }
    const nueva = { nombre: nombreJugada, frames };
    const nuevaLista = [...jugadasGuardadas, nueva];
    
    // Guardamos sin etiquetas de texto extra
    await AsyncStorage.setItem('plays_v4', JSON.stringify(nuevaLista));
    
    setJugadasGuardadas(nuevaLista);
    setSaveModal(false);
    setNombreJugada('');
    setFrames([]); // Reinicia el contador de pasos a 0
    Alert.alert("Éxito", "Jugada guardada. El contador se ha reiniciado.");
  };

  const aplicarPosiciones = (coords: any) => {
    const jugadoresEnCampo = players.filter((p: any) => p.onCourt);
    jugadoresEnCampo.forEach((p: any, i: number) => {
      const c = coords.p[i];
      if (c && pos.current[p.id]) {
        Animated.spring(pos.current[p.id], {
          toValue: { x: c.x * FIELD_W, y: c.y * FIELD_H },
          useNativeDriver: false
        }).start();
      }
    });
    coords.r.forEach((c: any, i: number) => {
      const id = `rival${i}`;
      if (pos.current[id]) {
        Animated.spring(pos.current[id], {
          toValue: { x: c.x * FIELD_W, y: c.y * FIELD_H },
          useNativeDriver: false
        }).start();
      }
    });
    setMenuAbierto(false); setSisModal(false); setStratModal(false);
  };
  // --- LÓGICA DE REPRODUCCIÓN CORREGIDA ---

  const iniciarReproduccion = async () => {
    if (frames.length === 0) { Alert.alert("Aviso", "No hay pasos grabados"); return; }
    
    setModoReproduccion(true); // Asegura que se vean los botones
    setReproduciendo(true);
    setPausado(false);
    pausadoRef.current = false;
    abortarRef.current = false;

    // Si estamos al final, reiniciamos
    let inicio = frameIndex;
    if (frameIndex >= frames.length - 1) {
      inicio = 0;
      setFrameIndex(0);
      aplicarFrame(frames[0]);
      await new Promise(r => setTimeout(r, 500)); // Pequeña espera visual
    }

    do {
      for (let i = inicio; i < frames.length; i++) {
        // Chequeo de Stop/Salida
        if (abortarRef.current) break;

        setFrameIndex(i); // Actualiza el contador visual
        
        // Lógica de PAUSA
        while (pausadoRef.current) {
          if (abortarRef.current) break;
          await new Promise(r => setTimeout(r, 200));
        }

        const frame = frames[i];
        
        // Animación suave hacia el siguiente paso
        const anims = Object.keys(frame).map(id => {
          if (pos.current[id]) {
            return Animated.timing(pos.current[id], {
              toValue: { x: frame[id].x, y: frame[id].y },
              duration: 1000 / velocidad, // Ajusta la velocidad aquí
              useNativeDriver: false
            });
          }
          return null;
        }).filter(Boolean);

        if (anims.length > 0) {
          // Ejecutar animación y esperar a que termine
          await new Promise(r => Animated.parallel(anims).start(r));
        }
      }
      
      // Si el bucle está activado y no se ha dado a STOP, repetir desde 0
      if (bucle && !abortarRef.current) {
        inicio = 0;
        setFrameIndex(0);
        aplicarFrame(frames[0]);
      }
      
    } while (bucle && !abortarRef.current);

    setReproduciendo(false);
  };

  const pausarJugada = () => {
    setPausado(true);
    pausadoRef.current = true;
    setReproduciendo(false); // Para cambiar el icono a Play
  };

  const siguientePasoManual = () => {
    // Si no estamos en modo reproducción, entramos para ver los controles
    if (!modoReproduccion) setModoReproduccion(true);

    if (frameIndex < frames.length - 1) {
      const next = frameIndex + 1;
      setFrameIndex(next);
      // Mueve las fichas instantáneamente (sin animación lenta) para paso a paso
      Animated.parallel(
        Object.keys(frames[next]).map(id => {
           if (pos.current[id]) {
             return Animated.spring(pos.current[id], {
               toValue: frames[next][id],
               useNativeDriver: false
             });
           }
           return null;
        }).filter((x): x is Animated.CompositeAnimation => x !== null)
      ).start();
    } else {
      Alert.alert("Fin", "Último paso alcanzado");
    }
  };

  const detenerDefinitivamente = () => {
    abortarRef.current = true;
    pausadoRef.current = false;
    setReproduciendo(false);
    setPausado(false);
    setFrameIndex(0);
    if (frames.length > 0) aplicarFrame(frames[0]);
  };

  const salirReproduccion = () => {
    detenerDefinitivamente();
    setModoReproduccion(false); // Oculta los botones de play/pause
    resetPizarra(); // Vuelve a la posición inicial
  };
  // --- LÓGICA DE PERSISTENCIA AL CAMBIAR ESTADO 'onCourt' [cite: 2025-12-26] ---
  const togglePlayerOnCourt = (id: string) => {
    const updatedPlayers = players.map((p: any) => {
      if (p.id === id) {
        // Lógica de máximo 5 jugadores en pista para los 11 sistemas [cite: 2026-01-01]
        const count = players.filter((x: any) => x.onCourt).length;
        if (!p.onCourt && count >= 5) {
          Alert.alert("Límite", "Solo puede haber 5 jugadores en pista");
          return p;
        }
        return { ...p, onCourt: !p.onCourt };
      }
      return p;
    });
    setPlayers(updatedPlayers); // Esto guarda en AsyncStorage vía App.tsx
  };
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.sideBench}>
        <TouchableOpacity style={styles.btnAction} onPress={() => setMenuAbierto(true)}>
          <Text style={styles.btnText}>MENU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={resetPizarra}>
          <Text style={styles.btnText}>LIMPIAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#D32F2F' }]} onPress={onBack}>
          <Text style={styles.btnText}>◀</Text>
        </TouchableOpacity>
        <ScrollView>
          {players.map((p: any) => (
            <TouchableOpacity key={p.id} style={styles.benchItem} onPress={() => {
                const count = players.filter((x: any) => x.onCourt).length;
                if (!p.onCourt && count >= 5) return;
                setPlayers(players.map((x: any) => (x.id === p.id ? { ...x, onCourt: !x.onCourt } : x)));
              }}>
              <View>
                {renderFicha(p, 35)}
                {p.onCourt && <View style={styles.onCourtDot} />}
              </View>
              <Text style={styles.benchName}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.fieldArea}>
        <Svg width={FIELD_W} height={FIELD_H + 40}>
          <Rect y={20} width={FIELD_W} height={FIELD_H} fill="#1B5E20" stroke="#FFF" strokeWidth={2} />
          <Rect x={FIELD_W/2 - 15} y={10} width={30} height={10} fill="none" stroke="#FFF" strokeWidth={2} />
          <Path d={`M ${FIELD_W/2 - SEIS_METROS} 20 A ${SEIS_METROS} ${SEIS_METROS} 0 0 0 ${FIELD_W/2 + SEIS_METROS} 20`} fill="none" stroke="#FFF" strokeWidth={2} />
          <Circle cx={FIELD_W/2} cy={20 + SEIS_METROS} r={2} fill="#FFF" />
          <Circle cx={FIELD_W/2} cy={20 + DIEZ_METROS} r={2} fill="#FFF" />
          
          <Line x1={0} y1={20 + OCHO_METROS} x2={FIELD_W} y2={20 + OCHO_METROS} stroke="rgba(255,255,255,0.5)" strokeDasharray="5,5" strokeWidth={2} />

          <Rect x={FIELD_W/2 - 15} y={FIELD_H + 20} width={30} height={10} fill="none" stroke="#FFF" strokeWidth={2} />
          <Path d={`M ${FIELD_W/2 - SEIS_METROS} ${FIELD_H + 20} A ${SEIS_METROS} ${SEIS_METROS} 0 0 1 ${FIELD_W/2 + SEIS_METROS} ${FIELD_H + 20}`} fill="none" stroke="#FFF" strokeWidth={2} />
          <Circle cx={FIELD_W/2} cy={FIELD_H + 20 - SEIS_METROS} r={2} fill="#FFF" />
          <Circle cx={FIELD_W/2} cy={FIELD_H + 20 - DIEZ_METROS} r={2} fill="#FFF" />

          <Line x1={0} y1={FIELD_H + 20 - OCHO_METROS} x2={FIELD_W} y2={FIELD_H + 20 - OCHO_METROS} stroke="rgba(255,255,255,0.5)" strokeDasharray="5,5" strokeWidth={2} />
          <Line x1={0} y1={FIELD_H / 2 + 20} x2={FIELD_W} y2={FIELD_H / 2 + 20} stroke="#FFF" strokeWidth={2} />
          <Circle cx={FIELD_W / 2} cy={FIELD_H / 2 + 20} r={3 * m} fill="none" stroke="#FFF" strokeWidth={2} />
        </Svg>

        
{/* 1. Jugadores del equipo - PROTECCIÓN TOTAL */}
{players && players.filter((p: any) => p && p.onCourt).map((p: any) => {
  // Verificamos que el jugador tenga una posición asignada en el objeto de animaciones
  if (!pos.current || !pos.current[p.id]) return null;

  return (
    <Animated.View 
      key={`player-node-${p.id}`} 
      {...createPan(p.id).panHandlers} 
      style={[
        styles.pNode, 
        { transform: pos.current[p.id].getTranslateTransform() }
      ]}
    >
      {renderFicha(p, 40)}
    </Animated.View>
  );
})}

{/* 2. Rivales (Asegúrate de que también tengan validación) */}
{Array.from({ length: 5 }).map((_, i) => {
  const id = `rival${i}`;
  if (!pos.current[id]) return null;

  return (
    <Animated.View 
      key={`rival-node-${i}`} 
      {...createPan(id).panHandlers} 
      style={[styles.pNode, { transform: pos.current[id].getTranslateTransform() }]}
    >
      {renderFicha({ idx: i }, 24, true)}
    </Animated.View>
  );
})}

        {pos.current['ball'] && (
          <Animated.View {...createPan('ball').panHandlers} style={[styles.pNode, { transform: pos.current['ball'].getTranslateTransform() }]}>
            <Text style={{ fontSize: 18 }}>⚽</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.compactControls}>
        <View style={styles.actionRow}>
          {/* MODO EDICIÓN: Capturar, Guardar y PROBAR */}
          {!modoReproduccion ? (
            <>
              <TouchableOpacity style={styles.cBtn} onPress={capturarFrame}>
                <Text style={styles.cText}>📸 ({frames.length})</Text>
              </TouchableOpacity>
              
              {/* NUEVO BOTÓN PARA ENTRAR A REPRODUCIR LO QUE ACABAS DE HACER */}
              <TouchableOpacity 
                style={[styles.cBtn, { backgroundColor: frames.length > 0 ? '#4CAF50' : '#333' }]} 
                onPress={() => {
                   if(frames.length > 0) {
                     setModoReproduccion(true);
                     aplicarFrame(frames[0]);
                   } else {
                     Alert.alert("Vacío", "Graba algún paso primero");
                   }
                }}
              >
                <Text style={styles.cText}>▶ PROBAR</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.cBtn, { backgroundColor: frames.length > 0 ? '#FF9800' : '#333' }]} 
                onPress={() => frames.length > 0 && setSaveModal(true)}
              >
                <Text style={styles.cText}>💾 GUARDAR</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* MODO REPRODUCCIÓN: Play/Pause, Stop, Paso, Salir */
            <>
              {/* Botón PLAY / PAUSA */}
              <TouchableOpacity 
                style={[styles.cBtn, { backgroundColor: reproduciendo ? '#FFC107' : '#4CAF50', minWidth: 50 }]} 
                onPress={reproduciendo ? pausarJugada : iniciarReproduccion}
              >
                <Text style={[styles.cText, { fontSize: 16 }]}>{reproduciendo ? '⏸' : '▶'}</Text>
              </TouchableOpacity>

              {/* Botón STOP (Reinicia al paso 0) */}
              <TouchableOpacity style={[styles.cBtn, { backgroundColor: '#D32F2F', minWidth: 50 }]} onPress={detenerDefinitivamente}>
                <Text style={styles.cText}>⏹</Text>
              </TouchableOpacity>

              {/* Botón PASO A PASO */}
              <TouchableOpacity style={[styles.cBtn, { backgroundColor: '#2196F3', minWidth: 50 }]} onPress={siguientePasoManual}>
                <Text style={styles.cText}>⏭ (+1)</Text>
              </TouchableOpacity>
              
              {/* Botón BUCLE */}
              <TouchableOpacity 
                style={[styles.cBtn, { backgroundColor: bucle ? '#E91E63' : '#444', minWidth: 40 }]} 
                onPress={() => setBucle(!bucle)}
              >
                <Text style={styles.cText}>🔄</Text>
              </TouchableOpacity>

              {/* Botón SALIR (Cierra modo reproducción) */}
              <TouchableOpacity style={[styles.cBtn, { backgroundColor: '#333', minWidth: 40 }]} onPress={salirReproduccion}>
                <Text style={styles.cText}>✖</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Barra de progreso visual opcional */}
        {modoReproduccion && frames.length > 0 && (
           <View style={{ width: '100%', height: 4, backgroundColor: '#333', marginTop: 10, borderRadius: 2 }}>
             <View style={{ 
               width: `${((frameIndex + 1) / frames.length) * 100}%`, 
               height: '100%', 
               backgroundColor: '#2196F3' 
             }} />
           </View>
        )}
      </View>

      {/* MODALES */}
      <Modal visible={menuAbierto} transparent>
        <View style={styles.overlay}>
          <View style={styles.mContent}>
            <Text style={styles.mT}>MENÚ</Text>
            <TouchableOpacity style={styles.btnC} onPress={() => setSisModal(true)}><Text style={{ color: '#FFF' }}>SISTEMAS</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnC} onPress={() => setStratModal(true)}><Text style={{ color: '#FFF' }}>ESTRATEGIAS</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnC} onPress={() => { setBiblioModal(true); setMenuAbierto(false); }}><Text style={{ color: '#FFF' }}>BIBLIOTECA</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btnC, { backgroundColor: '#D32F2F' }]} onPress={() => setMenuAbierto(false)}><Text style={{ color: '#FFF' }}>CERRAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={sisModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.mContentFull}>
            <Text style={styles.mT}>SISTEMAS DE JUEGO [cite: 2026-01-01]</Text>
            <ScrollView style={{ marginBottom: 10 }}>
              {Object.keys(SISTEMAS_POS).map((k) => (
                <TouchableOpacity key={k} style={styles.cardDetalle} onPress={() => aplicarPosiciones(SISTEMAS_POS[k].coords)}>
                  <Text style={styles.cardTituloPrincipal}>{k}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Situación: </Text>{SISTEMAS_POS[k].situacion}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Estructura: </Text>{SISTEMAS_POS[k].estructura}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Roles: </Text>{SISTEMAS_POS[k].roles}</Text>
                  <Text style={[styles.infoText, { color: '#4CAF50', fontWeight: 'bold' }]}>{SISTEMAS_POS[k].cuando}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.btnC, { backgroundColor: '#D32F2F', width: '100%' }]} onPress={() => setSisModal(false)}><Text style={{ color: '#FFF' }}>VOLVER</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={stratModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.mContentFull}>
            <Text style={styles.mT}>ESTRATEGIAS (ABP)</Text>
            <ScrollView style={{ marginBottom: 10 }}>
              {ESTRATEGIAS_FULL.map((e, i) => (
                <TouchableOpacity key={i} style={[styles.cardDetalle, { borderColor: '#FF9800' }]} onPress={() => aplicarPosiciones(e.coords)}>
                  <Text style={[styles.cardTituloPrincipal, { color: '#FF9800' }]}>{e.name}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Situación: </Text>{e.situacion}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Roles: </Text>{e.roles}</Text>
                  <Text style={[styles.infoText, { color: '#4CAF50' }]}>{e.cuando}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.btnC, { backgroundColor: '#D32F2F', width: '100%' }]} onPress={() => setStratModal(false)}><Text style={{ color: '#FFF' }}>VOLVER</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={biblioModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.mContentFull}>
            <Text style={styles.mT}>MIS JUGADAS GUARDADAS</Text>
            <ScrollView style={{ width: '100%' }}>
              {jugadasGuardadas.map((j, index) => (
                <View key={`jugada-${index}`} style={styles.cardJugada}>
                  <TouchableOpacity 
  style={{ flex: 1 }} 
 onPress={() => {
  // Reset TOTAL
  abortarRef.current = false;
  pausadoRef.current = false;

  setFrames(j.frames);
  setFrameIndex(0);

  setReproduciendo(false);
  setPausado(false);
  setModoReproduccion(true);

  setBiblioModal(false);

  // Colocar primer frame
  if (j.frames?.length > 0) {
    aplicarFrame(j.frames[0]);
  }
}}

>
  <Text style={styles.cardT}>{j.nombre}</Text>
  <Text style={{ color: '#888', fontSize: 10 }}>{j.frames?.length || 0} pasos</Text>
</TouchableOpacity>
                  <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarJugada(j.nombre)}><Text style={{ color: '#FFF' }}>×</Text></TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.btnC, { marginTop: 10, width: '100%' }]} onPress={() => setBiblioModal(false)}><Text style={{ color: '#FFF' }}>CERRAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={saveModal} transparent>
        <View style={styles.overlay}>
          <View style={styles.mContent}>
            <Text style={styles.mT}>GUARDAR JUGADA</Text>
            <TextInput value={nombreJugada} onChangeText={setNombreJugada} placeholder="Nombre" placeholderTextColor="#AAA" style={styles.input} />
            <TouchableOpacity style={styles.btnC} onPress={guardarEnBiblioteca}><Text style={{ color: '#FFF' }}>GUARDAR</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnC} onPress={() => setSaveModal(false)}><Text style={{ color: '#FFF' }}>CANCELAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001A33",
    minHeight: 100%,
  },
  mainContainer: { flex: 1, backgroundColor: '#000', flexDirection: 'row' },
  sideBench: { width: BENCH_W, backgroundColor: '#111', alignItems: 'center', paddingTop: 10 },
  fieldArea: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 20 },
  btnAction: { backgroundColor: '#444', width: 55, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginBottom: 10 },
  btnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  benchItem: { marginBottom: 15, alignItems: 'center' },
  benchName: { color: '#AAA', fontSize: 8, width: 60, textAlign: 'center' },
  fichaBase: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  onCourtDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },
  pNode: { position: 'absolute', width: 40, height: 40, left: -20, top: -20, justifyContent: 'center', alignItems: 'center' },
  compactControls: { 
    width: '85%', 
    backgroundColor: 'rgba(20,20,20,0.95)', 
    borderRadius: 15, 
    padding: 10, 
    position: 'absolute', 
    bottom: 50, // Lo subimos de 20 a 50 para que sea más cómodo
    left: BENCH_W + 15,
    borderWidth: 1,
    borderColor: '#444',
    elevation: 5 // Para que resalte sobre el campo
  },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  cBtn: { backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, minWidth: 60, alignItems: 'center' },
  cText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  mContent: { width: '85%', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#333' },
  mContentFull: { width: '90%', height: '85%', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  mT: { color: '#FFF', fontWeight: 'bold', marginBottom: 15, textAlign: 'center', fontSize: 16 },
  btnC: { backgroundColor: '#2196F3', paddingVertical: 10, borderRadius: 8, marginTop: 10, alignItems: 'center', width: '100%' },
  input: { backgroundColor: '#111', borderRadius: 8, padding: 10, color: '#FFF', marginBottom: 10 },
  cardDetalle: { backgroundColor: '#262626', borderRadius: 10, padding: 12, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#2196F3', width: '100%' },
  cardTituloPrincipal: { color: '#2196F3', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  infoLabel: { color: '#AAA', fontSize: 11, fontWeight: 'bold' },
  infoText: { color: '#EEE', fontSize: 11, marginBottom: 2 },
  cardJugada: { flexDirection: 'row', width: '100%', backgroundColor: '#262626', borderRadius: 8, padding: 12, marginBottom: 8, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  cardT: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnEliminar: { backgroundColor: '#D32F2F', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});