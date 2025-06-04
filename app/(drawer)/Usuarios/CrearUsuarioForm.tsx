import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';


// Función para validar que solo contenga letras, números y algunos caracteres especiales básicos
const validateAlphanumeric = (value: string) => {
  const alphanumericRegex = /^[a-zA-Z0-9\s._-]*$/;
  return alphanumericRegex.test(value);
};

// Función para validar nombres (solo letras y espacios)
const validateName = (value: string) => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/;
  return nameRegex.test(value);
};

// Función para validar username (letras, números, guiones y guiones bajos)
const validateUsername = (value: string) => {
  const usernameRegex = /^[a-zA-Z0-9_-]*$/;
  return usernameRegex.test(value);
};


const UsuarioSchema = Yup.object().shape({
  userName: Yup.string()
    .lowercase('El nombre de usuario debe estar en minúsculas')
    .required('Usuario requerido')
    .min(3,'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .test('alphanumeric', 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos', validateUsername),
    
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

  password: Yup.string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .required('Contraseña requerida')
  .test('alphanumeric', 'La contraseña solo puede contener letras, números y algunos caracteres especiales básicos', validateAlphanumeric),

  isAdmin: Yup.boolean()
  .required()
});

const trimFields = (values: { userName: string; email: string; nombre: string; apellido: string; }) => {
  return {
    ...values,
    userName: values.userName.replace(/\s+/g, '').toLowerCase(),
    email: values.email.replace(/\s+/g, ''),
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
  };
};

interface CrearUsuarioFormProps {
  onUsuarioCreado: () => void;
}

const CrearUsuarioForm: React.FC<CrearUsuarioFormProps> = ({ onUsuarioCreado }) => {
  const crearUsuario = async (values, { setSubmitting, resetForm }) => {
    const formattedValues = trimFields(values);
    try {
      await MedicionesApi.post('/usuarios', formattedValues);
      resetForm();
      if (onUsuarioCreado) {
        onUsuarioCreado();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ userName: '', email: '', nombre: '', apellido: '', password: '', isAdmin: false }}
      validationSchema={UsuarioSchema}
      onSubmit={crearUsuario}
    >
      {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange('userName')(text.toLowerCase())}
            onBlur={handleBlur('userName')}
            value={values.userName.toLowerCase()}
            placeholder="Nombre de usuario"
            placeholderTextColor="#bbbbbb"
            autoCapitalize="none"
          />
          {touched.userName && errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}

          <TextInput
            style={styles.input}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
            placeholder="Email"
            placeholderTextColor="#bbbbbb"
            keyboardType="email-address"
          />
          {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={styles.input}
            onChangeText={handleChange('nombre')}
            onBlur={handleBlur('nombre')}
            value={values.nombre}
            placeholder="Nombre"
            placeholderTextColor="#bbbbbb"
          />
          {touched.nombre && errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <TextInput
            style={styles.input}
            onChangeText={handleChange('apellido')}
            onBlur={handleBlur('apellido')}
            value={values.apellido}
            placeholder="Apellido"
            placeholderTextColor="#bbbbbb"
          />
          {touched.apellido && errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}

          <TextInput
            style={styles.input}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            placeholder="Contraseña"
            placeholderTextColor="#bbbbbb"
            secureTextEntry
          />
          {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Es Administrador:</Text>
            <Switch
              value={values.isAdmin}
              onValueChange={(value) => setFieldValue('isAdmin', value)}
              trackColor={{ false: Color.colorLavenderblush, true: Color.colorPink }}
              thumbColor={values.isAdmin ? Color.colorPlum : Color.colorGrey}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Creando...' : 'Crear Usuario'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
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

export default CrearUsuarioForm;