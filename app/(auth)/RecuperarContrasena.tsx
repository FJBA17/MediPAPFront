import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ImageBackground,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MedicionesApi } from '../../src/config/api/medicionesApi';
import CustomAlert from '../../src/components/CustomAlert';
import VersionDisplay from '../../src/components/VersionAPP';
import axios from 'axios';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function RecuperarContrasena() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertConfirmText, setAlertConfirmText] = useState('OK');
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const validateUsername = (username) => username.length >= 3;
  const validateCode = (code) => code.length === 6;
  const validatePassword = (password) => password.length >= 8;

  const handleSendVerificationCode = async () => {
    if (!validateUsername(username)) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await MedicionesApi.post('/mail/send-verification-code', { userName: username });
      setAlertTitle('Se ha enviado un código de verificación a tu correo');
      setAlertConfirmText('OK');
      setAlertVisible(true);
      setStep(2);
      setError('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'No se pudo enviar el código. Verifica el nombre de usuario e intenta de nuevo.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleValidateCode = async () => {
    if (!validateCode(code)) {
      setError('El código debe tener 6 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await MedicionesApi.post('/mail/validar-codigo', { userName: username, code });
      setTempToken(response.data.tempToken);
      setStep(3);
      setError('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Código inválido. Intenta de nuevo.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!validatePassword(newPassword)) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await MedicionesApi.post('/mail/restablecer-password', {
        userName: username,
        tempToken,
        newPassword
      });
      setAlertTitle('Tu contraseña ha sido restablecida con éxito');
      setAlertConfirmText('Volver al inicio de sesión');
      setAlertVisible(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'No se pudo restablecer la contraseña. Intenta de nuevo.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Ingresa tu usuario";
      case 2:
        return "Código de verificación";
      case 3:
        return "Nueva contraseña";
      default:
        return "Recuperar Contraseña";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Te enviaremos un código de verificación";
      case 2:
        return "Revisa tu correo electrónico";
      case 3:
        return "Crea una nueva contraseña segura";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                <TextInput
                  style={styles.modernInput}
                  placeholder="Nombre de Usuario"
                  placeholderTextColor="#abaaad"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setError('');
                  }}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            
            <TouchableOpacity 
              style={[styles.actionButton, loading && styles.disabledButton]} 
              onPress={handleSendVerificationCode}
              disabled={loading || !username}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : ['#b52e69', '#b52e69']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <Text style={styles.actionButtonText}>Enviando...</Text>
                ) : (
                  <Text style={styles.actionButtonText}>Enviar Código</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                <TextInput
                  style={styles.modernInput}
                  placeholder="Código de Verificación"
                  placeholderTextColor="#abaaad"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text.toUpperCase());
                    setError('');
                  }}
                  autoCapitalize="characters"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            
            <TouchableOpacity 
              style={[styles.actionButton, loading && styles.disabledButton]} 
              onPress={handleValidateCode}
              disabled={loading || !code}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : ['#b52e69', '#b52e69']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <Text style={styles.actionButtonText}>Validando...</Text>
                ) : (
                  <Text style={styles.actionButtonText}>Validar Código</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                <TextInput
                  style={[styles.modernInput, { paddingRight: 50 }]}
                  placeholder="Nueva Contraseña"
                  placeholderTextColor="#abaaad"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError('');
                  }}
                  secureTextEntry={secureTextEntry}
                  editable={!loading}
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
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            
            <TouchableOpacity 
              style={[styles.actionButton, loading && styles.disabledButton]} 
              onPress={handleResetPassword}
              disabled={loading || !newPassword}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : ['#b52e69', '#b52e69']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <Text style={styles.actionButtonText}>Restableciendo...</Text>
                ) : (
                  <Text style={styles.actionButtonText}>Restablecer Contraseña</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
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
            <Text style={styles.welcomeTitle}>Recuperar Contraseña</Text>
            <Text style={styles.stepTitle}>{getStepTitle()}</Text>
            <Text style={styles.stepDescription}>{getStepDescription()}</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {renderStep()}
            
            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>
                <Ionicons name="arrow-back-outline" size={16} color="#b52e69" /> 
                {" "}Volver al Inicio de Sesión
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Creado por www.zdad-informaticos.com
          </Text>
          <Text style={styles.versionText}>
            <VersionDisplay />
          </Text>
        </View>

        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          onConfirm={() => {
            setAlertVisible(false);
            if (step === 3 && alertTitle.includes('restablecida con éxito')) {
              router.replace('/login');
            }
          }}
          confirmText={alertConfirmText}
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
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
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
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },

  // Action Button
  actionButton: {
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
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonGradient: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Back Button
  backButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#b52e69',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Footer Section
  footerSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
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