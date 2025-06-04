import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
  PanResponder,
  KeyboardAvoidingView,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { MedicionesApi } from '@/src/config/api/medicionesApi';
import { useFocusEffect } from '@react-navigation/native';
import { useAutorizacionStore } from '@/src/store';
import { Color } from '@/src/theme/GlobalStyles';
import CustomAlert from '@/src/components/CustomAlert';

export default function DetalleSeguimientoPap() {
  const { rut } = useLocalSearchParams<{ rut: string }>();

  const [notas, setNotas] = useState([]);
  const [seguimiento, setSeguimiento] = useState(null);
  const [estadoActual, setEstadoActual] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('No contactada');
  const [showEstadoOptions, setShowEstadoOptions] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertConfirmText, setAlertConfirmText] = useState('OK');
  const [showCancelButton, setShowCancelButton] = useState(false);

  const router = useRouter();
  const navigation = useNavigation();
  const user = useAutorizacionStore(state => state.user);

  const modalY = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          modalY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          closeModal();
        } else {
          Animated.spring(modalY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      }
    })
  ).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#f08fb8" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [notasRes, seguimientoRes, estadoRes] = await Promise.all([
            MedicionesApi.get(`/seguimientoNota/historialNotas/${rut}`),
            MedicionesApi.get(`/seguimientoPap/rut/${rut}`),
            MedicionesApi.get(`/seguimientoEstado/ultimoEstado/${rut}`).catch(() => null)
          ]);

          const notasOrdenadas = (notasRes.data.data || []).sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );

          setNotas(notasOrdenadas);
          setSeguimiento(seguimientoRes.data.data?.[0] || null);
          setEstadoActual(estadoRes?.data?.data?.estado || 'Sin estado');
        } catch (error) {
          console.error('Error al obtener datos del seguimiento:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [rut])
  );

  const formatearFechaHora = (fechaIso: string) => {
    const fecha = new Date(fechaIso);
    return `${fecha.toLocaleDateString([], {day: '2-digit', month: '2-digit', year: 'numeric'})} ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const crearNotaYEstado = async () => {
    if (!nuevaNota.trim()) {
      setAlertTitle('La nota no puede estar vacía');
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
      return;
    }

    try {
      await MedicionesApi.post('/seguimientoNota', {
        rut,
        nota: nuevaNota,
        userName: user?.userName || 'anonimo'
      });

      await MedicionesApi.post('/seguimientoEstado', {
        rut,
        estado: nuevoEstado,
        userName: user?.userName || 'anonimo'
      });

      setAlertTitle('Nota y estado actualizados');
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
      setNuevaNota('');
      setModalVisible(false);
    } catch (error) {
      setAlertTitle('No se pudo guardar la nota y el estado');
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    modalY.setValue(1000);
    overlayOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(modalY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.spring(modalY, {
        toValue: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'En seguimiento':
        return { backgroundColor: '#FFF3E0', color: '#FF9800' };
      case 'Contactada':
        return { backgroundColor: '#E91E63', color: '#FCE4EC' };
      case 'Finalizada':
        return { backgroundColor: '#E8F5E8', color: '#4CAF50' };
      default:
        return { backgroundColor: '#F5F5F5', color: '#9E9E9E' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f08fb8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.mainContainer}>
        {/* Header fijo con datos de la paciente */}
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Datos de la Paciente</Text>
          
          {seguimiento ? (
            <View style={styles.patientCard}>
              <View style={styles.patientRow}>
                <Icon name="person" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Nombre:</Text>
                <Text style={styles.patientValue}>{seguimiento.nombreCompleto}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="badge" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>RUT:</Text>
                <Text style={[styles.patientValue, {color: Color.colorMediumvioletred, fontWeight: 'bold'}]}>{seguimiento.rut}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="event" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Edad:</Text>
                <Text style={styles.patientValue}>{seguimiento.edad || 'No registrada'}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="cake" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>F.N:</Text>
                <Text style={styles.patientValue}>{seguimiento.fechaNacimiento || 'No registrado'}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="phone" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Fono:</Text>
                <Text style={styles.patientValue}>{seguimiento.fono || 'No registrado'}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="home" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Domicilio:</Text>
                <Text style={styles.patientValue}>{seguimiento.domicilio || 'No registrado'}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="event-available" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Fecha Detección:</Text>
                <Text style={styles.patientValue}>{formatearFechaHora(seguimiento.fechaDeteccion)?.slice(0,8) || 'No registrada'}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="healing" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Fecha PAP:</Text>
                <Text style={styles.patientValue}>{seguimiento.fechaPap || 'No registrada'}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="verified-user" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Vigencia PAP:</Text>
                <Text style={styles.patientValue}> {seguimiento.vigenciaPap || 'NO'}</Text>
              </View>
              
              <View style={styles.patientRow}>
                <Icon name="history" size={16} color="#666" style={styles.icon} />
                <Text style={styles.patientLabel}>Años PAP:</Text>
                <Text style={styles.patientValue}>{seguimiento.anosPap ?? 'No registrado'}</Text>
              </View>
              
              <View style={[styles.patientRow, { marginTop: 8 }]}>
                <View style={[styles.estadoBadge, getEstadoStyle(estadoActual)]}>
                  <View style={[styles.estadoDot, { backgroundColor: getEstadoStyle(estadoActual).color }]} />
                  <Text style={[styles.estadoText, { color: getEstadoStyle(estadoActual).color }]}>
                    {estadoActual}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.patientCard}>
              <Text style={styles.noDataText}>No se encontró información del seguimiento.</Text>
            </View>
          )}
          
          {/* Título de Notas */}
          <Text style={styles.sectionTitle}>Notas</Text>
        </View>

        {/* Sección de Notas con scroll independiente */}
        <View style={styles.notesContainer}>
          <ScrollView 
            style={styles.notesScrollView}
            showsVerticalScrollIndicator={false}
          >
            {notas.length === 0 ? (
              <View style={styles.emptyNotesCard}>
                <Icon name="note" size={48} color="#ccc" />
                <Text style={styles.emptyNotesText}>No hay notas registradas</Text>
              </View>
            ) : (
              notas.map((nota, index) => (
                <View key={index} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteDate}>{formatearFechaHora(nota.fecha)}</Text>
                  </View>
                  <Text style={styles.noteText}>{nota.nota}</Text>
                  <Text style={styles.noteAuthor}>Registrado por: {nota.usuarioRegistro}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
      
      {/* Botón flotante con gradiente */}
      <TouchableOpacity style={styles.floatingButton} onPress={openModal}>
        <Icon name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal mejorado */}
      <Modal transparent visible={modalVisible} animationType="none">
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}> 
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[styles.modalView, { transform: [{ translateY: modalY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Nueva Nota</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Escribe la nota..."
            placeholderTextColor="#999"
            multiline
            value={nuevaNota}
            onChangeText={setNuevaNota}
          />
          
          <TouchableOpacity onPress={() => setShowEstadoOptions(!showEstadoOptions)} style={styles.selector}>
            <Text style={styles.selectorText}>{nuevoEstado}</Text>
            <Icon name={showEstadoOptions ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#666" />
          </TouchableOpacity>
          
          {showEstadoOptions && (
            <View style={styles.optionList}>
              {['No contactada', 'Contactada', 'En seguimiento', 'Finalizada'].map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={styles.optionItem}
                  onPress={() => {
                    setNuevoEstado(estado);
                    setShowEstadoOptions(false);
                  }}
                >
                  <Text style={styles.optionText}>{estado}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.saveButton]} onPress={crearNotaYEstado}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Modal>
      
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => setAlertVisible(false)}
        confirmText={alertConfirmText}
        showCancelButton={showCancelButton}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.colorLavenderblush,
  },
  mainContainer: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  notesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notesScrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  patientLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    minWidth: 100,
    marginRight: 8,
  },
  patientValue: {
    fontSize: 16,
    color: 'black',
    flex: 1,
  },
  icon: {
    marginRight: 5,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  estadoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  estadoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyNotesCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  emptyNotesText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    fontStyle: 'italic',
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  noteText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#EC4899',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    height: 120,
    marginBottom: 16,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  selectorText: {
    fontSize: 16,
    color: '#1F2937',
  },
  optionList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#EC4899',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});