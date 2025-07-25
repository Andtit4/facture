import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  useColorScheme
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { AuthApi } from "../infrastructure/AuthApi";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", confirmPassword: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [username, setUsername] = useState("");
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Couleurs adaptatives selon le thème
  const getGradientColors = () => {
    if (isDark) {
      return ['#1a1a2e', '#16213e', '#0f3460'];
    } else {
      return ['#4c669f', '#3b5998', '#192f6a'];
    }
  };

  const validForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };
    
    if (!email.trim()) {
      newErrors.email = 'Email requis';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Email invalide';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validForm()) {
      return;
    }

    setIsLoading(true);
    setShowError(false);
    setErrorMessage("");

    try {
      const response = await AuthApi.login(email.trim(), password);
      
      if (response?.access_token) {
        await AsyncStorage.setItem('token', response.access_token);
        router.navigate('/home/presentation/HomeScreen');
      } else {
        setShowError(true);
        setErrorMessage('Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setShowError(true);
      setErrorMessage('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Mot de passe oublié",
      "Fonctionnalité en cours de développement",
      [{ text: "OK" }]
    );
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      "Connexion Google",
      "Fonctionnalité en cours de développement",
      [{ text: "OK" }]
    );
  };

  const handleLogin = () => {
    try {
      console.log('Navigation vers l\'inscription');
      router.replace('/login/presentation/Login');
    } catch (error) {
      console.error('Erreur navigation vers inscription:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Connexion</Text>
            </View>

            {/* Message d'erreur global */}
            {showError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            )}

            <View style={[
              styles.formContainer,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)' }
            ]}>
                 <View style={styles.inputContainer}>
                <View style={[
                  styles.inputGroup,
                  errors.email ? styles.inputGroupError : null
                ]}>
                  <Ionicons name="person-outline" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={isDark ? "#ccc" : "#aaa"}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                     /*  if (errors.username) {
                        setErrors(prev => ({ ...prev, username: "" }));
                      } */
                    }}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
              </View>

              {/* Champ Email */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputGroup,
                  errors.email ? styles.inputGroupError : null
                ]}>
                  <Ionicons name="mail-outline" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={isDark ? "#ccc" : "#aaa"}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: "" }));
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
              </View>

              {/* Champ Mot de passe */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputGroup,
                  errors.password ? styles.inputGroupError : null
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor={isDark ? "#ccc" : "#aaa"}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: "" }));
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                 
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
              </View>
                {/* Champ Confirmation Mot de passe */}
                 <View style={styles.inputContainer}>
                <View style={[
                  styles.inputGroup,
                  errors.confirmPassword ? styles.inputGroupError : null
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmation Mot de passe"
                    placeholderTextColor={isDark ? "#ccc" : "#aaa"}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}
              </View>
             

              

              {/* Bouton Connexion */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Inscription...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>S'inscrire</Text>
                )}
              </TouchableOpacity>

              {/* Séparateur */}
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>OU</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Options alternatives */}
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={24} color="#fff" />
                <Text style={styles.socialButtonText}>Continuer avec Google</Text>
              </TouchableOpacity>

              {/* Inscription */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Vous avez déjà un compte ?</Text>
                <TouchableOpacity 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.signupLink,
                    isLoading && styles.signupLinkDisabled
                  ]}>
                    {" "}Se connecter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#ff6b6b',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  errorMessage: {
    color: '#ff6b6b',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  formContainer: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  inputGroupError: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0, // Fix pour Android
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    padding: 5,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    /* shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84, */
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(74, 144, 226, 0.6)',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
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
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  signupText: {
    color: '#fff',
    fontSize: 14,
  },
  signupLink: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signupLinkDisabled: {
    opacity: 0.6,
  },
});