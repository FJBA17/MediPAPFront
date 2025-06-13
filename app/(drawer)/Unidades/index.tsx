// app/(drawer)/Unidades/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  TextInput,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../src/components/Icons';
import { Color, Padding } from '../../../src/theme/GlobalStyles';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import { StatusBar } from 'expo-status-bar';
import CustomAlert from '../../../src/components/CustomAlert';

interface Unidad {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  fechaCreacion: string;
  usuarios?: any[];
}

interface Usuario {
  userName: string;
  nombre: string;
  apellido: string;
  email: string;
  isAdmin: boolean;
}

export default function UnidadesScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Estados para modal de crear/editar
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activa: true,
  });
  
  // Estados para modal de usuarios
  const [isUsuariosModalVisible, setIsUsuariosModalVisible] = useState(false);
  const [usuariosUnidad, setUsuariosUnidad] = useState<Usuario[]>([]);
  
  // Estados para CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(() => {});
  const [showCancelButton, setShowCancelButton] = useState(true);
  const [confirmText, setConfirmText] = useState('Confirmar');
  
  // Animaciones
  const modalY = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const usuariosModalY = useRef(new Animated.Value(1000)).current;
  const usuariosOverlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        cargarUnidades(),
        cargarUsuarios(),
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarAlerta('Error al cargar datos', false);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarUnidades = async () => {
    try {
      const response = await MedicionesApi.get('/unidades');
      setUnidades(response.data);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      mostrarAlerta('Error al cargar unidades', false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await MedicionesApi.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  // Función para mostrar alertas personalizadas
  const mostrarAlerta = (mensaje: string, conCancelBtn: boolean = true, onConfirm?: () => void, btnText: string = 'OK') => {
    setAlertMessage(mensaje);
    setShowCancelButton(conCancelBtn);
    setConfirmText(btnText);
    if (onConfirm) {
      setAlertConfirmAction(() => onConfirm);
    } else {
      setAlertConfirmAction(() => () => setAlertVisible(false));
    }
    setAlertVisible(true);
  };

  // Funciones del modal principal
  const openModal = (mode: 'create' | 'edit', unidad?: Unidad) => {
    setModalMode(mode);
    if (mode === 'edit' && unidad) {
      setSelectedUnidad(unidad);
      setFormData({
        nombre: unidad.nombre,
        descripcion: unidad.descripcion || '',
        activa: unidad.activa,
      });
    } else {
      setSelectedUnidad(null);
      setFormData({
        nombre: '',
        descripcion: '',
        activa: true,
      });
    }
    
    setIsModalVisible(true);
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

  const closeModal = () => {
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
      setIsModalVisible(false);
    });
  };

  // Funciones del modal de usuarios
  const verUsuariosUnidad = async (unidadId: number) => {
    try {
      const response = await MedicionesApi.get(`/unidades/${unidadId}/usuarios`);
      setUsuariosUnidad(response.data.usuarios);
      
      setIsUsuariosModalVisible(true);
      usuariosModalY.setValue(1000);
      usuariosOverlayOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(usuariosModalY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 15,
        }),
        Animated.timing(usuariosOverlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } catch (error) {
      console.error('Error al cargar usuarios de la unidad:', error);
      mostrarAlerta('No se pudieron cargar los usuarios de la unidad', false);
    }
  };

  const closeUsuariosModal = () => {
    Animated.parallel([
      Animated.spring(usuariosModalY, {
        toValue: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(usuariosOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsUsuariosModalVisible(false);
    });
  };

  const guardarUnidad = async () => {
    if (!formData.nombre.trim()) {
      mostrarAlerta('El nombre de la unidad es requerido', false);
      return;
    }

    try {
      setIsLoading(true);
      
      if (modalMode === 'create') {
        await MedicionesApi.post('/unidades', formData);
      } else if (selectedUnidad) {
        await MedicionesApi.put(`/unidades/${selectedUnidad.id}`, formData);
      }
      
      await cargarUnidades();
      closeModal();
      mostrarAlerta(modalMode === 'create' ? 'Unidad creada exitosamente' : 'Unidad actualizada exitosamente', false);
    } catch (error: any) {
      console.error('Error al guardar unidad:', error);
      const mensaje = error.response?.data?.message || 'Error al guardar la unidad';
      mostrarAlerta(mensaje, false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEstadoUnidad = async (unidad: Unidad) => {
    try {
      setIsLoading(true);
      await MedicionesApi.patch(`/unidades/${unidad.id}/toggle-active`);
      await cargarUnidades();
      mostrarAlerta(`Unidad ${unidad.activa ? 'desactivada' : 'activada'} exitosamente`, false);
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      const mensaje = error.response?.data?.message || 'Error al cambiar el estado';
      mostrarAlerta(mensaje, false);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarEliminarUnidad = (unidad: Unidad) => {
    mostrarAlerta(
      `¿Estás seguro de que quieres eliminar la unidad "${unidad.nombre}"?`,
      true,
      () => eliminarUnidad(unidad),
      'Eliminar'
    );
  };

  const eliminarUnidad = async (unidad: Unidad) => {
    try {
      setIsLoading(true);
      await MedicionesApi.delete(`/unidades/${unidad.id}`);
      await cargarUnidades();
      setAlertVisible(false);
      mostrarAlerta('Unidad eliminada exitosamente', false);
    } catch (error: any) {
      console.error('Error al eliminar unidad:', error);
      const mensaje = error.response?.data?.message || 'Error al eliminar la unidad';
      mostrarAlerta(mensaje, false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#b52e69', 'white']}
        style={styles.gradient}
      >
        {/* Header con botón crear */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestión de Unidades</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openModal('create')}
          >
            <LinearGradient
              colors={['#f08fb8', '#b52e69']}
              style={styles.addButtonGradient}
            >
              <Icons name="add" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {unidades.length > 0 ? (
            unidades.map((unidad) => (
              <View key={unidad.id} style={styles.unidadCard}>
                <View style={styles.unidadHeader}>
                  <View style={styles.unidadInfo}>
                    <Text style={styles.unidadNombre}>{unidad.nombre}</Text>
                    {unidad.descripcion && (
                      <Text style={styles.unidadDescripcion}>{unidad.descripcion}</Text>
                    )}
                    <Text style={styles.unidadFecha}>
                      Creada: {formatearFecha(unidad.fechaCreacion)}
                    </Text>
                  </View>
                  <View style={styles.unidadStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: unidad.activa ? '#4CAF50' : '#FF5722' }
                    ]}>
                      <Text style={styles.statusText}>
                        {unidad.activa ? 'Activa' : 'Inactiva'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.unidadActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => verUsuariosUnidad(unidad.id)}
                  >
                    <Icons name="people-outline" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Ver Usuarios</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => openModal('edit', unidad)}
                  >
                    <Icons name="create-outline" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, unidad.activa ? styles.deactivateButton : styles.activateButton]}
                    onPress={() => toggleEstadoUnidad(unidad)}
                  >
                    <Icons name={unidad.activa ? "pause-outline" : "play-outline"} size={16} color="white" />
                    <Text style={styles.actionButtonText}>
                      {unidad.activa ? 'Desactivar' : 'Activar'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmarEliminarUnidad(unidad)}
                  >
                    <Icons name="trash-outline" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Icons name="cube-outline" size={64} color="#e0e0e0" />
              <Text style={styles.emptyStateText}>No hay unidades disponibles</Text>
              <Text style={styles.emptyStateSubtext}>Crea una nueva unidad con el botón +</Text>
            </View>
          )}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Modal de Crear/Editar Unidad */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeModal}
          statusBarTranslucent={true}
        >
          {isModalVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View
            style={[
              styles.modalView,
              { transform: [{ translateY: modalY }] }
            ]}
          >
            <LinearGradient
              colors={['#b52e69', '#f5f5f5']}
              style={styles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.2 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalMode === 'create' ? 'Crear Unidad' : 'Editar Unidad'}
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Icons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre *</Text>
                  <View style={styles.inputWrapper}>
                    <Icons name="briefcase-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ingrese el nombre de la unidad"
                      value={formData.nombre}
                      onChangeText={(text) => setFormData({...formData, nombre: text})}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Descripción (opcional)</Text>
                  <View style={styles.inputWrapper}>
                    <Icons name="create-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Ingrese una descripción"
                      value={formData.descripcion}
                      onChangeText={(text) => setFormData({...formData, descripcion: text})}
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <View style={styles.switchSection}>
                  <View style={styles.switchContainer}>
                    <View style={styles.switchInfo}>
                      <Icons name="power-outline" size={20} color="#a33d69" />
                      <Text style={styles.switchLabel}>Estado</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.switch,
                        { backgroundColor: formData.activa ? '#4CAF50' : '#ccc' }
                      ]}
                      onPress={() => setFormData({...formData, activa: !formData.activa})}
                    >
                      <View style={[
                        styles.switchThumb,
                        { transform: [{ translateX: formData.activa ? 20 : 0 }] }
                      ]} />
                    </TouchableOpacity>
                    <Text style={styles.switchValue}>
                      {formData.activa ? 'Activa' : 'Inactiva'}
                    </Text>
                  </View>
                  <Text style={styles.switchDescription}>
                    Determina si la unidad estará disponible en el sistema
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={guardarUnidad}
                  >
                    <LinearGradient
                      colors={['#b52e69', '#f08fb8']}
                      style={styles.saveButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.saveButtonText}>
                        {modalMode === 'create' ? 'Crear' : 'Guardar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </Modal>

        {/* Modal de Usuarios de la Unidad */}
        <Modal
          visible={isUsuariosModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeUsuariosModal}
          statusBarTranslucent={true}
        >
          {isUsuariosModalVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}
          <Animated.View style={[styles.overlay, { opacity: usuariosOverlayOpacity }]}>
            <TouchableWithoutFeedback onPress={closeUsuariosModal}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View
            style={[
              styles.modalView,
              { transform: [{ translateY: usuariosModalY }] }
            ]}
          >
            <LinearGradient
              colors={['#b52e69', '#f5f5f5']}
              style={styles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.2 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Usuarios de la Unidad</Text>
                <TouchableOpacity onPress={closeUsuariosModal} style={styles.closeButton}>
                  <Icons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.usuariosContainer}>
                {usuariosUnidad.length > 0 ? (
                  usuariosUnidad.map((usuario, index) => (
                    <View key={index} style={styles.usuarioItem}>
                      <View style={styles.usuarioAvatar}>
                        <Icons name="person" size={24} color="#a33d69" />
                      </View>
                      <View style={styles.usuarioInfo}>
                        <Text style={styles.usuarioNombre}>
                          {usuario.nombre} {usuario.apellido}
                        </Text>
                        <Text style={styles.usuarioEmail}>{usuario.email}</Text>
                        <Text style={styles.usuarioUserName}>@{usuario.userName}</Text>
                      </View>
                      {usuario.isAdmin && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Icons name="people-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                      No hay usuarios asignados a esta unidad
                    </Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </Modal>

        {/* CustomAlert para mensajes y confirmaciones */}
        <CustomAlert
          visible={alertVisible}
          title={alertMessage}
          onConfirm={alertConfirmAction}
          onCancel={() => setAlertVisible(false)}
          confirmText={confirmText}
          showCancelButton={showCancelButton}
        />

        {isLoading && <LoadingModal visible={true} />}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Padding.p_base,
    paddingBottom: 20,
    flexGrow: 1,
  },
  spacer: {
    height: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Padding.p_base,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unidadCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ebc7d6',
    shadowColor: '#a33d69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unidadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  unidadInfo: {
    flex: 1,
  },
  unidadNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f0a12',
    marginBottom: 5,
  },
  unidadDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  unidadFecha: {
    fontSize: 12,
    color: '#999',
  },
  unidadStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unidadActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  viewButton: {
    backgroundColor: '#2196F3',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  deactivateButton: {
    backgroundColor: '#9E9E9E',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  
  // Modal styles
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
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
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
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f0a12',
    paddingVertical: 12,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  
  // Switch styles
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
    marginBottom: 8,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f0a12',
    marginLeft: 8,
  },
  switchValue: {
    fontSize: 14,
    color: '#1f0a12',
    marginLeft: 10,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginLeft: 28,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  
  // Modal action buttons
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Usuarios modal styles
  usuariosContainer: {
    padding: 20,
    maxHeight: '80%',
  },
  usuarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
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
  usuarioAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(243, 145, 185, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f0a12',
  },
  usuarioEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  usuarioUserName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: '#b52e69',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});