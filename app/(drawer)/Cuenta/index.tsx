import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { FontFamily, FontSize, Color, Border, Padding } from "../../../src/theme/GlobalStyles";
import { Usuario } from '../../../src/interfaces/usuario.interface';
import { useAutorizacionStore } from '../../../src/store/Autorizacion/Autorizacion.store';
import { useShallow } from 'zustand/react/shallow';
import PasswordCambioForm from '../../../src/components/PasswordCambioForm';
import AdminPasswordCambioForm from '../../../src/components/AdminPasswordCambioForm';
import CustomAlert from '../../../src/components/CustomAlert';

const validateName = (value: string) => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/;
  return nameRegex.test(value);
};

const UsuarioSchema = Yup.object().shape({
  email: Yup.string()
  .email('Email inválido')
  .required('Email requerido')
  .test('no-emojis', 'El email no puede contener emojis o caracteres especiales', (value) => {
    if (!value) return true;
    const emailRegex = /^[a-zA-Z0-9@._-]*$/;
    return emailRegex.test(value);
  }),

  nombre: Yup.string()
  .required('Nombre requerido')
  .min(3, 'El nombre debe tener al menos 3 caracteres')
  .max(50, 'El nombre no puede tener más de 50 caracteres')
  .test('only-letters', 'El nombre solo puede contener letras y espacios', validateName),

  apellido: Yup.string()
  .required('Apellido requerido')
  .min(3, 'El apellido debe tener al menos 3 caracteres')
  .max(50, 'El apellido no puede tener más de 50 caracteres')
  .test('only-letters', 'El apellido solo puede contener letras y espacios', validateName),

  isAdmin: Yup.boolean()
  .required()
});

const trimFields = (values) => {
  return {
    ...values,
    email: values.email.replace(/\s+/g, ''),
  };
};

interface UsuarioEditarProps {
  usuario: Usuario;
  onUsuarioEditado: (usuarioActualizado: Usuario) => void;
  origenNavegacion: 'menu' | 'listaUsuarios';
}

export default function UsuarioEditar({ 
  usuario: initialUsuario, 
  onUsuarioEditado, 
  origenNavegacion 
}: UsuarioEditarProps) {
  const [usuario, setUsuario] = useState(initialUsuario || useAutorizacionStore(useShallow(state => state.user)));
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const actualizarUsuarioGlobal = useAutorizacionStore(state => state.actualizarUsuario);
  const usuarioActual = useAutorizacionStore(useShallow(state => state.user));
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const editarUsuario = async (values, { setSubmitting }) => {
    const formattedValues = trimFields(values);
    try {
      await MedicionesApi.put(`/usuarios/${usuario.userName}`, formattedValues);

      const usuarioActualizado = { ...usuario, ...formattedValues };
      setUsuario(usuarioActualizado);

      if (usuarioActual.userName === usuario.userName) {
        actualizarUsuarioGlobal(usuarioActualizado);
      }

      setAlertMessage('Perfil actualizado exitosamente');
      setAlertVisible(true);

      if (onUsuarioEditado) {
        onUsuarioEditado(usuarioActualizado);
      }
    } catch (error) {
      setError('Error al editar el usuario');
      setAlertMessage('Error al actualizar el perfil');
      setAlertVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <LinearGradient
        colors={['#b52e69', 'white']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={50} color="white" />
            </View>
            <Text style={styles.welcomeTitle}>Mi Cuenta</Text>
            <Text style={styles.welcomeSubtitle}>Gestiona tu información personal</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Formik
              initialValues={{
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                isAdmin: usuario.isAdmin
              }}
              validationSchema={UsuarioSchema}
              onSubmit={editarUsuario}
              enableReinitialize
            >
              {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
                <View>
                  {error ? <Text style={styles.globalErrorText}>{error}</Text> : null}

                  {/* Username Field (Read-only) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Usuario</Text>
                    <View style={[styles.inputWrapper, styles.disabledInput]}>
                      <Ionicons name="person-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.modernInput, styles.disabledInputText]}
                        editable={false}
                        value={usuario.userName}
                        placeholder="Usuario"
                        placeholderTextColor="#abaaad"
                      />
                      <Ionicons name="lock-closed-outline" size={16} color="#abaaad" />
                    </View>
                  </View>

                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modernInput}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        placeholder="Email"
                        placeholderTextColor="#abaaad"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Nombre Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nombre</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modernInput}
                        onChangeText={handleChange('nombre')}
                        onBlur={handleBlur('nombre')}
                        value={values.nombre}
                        placeholder="Nombre"
                        placeholderTextColor="#abaaad"
                      />
                    </View>
                    {touched.nombre && errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
                  </View>

                  {/* Apellido Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Apellido</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                      <TextInput
                        style={styles.modernInput}
                        onChangeText={handleChange('apellido')}
                        onBlur={handleBlur('apellido')}
                        value={values.apellido}
                        placeholder="Apellido"
                        placeholderTextColor="#abaaad"
                      />
                    </View>
                    {touched.apellido && errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
                  </View>

                  {/* Admin Switch */}
                  {usuarioActual?.isAdmin && (
                    <View style={styles.switchSection}>
                      <View style={styles.switchContainer}>
                        <View style={styles.switchInfo}>
                          <Ionicons name="shield-checkmark-outline" size={20} color="#a33d69" />
                          <Text style={styles.switchLabel}>Administrador</Text>
                        </View>
                        <Switch
                          value={values.isAdmin}
                          onValueChange={(value) => setFieldValue('isAdmin', value)}
                          trackColor={{ false: '#ebc7d6', true: '#b52e69' }}
                          thumbColor={values.isAdmin ? '#fff' : '#abaaad'}
                          ios_backgroundColor="#ebc7d6"
                        />
                      </View>
                      <Text style={styles.switchDescription}>
                        Los administradores tienen acceso completo al sistema
                      </Text>
                    </View>
                  )}

                  {/* Password Change Section */}
                  <View style={styles.passwordSection}>
                    <TouchableOpacity
                      style={styles.passwordToggleButton}
                      onPress={() => setShowPasswordChange(!showPasswordChange)}
                    >
                      <View style={styles.passwordToggleContent}>
                        <View style={styles.passwordToggleLeft}>
                          <Ionicons name="key-outline" size={20} color="#a33d69" />
                          <Text style={styles.passwordToggleText}>Cambiar contraseña</Text>
                        </View>
                        <Ionicons 
                          name={showPasswordChange ? "chevron-up-outline" : "chevron-down-outline"} 
                          size={20} 
                          color="#a33d69" 
                        />
                      </View>
                    </TouchableOpacity>

                    {showPasswordChange && (
                      <View style={styles.passwordFormContainer}>
                        {(origenNavegacion === 'menu' || usuarioActual.userName === usuario.userName) ? (
                          <PasswordCambioForm
                            onPasswordChanged={() => {
                              setShowPasswordChange(false);
                              setAlertMessage('Contraseña cambiada exitosamente');
                              setAlertVisible(true);
                            }}
                          />
                        ) : (
                          <AdminPasswordCambioForm
                            userName={usuario.userName}
                            onPasswordChanged={() => {
                              setShowPasswordChange(false);
                              setAlertMessage('Contraseña cambiada exitosamente por el administrador');
                              setAlertVisible(true);
                            }}
                          />
                        )}
                      </View>
                    )}
                  </View>

                  {/* Update Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, isSubmitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <LinearGradient
                      colors={isSubmitting ? ['#ccc', '#ccc'] : ['#b52e69', '#b52e69']}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="save-outline" size={20} color="white" style={styles.buttonIcon} />
                      <Text style={styles.actionButtonText}>
                        {isSubmitting ? 'Actualizando...' : 'Actualizar Perfil'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        <CustomAlert
          visible={alertVisible}
          title={alertMessage}
          onConfirm={() => setAlertVisible(false)}
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
  scrollContent: {
    flexGrow: 1,
  },
  spacer: {
    flex: 1,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 30,
  },
  avatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
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
    marginBottom: 20,
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f0a12',
    marginBottom: 8,
    marginLeft: 5,
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
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
  disabledInputText: {
    color: '#abaaad',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
  globalErrorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    padding: 10,
    borderRadius: 8,
  },

  // Switch Section
  switchSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ebc7d6',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f0a12',
    marginLeft: 8,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginLeft: 28,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Password Section
  passwordSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ebc7d6',
    marginBottom : 20,
  },
  passwordToggleButton: {
    padding: 15,
  },
  passwordToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f0a12',
    marginLeft: 8,
  },
  passwordFormContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ebc7d6',
    padding: 15,
  },
});