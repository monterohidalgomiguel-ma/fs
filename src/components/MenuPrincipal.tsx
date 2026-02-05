import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function MenuPrincipal({ equipoNombre, temporadaNombre, onSelect }: any) {
  return (
    <View style={styles.container}>
      {/* Cabecera Identificativa */}
      <View style={styles.headerMini}>
        <Text style={styles.clubText}>{equipoNombre}</Text>
        <Text style={styles.tempText}>{temporadaNombre}</Text>
      </View>

      <Text style={styles.mainTitle}>GESTIÓN TÁCTICA</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* FILA 1: Plantilla y Entrenos */}
        <View style={styles.row}>
          <MenuBtn 
            title="PLANTILLA" 
            icon="users" 
            color="#4A90E2" 
            onPress={() => onSelect('PLANTILLA')} 
          />
          <MenuBtn 
            title="ENTRENOS" 
            icon="calendar-check-o" 
            color="#50C878" 
            onPress={() => onSelect('ENTRENAMIENTOS')} 
          />
        </View>

        {/* FILA 2: Partidos y Cronómetro */}
        <View style={styles.row}>
          <MenuBtn 
            title="PARTIDOS" 
            icon="vcard-o" 
            color="#FF9F43" 
            onPress={() => onSelect('NUEVO_PARTIDO')} 
          />
          <MenuBtn 
            title="CRONÓMETRO" 
            icon="clock-o" 
            color="#FF4757" 
            onPress={() => onSelect('CONFIG_PARTIDO')} 
          />
        </View>

        {/* FILA 3: Pizarra y Stats */}
        <View style={styles.row}>
          <MenuBtn 
            title="PIZARRA" 
            icon="pencil-square-o" 
            color="#A29BFE" 
            onPress={() => onSelect('PIZARRA')} 
          />
          <MenuBtn 
            title="STATS" 
            icon="line-chart" 
            color="#00D2D3" 
            onPress={() => onSelect('STATS')} 
          />
        </View>

        {/* Botón para cambiar de equipo */}
        <TouchableOpacity style={styles.btnVolver} onPress={() => onSelect('VOLVER')}>
          <FontAwesome name="exchange" size={14} color="#FF4757" />
          <Text style={styles.btnVolverTxt}>CAMBIAR DE EQUIPO / TEMPORADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Componente interno para los botones tipo "Card"
function MenuBtn({ title, icon, color, onPress }: any) {
  return (
    <TouchableOpacity 
      style={[styles.card, { borderTopColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <FontAwesome name={icon} size={28} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#001A33', 
    paddingHorizontal: 20 
  },
  headerMini: { 
    marginTop: 10, 
    alignItems: 'flex-end', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#1565C0', 
    paddingBottom: 5 
  },
  clubText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: 'bold', 
    opacity: 0.8,
    textTransform: 'uppercase'
  },
  tempText: { 
    color: '#00aaff', 
    fontSize: 10, 
    fontWeight: '600' 
  },
  mainTitle: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '900', 
    textAlign: 'center', 
    marginVertical: 25, 
    letterSpacing: 1 
  },
  scroll: { 
    paddingBottom: 40 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 18, 
    gap: 15 
  },
  card: { 
    flex: 1, 
    backgroundColor: '#012E57', 
    borderRadius: 20, 
    paddingVertical: 20, 
    alignItems: 'center',
    borderTopWidth: 4,
    elevation: 8, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  iconCircle: { 
    width: 55, 
    height: 55, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  cardTitle: { 
    color: '#FFF', 
    fontSize: 13, 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  },
  btnVolver: { 
    marginTop: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    padding: 15, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#FF4757',
    backgroundColor: 'rgba(255, 71, 87, 0.05)'
  },
  btnVolverTxt: { 
    color: '#FF4757', 
    fontSize: 12, 
    fontWeight: 'bold' 
  }
});