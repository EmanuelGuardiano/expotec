import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Dimensions, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../App'; // Ajuste este import se necessário

// --- TIPAGEM ---
type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Menu'>;

// Estrutura de um item de currículo (Área, Matéria, Tópico, etc.)
interface ItemCurriculo {
  id: number;
  nome: string;
}

// Estrutura de uma Questão
interface Questao {
  id: number;
  textoBase: string;
  enunciado: string;
  alternativas: Record<string, string>;
}

const API_BASE_URL = 'http://localhost:8080/api/exercicios';

const { width } = Dimensions.get('window');

export default function ExerciciosScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // --- ESTADOS PARA ARMAZENAR AS LISTAS VINDAS DA API ---
  const [areas, setAreas] = useState<ItemCurriculo[]>([]);
  const [disciplinas, setDisciplinas] = useState<ItemCurriculo[]>([]);
  const [topicos, setTopicos] = useState<ItemCurriculo[]>([]);
  const [subtopicos, setSubtopicos] = useState<ItemCurriculo[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);

  // --- ESTADOS PARA CONTROLAR O ITEM SELECIONADO EM CADA COLUNA ---
  const [selectedArea, setSelectedArea] = useState<ItemCurriculo | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<ItemCurriculo | null>(null);
  const [selectedTopico, setSelectedTopico] = useState<ItemCurriculo | null>(null);
  const [selectedSubtopico, setSelectedSubtopico] = useState<ItemCurriculo | null>(null);

  // --- ESTADOS DE CARREGAMENTO (LOADING) ---
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [isLoadingTopicos, setIsLoadingTopicos] = useState(false);
  const [isLoadingSubtopicos, setIsLoadingSubtopicos] = useState(false);

  // Efeito para buscar as ÁREAS quando o componente é montado
  useEffect(() => {
    const fetchAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const response = await fetch(`${API_BASE_URL}/areas`);
        const data: ItemCurriculo[] = await response.json();
        setAreas(data);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as áreas de conhecimento.');
      } finally {
        setIsLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  // Efeito para buscar as DISCIPLINAS quando uma ÁREA é selecionada
  useEffect(() => {
    if (selectedArea) {
      const fetchDisciplinas = async () => {
        setIsLoadingDisciplinas(true);
        setDisciplinas([]); // Limpa a lista anterior
        try {
          const response = await fetch(`${API_BASE_URL}/areas/${selectedArea.id}/materias`);
          const data: ItemCurriculo[] = await response.json();
          setDisciplinas(data);
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar as disciplinas.');
        } finally {
          setIsLoadingDisciplinas(false);
        }
      };
      fetchDisciplinas();
    }
  }, [selectedArea]);

  // Efeito para buscar os TÓPICOS quando uma DISCIPLINA é selecionada
  useEffect(() => {
    if (selectedDisciplina) {
      const fetchTopicos = async () => {
        setIsLoadingTopicos(true);
        setTopicos([]);
        try {
          const response = await fetch(`${API_BASE_URL}/materias/${selectedDisciplina.id}/topicos`);
          const data: ItemCurriculo[] = await response.json();
          setTopicos(data);
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar os tópicos.');
        } finally {
          setIsLoadingTopicos(false);
        }
      };
      fetchTopicos();
    }
  }, [selectedDisciplina]);

  // Efeito para buscar os SUBTÓPICOS quando um TÓPICO é selecionado
  useEffect(() => {
    if (selectedTopico) {
      const fetchSubtopicos = async () => {
        setIsLoadingSubtopicos(true);
        setSubtopicos([]);
        try {
          // Usando o endpoint validado do seu backend
          const response = await fetch(`${API_BASE_URL}/topicos/${selectedTopico.id}/subtopicos`);
          const data: ItemCurriculo[] = await response.json();
          setSubtopicos(data);
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar os subtópicos.');
        } finally {
          setIsLoadingSubtopicos(false);
        }
      };
      fetchSubtopicos();
    }
  }, [selectedTopico]);

  // --- FUNÇÕES DE CONTROLE ---

  const handleSelectArea = (area: ItemCurriculo) => {
    setSelectedArea(area);
    // Limpa as seleções e dados subsequentes
    setSelectedDisciplina(null);
    setSelectedTopico(null);
    setSelectedSubtopico(null);
    setDisciplinas([]);
    setTopicos([]);
    setSubtopicos([]);
    setQuestoes([]);
  };

  const handleSelectDisciplina = (disciplina: ItemCurriculo) => {
    setSelectedDisciplina(disciplina);
    setSelectedTopico(null);
    setSelectedSubtopico(null);
    setTopicos([]);
    setSubtopicos([]);
    setQuestoes([]);
  };

  const handleSelectTopico = (topico: ItemCurriculo) => {
    setSelectedTopico(topico);
    setSelectedSubtopico(null);
    setSubtopicos([]);
    setQuestoes([]);
  };

  const handleGerarQuestoes = async () => {
    if (!selectedArea || !selectedDisciplina || !selectedTopico || !selectedSubtopico) {
      Alert.alert('Seleção Incompleta', 'Por favor, selecione todas as quatro opções para gerar os exercícios.');
      return;
    }

    const url = `${API_BASE_URL}/${selectedArea.id}/${selectedDisciplina.id}/${selectedTopico.id}/${selectedSubtopico.id}/gerar`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Falha ao buscar os exercícios. Verifique o servidor.');
      }
      const data = await response.json();
      // O seu backend retorna o objeto completo, então pegamos a propriedade 'questoes'
      setQuestoes(data.questoes || []);
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
      Alert.alert('Erro', 'Não foi possível carregar os exercícios. Tente novamente mais tarde.');
    }
  };

  const limparSelecaoCompleta = () => {
    setSelectedArea(null);
    setSelectedDisciplina(null);
    setSelectedTopico(null);
    setSelectedSubtopico(null);
    setDisciplinas([]);
    setTopicos([]);
    setSubtopicos([]);
    setQuestoes([]);
  };

  const handleLogout = () => {
    signOut(auth).catch(error => console.log('Erro no Logout:', error));
  };

  // --- RENDERIZAÇÃO ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={require('../assets/corinthians.png')} style={styles.headerImage} resizeMode="cover" />
      <Text style={styles.subtitle}>Gere aqui exercícios sobre o tema que você quiser</Text>
      <Text style={styles.emailText}>Logado como: {auth.currentUser?.email}</Text>

      <View style={styles.row}>
        {/* Coluna de Áreas */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Área de Conhecimento</Text>
          {isLoadingAreas ? <ActivityIndicator size="large" color="#007bff" /> : (
            areas.map(area => (
              <TouchableOpacity key={area.id} style={[styles.button, selectedArea?.id === area.id && styles.buttonSelected]} onPress={() => handleSelectArea(area)}>
                <Text style={[styles.buttonText, selectedArea?.id === area.id && styles.buttonTextSelected]}>{area.nome}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Coluna de Disciplinas */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Disciplina</Text>
          {isLoadingDisciplinas ? <ActivityIndicator size="large" color="#007bff" /> : (
            disciplinas.length > 0 ? (
              disciplinas.map(d => (
                <TouchableOpacity key={d.id} style={[styles.button, selectedDisciplina?.id === d.id && styles.buttonSelected]} onPress={() => handleSelectDisciplina(d)}>
                  <Text style={[styles.buttonText, selectedDisciplina?.id === d.id && styles.buttonTextSelected]}>{d.nome}</Text>
                </TouchableOpacity>
              ))
            ) : <Text style={styles.placeholder}>Escolha uma área</Text>
          )}
        </View>

        {/* Coluna de Tópicos */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Tópico</Text>
          {isLoadingTopicos ? <ActivityIndicator size="large" color="#007bff" /> : (
            topicos.length > 0 ? (
              topicos.map(t => (
                <TouchableOpacity key={t.id} style={[styles.button, selectedTopico?.id === t.id && styles.buttonSelected]} onPress={() => handleSelectTopico(t)}>
                  <Text style={[styles.buttonText, selectedTopico?.id === t.id && styles.buttonTextSelected]}>{t.nome}</Text>
                </TouchableOpacity>
              ))
            ) : <Text style={styles.placeholder}>Escolha uma disciplina</Text>
          )}
        </View>

        {/* Coluna de Subtópicos */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Subtópico</Text>
          {isLoadingSubtopicos ? <ActivityIndicator size="large" color="#007bff" /> : (
            subtopicos.length > 0 ? (
              subtopicos.map(s => (
                <TouchableOpacity key={s.id} style={[styles.button, selectedSubtopico?.id === s.id && styles.buttonSelected]} onPress={() => setSelectedSubtopico(s)}>
                  <Text style={[styles.buttonText, selectedSubtopico?.id === s.id && styles.buttonTextSelected]}>{s.nome}</Text>
                </TouchableOpacity>
              ))
            ) : <Text style={styles.placeholder}>Escolha um tópico</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.summaryTitle}>Resumo da seleção:</Text>
        <Text style={styles.summaryText}>
          {selectedArea?.nome || '—'} • {selectedDisciplina?.nome || '—'} • {selectedTopico?.nome || '—'} • {selectedSubtopico?.nome || '—'}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleGerarQuestoes}>
            <Text style={styles.actionButtonText}>Gerar Questões</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={limparSelecaoCompleta}>
            <Text style={styles.actionButtonText}>Limpar Seleção</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.questoesContainer}>
        {questoes.map((questao, index) => (
          <View key={questao.id} style={styles.questaoCard}>
            <Text style={styles.questaoHeader}>Questão {index + 1}</Text>
            {questao.textoBase && <Text style={styles.textoBase}>{questao.textoBase}</Text>}
            <Text style={styles.enunciado}>{questao.enunciado}</Text>
            <View style={styles.alternativasContainer}>
              {Object.entries(questao.alternativas).map(([letra, texto]) => (
                <Text key={letra} style={styles.alternativa}>
                  <Text style={{ fontWeight: 'bold' }}>{letra})</Text> {texto}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      
    </ScrollView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerImage: { width: '100%', height: 150, alignSelf: 'center', marginBottom: 10, borderRadius: 8 },
  subtitle: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  emailText: { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  column: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: '48%',
    marginVertical: 8,
    minHeight: 150, // Garante altura mínima para caber o loading
  },
  columnTitle: { textAlign: 'center', fontWeight: 'bold', color: '#444', marginBottom: 10 },
  button: {
    backgroundColor: '#e9e9e9',
    borderRadius: 6,
    padding: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonSelected: { backgroundColor: '#007bff', borderColor: '#0056b3' },
  buttonText: { textAlign: 'center', color: '#333' },
  buttonTextSelected: { color: '#fff', fontWeight: 'bold' },
  placeholder: { textAlign: 'center', color: '#999', marginTop: 8, fontStyle: 'italic' },
  footer: { marginTop: 20, alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  summaryTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  summaryText: { marginVertical: 8, textAlign: 'center', color: '#555' },
  buttonRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  actionButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButton: { backgroundColor: '#ffc107' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    alignSelf: 'center',
  },
  questoesContainer: { marginTop: 20 },
  questaoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  questaoHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#007bff' },
  textoBase: { fontStyle: 'italic', color: '#555', marginBottom: 10, lineHeight: 20 },
  enunciado: { fontWeight: '600', color: '#333', marginBottom: 12, lineHeight: 22 },
  alternativasContainer: { marginLeft: 10 },
  alternativa: { marginBottom: 8, color: '#444', lineHeight: 20 },
});