import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Dimensions, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../App'; 

type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Menu'>;

interface ItemCurriculo {
  id: number;
  nome: string;
}

interface Questao {
  id: number;
  textoBase: string;
  enunciado: string;
  alternativas: Record<string, string>;
}

interface FeedbackUnico {
  idQuestao: number;
  correta: boolean;
  respostaSugerida: string; // alternativa correta
  feedbackDetalhado?: string;
}

const API_BASE_URL = 'http://localhost:9090/api/exercicios';
const { width } = Dimensions.get('window');

export default function ExerciciosScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [areas, setAreas] = useState<ItemCurriculo[]>([]);
  const [disciplinas, setDisciplinas] = useState<ItemCurriculo[]>([]);
  const [topicos, setTopicos] = useState<ItemCurriculo[]>([]);
  const [subtopicos, setSubtopicos] = useState<ItemCurriculo[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostasSelecionadas, setRespostasSelecionadas] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, FeedbackUnico>>({});

  const [selectedArea, setSelectedArea] = useState<ItemCurriculo | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<ItemCurriculo | null>(null);
  const [selectedTopico, setSelectedTopico] = useState<ItemCurriculo | null>(null);
  const [selectedSubtopico, setSelectedSubtopico] = useState<ItemCurriculo | null>(null);

  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [isLoadingTopicos, setIsLoadingTopicos] = useState(false);
  const [isLoadingSubtopicos, setIsLoadingSubtopicos] = useState(false);

  const handleSelectAlternativa = (questaoId: number, letra: string) => {
    setRespostasSelecionadas(prev => ({ ...prev, [questaoId]: letra }));
  };

  // --- Fetch Áreas ---
  useEffect(() => {
    const fetchAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const response = await fetch(`${API_BASE_URL}/areas`);
        const data: ItemCurriculo[] = await response.json();
        setAreas(data);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar as áreas de conhecimento.');
      } finally { setIsLoadingAreas(false); }
    };
    fetchAreas();
  }, []);

  // --- Fetch Disciplinas ---
  useEffect(() => {
    if (selectedArea) {
      setIsLoadingDisciplinas(true);
      setDisciplinas([]);
      fetch(`${API_BASE_URL}/areas/${selectedArea.id}/materias`)
        .then(res => res.json())
        .then(data => setDisciplinas(data))
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar as disciplinas.'))
        .finally(() => setIsLoadingDisciplinas(false));
    }
  }, [selectedArea]);

  // --- Fetch Topicos ---
  useEffect(() => {
    if (selectedDisciplina) {
      setIsLoadingTopicos(true);
      setTopicos([]);
      fetch(`${API_BASE_URL}/materias/${selectedDisciplina.id}/topicos`)
        .then(res => res.json())
        .then(data => setTopicos(data))
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar os tópicos.'))
        .finally(() => setIsLoadingTopicos(false));
    }
  }, [selectedDisciplina]);

  // --- Fetch Subtopicos ---
  useEffect(() => {
    if (selectedTopico) {
      setIsLoadingSubtopicos(true);
      setSubtopicos([]);
      fetch(`${API_BASE_URL}/topicos/${selectedTopico.id}/subtopicos`)
        .then(res => res.json())
        .then(data => setSubtopicos(data))
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar os subtópicos.'))
        .finally(() => setIsLoadingSubtopicos(false));
    }
  }, [selectedTopico]);

  const handleSelectArea = (area: ItemCurriculo) => {
    setSelectedArea(area);
    setSelectedDisciplina(null); setSelectedTopico(null); setSelectedSubtopico(null);
    setDisciplinas([]); setTopicos([]); setSubtopicos([]); setQuestoes([]); setRespostasSelecionadas({}); setFeedback({});
  };

  const handleSelectDisciplina = (disciplina: ItemCurriculo) => {
    setSelectedDisciplina(disciplina);
    setSelectedTopico(null); setSelectedSubtopico(null);
    setTopicos([]); setSubtopicos([]); setQuestoes([]); setRespostasSelecionadas({}); setFeedback({});
  };

  const handleSelectTopico = (topico: ItemCurriculo) => {
    setSelectedTopico(topico);
    setSelectedSubtopico(null);
    setSubtopicos([]); setQuestoes([]); setRespostasSelecionadas({}); setFeedback({});
  };

  const handleGerarQuestoes = async () => {
    if (!selectedArea || !selectedDisciplina || !selectedTopico || !selectedSubtopico) {
      Alert.alert('Seleção Incompleta', 'Selecione todas as quatro opções.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/${selectedArea.id}/${selectedDisciplina.id}/${selectedTopico.id}/${selectedSubtopico.id}/gerar`);
      if (!res.ok) throw new Error('Falha ao buscar exercícios');
      const data = await res.json();
      setQuestoes(data.questoes || []);
      setRespostasSelecionadas({});
      setFeedback({});
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar questões.');
    }
  };

  const limparSelecaoCompleta = () => {
    setSelectedArea(null); setSelectedDisciplina(null); setSelectedTopico(null); setSelectedSubtopico(null);
    setDisciplinas([]); setTopicos([]); setSubtopicos([]); setQuestoes([]); setRespostasSelecionadas({}); setFeedback({});
  };

  const handleLogout = () => signOut(auth).catch(err => console.log(err));

  // --- NOVO: Corrigir questões e mostrar resposta correta ---
  const handleCorrigirQuestoes = async () => {
    if (questoes.length === 0) {
      Alert.alert('Nenhuma questão', 'Gere as questões antes de corrigir.');
      return;
    }

    const respostas = Object.entries(respostasSelecionadas).map(([questaoId, resposta]) => ({
      idQuestao: Number(questaoId),
      resposta
    }));

    if (respostas.length === 0) {
      Alert.alert('Nenhuma resposta', 'Selecione ao menos uma alternativa.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/corrigir/unica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas })
      });

      if (!res.ok) throw new Error('Erro na correção');

      const data: FeedbackUnico[] = await res.json();
      const novoFeedback: Record<number, FeedbackUnico> = {};
      data.forEach(f => { novoFeedback[f.idQuestao] = f; });
      setFeedback(novoFeedback);

      Alert.alert('Correção concluída', 'As respostas corretas agora estão destacadas.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível corrigir as questões.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={require('../assets/corinthians.png')} style={styles.headerImage} resizeMode="cover" />
      <Text style={styles.subtitle}>Gere aqui exercícios sobre o tema que você quiser</Text>
      <Text style={styles.emailText}>Logado como: {auth.currentUser?.email}</Text>

      <View style={styles.row}>
        {/* Áreas */}
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

        {/* Disciplinas */}
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

        {/* Tópicos */}
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

        {/* Subtópicos */}
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
              {Object.entries(questao.alternativas).map(([letra, texto]) => {
                const selecionada = respostasSelecionadas[questao.id] === letra;
                const correta = feedback[questao.id]?.respostaSugerida === letra;
                return (
                  <TouchableOpacity
                    key={letra}
                    style={[
                      styles.alternativaBotao,
                      selecionada && styles.alternativaSelecionada,
                      feedback[questao.id] && correta && styles.alternativaCorreta,
                      feedback[questao.id] && selecionada && !correta && styles.alternativaIncorreta,
                    ]}
                    onPress={() => handleSelectAlternativa(questao.id, letra)}
                    disabled={!!feedback[questao.id]} // bloqueia após correção
                  >
                    <Text
                      style={[
                        styles.alternativaTexto,
                        selecionada && styles.alternativaTextoSelecionada,
                        feedback[questao.id] && correta && styles.alternativaTextoCorreta,
                        feedback[questao.id] && selecionada && !correta && styles.alternativaTextoIncorreta,
                      ]}
                    >
                      <Text style={{ fontWeight: 'bold' }}>{letra}) </Text>
                      {texto}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {feedback[questao.id] && !feedback[questao.id].correta && (
              <Text style={styles.feedbackDetalhe}>
                Resposta correta: {feedback[questao.id].respostaSugerida}
                {feedback[questao.id].feedbackDetalhado ? `\nDetalhes: ${feedback[questao.id].feedbackDetalhado}` : ''}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity style={[styles.actionButton, { marginTop: 20 }]} onPress={handleCorrigirQuestoes}>
          <Text style={styles.actionButtonText}>Corrigir Questões</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- ESTILOS ADICIONAIS PARA CORREÇÃO ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerImage: { width: '100%', height: 150, alignSelf: 'center', marginBottom: 10, borderRadius: 8 },
  subtitle: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  emailText: { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  column: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, width: '48%', marginVertical: 8, minHeight: 150 },
  columnTitle: { textAlign: 'center', fontWeight: 'bold', color: '#444', marginBottom: 10 },
  button: { backgroundColor: '#e9e9e9', borderRadius: 6, padding: 10, marginVertical: 4, borderWidth: 1, borderColor: 'transparent' },
  buttonSelected: { backgroundColor: '#007bff', borderColor: '#0056b3' },
  buttonText: { textAlign: 'center', color: '#333' },
  buttonTextSelected: { color: '#fff', fontWeight: 'bold' },
  placeholder: { textAlign: 'center', color: '#999', marginTop: 8, fontStyle: 'italic' },
  footer: { marginTop: 20, alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  summaryTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  summaryText: { marginVertical: 8, textAlign: 'center', color: '#555' },
  buttonRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  actionButton: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  clearButton: { backgroundColor: '#ffc107' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  questoesContainer: { marginTop: 20 },
  questaoCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  questaoHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#007bff' },
  textoBase: { fontStyle: 'italic', color: '#555', marginBottom: 10, lineHeight: 20 },
  enunciado: { fontWeight: '600', color: '#333', marginBottom: 12, lineHeight: 22 },
  alternativasContainer: { marginLeft: 10 },
  alternativaBotao: { padding: 10, marginVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9' },
  alternativaSelecionada: { backgroundColor: '#007bff', borderColor: '#0056b3' },
  alternativaTexto: { color: '#333' },
  alternativaTextoSelecionada: { color: '#fff', fontWeight: 'bold' },
  alternativaCorreta: { backgroundColor: '#28a745', borderColor: '#1c7430' },
  alternativaIncorreta: { backgroundColor: '#dc3545', borderColor: '#a71d2a' },
  alternativaTextoCorreta: { color: '#fff', fontWeight: 'bold' },
  alternativaTextoIncorreta: { color: '#fff', fontWeight: 'bold' },
  feedbackDetalhe: { marginTop: 5, fontStyle: 'italic', color: '#555' },
});
