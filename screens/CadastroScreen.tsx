import React, { useState } from 'react';
import {View, TextInput, StyleSheet, Text, Alert, } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { TouchableOpacity } from 'react-native';
import { auth } from '../firebaseConfig';

export default function CadastroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  
  const handleCadastro = () => {
    if (email !== '' && password !== '') {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => console.log('Cadastrado com sucesso!'))
        .catch((error) => Alert.alert('Erro no cadastro', error.message));
    }
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastra-se no projeto</Text>

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
  <TouchableOpacity style={styles.loginButton} onPress={handleCadastro}>
    <Text style={styles.buttonText}>Cadastre-se</Text>
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
    backgroundColor: '#fafbfdf4',
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
},

loginButton: {
  backgroundColor: '#007bff',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 5,
  alignItems: 'center',
},

cadastroButton: {
  marginTop: 8,
  paddingVertical: 6,
  paddingHorizontal: 12,
  alignSelf: 'flex-start',
  backgroundColor: '#007bff',
  borderRadius: 4,
},

buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

cadastroText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
  },
});
