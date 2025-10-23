import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Dimensions, 
  ImageSourcePropType, 
  TouchableOpacity,
  Linking 
} from 'react-native';

interface Player {
  name: string;
  img: ImageSourcePropType; 
  subject: string;
  link?: string;
  role: 'professor' | 'aluno';
}

const players: Player[] = [
  { name: 'Guilherme Miguel', img: require('../assets/save.jpeg'), subject: 'Matemática', role: 'professor' },
  { name: 'Sandro Curió', img: require('../assets/Sandro_curio.jpg'), subject: 'Matemática', link: 'https://www.youtube.com/@sandrocuriodicasdemat', role: 'professor' },
  { name: 'Professor Noslen', img: require('../assets/Noslen.jpg'), subject: 'Português', link: 'https://www.youtube.com/@ProfessorNoslen', role: 'professor' },
  { name: 'Gabriel Cabral', img: require('../assets/cabral.jpg'), subject: 'Química', link: 'https://www.youtube.com/@ProfessorGabrielCabral', role: 'professor' },
  { name: 'Química do Monstro', img: require('../assets/monstro.jpg'), subject: 'Química', link: 'https://www.youtube.com/c/QU%C3%8DMICADOMONSTRO', role: 'professor' },
  { name: 'Débora Aladim', img: require('../assets/debora.jpg'), subject: 'História', link: 'https://www.youtube.com/@deboraaladim', role: 'professor' },
  { name: 'Samuel Cunha', img: require('../assets/samuel.jpg'), subject: 'Biologia', link: 'https://www.youtube.com/@professorsamuelcunha', role: 'professor' },
  { name: 'Thais Formagio', img: require('../assets/thais.jpg'), subject: 'Geografia', link: 'https://www.youtube.com/@profthaisformagio', role: 'professor' },
  { name: 'Profinho', img: require('../assets/profinho.webp'), subject: 'Redação', link: 'https://www.youtube.com/@Profinho', role: 'professor' },
  { name: 'Umberto Mannarino', img: require('../assets/umberto.jpg'), subject: 'Física', link: 'https://www.youtube.com/@umbertomann', role: 'professor' },
];

const professores: Player[] = players.filter(p => p.role === 'professor');

interface CardProps {
  player: Player; 
}

const Card: React.FC<CardProps> = ({ player }) => {
  const handlePress = () => {
    if (player.link) {
      Linking.openURL(player.link).catch(err => console.error('Erro ao abrir o link:', err));
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={player.link ? 0.7 : 1}>
      <Image source={player.img} style={styles.image} />
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.subject}>{player.subject}</Text>
    </TouchableOpacity>
  );
};

export default function SobreScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Professores</Text>
      <Text style={styles.subtitle}>Clique na foto para abrir o canal no YouTube 🎓</Text>
      
      <Text style={styles.sectionTitle}>Professores</Text>
      <View style={styles.grid}>
        {professores.map((player, index) => (
          <Card key={`prof-${index}`} player={player} />
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
    height: 220,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    margin: 6,
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
    marginTop: 5,
  },
  subject: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
  },
});
