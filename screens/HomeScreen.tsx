import React from 'react';
import { View, Text, Button, StyleSheet, Image, Dimensions } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { DrawerParamList } from '../App';

type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Menu'>;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLogout = () => {
    signOut(auth).catch(error => console.log('Erro no Logout:', error));
  };

  return (
    <View style={styles.container}>
      {/* Imagem no topo */}
      <Image
        source={require('../assets/save.jpeg')} // coloque sua imagem aqui
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Conteúdo da tela */}
      <View style={styles.content}>
        <Text style={styles.title}>Tela Principal</Text>
        <Text style={styles.emailText}>Logado como: {auth.currentUser?.email}</Text>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: width,
    height: 150, // você pode ajustar pra 200 ou 250 se quiser um banner maior
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  emailText: {
    fontSize: 16,
    marginVertical: 20,
  },
});
