import React, { useState } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,ScrollView,Alert,Image,Dimensions } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { DrawerParamList } from '../App';

type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Menu'>;

// Captura a largura da tela
const { width } = Dimensions.get('window');

export default function ExerciciosScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(null);
  const [selectedTopico, setSelectedTopico] = useState<string | null>(null);
  const [selectedSubtopico, setSelectedSubtopico] = useState<string | null>(null);

  const areas = ['Ciências Humanas', 'Ciências da Natureza', 'Matemática', 'Linguagens'];

  const disciplinasByArea: Record<string, string[]> = {
    'Ciências Humanas': ['História', 'Geografia', 'Filosofia'],
    'Ciências da Natureza': ['Biologia', 'Química', 'Física'],
    Matemática: ['Álgebra', 'Geometria', 'Estatística'],
    Linguagens: ['Português', 'Inglês', 'Literatura'],
  };

  const topicsByDisciplina: Record<string, string[]> = {
    História: ['Era Vargas', 'Período Colonial'],
    Geografia: ['Clima', 'Relevo'],
    Biologia: ['Célula', 'Evolução'],
    Química: ['Tabelas', 'Reações'],
    Física: ['Mecânica', 'Óptica'],
    Álgebra: ['Equações', 'Funções'],
    Geometria: ['Triângulos', 'Circunferência'],
    Estatística: ['Média', 'Probabilidade'],
    Português: ['Gramática', 'Interpretação'],
    Inglês: ['Leitura', 'Listening'],
    Literatura: ['Romantismo', 'Modernismo'],
  };

  const subtopicsByTopic: Record<string, string[]> = {
    Equações: ['1º Grau', '2º Grau'],
    Funções: ['Afim', 'Quadrática'],
    Célula: ['Organelas', 'Divisão Celular'],
  };

  const disciplinas = selectedArea ? disciplinasByArea[selectedArea] || [] : [];
  const topicos = selectedDisciplina ? topicsByDisciplina[selectedDisciplina] || [] : [];
  const subtopicos = selectedTopico ? subtopicsByTopic[selectedTopico] || [] : [];

  const handleLogout = () => {
    signOut(auth).catch(error => console.log('Erro no Logout:', error));
  };

  const handleGerarQuestoes = () => {
    Alert.alert('Gerar Questões', 'Aqui você chamaria a lógica para gerar as questões.');
  };

  return (
      /* Cabeçalho com imagem */
    <><Image
        source={require('../assets/exercicios.jpeg')}
        style={styles.headerImage}
        resizeMode="cover"
      />
<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      

      <Text style={styles.subtitle}>Gere aqui exercícios sobre o tema que você quiser</Text>
      <Text style={styles.emailText}>Logado como: {auth.currentUser?.email}</Text>

      {/* Seletor de áreas */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Selecione a área de conhecimento</Text>
          {areas.map(area => (
            <TouchableOpacity
              key={area}
              style={[styles.button, selectedArea === area && styles.buttonSelected]}
              onPress={() => {
                setSelectedArea(area);
                setSelectedDisciplina(null);
                setSelectedTopico(null);
                setSelectedSubtopico(null);
              }}
            >
              <Text>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disciplina */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Selecione a disciplina</Text>
          {disciplinas.length > 0 ? (
            disciplinas.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.button, selectedDisciplina === d && styles.buttonSelected]}
                onPress={() => {
                  setSelectedDisciplina(d);
                  setSelectedTopico(null);
                  setSelectedSubtopico(null);
                }}
              >
                <Text>{d}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholder}>Escolha uma área</Text>
          )}
        </View>

        {/* Tópico */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Selecione o tópico</Text>
          {topicos.length > 0 ? (
            topicos.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.button, selectedTopico === t && styles.buttonSelected]}
                onPress={() => {
                  setSelectedTopico(t);
                  setSelectedSubtopico(null);
                }}
              >
                <Text>{t}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholder}>Selecione uma disciplina</Text>
          )}
        </View>

        {/* Subtópico */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Selecione o subtópico</Text>
          {subtopicos.length > 0 ? (
            subtopicos.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.button, selectedSubtopico === s && styles.buttonSelected]}
                onPress={() => setSelectedSubtopico(s)}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholder}>Selecione um tópico</Text>
          )}
        </View>
      </View>

      {/* Resumo e Ações */}
      <View style={styles.footer}>
        <Text style={styles.summaryTitle}>Resumo da seleção:</Text>
        <Text style={styles.summaryText}>
          Área: {selectedArea || '—'} • Disciplina: {selectedDisciplina || '—'} •
          Tópico: {selectedTopico || '—'} • Subtópico: {selectedSubtopico || '—'}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleGerarQuestoes}>
            <Text>Gerar Questões</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedArea(null);
              setSelectedDisciplina(null);
              setSelectedTopico(null);
              setSelectedSubtopico(null);
            }}
          >
            <Text>Limpar Seleção</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.arrow}>⬇️</Text>
        <Text style={styles.placeholder}>Aqui esta suas questões</Text>

        
      </View>
    </ScrollView></>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerImage: {
    width: width,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  subtitle: { textAlign: 'center', fontSize: 16, marginVertical: 8 },
  emailText: { textAlign: 'center', fontSize: 14, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  column: {
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 4,
    padding: 8,
    width: '45%',
    marginVertical: 8,
  },
  columnTitle: { textAlign: 'center', fontWeight: '600', marginBottom: 8 },
  button: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    padding: 6,
    marginVertical: 4,
  },
  buttonSelected: { backgroundColor: '#d3d3d3' },
  placeholder: { textAlign: 'center', color: '#777', marginTop: 8 },
  footer: { marginTop: 20, alignItems: 'center' },
  summaryTitle: { fontWeight: 'bold', fontSize: 16 },
  summaryText: { marginVertical: 4, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  actionButton: {
    borderWidth: 2,
    borderColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  arrow: { 
    fontSize: 30,
    marginTop: 20 },
});
