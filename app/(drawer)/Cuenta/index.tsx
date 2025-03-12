import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { FontFamily, FontSize, Color, Border, Padding } from "../../../src/theme/GlobalStyles";
import { Usuario } from '../../../src/interfaces/usuario.interface';
import { useAutorizacionStore } from '../../../src/store/Autorizacion/Autorizacion.store'; // Ruta actualizada
import { useShallow } from 'zustand/react/shallow';
import PasswordCambioForm from '../../../src/components/PasswordCambioForm';
import AdminPasswordCambioForm from '../../../src/components/AdminPasswordCambioForm';
import CustomAlert from '../../../src/components/CustomAlert';

const UsuarioSchema = Yup.object().shape({
  email: Yup.string().email('Email inválido').required('Email requerido'),
  nombre: Yup.string().required('Nombre requerido'),
  apellido: Yup.string().required('Apellido requerido'),
  isAdmin: Yup.boolean().required()
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
    <View style={styles.container}>
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
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              editable={false}
              value={usuario.userName}
            />

            <TextInput
              style={styles.input}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              placeholder="Email"
              keyboardType="email-address"
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              onChangeText={handleChange('nombre')}
              onBlur={handleBlur('nombre')}
              value={values.nombre}
              placeholder="Nombre"
            />
            {touched.nombre && errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

            <TextInput
              style={styles.input}
              onChangeText={handleChange('apellido')}
              onBlur={handleBlur('apellido')}
              value={values.apellido}
              placeholder="Apellido"
            />
            {touched.apellido && errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}

            {usuarioActual?.isAdmin && (
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Es Administrador:</Text>
                <Switch
                  value={values.isAdmin}
                  onValueChange={(value) => setFieldValue('isAdmin', value)}
                  trackColor={{ false: Color.colorLavenderblush, true: Color.colorPink }}
                  thumbColor={values.isAdmin ? Color.colorPlum : Color.colorGrey}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Actualizar Usuario</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPasswordChange(!showPasswordChange)}
      >
        <Text style={styles.buttonText}>
          {showPasswordChange ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
        </Text>
      </TouchableOpacity>

      {showPasswordChange && (
        origenNavegacion === 'menu' ? (
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
        )
      )}

      <CustomAlert
        visible={alertVisible}
        title={alertMessage}
        onConfirm={() => setAlertVisible(false)}
        confirmText="OK"
        showCancelButton={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Padding.p_base,
    backgroundColor: Color.colorLavenderblush,
    borderRadius: Border.br_xs,
  },
  input: {
    height: 40,
    borderColor: Color.colorThistle,
    borderWidth: 1,
    marginBottom: Padding.p_5xs,
    paddingHorizontal: Padding.p_3xs,
    borderRadius: Border.br_xs,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
    backgroundColor : 'white'
  },
  errorText: {
    color: Color.colorPalevioletred_100,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    marginBottom: Padding.p_5xs,
  },
  button: {
    backgroundColor: Color.colorPlum,
    padding: Padding.p_3xs,
    alignItems: 'center',
    borderRadius: Border.br_xs,
    marginTop: Padding.p_base,
  },
  buttonText: {
    color: Color.colorWhite,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansMedium,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Padding.p_3xs,
  },
  switchLabel: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
});