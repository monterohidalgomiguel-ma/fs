import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PlayerEditor({ players, setPlayers, onExit }: any) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [role, setRole] = useState<"jugador" | "Monitor">("jugador");
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveToDisk = async (data: any[]) => {
    try {
      await AsyncStorage.setItem("@plantilla_futsal", JSON.stringify(data));
    } catch {
      Alert.alert("Error", "No se pudo guardar la plantilla");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos", "Acceso a galería denegado");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    });

    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const resetForm = () => {
    setName("");
    setNumber("");
    setPosition("");
    setPhoto(null);
    setRole("jugador");
    setEditingId(null);
  };

  const savePerson = () => {
    if (!name.trim()) return Alert.alert("Error", "Nombre obligatorio");
    if (role === "jugador" && !number.trim())
      return Alert.alert("Error", "Dorsal obligatorio");

    let updated;

    if (editingId) {
      updated = players.map((p: any) =>
        p.id === editingId
          ? {
              ...p,
              name: name.trim(),
              photo,
              role,
              isCoach: role === "Monitor",
              number: role === "jugador" ? number : "",
              position: role === "jugador" ? position : "",
              onCourt: role === "jugador" ? p.onCourt : false
            }
          : p
      );
    } else {
      updated = [
        ...players,
        {
          id: Date.now().toString(),
          name: name.trim(),
          photo,
          role,
          isCoach: role === "Monitor",
          number: role === "jugador" ? number : "",
          position: role === "jugador" ? position : "",
          onCourt: false
        }
      ];
    }

    setPlayers(updated);
    saveToDisk(updated);
    resetForm();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setPhoto(p.photo || null);
    setRole(p.role);
    setNumber(p.number || "");
    setPosition(p.position || "");
  };

  const deletePlayer = (id: string) => {
    Alert.alert("Eliminar", "¿Seguro?", [
      { text: "Cancelar" },
      {
        text: "Borrar",
        onPress: () => {
          const filtered = players.filter((x: any) => x.id !== id);
          setPlayers(filtered);
          saveToDisk(filtered);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onExit} style={styles.back}>
        <Text style={styles.backTxt}>← VOLVER A PIZARRA</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={styles.label}>
          {editingId ? "EDITAR PERFIL" : "NUEVO PERFIL"}
        </Text>

        <View style={styles.photoRow}>
          <TouchableOpacity onPress={pickImage} style={styles.photoCircle}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.image} />
            ) : (
              <Text style={styles.photoTxt}>FOTO</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 12 }]}
            placeholder="Nombre completo"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.roleRow}>
          <TouchableOpacity
            onPress={() => setRole("jugador")}
            style={[styles.roleBtn, role === "jugador" && styles.active]}
          >
            <Text style={styles.btnTxt}>JUGADOR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRole("Monitor");
              setNumber("");
              setPosition("");
            }}
            style={[styles.roleBtn, role === "Monitor" && styles.active]}
          >
            <Text style={styles.btnTxt}>MONITOR / ENT</Text>
          </TouchableOpacity>
        </View>

        {role === "jugador" && (
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { width: "30%" }]}
              placeholder="Dorsal"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={number}
              onChangeText={setNumber}
            />
            <TextInput
              style={[styles.input, { width: "65%" }]}
              placeholder="Posición"
              placeholderTextColor="#666"
              value={position}
              onChangeText={setPosition}
            />
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={savePerson}>
          <Text style={styles.btnTxt}>
            {editingId ? "ACTUALIZAR" : "AÑADIR"}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity onPress={resetForm} style={styles.cancel}>
            <Text style={styles.cancelTxt}>CANCELAR EDICIÓN</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView>
        <Text style={styles.section}>PLANTILLA</Text>

        {players.map((p: any) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.thumb}>
              {p.photo ? (
                <Image source={{ uri: p.photo }} style={styles.image} />
              ) : (
                <Text style={styles.initial}>{p.name[0]}</Text>
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.name}>
                {p.name} {p.role === "jugador" ? `#${p.number}` : "(DT)"}
              </Text>
              <Text style={styles.sub}>
                {p.role === "Monitor"
                  ? "ENTRENADOR"
                  : p.position || ""}
              </Text>
            </View>

            <TouchableOpacity onPress={() => startEdit(p)}>
              <Text style={styles.edit}>EDITAR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deletePlayer(p.id)}>
              <Text style={styles.delete}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  back: { marginTop: 30, marginBottom: 15 },
  backTxt: { color: "#1565C0", fontWeight: "bold" },
  form: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20
  },
  label: { color: "#666", fontSize: 10, marginBottom: 12 },
  photoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  photoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center"
  },
  photoTxt: { color: "#666", fontSize: 10 },
  image: { width: "100%", height: "100%" },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8
  },
  roleRow: { flexDirection: "row", marginBottom: 12 },
  roleBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: "#333",
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center"
  },
  active: { backgroundColor: "#1565C0" },
  btnTxt: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  addBtn: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center"
  },
  cancel: { marginTop: 10, alignItems: "center" },
  cancelTxt: { color: "#777", fontSize: 11 },
  section: { color: "#444", fontSize: 11, marginBottom: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center"
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center"
  },
  initial: { color: "#fff", fontWeight: "bold" },
  name: { color: "#fff", fontWeight: "bold" },
  sub: { color: "#666", fontSize: 10 },
  edit: { color: "#1565C0", fontSize: 10, marginRight: 10 },
  delete: { color: "red", fontWeight: "bold" }
});
