import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator } from "react-native";
  import { LinearGradient } from 'expo-linear-gradient';


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validForm = () => {
    let valid = true;
    const errors = {email: '', password: ''}
    if (!email) {
      errors.email = 'Email requis'
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email invalide';
      valid = false;
    }

    if (!password) {
      errors.password = 'Mot de passe requis';
      valid = false;
    } else if (password.length < 6) {
      errors.password = 'Minimum 6 caractères';
      valid = false;
    }

    setErrors(errors)
    return valid;
  }

   const handleLogin = () => {
    if (validForm()) {
      setIsLoading(true);
      // Simuler une requête API
      setTimeout(() => {
        setIsLoading(false);
        console.log('Connexion réussie avec:', email);
        // Ici vous navigueriez vers l'écran d'accueil
      }, 1500);
    }
  };

  return (
    <LinearGradient 
      colors={['#4c669f', '#3b5998', '#192f6a']} 
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.logoContainer}>
          {<Image 
            source={require('../../../assets/logo.png')} // Créez un dossier assets avec votre logo
            style={styles.logo}
          />}
          <Text style={styles.title}>Connexion</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Champ Email */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

          {/* Champ Mot de passe */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

          {/* Bouton Mot de passe oublié */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Bouton Connexion */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OU</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Options alternatives */}
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#fff" />
            <Text style={styles.socialButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          {/* Inscription */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Vous n'avez pas de compte ?</Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}> S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 25,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  separatorText: {
    color: '#fff',
    marginHorizontal: 10,
    fontSize: 16,
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#fff',
  },
  signupLink: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
});
