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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
          <Ionicons name="arrow-back-outline" size={24} color="#ffffff" />
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
      
      // Refrescar datos
      const fetchData = async () => {
        try {
          const [notasRes, estadoRes] = await Promise.all([
            MedicionesApi.get(`/seguimientoNota/historialNotas/${rut}`),
            MedicionesApi.get(`/seguimientoEstado/ultimoEstado/${rut}`).catch(() => null)
          ]);

          const notasOrdenadas = (notasRes.data.data || []).sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );

          setNotas(notasOrdenadas);
          setEstadoActual(estadoRes?.data?.data?.estado || 'Sin estado');
        } catch (error) {
          console.error('Error al refrescar datos:', error);
        }
      };
      fetchData();
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
        return { backgroundColor: '#FCE4EC', color: '#E91E63' };
      case 'Finalizada':
        return { backgroundColor: '#E8F5E8', color: '#4CAF50' };
      default:
        return { backgroundColor: '#F5F5F5', color: '#9E9E9E' };
    }
  };

  if (loading) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Cargando detalle...</Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          

          {/* Patient Info Section */}
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Datos del Paciente</Text>
            
            {seguimiento ? (
              <View style={styles.patientCard}>
                <View style={styles.patientRow}>
                  <Ionicons name="person-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Nombre:</Text>
                  <Text style={styles.patientValue}>{seguimiento.nombreCompleto}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="card-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>RUT:</Text>
                  <Text style={[styles.patientValue, {color: '#b52e69', fontWeight: 'bold'}]}>{seguimiento.rut}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="calendar-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Edad:</Text>
                  <Text style={styles.patientValue}>{seguimiento.edad || 'No registrada'}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="gift-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>F.N:</Text>
                  <Text style={styles.patientValue}>{seguimiento.fechaNacimiento || 'No registrado'}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="call-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Fono:</Text>
                  <Text style={styles.patientValue}>{seguimiento.fono || 'No registrado'}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="home-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Domicilio:</Text>
                  <Text style={styles.patientValue}>{seguimiento.domicilio || 'No registrado'}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="today-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Fecha Detección:</Text>
                  <Text style={styles.patientValue}>{formatearFechaHora(seguimiento.fechaDeteccion)?.slice(0,10) || 'No registrada'}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="medical-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Fecha PAP:</Text>
                  <Text style={styles.patientValue}>{seguimiento.fechaPap || 'No registrada'}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Vigencia PAP:</Text>
                  <Text style={styles.patientValue}> {seguimiento.vigenciaPap || 'NO'}</Text>
                </View>
                
                <View style={styles.patientRow}>
                  <Ionicons name="time-outline" size={16} color="#a33d69" style={styles.icon} />
                  <Text style={styles.patientLabel}>Años PAP:</Text>
                  <Text style={styles.patientValue}>{seguimiento.anosPap ?? 'No registrado'}</Text>
                </View>
                
                <View style={[styles.patientRow, { marginTop: 15, justifyContent: 'center' }]}>
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

            {/* Notes Section */}
            <Text style={styles.sectionTitle}>Historial de Notas</Text>
            
            {notas.length === 0 ? (
              <View style={styles.emptyNotesCard}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <Text style={styles.emptyNotesText}>No hay notas registradas</Text>
                <Text style={styles.emptyNotesSubtext}>Agrega la primera nota usando el botón inferior</Text>
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
          </View>

          <View style={styles.spacer} />
        </ScrollView>
        
        {/* Floating Action Button */}
        <TouchableOpacity style={styles.floatingButton} onPress={openModal}>
          <LinearGradient
            colors={['#b52e69', '#a33d69']}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="add-outline" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Modal para nueva nota */}
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
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nota</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textAreaInput}
                  placeholder="Escribe la nota del seguimiento..."
                  placeholderTextColor="#abaaad"
                  multiline
                  value={nuevaNota}
                  onChangeText={setNuevaNota}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estado</Text>
              <TouchableOpacity 
                onPress={() => setShowEstadoOptions(!showEstadoOptions)} 
                style={styles.selector}
              >
                <Text style={styles.selectorText}>{nuevoEstado}</Text>
                <Ionicons 
                  name={showEstadoOptions ? "chevron-up-outline" : "chevron-down-outline"} 
                  size={20} 
                  color="#a33d69" 
                />
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
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={crearNotaYEstado}>
                <LinearGradient
                  colors={['#b52e69', '#b52e69']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </LinearGradient>
              </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 40 : 60,
    paddingBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
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

  // Content Section
  contentSection: {
    paddingTop : 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f0a12',
  },

  // Patient Card
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#ebc7d6',
    shadowColor: '#1f0a12',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  patientLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f0a12',
    minWidth: 100,
    marginRight: 8,
  },
  patientValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
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
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Notes
  emptyNotesCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebc7d6',
    marginBottom: 100,
  },
  emptyNotesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontWeight: '600',
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ebc7d6',
    shadowColor: '#1f0a12',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a33d69',
  },
  noteText: {
    fontSize: 14,
    color: '#1f0a12',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#b52e69',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },

  // Modal Styles
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ebc7d6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f0a12',
    textAlign: 'center',
  },

  // Form Inputs
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f0a12',
    marginBottom: 8,
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderColor: '#ebc7d6',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  textAreaInput: {
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1f0a12',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebc7d6',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  selectorText: {
    fontSize: 16,
    color: '#1f0a12',
  },
  optionList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ebc7d6',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#1f0a12',
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ebc7d6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});