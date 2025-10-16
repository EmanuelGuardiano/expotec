// App.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { onAuthStateChanged, User } from 'firebase/auth';
import { View, Text } from 'react-native';
// Tipagem do Drawer
export type DrawerParamList = {
  Menu: undefined;
  Exercicios: undefined;
  Vestibulares: undefined;
  Professores: undefined;
  Sobre_nos: undefined;
  Relatorios: undefined;
  
};

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CadastroScreen from './screens/CadastroScreen';
import { auth } from './firebaseConfig';
import ExerciciosScreen from './screens/ExerciciosScreen';

// --- Tipagem ---
type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  HomeDrawer: undefined;
};



// --- Navegadores ---
const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// --- Drawer com menu burger ---
function HomeDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Menu">
      <Drawer.Screen name="Menu" component={HomeScreen} options={{ title: 'Tela Inicial' }}/>
      <Drawer.Screen name="Exercicios" component={ExerciciosScreen} options={{ title: 'Exercicios' }}/>
      <Drawer.Screen name="Vestibulares" component={HomeScreen} options={{ title: 'Vestibulares' }}/>
      <Drawer.Screen name="Professores" component={HomeScreen} options={{ title: 'Professores' }}/>
      <Drawer.Screen name="Sobre_nos" component={HomeScreen} options={{ title: 'Sobre nos' }}/>
      <Drawer.Screen name="Relatorios" component={HomeScreen} options={{ title: 'Relatorios' }}/>
    </Drawer.Navigator>
    

  );
}



// --- App principal ---
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
