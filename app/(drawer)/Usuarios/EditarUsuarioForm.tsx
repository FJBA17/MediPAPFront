import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { useAutorizacionStore } from '../../../src/store/index';
import { useShallow } from 'zustand/react/shallow';
import PasswordCambioForm from '../../../src/components/PasswordCambioForm';
import AdminPasswordCambioForm from '../../../src/components/AdminPasswordCambioForm';

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

interface Usuario {
  userName: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaCreacion?: string;
  isAdmin: boolean;
}

interface EditarUsuarioFormProps {
  usuario: Usuario;
  onUsuarioEditado: () => void;
  origenNavegacion: 'menu' | 'listaUsuarios';
}

const EditarUsuarioForm: React.FC<EditarUsuarioFormProps> = ({
  usuario: initialUsuario,
  onUsuarioEditado,
  origenNavegacion
}) => {
  const [usuario, setUsuario] = useState(initialUsuario);
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const actualizarUsuarioGlobal = useAutorizacionStore(state => state.actualizarUsuario);
  const usuarioActual = useAutorizacionStore(useShallow(state => state.user));

  const editarUsuario = async (values, { setSubmitting }) => {
    const formattedValues = trimFields(values);
    try {
      await MedicionesApi.put(`/usuarios/${usuario.userName}`, formattedValues);

      const usuarioActualizado = { ...usuario, ...formattedValues };
      setUsuario(usuarioActualizado);

      if (usuarioActual?.userName === usuario.userName) {
        actualizarUsuarioGlobal(usuarioActualizado);
      }

      setSuccessMessage('Perfil actualizado exitosamente');
      
      // Mostrar mensaje de éxito y luego finalizar
      setTimeout(() => {
        if (onUsuarioEditado) {
          onUsuarioEditado();
        }
      }, 1500);
    } catch (error) {
      setError('Error al editar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowPasswordChange(false);
    setSuccessMessage(origenNavegacion === 'menu' ? 
      'Contraseña cambiada exitosamente' : 
      'Contraseña cambiada exitosamente por el administrador');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      
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
              <Text style={styles.buttonText}>{isSubmitting ? 'Actualizando...' : 'Actualizar Usuario'}</Text>
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
            onPasswordChanged={handlePasswordChanged}
          />
        ) : (
          <AdminPasswordCambioForm
            userName={usuario.userName}
            onPasswordChanged={handlePasswordChanged}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    padding: Padding.p_base,
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
  },
  errorText: {
    color: Color.colorPalevioletred_100,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    marginBottom: Padding.p_5xs,
  },
  successText: {
    color: 'green',
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    marginBottom: Padding.p_5xs,
    textAlign: 'center',
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

export default EditarUsuarioForm;