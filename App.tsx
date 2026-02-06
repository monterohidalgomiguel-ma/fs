import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- IMPORTACIÓN DE COMPONENTES ---
import MenuPrincipal from './src/components/MenuPrincipal';
import Plantilla from './src/components/Plantilla';
import Pizarra from './src/components/Pizarra';
import Partidos from './src/components/Partidos';
import Stats from './src/components/Stats';
import CalendarioEventos from './src/components/CalendarioEventos';
import SelectorEquipo from './src/components/SelectorEquipo';
import Entrenamientos from './src/components/Entrenamientos'; 
import ConfigurarPartido from './src/components/ConfigurarPartido';
import CronometroPartido from './src/components/CronometroPartido';

// Prevenir que la splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [screen, setScreen] = useState('SELECTOR'); 
  const [isLoaded, setIsLoaded] = useState(false);

  // --- ESTADOS GLOBALES ---
  const [players, setPlayers] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [entrenos, setEntrenos] = useState([]);
  const [activeMatchData, setActiveMatchData] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // Configuración de equipo actual
  const [equipo, setEquipo] = useState('Leganés Amas B');
  const [temporada, setTemporada] = useState('2025-26');

  // Prefijo dinámico para separar datos de diferentes equipos/temporadas
  const prefijo = `@${equipo.replace(/\s+/g, '_')}_${temporada}:`;

  // --- CARGA DE DATOS ---
  useEffect(() => {
    async function loadAllData() {
      try {
        const [resP, resPar, resEnt] = await Promise.all([
          AsyncStorage.getItem(`${prefijo}players`),
          AsyncStorage.getItem(`${prefijo}partidos`),
          AsyncStorage.getItem(`${prefijo}entrenos`)
        ]);

        // Validamos que los datos existan antes de parsear para evitar crashes
        if (resP) setPlayers(JSON.parse(resP)); else setPlayers([]);
        if (resPar) setPartidos(JSON.parse(resPar)); else setPartidos([]);
        if (resEnt) setEntrenos(JSON.parse(resEnt)); else setEntrenos([]);

      } catch (e) {
        console.error("Error cargando datos iniciales:", e);
      } finally {
        setIsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    loadAllData();
  }, [prefijo]);

  // --- FUNCIONES DE PERSISTENCIA ---
  const savePlayers = async (data) => {
    setPlayers(data);
    await AsyncStorage.setItem(`${prefijo}players`, JSON.stringify(data));
  };

  const savePartidos = async (data) => {
    setPartidos(data);
    await AsyncStorage.setItem(`${prefijo}partidos`, JSON.stringify(data));
  };

  const saveEntrenos = async (data) => {
    setEntrenos(data);
    await AsyncStorage.setItem(`${prefijo}entrenos`, JSON.stringify(data));
  };

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleConfigurarEquipo = (eq, temp) => {
    setEquipo(eq);
    setTemporada(temp);
    setScreen('MENU');
  };

  const handleStartMatch = (config, rotacion) => {
    setActiveMatchData({ config, rotacion });
    setScreen('CRONOMETRO_VIVO');
  };
// Busca esta función en tu App.tsx
const handleEditSession = (item, tipo) => {
  setEditItem(item); // Esto carga los datos del partido (rival, fecha, etc.) en el estado global
  
  if (tipo === 'ENT') {
    setScreen('ENTRENAMIENTOS'); 
  } else if (tipo === 'PAR') {
    setScreen('NUEVO_PARTIDO'); // Abre el acta (goles, minutos de los jugadores)
  } else if (tipo === 'EDIT_PAR') {
    // CAMBIA 'CALENDARIO' POR EL NOMBRE DE LA PANTALLA DONDE CREAS LOS PARTIDOS
    // Si usas la misma pantalla para crear y editar, suele llamarse 'PARTIDOS' o 'NUEVO_PARTIDO'
    setScreen('NUEVO_PARTIDO'); 
    
    // Si tu pantalla de "NUEVO_PARTIDO" tiene una lógica interna que separa 
    // el "Acta" de los "Datos del partido", asegúrate de que al recibir un 
    // item con datos, muestre el formulario de datos.
  }
};

  // Renderizado nulo mientras carga (Splash Screen visible)
  if (!isLoaded) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#001A33" />

          {/* Renderizado de Pantallas */}
          {screen === 'SELECTOR' && (
            <SelectorEquipo onConfirm={handleConfigurarEquipo} />
          )}

          {screen === 'MENU' && (
            <MenuPrincipal 
              onSelect={setScreen} 
              equipoNombre={equipo} 
              temporadaNombre={temporada} 
            />
          )}

          {screen === 'PLANTILLA' && (
  <Plantilla 
    players={players} 
    setPlayers={savePlayers} // Cambiado de onSave a setPlayers
    onBack={() => setScreen('MENU')} 
  />
)}
          {screen === 'ENTRENAMIENTOS' && (
  <Entrenamientos 
    players={players} 
    entrenos={entrenos} 
    setEntrenos={saveEntrenos} 
    editItem={editItem} // <-- Esto debe recibir el objeto desde Stats
    onBack={() => {
      setEditItem(null); // ¡Muy importante limpiar al salir!
      setScreen('MENU');
    }} 
  />
)}

          {screen === 'CONFIG_PARTIDO' && (
            <ConfigurarPartido 
              players={players}
              onStartMatch={handleStartMatch}
              onBack={() => setScreen('MENU')}
            />
          )}

          {screen === 'CRONOMETRO_VIVO' && activeMatchData && (
            <CronometroPartido 
              config={activeMatchData.config}
              rotacion={activeMatchData.rotacion}
              players={players}
              onBack={() => {
                setActiveMatchData(null); // Limpiamos datos al salir
                setScreen('MENU');
              }}
              // Si tu Cronometro guarda el partido al terminar, podrías pasar:
              // onFinish={(newMatch) => savePartidos([...partidos, newMatch])}
            />
          )}

          {screen === 'NUEVO_PARTIDO' && (
  <Partidos 
    players={players} 
    partidos={partidos} 
    setPartidos={savePartidos} 
    editItem={editItem} // <--- ¡ESTO FALTABA! Sin esto no recupera datos
    onBack={() => {
      setEditItem(null); // Limpiamos al volver
      setScreen('MENU');
    }} 
  />
)}
          {screen === 'PIZARRA' && (
  <View style={{ flex: 1, width: '100%', height: '100%' }}>
    <Pizarra 
      players={players} 
      setPlayers={savePlayers} 
      onBack={() => setScreen('MENU')} 
    />
  </View>
)}

          {screen === 'STATS' && (
  <Stats 
    players={players} 
    entrenos={entrenos} 
    partidos={partidos} 
    onBack={() => setScreen('MENU')} 
    onEditSession={handleEditSession} // <--- PASAR LA FUNCIÓN AQUÍ
    onDeleteSession={(id, tipo) => {
        if(tipo === 'ENT') saveEntrenos(entrenos.filter(e => e.id !== id));
        else savePartidos(partidos.filter(p => p.id !== id));
    }}
  />
)}
          {screen === 'CALENDARIO' && (
            <CalendarioEventos 
              entrenos={entrenos} 
              partidos={partidos} 
              setEntrenos={saveEntrenos}
              setPartidos={savePartidos}
              onBack={() => setScreen('MENU')} 
            />
          )}

          {screen === 'VOLVER' && (
            <SelectorEquipo onConfirm={handleConfigurarEquipo} />
          )}
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#001A33' 
  }
});