import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// --- MEDIDAS ESTRICTAS PARA MANTENER ALINEACIÓN ---
const ROW_HEIGHT = 50;    
const FIX_NAME_W = 110;   
const ENT_COL_W = 90;     
const MATCH_COL_W = 190;  
const SUB_COL_W = 47.5;
const GLOB_COL_W = 75;
const SECTION_SPACER_H = 30;

export default function Stats({ players = [], entrenos = [], partidos = [], onBack, onEditSession, onDeleteSession }) {
  const [activeTab, setActiveTab] = useState('ENTRENOS');

  const listaJugadores = useMemo(() => players.filter(p => p.role === 'Jugador'), [players]);
  const listaStaff = useMemo(() => players.filter(p => p.role === 'Monitor'), [players]);

  const todasLasComps = useMemo(() => {
    const existentes = [...new Set(partidos.map(p => p.tipo?.toUpperCase() || 'LIGA'))];
    const base = ['LIGA', 'COPA', 'AMISTOSO'];
    return [...new Set([...base, ...existentes])];
  }, [partidos]);

  const statsCalculadas = useMemo(() => {
    const procesarLista = (lista) => lista.map(jug => {
      let global = { ent: 0, par: 0, gol: 0, cap: 0, min: 0 };
      global.ent = entrenos.filter(e => e.asistencia?.find(a => a.id === jug.id && a.estado === 'AS')).length;

      const porComp = todasLasComps.map(c => {
        let s = { nombre: c, par: 0, gol: 0, cap: 0, min: 0 };
        partidos.filter(p => (p.tipo?.toUpperCase() || 'LIGA') === c).forEach(p => {
          const reg = p.convocatoria?.find(conv => conv.id === jug.id);
          if (reg && reg.estado === 'AS') {
            s.par++; global.par++;
            s.gol += parseInt(reg.goles) || 0; global.gol += parseInt(reg.goles) || 0;
            if (reg.esCapitan) { s.cap++; global.cap++; }
            const [m, s_min] = (reg.minutos || "0:00").split(':').map(Number);
            const totalM = Math.floor(((m * 60) + (s_min || 0)) / 60);
            s.min += totalM; global.min += totalM;
          }
        });
        return s;
      });
      return { id: jug.id, name: jug.name, global, porComp };
    });

    return {
      jugadores: procesarLista(listaJugadores),
      staff: procesarLista(listaStaff),
      resComp: todasLasComps.map(c => {
        let res = { nombre: c, j: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 };
        partidos.filter(p => (p.tipo?.toUpperCase() || 'LIGA') === c).forEach(part => {
          res.j++;
          const gf = parseInt(part.golesFavor) || 0;
          const gc = parseInt(part.golesContra) || 0;
          res.gf += gf; res.gc += gc;
          if (gf > gc) res.g++; else if (gf === gc) res.e++; else res.p++;
        });
        return res;
      }),
      local: partidos.filter(p => p.lugar === 'LOCAL').reduce((acc, p) => {
          acc.j++; const gf=parseInt(p.golesFavor)||0, gc=parseInt(p.golesContra)||0;
          acc.gf+=gf; acc.gc+=gc; if(gf>gc)acc.g++; else if(gf===gc)acc.e++; else acc.p++;
          return acc;
      }, {nombre:'LOCAL', j:0, g:0, e:0, p:0, gf:0, gc:0}),
      visita: partidos.filter(p => p.lugar === 'VISITANTE').reduce((acc, p) => {
          acc.j++; const gf=parseInt(p.golesFavor)||0, gc=parseInt(p.golesContra)||0;
          acc.gf+=gf; acc.gc+=gc; if(gf>gc)acc.g++; else if(gf===gc)acc.e++; else acc.p++;
          return acc;
      }, {nombre:'VISITANTE', j:0, g:0, e:0, p:0, gf:0, gc:0})
    };
  }, [listaJugadores, listaStaff, entrenos, partidos, todasLasComps]);

  const handleExport = async () => {
    try {
      let html = `<html><head><style>
        body { font-family: sans-serif; padding: 20px; background-color: white; }
        h2 { color: #012E57; border-bottom: 2px solid #1565C0; padding-bottom: 5px; text-align: center; }
        h3 { color: #1565C0; margin-top: 20px; font-size: 14px; border-left: 4px solid #1565C0; padding-left: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
        th, td { border: 1px solid #CCC; padding: 8px; text-align: center; font-size: 10px; }
        th { background-color: #012E57; color: white; }
        .name-col { text-align: left; font-weight: bold; width: 120px; background-color: #F9F9F9; }
        .section-header { background-color: #E3F2FD; font-weight: bold; text-align: left; padding: 8px; color: #1565C0; }
        .pichichi-box { border: 1px solid #012E57; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
        .page-break { page-break-before: always; }
        .highlight { color: #2E7D32; font-weight: bold; }
        .total-row { background-color: #EEE; font-weight: bold; }
      </style></head><body>`;

      if (activeTab === 'ENTRENOS') {
        html += `<h2>ASISTENCIA ENTRENAMIENTOS</h2><table><tr><th class="name-col">Nombre</th>${entrenos.map(e => `<th>${e.fecha}</th>`).join('')}</tr>`;
        [{l:'JUGADORES', d:listaJugadores}, {l:'STAFF', d:listaStaff}].forEach(g => {
          html += `<tr><td colspan="${entrenos.length+1}" class="section-header">${g.l}</td></tr>`;
          g.d.forEach(p => {
            html += `<tr><td class="name-col">${p.name}</td>${entrenos.map(e => `<td>${e.asistencia?.find(a => a.id === p.id)?.estado || '-'}</td>`).join('')}</tr>`;
          });
        });
        html += `</table>`;
      } 
      else if (activeTab === 'PARTIDOS') {
        html += `<h2>DATOS DE PARTIDOS</h2><table><tr><th class="name-col">Nombre</th>${partidos.map(p => `<th>${p.rival}<br>${p.fecha}</th>`).join('')}</tr>`;
        [{l:'JUGADORES', d:listaJugadores}, {l:'STAFF', d:listaStaff}].forEach(g => {
          html += `<tr><td colspan="${partidos.length+1}" class="section-header">${g.l}</td></tr>`;
          g.d.forEach(p => {
            html += `<tr><td class="name-col">${p.name}</td>${partidos.map(pa => {
              const c = pa.convocatoria?.find(conv => conv.id === p.id);
              return `<td>${c ? `${c.estado}${c.esCapitan?'(C)':''}<br>G:${c.goles}` : '-'}</td>`;
            }).join('')}</tr>`;
          });
        });
        html += `</table>`;
      } 
      else if (activeTab === 'RESUMEN') {
        html += `<h2>RESUMEN GLOBAL</h2><table><tr><th class="name-col">Nombre</th><th>ENT(%)</th><th>PAR(%)</th><th>GOLES</th><th>CAP</th><th>MINS</th></tr>`;
        [{l:'JUGADORES', d:statsCalculadas.jugadores, s:false}, {l:'STAFF', d:statsCalculadas.staff, s:true}].forEach(g => {
          html += `<tr><td colspan="6" class="section-header">${g.l}</td></tr>`;
          g.d.forEach(s => {
            const eP = entrenos.length > 0 ? Math.round((s.global.ent/entrenos.length)*100)+'%' : '0%';
            const pP = partidos.length > 0 ? Math.round((s.global.par/partidos.length)*100)+'%' : '0%';
            html += `<tr><td class="name-col">${s.name}</td><td>${eP}</td><td>${pP}</td><td>${g.s?'-':s.global.gol}</td><td>${g.s?'-':s.global.cap}</td><td>${g.s?'-':s.global.min+'m'}</td></tr>`;
          });
        });
        html += `</table>`;
      } 
      else if (activeTab === 'COMPETICION') {
        // --- HOJA 1: TABLAS DE EQUIPO ---
        html += `<h2>ESTADÍSTICAS DE EQUIPO</h2>`;
        const renderHtmlTable = (data, title) => {
          let t = `<h3>${title}</h3><table><tr><th>TIPO</th><th>J</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th></tr>`;
          let tot = {j:0, g:0, e:0, p:0, gf:0, gc:0};
          data.forEach(d => {
            tot.j+=d.j; tot.g+=d.g; tot.e+=d.e; tot.p+=d.p; tot.gf+=d.gf; tot.gc+=d.gc;
            t += `<tr><td>${d.nombre}</td><td>${d.j}</td><td>${d.g}</td><td>${d.e}</td><td>${d.p}</td><td>${d.gf}</td><td>${d.gc}</td><td>${d.gf-d.gc}</td></tr>`;
          });
          t += `<tr class="total-row"><td>TOTALES</td><td>${tot.j}</td><td>${tot.g}</td><td>${tot.e}</td><td>${tot.p}</td><td>${tot.gf}</td><td>${tot.gc}</td><td>${tot.gf-tot.gc}</td></tr></table>`;
          return t;
        };
        html += renderHtmlTable(statsCalculadas.resComp, "RESULTADOS POR COMPETICIÓN");
        html += renderHtmlTable([statsCalculadas.local, statsCalculadas.visita], "LOCAL VS VISITANTE");

        // --- HOJA 2: PICHICHIS ---
        html += `<div class="page-break"></div><h2>🔥 MÁXIMOS GOLEADORES</h2>`;
        ['GENERAL', ...todasLasComps].forEach(c => {
          const sorted = [...statsCalculadas.jugadores].sort((a,b) => {
            const gA = c === 'GENERAL' ? a.global.gol : (a.porComp.find(pc=>pc.nombre===c)?.gol || 0);
            const gB = c === 'GENERAL' ? b.global.gol : (b.porComp.find(pc=>pc.nombre===c)?.gol || 0);
            return gB - gA;
          });
          const top = sorted[0];
          const goals = c === 'GENERAL' ? top?.global.gol : top?.porComp.find(pc=>pc.nombre===c)?.gol;
          html += `<div class="pichichi-box"><strong>${c}:</strong> ${goals > 0 ? top.name : 'Nadie'} <span class="highlight">${goals > 0 ? goals : 0} ⚽</span></div>`;
        });

        // --- HOJAS SIGUIENTES: DESGLOSE INDIVIDUAL ---
        ['GENERAL', ...todasLasComps].forEach(cNom => {
          html += `<div class="page-break"></div><h2>DESGLOSE: ${cNom}</h2>`;
          html += `<table><tr><th class="name-col">Nombre</th>${cNom==='GENERAL'?'<th>ENT</th>':''}<th>PAR</th><th>GOL</th><th>CAP</th><th>MIN</th></tr>`;
          [{l:'JUGADORES', d:statsCalculadas.jugadores, s:false}, {l:'STAFF', d:statsCalculadas.staff, s:true}].forEach(g => {
            html += `<tr><td colspan="${cNom==='GENERAL'?6:5}" class="section-header">${g.l}</td></tr>`;
            g.d.forEach(j => {
              const d = cNom === 'GENERAL' ? j.global : j.porComp.find(pc => pc.nombre === cNom);
              html += `<tr><td class="name-col">${j.name}</td>${cNom==='GENERAL'?`<td>${d.ent}</td>`:''}<td>${d.par}</td><td>${g.s?'-':d.gol}</td><td>${g.s?'-':d.cap}</td><td>${g.s?'-':d.min+'m'}</td></tr>`;
            });
          });
          html += `</table>`;
        });
      }

      html += `</body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      Alert.alert("Error", "No se pudo exportar.");
    }
  };

  const renderFilaDatos = (p, idx, isStaff) => (
    <View key={p.id} style={[styles.dataRow, { height: ROW_HEIGHT }]}>
      {activeTab === 'ENTRENOS' && entrenos.map(e => {
        const st = (e.asistencia || []).find(a => a.id === p.id);
        const color = st?.estado === 'AS' ? '#2E7D32' : st?.estado === 'AV' ? '#E65100' : st?.estado === 'NA' ? '#B71C1C' : '#333';
        return (
          <View key={e.id} style={[styles.cell, { width: ENT_COL_W }]}>
            <View style={[styles.badge, {backgroundColor: color}]}><Text style={styles.badgeTxt}>{st?.estado || '-'}</Text></View>
          </View>
        );
      })}
      {activeTab === 'PARTIDOS' && partidos.map(pa => {
        const c = pa.convocatoria?.find(conv => conv.id === p.id) || { estado:'-', goles:0, minutos:'0:00', esCapitan:false };
        return (
          <View key={pa.id} style={{flexDirection:'row', width: MATCH_COL_W, borderLeftWidth:0.5, borderColor:'#012E57'}}>
            <View style={styles.subCol}><Text style={styles.subColTxt}>{c.estado}</Text></View>
            <View style={styles.subCol}><Text style={[styles.subColTxt, c.esCapitan && {color:'#FFD700', fontWeight:'bold'}]}>{c.esCapitan ? 'C' : '-'}</Text></View>
            <View style={styles.subCol}><Text style={styles.subColTxt}>{c.goles}</Text></View>
            <View style={styles.subCol}><Text style={[styles.subColTxt, {fontSize:9}]}>{c.minutos}</Text></View>
          </View>
        );
      })}
      {activeTab === 'RESUMEN' && ['ENT(N)','ENT(%)','PAR(N)','PAR(%)','GOLES','CAP','MINS'].map(h => {
        const s = isStaff ? statsCalculadas.staff[idx] : statsCalculadas.jugadores[idx];
        let val = "-"; let color = "#FFF";
        if (h === 'ENT(N)') val = s.global.ent;
        if (h === 'ENT(%)') { val = entrenos.length > 0 ? Math.round((s.global.ent/entrenos.length)*100)+'%' : '0%'; color='#00D4FF'; }
        if (h === 'PAR(N)') val = s.global.par;
        if (h === 'PAR(%)') { val = partidos.length > 0 ? Math.round((s.global.par/partidos.length)*100)+'%' : '0%'; color='#00D4FF'; }
        if (h === 'GOLES') val = !isStaff ? s.global.gol : '-';
        if (h === 'CAP') val = !isStaff ? s.global.cap : '-';
        if (h === 'MINS') { val = !isStaff ? s.global.min+'m' : '-'; color='#FFD700'; }
        return <View key={h} style={[styles.cell, {width: GLOB_COL_W}]}><Text style={[styles.globC, {color}]}>{val}</Text></View>
      })}
    </View>
  );

  const renderTabAsistencia = () => {
    const hH = activeTab === 'PARTIDOS' ? 130 : 80;
    return (
      <View style={{flex:1, flexDirection: 'row'}}>
        <View style={{width: FIX_NAME_W, zIndex: 10, backgroundColor: '#001A33', borderRightWidth: 1, borderColor: '#1565C0'}}>
          <View style={[styles.headerCell, {height: hH}]}><Text style={styles.headerLabel}>NOMBRE</Text></View>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={styles.sectHeader}><Text style={styles.sectTitle}>JUGADORES</Text></View>
            {listaJugadores.map(p => <View key={p.id} style={[styles.nameRow, {height: ROW_HEIGHT}]}><Text style={styles.nameTxt} numberOfLines={1}>{p.name}</Text></View>)}
            <View style={styles.sectHeader}><Text style={styles.sectTitle}>STAFF</Text></View>
            {listaStaff.map(p => <View key={p.id} style={[styles.nameRow, {height: ROW_HEIGHT}]}><Text style={styles.nameTxt} numberOfLines={1}>{p.name}</Text></View>)}
          </ScrollView>
        </View>

        <ScrollView horizontal bounces={false}>
          <View>
            <View style={[styles.tableHeader, { height: hH }]}>
              {activeTab === 'ENTRENOS' ? entrenos.map(e => (
                <View key={e.id} style={[styles.dateCol, { width: ENT_COL_W }]}>
                  <Text style={styles.dateTxt}>{e.fecha}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => onEditSession(e, 'ENT')} style={styles.miniBtn}><Text style={styles.miniBtnTxt}>E</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => onDeleteSession(e.id, 'ENT')} style={[styles.miniBtn, {backgroundColor:'#C62828'}]}><Text style={styles.miniBtnTxt}>X</Text></TouchableOpacity>
                  </View>
                </View>
              )) : activeTab === 'PARTIDOS' ? partidos.map(p => {
                const tieneActa = p.convocatoria && p.convocatoria.length > 0;
                return (
                  <View key={p.id} style={[styles.matchHeaderCol, { width: MATCH_COL_W }]}>
                    <Text style={styles.rivalTxt} numberOfLines={1}>{p.rival}</Text>
                    <Text style={styles.resultadoTxt}>{p.golesFavor || 0} - {p.golesContra || 0}</Text>
                    <Text style={styles.dateSubTxt}>{p.fecha}</Text>
                    <View style={[styles.actionRow, {marginBottom: 8}]}>
                      <TouchableOpacity onPress={() => onEditSession(p, 'PAR')} style={[styles.miniBtn, {backgroundColor: tieneActa ? '#2E7D32' : '#555'}]}>
                        <Text style={styles.miniBtnTxt}>{tieneActa ? 'ACTA' : 'ND'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onEditSession(p, 'EDIT_PAR')} style={[styles.miniBtn, {backgroundColor:'#1565C0'}]}>
                        <Text style={styles.miniBtnTxt}>E</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onDeleteSession(p.id, 'PAR')} style={[styles.miniBtn, {backgroundColor:'#C62828'}]}><Text style={styles.miniBtnTxt}>X</Text></TouchableOpacity>
                    </View>
                    <View style={styles.subHeaderRow}><Text style={styles.subH}>AS</Text><Text style={styles.subH}>C</Text><Text style={styles.subH}>G</Text><Text style={styles.subH}>MIN</Text></View>
                  </View>
                );
              }) : ['ENT(N)','ENT(%)','PAR(N)','PAR(%)','GOLES','CAP','MINS'].map(h => (
                 <View key={h} style={[styles.dateCol, { width: GLOB_COL_W }]}><Text style={styles.globH}>{h}</Text></View>
              ))}
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              <View style={styles.sectHeader} /> 
              {listaJugadores.map((p, idx) => renderFilaDatos(p, idx, false))}
              <View style={styles.sectHeader} />
              {listaStaff.map((p, idx) => renderFilaDatos(p, idx, true))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderTabFinal = () => {
    const RenderTablaEquipo = ({ data, titulo }) => {
      const total = data.reduce((acc, curr) => ({
        j: acc.j + curr.j, g: acc.g + curr.g, e: acc.e + curr.e, p: acc.p + curr.p, gf: acc.gf + curr.gf, gc: acc.gc + curr.gc
      }), { j: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 });
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{titulo}</Text>
          <View style={styles.compHeader}><Text style={{flex:2, color:'#00aaff', fontSize:9}}>TIPO</Text>{['J','G','E','P','GF','GC','DG'].map(h => <Text key={h} style={styles.compH}>{h}</Text>)}</View>
          {data.map((d, i) => (
            <View key={i} style={styles.compRow}><Text style={{flex:2, color:'#FFF', fontSize:10}}>{d.nombre}</Text><Text style={styles.compC}>{d.j}</Text><Text style={styles.compC}>{d.g}</Text><Text style={styles.compC}>{d.e}</Text><Text style={styles.compC}>{d.p}</Text><Text style={styles.compC}>{d.gf}</Text><Text style={styles.compC}>{d.gc}</Text><Text style={styles.compC}>{d.gf-d.gc}</Text></View>
          ))}
          <View style={[styles.compRow, {borderTopWidth:1, borderColor:'#1565C0', marginTop:5}]}>
            <Text style={{flex:2, color:'#FFD700', fontSize:10, fontWeight:'bold'}}>TOTALES</Text>
            <Text style={styles.totalC}>{total.j}</Text><Text style={styles.totalC}>{total.g}</Text><Text style={styles.totalC}>{total.e}</Text><Text style={styles.totalC}>{total.p}</Text><Text style={styles.totalC}>{total.gf}</Text><Text style={styles.totalC}>{total.gc}</Text><Text style={styles.totalC}>{total.gf-total.gc}</Text>
          </View>
        </View>
      );
    };

    return (
      <ScrollView style={{padding:10}}>
        <RenderTablaEquipo data={statsCalculadas.resComp} titulo="RESULTADOS POR COMPETICIÓN" />
        <RenderTablaEquipo data={[statsCalculadas.local, statsCalculadas.visita]} titulo="LOCAL VS VISITANTE" />
        
        <View style={[styles.card, {backgroundColor:'#002D57'}]}>
          <Text style={styles.cardTitle}>🔥 MÁXIMOS GOLEADORES (PICHICHIS)</Text>
          {['GENERAL', ...todasLasComps].map(c => {
            const sorted = [...statsCalculadas.jugadores].sort((a,b) => {
                const goalsA = c === 'GENERAL' ? a.global.gol : (a.porComp.find(pc=>pc.nombre===c)?.gol || 0);
                const goalsB = c === 'GENERAL' ? b.global.gol : (b.porComp.find(pc=>pc.nombre===c)?.gol || 0);
                return goalsB - goalsA;
            });
            const top = sorted[0];
            const goals = c === 'GENERAL' ? top?.global.gol : top?.porComp.find(pc=>pc.nombre===c)?.gol;
            return (
              <View key={c} style={styles.pichichiRow}>
                <Text style={{color:'#00aaff', flex:1.5, fontSize:10}}>{c}:</Text>
                <Text style={{color:'#FFF', flex:2, fontSize:10}}>{goals > 0 ? top.name : 'Sin goles'}</Text>
                <Text style={{color:'#00FF00', fontWeight:'bold', fontSize:10}}>{goals > 0 ? goals : 0} ⚽</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectTitle}>DESGLOSE INDIVIDUAL</Text>
        {['GENERAL', ...todasLasComps].map(cNom => (
          <View key={cNom} style={styles.card}>
            <Text style={[styles.cardTitle, {color:'#FFD700'}]}>{cNom}</Text>
            <View style={styles.compHeader}><Text style={{flex:2, color:'#00aaff', fontSize:9}}>JUGADOR</Text>{(cNom==='GENERAL'?['ENT','PAR','GOL','CAP','MIN']:['PAR','GOL','CAP','MIN']).map(h => <Text key={h} style={styles.compH}>{h}</Text>)}</View>
            {statsCalculadas.jugadores.map(j => {
              const d = cNom === 'GENERAL' ? j.global : j.porComp.find(pc => pc.nombre === cNom);
              return (
                <View key={j.id} style={styles.compRow}><Text style={{flex:2, color:'#FFF', fontSize:10}}>{j.name}</Text>{cNom === 'GENERAL' && <Text style={styles.compC}>{d.ent}</Text>}<Text style={styles.compC}>{d.par}</Text><Text style={[styles.compC, {fontWeight:'bold'}]}>{d.gol}</Text><Text style={styles.compC}>{d.cap}</Text><Text style={styles.compC}>{d.min}m</Text></View>
              );
            })}
          </View>
        ))}
        <View style={{height: 40}} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnTxt}>← VOLVER</Text></TouchableOpacity>
        <Text style={styles.title}>ESTADÍSTICAS</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportTopBtn}>
          <Text style={styles.exportTopBtnTxt}>EXPORTAR</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        {['ENTRENOS', 'PARTIDOS', 'RESUMEN', 'FINAL'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === (t==='FINAL'?'COMPETICION':t) && styles.activeTab]} onPress={() => setActiveTab(t==='FINAL'?'COMPETICION':t)}>
            <Text style={styles.tabTxt}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === 'COMPETICION' ? renderTabFinal() : renderTabAsistencia()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001A33' },
  headerNav: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: 40, backgroundColor: '#012E57', justifyContent: 'space-between' },
  backBtn: { padding: 8 },
  backBtnTxt: { color: '#00aaff', fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  exportTopBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  exportTopBtnTxt: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#012E57', padding: 5, gap: 4 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#001A33' },
  activeTab: { backgroundColor: '#1565C0' },
  tabTxt: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  headerCell: { backgroundColor: '#012E57', justifyContent: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#1565C0' },
  headerLabel: { color: '#00aaff', fontSize: 10, fontWeight: 'bold' },
  sectHeader: { height: SECTION_SPACER_H, backgroundColor: '#001326', justifyContent: 'center', paddingHorizontal: 10 },
  sectTitle: { color: '#1565C0', fontSize: 10, fontWeight: 'bold' },
  nameRow: { justifyContent: 'center', paddingHorizontal: 10, borderBottomWidth: 0.5, borderColor: '#012E57' },
  nameTxt: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#012E57', borderBottomWidth:1, borderColor:'#1565C0' },
  dateCol: { alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderColor: '#012E57' },
  matchHeaderCol: { alignItems: 'center', justifyContent: 'flex-end', borderLeftWidth: 1, borderColor: '#012E57' },
  rivalTxt: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  resultadoTxt: { color: '#00FF00', fontSize: 12, fontWeight: 'bold' },
  dateSubTxt: { color: '#00aaff', fontSize: 8, marginBottom: 5 },
  dateTxt: { color: '#FFF', fontSize: 9, fontWeight: 'bold', marginBottom: 5 },
  actionRow: { flexDirection: 'row', gap: 4 },
  miniBtn: { padding: 4, borderRadius: 4, minWidth: 28, backgroundColor: '#1565C0', alignItems: 'center', justifyContent:'center' },
  miniBtnTxt: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  dataRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#012E57' },
  cell: { justifyContent: 'center', alignItems: 'center' },
  badge: { width: 30, height: 20, borderRadius: 4, justifyContent:'center', alignItems:'center' },
  badgeTxt: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  subHeaderRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#1565C0', width: '100%' },
  subH: { width: SUB_COL_W, textAlign: 'center', color: '#00aaff', fontSize: 8, fontWeight: 'bold', paddingVertical: 2 },
  subCol: { width: SUB_COL_W, justifyContent: 'center', alignItems: 'center' },
  subColTxt: { color: '#FFF', fontSize: 10 },
  globH: { color: '#00aaff', fontSize: 8, fontWeight: 'bold', textAlign:'center' },
  globC: { fontSize: 10, fontWeight: 'bold', textAlign:'center' },
  card: { backgroundColor: '#012E57', borderRadius: 8, padding: 10, marginBottom: 15 },
  cardTitle: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  compHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#1565C0', paddingBottom: 5 },
  compH: { flex: 1, color: '#00aaff', fontSize: 8, textAlign: 'center', fontWeight: 'bold' },
  compRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5, borderColor: '#001A33' },
  compC: { flex: 1, color: '#FFF', fontSize: 10, textAlign: 'center' },
  totalC: { flex: 1, color: '#FFD700', fontSize: 10, textAlign: 'center', fontWeight: 'bold' },
  pichichiRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderColor: '#001A33', alignItems:'center' }
});