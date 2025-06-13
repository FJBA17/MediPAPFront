import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Modal,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { useAutorizacionStore } from '../../../src/store/index';
import { useShallow } from 'zustand/react/shallow';
import PasswordCambioForm from '../../../src/components/PasswordCambioForm';
import AdminPasswordCambioForm from '../../../src/components/AdminPasswordCambioForm';
import { Icons } from '../../../src/components/Icons';
import { StatusBar } from 'expo-status-bar';

interface Unidad {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

interface Usuario {
  userName: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaCreacion?: string;
  isAdmin: boolean;
  unidad?: Unidad;
  unidadId?: number;
}

interface EditarUsuarioFormProps {
  usuario: Usuario;
  onUsuarioEditado: () => void;
  origenNavegacion: 'menu' | 'listaUsuarios';
}

// Función para validar nombres (solo letras y espacios)
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
  
  isAdmin: Yup.boolean().required(),
  
  unidadId: Yup.number()
  .nullable()
  .notRequired()
});

const trimFields = (values) => {
  return {
    ...values,
    email: values.email.replace(/\s+/g, ''),
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
  };
};

const EditarUsuarioForm: React.FC<EditarUsuarioFormProps> = ({
  usuario: initialUsuario,
  onUsuarioEditado,
  origenNavegacion
}) => {
  const [usuario, setUsuario] = useState(initialUsuario);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargandoUnidades, setCargandoUnidades] = useState(true);
  const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(initialUsuario.unidad || null);
  const [isUnidadModalVisible, setIsUnidadModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Animaciones para el modal
  const modalY = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  const actualizarUsuarioGlobal = useAutorizacionStore(state => state.actualizarUsuario);
  const usuarioActual = useAutorizacionStore(useShallow(state => state.user));

  useEffect(() => {
    cargarUnidades();
  }, []);

  const cargarUnidades = async () => {
    try {
      const response = await MedicionesApi.get('/unidades/activas');
      setUnidades(response.data);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      setUnidades([]);
    } finally {
      setCargandoUnidades(false);
    }
  };

  const openUnidadModal = () => {
    if (!usuarioActual?.isAdmin) return; // Solo admin puede cambiar unidades
    
    setIsUnidadModalVisible(true);
    modalY.setValue(1000);
    overlayOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(modalY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 15,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeUnidadModal = () => {
    Animated.parallel([
      Animated.spring(modalY, {
        toValue: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsUnidadModalVisible(false);
    });
  };

  const selectUnidad = (unidad: Unidad | null, setFieldValue: any) => {
    setSelectedUnidad(unidad);
    setFieldValue('unidadId', unidad?.id || null);
    closeUnidadModal();
  };

  const editarUsuario = async (values, { setSubmitting }) => {
    const formattedValues = trimFields(values);
    try {
      await MedicionesApi.put(`/usuarios/${usuario.userName}`, formattedValues);

      const usuarioActualizado = { ...usuario, ...formattedValues, unidad: selectedUnidad };
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
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
        
        <Formik
          initialValues={{
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            isAdmin: usuario.isAdmin,
            unidadId: usuario.unidad?.id || usuario.unidadId || null
          }}
          validationSchema={UsuarioSchema}
          onSubmit={editarUsuario}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
            <View>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                editable={false}
                value={usuario.userName}
                placeholder="Nombre de usuario"
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

              {/* SELECTOR DE UNIDAD PERSONALIZADO */}
              <View style={styles.unidadContainer}>
                <Text style={styles.unidadLabel}>Unidad:</Text>
                <TouchableOpacity
                  style={[
                    styles.unidadSelector,
                    !usuarioActual?.isAdmin && styles.disabledSelector
                  ]}
                  onPress={openUnidadModal}
                  disabled={cargandoUnidades || !usuarioActual?.isAdmin}
                >
                  <Text style={styles.unidadSelectorText}>
                    {cargandoUnidades 
                      ? 'Cargando...' 
                      : selectedUnidad 
                        ? selectedUnidad.nombre 
                        : 'Sin unidad asignada'
                    }
                  </Text>
                  {usuarioActual?.isAdmin && (
                    <Icons name="chevron-down" size={20} color={Color.colorMediumvioletred} />
                  )}
                </TouchableOpacity>
                {!usuarioActual?.isAdmin && (
                  <Text style={styles.infoText}>Solo los administradores pueden cambiar unidades</Text>
                )}
              </View>

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

              {/* Modal de Selección de Unidad */}
              <Modal
                visible={isUnidadModalVisible}
                transparent
                animationType="none"
                onRequestClose={closeUnidadModal}
                statusBarTranslucent={true}
              >
                {isUnidadModalVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}
                <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                  <TouchableWithoutFeedback onPress={closeUnidadModal}>
                    <View style={StyleSheet.absoluteFill} />
                  </TouchableWithoutFeedback>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.modalView,
                    { transform: [{ translateY: modalY }] }
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Seleccionar Unidad</Text>
                    <TouchableOpacity onPress={closeUnidadModal}>
                      <Icons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.unidadesContainer}>
                    {/* Opción Sin Unidad */}
                    <TouchableOpacity
                      style={[
                        styles.unidadOption,
                        !selectedUnidad && styles.selectedUnidadOption
                      ]}
                      onPress={() => selectUnidad(null, setFieldValue)}
                    >
                      <Text style={[
                        styles.unidadOptionText,
                        !selectedUnidad && styles.selectedUnidadOptionText
                      ]}>
                        Sin unidad asignada
                      </Text>
                    </TouchableOpacity>

                    {/* Lista de Unidades */}
                    {unidades.map((unidad) => (
                      <TouchableOpacity
                        key={unidad.id}
                        style={[
                          styles.unidadOption,
                          selectedUnidad?.id === unidad.id && styles.selectedUnidadOption
                        ]}
                        onPress={() => selectUnidad(unidad, setFieldValue)}
                      >
                        <View style={styles.unidadOptionContent}>
                          <Text style={[
                            styles.unidadOptionText,
                            selectedUnidad?.id === unidad.id && styles.selectedUnidadOptionText
                          ]}>
                            {unidad.nombre}
                          </Text>
                          {unidad.descripcion && (
                            <Text style={styles.unidadOptionDescription}>
                              {unidad.descripcion}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </Modal>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: 600,
  },
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
  disabledInput: {
    backgroundColor: Color.colorLavenderblush,
    color: Color.colorMediumvioletred,
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
  unidadContainer: {
    marginBottom: Padding.p_base,
  },
  unidadLabel: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
    marginBottom: Padding.p_5xs,
  },
  unidadSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    borderColor: Color.colorThistle,
    borderWidth: 1,
    borderRadius: Border.br_xs,
    paddingHorizontal: Padding.p_3xs,
    backgroundColor: Color.colorWhite,
  },
  disabledSelector: {
    backgroundColor: Color.colorLavenderblush,
  },
  unidadSelectorText: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
    flex: 1,
  },
  infoText: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    color: Color.colorMediumvioletred,
    fontStyle: 'italic',
    marginTop: Padding.p_5xs,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.colorBlack,
  },
  unidadesContainer: {
    maxHeight: 300,
    padding: 10,
  },
  unidadOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedUnidadOption: {
    backgroundColor: Color.colorLavenderblush,
  },
  unidadOptionContent: {
    flex: 1,
  },
  unidadOptionText: {
    fontSize: 16,
    color: Color.colorBlack,
    fontFamily: FontFamily.publicSansRegular,
  },
  selectedUnidadOptionText: {
    color: Color.colorPlum,
    fontWeight: 'bold',
  },
  unidadOptionDescription: {
    fontSize: 12,
    color: Color.colorMediumvioletred,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default EditarUsuarioForm;