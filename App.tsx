import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { onAuthStateChanged, User } from 'firebase/auth';
import { View, Text } from 'react-native';
import CustomDrawer from './CustomDrawer';

// Tipagem do Drawer
export type DrawerParamList = {
  Menu: undefined;
  Exercicios: undefined;
  Vestibulares: undefined;
  Professores: undefined;
  Sobre_nos: undefined;
  Relatorios: undefined;
  Sair: undefined;
  
};

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CadastroScreen from './screens/CadastroScreen';
import { auth } from './firebaseConfig';
import ExerciciosScreen from './screens/ExerciciosScreen';
import VestibularesScreen from './screens/VestibulatresScreen';
import ProfessoresScreen from './screens/ProfessoresScreen';
import SobreScreen from './screens/SobreScreen';
import ResumoScreen from './screens/RelatoriosScreen';
import RelatoriosScreen from './screens/RelatoriosScreen';

// --- Tipagem ---
type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  HomeDrawer: undefined;
};



//Navegadores
const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

//Drawer com menu burger
function HomeDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Menu"
      drawerContent={(props) => <CustomDrawer {...props} />} // 👈 usa o menu customizado
    >
      <Drawer.Screen name="Menu" component={HomeScreen} options={{ title: 'Tela Inicial' }} />
      <Drawer.Screen name="Exercicios" component={ExerciciosScreen} options={{ title: 'Exercícios' }} />
      <Drawer.Screen name="Vestibulares" component={VestibularesScreen} options={{ title: 'Vestibulares' }} />
      <Drawer.Screen name="Professores" component={ProfessoresScreen} options={{ title: 'Professores' }} />
      <Drawer.Screen name="Sobre_nos" component={SobreScreen} options={{ title: 'Sobre Nós' }} />
      <Drawer.Screen name="Relatorios" component={RelatoriosScreen} options={{ title: 'Relatórios' }} />
    </Drawer.Navigator>
  );
}

// App principal
export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Quando logado, mostramos o Drawer
          <Stack.Screen name="HomeDrawer" component={HomeDrawer} />
        ) : (
          // Quando deslogado, mostramos login/cadastro
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
