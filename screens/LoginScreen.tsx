import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableOpacity,} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email !== '' && password !== '') {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => console.log('Login sucesso!'))
        .catch((error) => Alert.alert('Erro no Login', error.message));
    } else {
      Alert.alert('Atenção', 'Preencha todos os campos!');
    }
  };

  const handleCadastro = () => {
    navigation.navigate('Cadastro');
  };

  return (
   <View style={styles.container}>
      <Text style={styles.title}>SAVE</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      
      <View style={styles.buttonContainer}>
  <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
    <Text style={styles.buttonText}>Entrar</Text>
  </TouchableOpacity>

    
  <TouchableOpacity style={styles.cadastroButton} onPress={handleCadastro}>
    <Text style={styles.cadastroText}>Cadastrar</Text>
  </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9faf4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  buttonContainer: {
  marginTop: 10,
  flexDirection: 'row',
  justifyContent: 'center',
},

loginButton: {
  backgroundColor: '#007bff',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  width: '30%',
  marginRight: 10,
  alignItems: 'center',
},

cadastroButton: {
  backgroundColor: '#007bff',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  width: '30%',
  alignItems: 'center',
},

buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

cadastroText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  },
});