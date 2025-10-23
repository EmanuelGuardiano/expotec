import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';

// =================================================================
// TYPE DEFINITIONS
// =================================================================
interface ItemCurriculo { id: number; nome: string; }
interface Questao { id: number; textoBase: string | null; enunciado: string; alternativas: Record<string, string>; }
interface FeedbackUnico { questaoId: number; correta: boolean; respostaSugerida: string; feedbackDetalhado?: string; }
type LoadingState = { areas: boolean; disciplinas: boolean; topicos: boolean; subtopicos: boolean; questoes: boolean; correcao: boolean; };
const API_BASE_URL = 'http://localhost:8080/api/exercicios';

// =================================================================
// MAIN COMPONENT
// =================================================================
export default function ExerciciosScreen() {
  // --- STATE MANAGEMENT ---
  const [areas, setAreas] = useState<ItemCurriculo[]>([]);
  const [disciplinas, setDisciplinas] = useState<ItemCurriculo[]>([]);
  const [topicos, setTopicos] = useState<ItemCurriculo[]>([]);
  const [subtopicos, setSubtopicos] = useState<ItemCurriculo[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);

  const [selectedArea, setSelectedArea] = useState<ItemCurriculo | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<ItemCurriculo | null>(null);
  const [selectedTopico, setSelectedTopico] = useState<ItemCurriculo | null>(null);
  const [selectedSubtopico, setSelectedSubtopico] = useState<ItemCurriculo | null>(null);

  const [respostasSelecionadas, setRespostasSelecionadas] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, FeedbackUnico>>({});

  const [isLoading, setIsLoading] = useState<LoadingState>({
    areas: true, disciplinas: false, topicos: false, subtopicos: false, questoes: false, correcao: false,
  });

  // --- HELPERS ---
  const updateLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetarQuestoes = () => {
    setQuestoes([]);
    setRespostasSelecionadas({});
    setFeedback({});
  };

  // --- DATA FETCHING ---
  const fetchData = useCallback(async <T>(url: string, key: keyof LoadingState, setData: React.Dispatch<React.SetStateAction<T[]>>) => {
    updateLoading(key, true);
    setData([]);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Falha na rede ao buscar ${key}`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      Alert.alert('Erro de Conexão', (error as Error).message);
    } finally {
      updateLoading(key, false);
    }
  }, [updateLoading]);

  useEffect(() => { fetchData(`${API_BASE_URL}/areas`, 'areas', setAreas); }, [fetchData]);

  useEffect(() => {
    if (selectedArea?.id) { fetchData(`${API_BASE_URL}/areas/${selectedArea.id}/materias`, 'disciplinas', setDisciplinas); }
    else { setDisciplinas([]); }
  }, [selectedArea, fetchData]);
  
  useEffect(() => {
    if (selectedDisciplina?.id) { fetchData(`${API_BASE_URL}/materias/${selectedDisciplina.id}/topicos`, 'topicos', setTopicos); }
    else { setTopicos([]); }
  }, [selectedDisciplina, fetchData]);

  useEffect(() => {
    if (selectedTopico?.id) { fetchData(`${API_BASE_URL}/topicos/${selectedTopico.id}/subtopicos`, 'subtopicos', setSubtopicos); }
    else { setSubtopicos([]); }
  }, [selectedTopico, fetchData]);

  // --- EVENT HANDLERS ---
  const handleSelectArea = (area: ItemCurriculo) => {
    setSelectedArea(area); setSelectedDisciplina(null); setSelectedTopico(null); setSelectedSubtopico(null);
    resetarQuestoes();
  };
  const handleSelectDisciplina = (disciplina: ItemCurriculo) => {
    setSelectedDisciplina(disciplina); setSelectedTopico(null); setSelectedSubtopico(null);
    resetarQuestoes();
  };
  const handleSelectTopico = (topico: ItemCurriculo) => {
    setSelectedTopico(topico); setSelectedSubtopico(null);
    resetarQuestoes();
  };
  
  const handleGerarQuestoes = useCallback(async () => {
    if (!selectedArea || !selectedDisciplina || !selectedTopico || !selectedSubtopico) {
      Alert.alert('Seleção Incompleta', 'Selecione todas as quatro opções.'); return;
    }
    updateLoading('questoes', true); resetarQuestoes();
    const url = `${API_BASE_URL}/${selectedArea.id}/${selectedDisciplina.id}/${selectedTopico.id}/${selectedSubtopico.id}/gerar`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao gerar questões no servidor.');
      const data = await response.json();
      console.log("[GERAÇÃO] Questões recebidas:", data);
      setQuestoes(data.questoes || []);
    } catch (error) {
      Alert.alert('Erro', (error as Error).message);
    } finally {
      updateLoading('questoes', false);
    }
  }, [selectedArea, selectedDisciplina, selectedTopico, selectedSubtopico, updateLoading]);

  const handleCorrigirQuestoes = useCallback(async () => {
    const respostasArray = Object.entries(respostasSelecionadas).map(([questaoId, resposta]) => ({
      questaoId: Number(questaoId), resposta,
    }));
    if (respostasArray.length === 0) {
      Alert.alert('Nenhuma Resposta', 'Selecione pelo menos uma alternativa.'); return;
    }
    console.log("[CORREÇÃO] Enviando payload:", JSON.stringify(respostasArray, null, 2));
    updateLoading('correcao', true);
    try {
      const response = await fetch(`${API_BASE_URL}/corrigir/multiplas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(respostasArray),
      });
      const data: FeedbackUnico[] = await response.json();
      console.log(`[CORREÇÃO] Resposta recebida (Status ${response.status}):`, data);
      if (!response.ok) {
        throw new Error(`O servidor respondeu com status ${response.status}.`);
      }
      if (!data || data.length === 0) {
        Alert.alert('Correção Vazia', 'O servidor processou a requisição, mas não retornou feedbacks. Tente gerar novas questões.');
        return;
      }
      const novoFeedback = data.reduce((acc, f) => ({ ...acc, [f.questaoId]: f }), {});
      console.log("[CORREÇÃO] Estado de feedback será atualizado para:", novoFeedback);
      setFeedback(novoFeedback);
    } catch (error) {
      console.error("[CORREÇÃO] Erro na requisição:", error);
      Alert.alert('Erro ao Corrigir', (error as Error).message);
    } finally {
      updateLoading('correcao', false);
    }
  }, [respostasSelecionadas, updateLoading]);

  // --- RENDER ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image source={require('../assets/exercicios.jpeg')} style={styles.headerImage} />
      <Text style={styles.title}>Gerador de Exercícios</Text>
      <Text style={styles.subtitle}>Selecione o conteúdo e pratique com questões geradas por IA.</Text>

      <View style={styles.selectionGrid}>
        <SelectionColumn title="Área" items={areas} selectedItem={selectedArea} onSelectItem={handleSelectArea} isLoading={isLoading.areas} />
        <SelectionColumn title="Disciplina" items={disciplinas} selectedItem={selectedDisciplina} onSelectItem={handleSelectDisciplina} isLoading={isLoading.disciplinas} isEnabled={!!selectedArea} />
        <SelectionColumn title="Tópico" items={topicos} selectedItem={selectedTopico} onSelectItem={handleSelectTopico} isLoading={isLoading.topicos} isEnabled={!!selectedDisciplina} />
        <SelectionColumn title="Subtópico" items={subtopicos} selectedItem={selectedSubtopico} onSelectItem={setSelectedSubtopico} isLoading={isLoading.subtopicos} isEnabled={!!selectedTopico} />
      </View>

      <ActionFooter
          selection={{ selectedArea, selectedDisciplina, selectedTopico, selectedSubtopico }}
          onGerar={handleGerarQuestoes}
          onLimpar={() => {
            setSelectedArea(null); setSelectedDisciplina(null); setSelectedTopico(null); setSelectedSubtopico(null);
            resetarQuestoes();
          }}
          isLoading={isLoading.questoes}
      />
      
      {isLoading.questoes && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 30 }} />}
      
      {questoes.length > 0 && (
        <View style={styles.questoesContainer}>
          {questoes.map((questao, index) => (
            <QuestaoCard
              key={questao.id}
              questao={questao}
              index={index}
              respostaSelecionada={respostasSelecionadas[questao.id]}
              onSelectAlternativa={(letra) => setRespostasSelecionadas(prev => ({ ...prev, [questao.id]: letra }))}
              feedback={feedback[questao.id]}
              isCorrecaoLoading={isLoading.correcao}
            />
          ))}
          <ActionButton text="Corrigir Questões" onPress={handleCorrigirQuestoes} isLoading={isLoading.correcao} style={{ marginTop: 20 }}/>
        </View>
      )}
    </ScrollView>
  );
}

// =================================================================
// SUB-COMPONENTS (Não precisam de alteração)
// =================================================================
const ActionFooter = ({ selection, onGerar, onLimpar, isLoading }: any) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>Sua seleção:</Text>
    <Text style={styles.summaryText} numberOfLines={2}>
      {selection.selectedArea?.nome || '...'} / {selection.selectedDisciplina?.nome || '...'} / {selection.selectedTopico?.nome || '...'} / {selection.selectedSubtopico?.nome || '...'}
    </Text>
    <View style={styles.buttonRow}>
      <ActionButton text="Gerar Questões" onPress={onGerar} isLoading={isLoading} style={{flex: 1}}/>
      <ActionButton text="Limpar" onPress={onLimpar} variant="secondary" style={{flex: 0.6}}/>
    </View>
  </View>
);
const SelectionColumn = ({ title, items, selectedItem, onSelectItem, isLoading, isEnabled = true }: any) => (
  <View style={styles.column}>
    <Text style={styles.columnTitle}>{title}</Text>
    {isLoading ? <ActivityIndicator color="#007bff" /> : (
      !isEnabled ? <Text style={styles.placeholder}>Selecione a coluna anterior</Text> :
      items.length > 0 ? items.map((item: ItemCurriculo) => (
        <TouchableOpacity key={item.id} style={[styles.button, selectedItem?.id === item.id && styles.buttonSelected]} onPress={() => onSelectItem(item)}>
          <Text style={[styles.buttonText, selectedItem?.id === item.id && styles.buttonTextSelected]}>{item.nome}</Text>
        </TouchableOpacity>
      )) : <Text style={styles.placeholder}>Vazio</Text>
    )}
  </View>
);
const QuestaoCard = ({ questao, index, respostaSelecionada, onSelectAlternativa, feedback, isCorrecaoLoading }: any) => (
  <View style={styles.questaoCard}>
    <Text style={styles.questaoHeader}>Questão {index + 1}</Text>
    {questao.textoBase && <Text style={styles.textoBase}>{questao.textoBase}</Text>}
    <Text style={styles.enunciado}>{questao.enunciado}</Text>
    <View>
      {Object.entries(questao.alternativas).map(([letra, texto]) => {
        const isSelected = respostaSelecionada === letra;
        const isCorrectAnswer = feedback?.respostaSugerida === letra;
        const isWrongSelection = isSelected && feedback && !feedback.correta;
        return (
          <TouchableOpacity key={letra}
            style={[
              styles.alternativaBotao,
              isSelected && !feedback && styles.alternativaSelecionada,
              isCorrectAnswer && styles.alternativaCorreta,
              isWrongSelection && styles.alternativaIncorreta,
            ]}
            onPress={() => onSelectAlternativa(letra)}
            disabled={!!feedback || isCorrecaoLoading}>
            <Text style={[styles.alternativaTexto, (isCorrectAnswer || isWrongSelection) && styles.alternativaTextoCorrigida]}>
              <Text style={{ fontWeight: 'bold' }}>{letra}) </Text>{texto}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
    {feedback && !feedback.correta && (
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackDetalhe}>
          <Text style={{fontWeight: 'bold'}}>Resposta Correta: {feedback.respostaSugerida}. </Text>
          {feedback.feedbackDetalhado || ''}
        </Text>
      </View>
    )}
  </View>
);
const ActionButton = ({ text, onPress, isLoading = false, variant = 'primary', style }: any) => (
  <TouchableOpacity style={[styles.actionButton, variant === 'secondary' && styles.clearButton, style]} onPress={onPress} disabled={isLoading}>
    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>{text}</Text>}
  </TouchableOpacity>
);

// =================================================================
// STYLESHEET (Não precisa de alteração)
// =================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  contentContainer: { padding: 16, paddingBottom: 50 },
  headerImage: { width: '100%', height: 150, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1a2530' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#6c757d', marginBottom: 20 },
  selectionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  column: { width: '48.5%', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e9ecef', minHeight: 180 },
  columnTitle: { fontSize: 16, fontWeight: 'bold', color: '#343a40', textAlign: 'center', marginBottom: 10 },
  placeholder: { color: '#6c757d', textAlign: 'center', fontStyle: 'italic', paddingTop: 10 },
  button: { paddingVertical: 10, paddingHorizontal: 6, borderRadius: 6, marginVertical: 4 },
  buttonSelected: { backgroundColor: '#007bff' },
  buttonText: { color: '#343a40', textAlign: 'center' },
  buttonTextSelected: { color: '#fff', fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 16, borderWidth: 1, borderColor: '#e9ecef' },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#343a40' },
  summaryText: { color: '#6c757d', marginVertical: 8, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionButton: { backgroundColor: '#28a745', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  clearButton: { backgroundColor: '#ffc107' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  questoesContainer: { marginTop: 10 },
  questaoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e9ecef' },
  questaoHeader: { fontSize: 18, fontWeight: 'bold', color: '#007bff', marginBottom: 12 },
  textoBase: { fontStyle: 'italic', color: '#6c757d', marginBottom: 10, lineHeight: 22, borderLeftWidth: 3, paddingLeft: 10, borderLeftColor: '#007bff40' },
  enunciado: { fontSize: 16, color: '#212529', lineHeight: 24, fontWeight: '500', marginBottom: 15 },
  alternativaBotao: { padding: 14, marginVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#ced4da', backgroundColor: '#f8f9fa' },
  alternativaSelecionada: { backgroundColor: '#cfe2ff', borderColor: '#0d6efd' },
  alternativaCorreta: { backgroundColor: '#d1e7dd', borderColor: '#198754' },
  alternativaIncorreta: { backgroundColor: '#f8d7da', borderColor: '#dc3545' },
  alternativaTexto: { fontSize: 15, color: '#212529' },
  alternativaTextoCorrigida: { fontWeight: '500' },
  feedbackContainer: { marginTop: 15, padding: 12, backgroundColor: '#fff3cd', borderRadius: 8, borderWidth: 1, borderColor: '#ffeeba' },
  feedbackDetalhe: { color: '#664d03' },
});