import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { MedicionesApi } from '../../src/config/api/medicionesApi';
import { Color, Padding, FontFamily, Border, FontSize } from "../../src/theme/GlobalStyles";
import CustomAlert from '../../src/components/CustomAlert';
import axios from 'axios';
import { router } from 'expo-router';

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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Input
              placeholder="Nombre de Usuario"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError('');
              }}
              autoCapitalize="none"
              disabled={loading}
              containerStyle={styles.inputContainer}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              errorStyle={styles.errorText}
              errorMessage={error}
            />
            <Button
              title="Enviar Código de Verificación"
              onPress={handleSendVerificationCode}
              loading={loading}
              disabled={loading || !username}
              buttonStyle={styles.button}
              titleStyle={styles.buttonText}
              containerStyle={styles.buttonContainer}
            />
          </>
        );
      case 2:
        return (
          <>
            <Input
              placeholder="Código de Verificación"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              disabled={loading}
              containerStyle={styles.inputContainer}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              errorStyle={styles.errorText}
              errorMessage={error}
            />
            <Button
              title="Validar Código"
              onPress={handleValidateCode}
              loading={loading}
              disabled={loading || !code}
              buttonStyle={styles.button}
              titleStyle={styles.buttonText}
              containerStyle={styles.buttonContainer}
            />
          </>
        );
      case 3:
        return (
          <>
            <Input
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              disabled={loading}
              containerStyle={styles.inputContainer}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              errorStyle={styles.errorText}
              errorMessage={error}
            />
            <Button
              title="Restablecer Contraseña"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading || !newPassword}
              buttonStyle={styles.button}
              titleStyle={styles.buttonText}
              containerStyle={styles.buttonContainer}
            />
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        {renderStep()}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver al Inicio de Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        onConfirm={() => {
          setAlertVisible(false);
          if (step === 3) router.replace('/login');
        }}
        confirmText={alertConfirmText}
        showCancelButton={false}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Padding.p_base,
  },
  title: {
    fontSize: FontSize.size_lg,
    fontFamily: FontFamily.publicSansBold,
    marginBottom: Padding.p_base,
    textAlign: 'center',
    color: Color.colorBlack,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: Padding.p_base,
  },
  inputContainerStyle: {
    borderWidth: 1,
    borderColor : '#d87093',
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    paddingHorizontal: Padding.p_3xs,
  },
  inputStyle: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
  errorText: {
    color: Color.colorPalevioletred_100,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
  },
  buttonContainer: {
    marginBottom: Padding.p_base,
  },
  button: {
    backgroundColor: Color.colorPink,
    borderRadius: Border.br_xs,
    padding: Padding.p_3xs,
  },
  buttonText: {
    fontFamily: FontFamily.publicSansBold,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: Color.colorPlum,
    fontFamily: FontFamily.publicSansMedium,
    fontSize: FontSize.size_base,
  },
});