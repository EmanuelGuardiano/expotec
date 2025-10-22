import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, ImageSourcePropType } from 'react-native';

interface Player {
  name: string;
  img: ImageSourcePropType; 
  role: 'professor' | 'aluno';
}

const players: Player[] = [
  { name: 'Prof. Alessandro', img: require('../assets/save.jpeg'), role: 'professor' },
  { name: 'Prof. Raphael', img: require('../assets/save.jpeg'), role: 'professor' },
  { name: 'Prof. Leandro', img: require('../assets/save.jpeg'), role: 'professor' },
  { name: 'Prof. Renan', img: require('../assets/save.jpeg'), role: 'professor' },
  { name: 'Pedro Henrique', img: require('../assets/save.jpeg'), role: 'aluno' },
  { name: 'Emanuel Santos', img: require('../assets/save.jpeg'), role: 'aluno' },
  { name: 'Vinicius Rodrigues', img: require('../assets/save.jpeg'), role: 'aluno' },
  { name: 'Thiago Alves', img: require('../assets/save.jpeg'), role: 'aluno' },
  { name: 'Miguel', img: require('../assets/save.jpeg'), role: 'aluno' },
  { name: 'Julio Cessar', img: require('../assets/save.jpeg'), role: 'aluno' },
  { name: 'Lucas', img: require('../assets/save.jpeg'), role: 'aluno' },
  { name: 'Raphael Ramires', img: require('../assets/save.jpeg'), role: 'aluno' },
];

const professores: Player[] = players.filter(p => p.role === 'professor');
const alunos: Player[] = players.filter(p => p.role === 'aluno');

interface CardProps {
    player: Player; 
}

const Card: React.FC<CardProps> = ({ player }) => (
    <View style={styles.card}>
        <Image source={player.img} style={styles.image} />
        <Text style={styles.name}>{player.name}</Text>
    </View>
);

export default function SobreScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Nossa Sala</Text>
      <Text style={styles.subtitle}>"Queremos ser garotos de programa"</Text>
      
      {/* --- Seção de Professores --- */}
      <Text style={styles.sectionTitle}>Professores</Text>
      <View style={styles.grid}>
        {professores.map((player, index) => (
          <Card key={`prof-${index}`} player={player} />
        ))}
      </View>

      {/* --- Seção de Alunos --- */}
      <Text style={styles.sectionTitle}>Alunos</Text>
      <View style={styles.grid}>
        {alunos.map((player, index) => (
          <Card key={`aluno-${index}`} player={player} />
        ))}
      </View>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}


const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#FFFF',
  },
  mainTitle: {
    fontSize: 28,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
 
  sectionTitle: { 
    fontSize: 22,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 5,
    alignSelf: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8, 
  },
  card: {
    width: 150,
    height: 200,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    margin: 4,
  },
  image: {
    width: '100%', 
    height: 150, 
    resizeMode: 'cover',
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 5,
  },
});