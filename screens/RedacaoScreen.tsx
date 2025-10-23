import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../App';
import Markdown from 'react-native-markdown-display'; // 🆕 Import do renderizador de Markdown

type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Menu'>;

interface ItemCurriculo {
  id: number;
  nome: string;
}

interface ResumoResponse {
  resumo: string;
}

const API_BASE_URL = 'http://localhost:8080/api/resumo';

export default function ResumoScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // --- Estados ---
  const [areas, setAreas] = useState<ItemCurriculo[]>([]);
  const [disciplinas, setDisciplinas] = useState<ItemCurriculo[]>([]);
  const [topicos, setTopicos] = useState<ItemCurriculo[]>([]);
  const [subtopicos, setSubtopicos] = useState<ItemCurriculo[]>([]);
  const [resumo, setResumo] = useState<string | null>(null);

  const [selectedArea, setSelectedArea] = useState<ItemCurriculo | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<ItemCurriculo | null>(null);
  const [selectedTopico, setSelectedTopico] = useState<ItemCurriculo | null>(null);
  const [selectedSubtopico, setSelectedSubtopico] = useState<ItemCurriculo | null>(null);

  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  const [loadingTopicos, setLoadingTopicos] = useState(false);
  const [loadingSubtopicos, setLoadingSubtopicos] = useState(false);
  const [loadingResumo, setLoadingResumo] = useState(false);

  // --- BUSCAR ÁREAS ---
  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const res = await fetch(`${API_BASE_URL}/areas`);
        const data: ItemCurriculo[] = await res.json();
        setAreas(data);
      } catch {
        Alert.alert('Erro', 'Falha ao carregar áreas.');
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  // --- BUSCAR DISCIPLINAS ---
  useEffect(() => {
    if (!selectedArea) return;
    const fetchDisciplinas = async () => {
      setLoadingDisciplinas(true);
      setResumo(null);
      try {
        const res = await fetch(`${API_BASE_URL}/areas/${selectedArea.id}/materias`);
        const data: ItemCurriculo[] = await res.json();
        setDisciplinas(data);
      } catch {
        Alert.alert('Erro', 'Falha ao carregar disciplinas.');
      } finally {
        setLoadingDisciplinas(false);
      }
    };
    fetchDisciplinas();
  }, [selectedArea]);

  // --- BUSCAR TÓPICOS ---
  useEffect(() => {
    if (!selectedDisciplina) return;
    const fetchTopicos = async () => {
      setLoadingTopicos(true);
      setResumo(null);
      try {
        const res = await fetch(`${API_BASE_URL}/materias/${selectedDisciplina.id}/topicos`);
        const data: ItemCurriculo[] = await res.json();
        setTopicos(data);
      } catch {
        Alert.alert('Erro', 'Falha ao carregar tópicos.');
      } finally {
        setLoadingTopicos(false);
      }
    };
    fetchTopicos();
  }, [selectedDisciplina]);

  // --- BUSCAR SUBTÓPICOS ---
  useEffect(() => {
    if (!selectedTopico) return;
    const fetchSubtopicos = async () => {
      setLoadingSubtopicos(true);
      setResumo(null);
      try {
        const res = await fetch(`${API_BASE_URL}/topicos/${selectedTopico.id}/subtopicos`);
        const data: ItemCurriculo[] = await res.json();
        setSubtopicos(data);
      } catch {
        Alert.alert('Erro', 'Falha ao carregar subtópicos.');
      } finally {
        setLoadingSubtopicos(false);
      }
    };
    fetchSubtopicos();
  }, [selectedTopico]);

  // --- GERAR RESUMO AUTOMATICAMENTE ---
  useEffect(() => {
    const gerarResumo = async () => {
      if (!selectedArea || !selectedDisciplina || !selectedTopico || !selectedSubtopico) return;
      setLoadingResumo(true);
      try {
        const url = `${API_BASE_URL}/${selectedArea.id}/${selectedDisciplina.id}/${selectedTopico.id}/${selectedSubtopico.id}/resumo`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao buscar resumo');
        const data: ResumoResponse = await res.json();
        setResumo(data.resumo);
      } catch {
        Alert.alert('Erro', 'Não foi possível gerar o resumo.');
      } finally {
        setLoadingResumo(false);
      }
    };
    gerarResumo();
  }, [selectedSubtopico]);

  const limparSelecao = () => {
    setSelectedArea(null);
    setSelectedDisciplina(null);
    setSelectedTopico(null);
    setSelectedSubtopico(null);
    setDisciplinas([]);
    setTopicos([]);
    setSubtopicos([]);
    setResumo(null);
  };

  const handleLogout = () => signOut(auth).catch(console.error);

  return (
    <ScrollView style={styles.container}>
      <Image source={require('../assets/resumos.jpeg')} style={styles.headerImage} />
      <Text style={styles.subtitle}>Resumo automático do conteúdo de estudo</Text>
      <Text style={styles.emailText}>Logado como: {auth.currentUser?.email}</Text>

      <View style={styles.row}>
        {/* ÁREAS */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Área</Text>
          {loadingAreas ? <ActivityIndicator /> : areas.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[styles.button, selectedArea?.id === a.id && styles.buttonSelected]}
              onPress={() => { setSelectedArea(a); setSelectedDisciplina(null); setSelectedTopico(null); setSelectedSubtopico(null); }}
            >
              <Text style={[styles.buttonText, selectedArea?.id === a.id && styles.buttonTextSelected]}>{a.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DISCIPLINAS */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Disciplina</Text>
          {loadingDisciplinas ? <ActivityIndicator /> : disciplinas.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[styles.button, selectedDisciplina?.id === d.id && styles.buttonSelected]}
              onPress={() => { setSelectedDisciplina(d); setSelectedTopico(null); setSelectedSubtopico(null); }}
            >
              <Text style={[styles.buttonText, selectedDisciplina?.id === d.id && styles.buttonTextSelected]}>{d.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TÓPICOS */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Tópico</Text>
          {loadingTopicos ? <ActivityIndicator /> : topicos.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.button, selectedTopico?.id === t.id && styles.buttonSelected]}
              onPress={() => { setSelectedTopico(t); setSelectedSubtopico(null); }}
            >
              <Text style={[styles.buttonText, selectedTopico?.id === t.id && styles.buttonTextSelected]}>{t.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUBTÓPICOS */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Subtópico</Text>
          {loadingSubtopicos ? <ActivityIndicator /> : subtopicos.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.button, selectedSubtopico?.id === s.id && styles.buttonSelected]}
              onPress={() => setSelectedSubtopico(s)}
            >
              <Text style={[styles.buttonText, selectedSubtopico?.id === s.id && styles.buttonTextSelected]}>{s.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* RESUMO */}
      <View style={[styles.resumoContainer, { borderLeftWidth: 4, borderLeftColor: '#007bff' }]}>
        {loadingResumo && <ActivityIndicator size="large" color="#007bff" />}
        {resumo && <Markdown style={markdownStyles}>{resumo}</Markdown>}
      </View>

      <TouchableOpacity style={[styles.actionButton, { marginTop: 20 }]} onPress={limparSelecao}>
        <Text style={styles.actionButtonText}>Limpar Seleção</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerImage: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10 },
  subtitle: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  emailText: { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  column: { width: '48%', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginVertical: 6, borderWidth: 1, borderColor: '#ddd' },
  columnTitle: { textAlign: 'center', fontWeight: 'bold', color: '#444', marginBottom: 8 },
  button: { padding: 10, backgroundColor: '#eee', borderRadius: 6, marginVertical: 4 },
  buttonSelected: { backgroundColor: '#007bff' },
  buttonText: { textAlign: 'center', color: '#333' },
  buttonTextSelected: { color: '#fff', fontWeight: 'bold' },
  resumoContainer: { marginTop: 20, backgroundColor: '#fff', padding: 15, borderRadius: 8 },
  actionButton: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

const markdownStyles = {
  body: { color: '#333', fontSize: 16, lineHeight: 24 },
  heading1: { fontSize: 22, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
  heading2: { fontSize: 20, fontWeight: 'bold', color: '#0056b3', marginTop: 15 },
  heading3: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12 },
  strong: { fontWeight: 'bold', color: '#000' },
  paragraph: { marginBottom: 10 },
  list_item: { marginVertical: 4 },
  bullet_list: { paddingLeft: 20 },
  ordered_list: { paddingLeft: 20 },
  hr: { borderBottomWidth: 1, borderColor: '#ccc', marginVertical: 10 },
};
