import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { DrawerParamList } from '../App';

type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Menu'>;

export default function RelatoriosScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLogout = () => {
    signOut(auth).catch(error => console.log('Erro no Logout:', error));
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>resumos</Text>
      <Text style={styles.emailText}>Logado como: {auth.currentUser?.email}</Text>
      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
    emailText: { fontSize: 16, marginVertical: 20 },
});