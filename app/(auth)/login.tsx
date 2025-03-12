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
// Corregir la ruta del store de autorización
import { useAutorizacionStore } from "../../src/store/Autorizacion/Autorizacion.store";
import CustomAlert from "../../src/components/CustomAlert";
import VersionDisplay from "../../src/components/VersionAPP";

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.backgroundContainer}>
          <ImageBackground
            style={styles.backgroundImage}
            resizeMode="contain"
            source={require("../../src/assets/Login/ImagenLogo.png")}
          />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              value={username.toLowerCase()}
              onChangeText={(text) => {
                const formattedUsername = text.trim().replace(/\s+/g, " ");
                setUsername(formattedUsername);
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <CheckBox
              containerStyle={styles.checkbox}
              checked={isGuardarStorage}
              checkedColor="#d87093" // Color.colorPalevioletred_100
              onPress={toggleCheckBox}
            />
            <TouchableOpacity onPress={toggleCheckBox}>
              <Text style={styles.checkboxText}>Recordar credenciales</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleRecuperarContrasena}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Acceder</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footerContainer}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f0f5", // Equivalente a Color.colorLavenderblush
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  spacer: {
    flex: 1,
  },
  backgroundContainer: {
    marginTop: 40,
    height: Dimensions.get("window").height * 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width: 400,
    height: 400,
    
  },
  formContainer: {
    padding: 16,
    backgroundColor: "#f8f0f5",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#000", // Color.colorBlack
    fontWeight: "500", // FontFamily.publicSansMedium
    fontSize: 16, // FontSize.size_base
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#d8bfd8", // Similar a Color.colorThistle
    borderRadius: 8, // Border.br_xs
    paddingHorizontal: 10,
    backgroundColor: "#fff", // Color.colorWhite
    color: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d8bfd8",
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passwordInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 10,
    color: "#000",
  },
  iconContainer: {
    padding: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    marginRight: 8,
  },
  checkboxText: {
    color: "#db7093", // Similar a Color.colorPalevioletred_100
    fontWeight: "400", // FontFamily.publicSansRegular
    fontSize: 16, // FontSize.size_base
  },
  forgotPassword: {
    color: "#db7093",
    fontSize: 14,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#ffb6c1", // Similar a Color.colorPink
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: "#000", // Color.colorBlack
    fontWeight: "bold", // FontFamily.publicSansBold
    fontSize: 16, // FontSize.size_base
  },
  footerContainer: {
    padding: 8, // Padding.p_xs
    backgroundColor: "#f8f0f5",
    borderTopWidth: 1,
    borderTopColor: "#d8bfd8", // Color.colorThistle
    alignItems: "center",
  },
  footerText: {
    color: "#808080", // Color.colorGrey
    fontWeight: "500", // FontFamily.publicSansMedium
    fontSize: 14, // FontSize.size_sm
    textAlign: "center",
  },
  versionText: {
    color: "#808080",
    fontWeight: "400", // FontFamily.publicSansRegular
    fontSize: 14, // FontSize.size_sm
    marginTop: 10,
  },
});