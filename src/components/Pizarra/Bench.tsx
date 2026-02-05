import React, { useRef, useState, useEffect } from "react";
import { View } from "react-native";

import Bench from "./Bench";
import Field from "./Field";
import Modals from "./Modals";
import { SISTEMAS_POS, ESTRATEGIAS_FULL } from "../data/constants"; // Ajusta ruta si es necesario

export default function PizarraPro({
  players,
  setPlayers,
  library,
  setLibrary,
  onSaveToLibrary,
  onDeletePlay,
  onBack,
}: any) {
  const [sisModal, setSisModal] = useState(false);
  const [stratModal, setStratModal] = useState(false);
  const [libModal, setLibModal] = useState(false);

  const pos = useRef<any>(null);
  const paths = useRef<any>({});

  // Inicializar posiciones si no existen
  if (!pos.current) {
    pos.current = {};
    ['r1','r2','r3','r4','r5'].forEach((id, i) => {
      pos.current[id] = { x: 0, y: 0 };
      paths.current[id] = [];
    });
    players.forEach(p => {
      pos.current[p.id] = { x: 0, y: 0 };
      paths.current[p.id] = [];
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <Bench players={players} setPlayers={setPlayers} pos={pos} />
      <Field players={players} pos={pos} paths={paths} />
      <Modals
        players={players}
        sisModal={sisModal} setSisModal={setSisModal}
        stratModal={stratModal} setStratModal={setStratModal}
        libModal={libModal} setLibModal={setLibModal}
        library={library} setLibrary={setLibrary}
        pos={pos}
        paths={paths}
        SISTEMAS_POS={SISTEMAS_POS}
        ESTRATEGIAS_FULL={ESTRATEGIAS_FULL}
        onSaveToLibrary={onSaveToLibrary}
        onDeletePlay={onDeletePlay}
      />
    </View>
  );
}
