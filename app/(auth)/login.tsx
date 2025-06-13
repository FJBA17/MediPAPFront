import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Linking,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { CheckBox } from "@rneui/themed";
import { LinearGradient } from 'expo-linear-gradient';
// Corregir la ruta del store de autorización
import { useAutorizacionStore } from "../../src/store/Autorizacion/Autorizacion.store";
import CustomAlert from "../../src/components/CustomAlert";
import VersionDisplay from "../../src/components/VersionAPP";

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isGuardarStorage, setIsGuardarStorage] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Usar el store de autorización
  const { signIn, alertVisible, alertTitle, hideAlert, status } = useAutorizacionStore();

  useEffect(() => {
    loadLoginData();
  }, []);

  // Agregar un efecto para redirigir cuando el estado cambie a autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace("/(drawer)/home");
    }
  }, [status, router]);

  const loadLoginData = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem("username");
      const savedPassword = await AsyncStorage.getItem("password");
      const savedIsGuardar = await AsyncStorage.getItem("isGuardarStorage");

      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        setIsGuardarStorage(savedIsGuardar === "true");
      }
    } catch (error) {
      console.log("Error en el login:", error);
    }
  };

  const toggleCheckBox = () => {
    setIsGuardarStorage(!isGuardarStorage);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    try {
      // Utilizar la función signIn del store para autenticación
      await signIn(username, password);

      // Si la autenticación fue exitosa, guardar credenciales si está marcada la opción
      if (isGuardarStorage) {
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("password", password);
        await AsyncStorage.setItem("isGuardarStorage", "true");
      } else {
        await AsyncStorage.removeItem("username");
        await AsyncStorage.removeItem("password");
        await AsyncStorage.removeItem("isGuardarStorage");
      }
      
      // La navegación ahora se maneja en el useEffect que monitorea el estado 'status'
    } catch (error) {
      // El manejo de errores ya se hace en el store
      console.log("Error en el login:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleRecuperarContrasena = () => {
    // Actualización de la ruta para coincidir con la estructura de Expo Router
    router.push("./RecuperarContrasena");
  };

  return (
    <KeyboardAvoidingView
      
      style={styles.container}
    >
      <LinearGradient
        colors={['#b52e69', 'white']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <ImageBackground
              style={styles.logo}
              resizeMode="contain"
              source={require("../../src/assets/Login/ImagenLogo.png")}
            />
            <Text style={styles.welcomeTitle}>MediPAP</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            
              {/* Username Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Usuario"
                    placeholderTextColor="#abaaad"
                    value={username.toLowerCase()}
                    onChangeText={(text) => {
                      const formattedUsername = text.trim().replace(/\s+/g, " ");
                      setUsername(formattedUsername);
                    }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.modernInput, { paddingRight: 50 }]}
                    placeholder="Contraseña"
                    placeholderTextColor="#abaaad"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#a33d69"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me */}
              <View style={styles.rememberSection}>
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={toggleCheckBox}
                >
                  <View style={[styles.customCheckbox, isGuardarStorage && styles.customCheckboxChecked]}>
                    {isGuardarStorage && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Recordar credenciales</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRecuperarContrasena}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <LinearGradient
                  colors={['#b52e69', '#b52e69']}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </LinearGradient>
              </TouchableOpacity>
            
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.zdad-informaticos.com")}
          >
            <Text style={styles.footerText}>
              Creado por www.zdad-informaticos.com
            </Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>
            <VersionDisplay />
          </Text>
        </View>

        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          onConfirm={hideAlert}
          confirmText="OK"
          showCancelButton={false}
        />
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  gradient: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  spacer: {
    flex: 1,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Form Section
  formSection: {
    paddingHorizontal: 20,
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ebc7d6',
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#1f0a12',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    color: '#a33d69',
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f0a12',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 5,
    position: 'absolute',
    right: 15,
  },

  // Remember Section
  rememberSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCheckboxChecked: {
    backgroundColor: '#b52e69',
    borderColor: 'white',
  },
  rememberText: {
    fontSize: 14,
    color: '#b52e69',
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#b52e69',
    fontWeight: '600',
  },

  // Login Button
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#a33d69',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  loginButtonGradient: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Footer Section
  footerSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom : 20
  },
  footerText: {
    color: '#b52e69',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    color: '#b52e69',
    fontSize: 12,
  },
});