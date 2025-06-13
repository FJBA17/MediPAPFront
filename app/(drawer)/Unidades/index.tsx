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
} from 'react-native';
import { Icons } from '../../../src/components/Icons';
import { Color, Padding } from '../../../src/theme/GlobalStyles';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import { StatusBar } from 'expo-status-bar';

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
      Alert.alert('Error', 'No se pudieron cargar los usuarios de la unidad');
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
      Alert.alert('Error', 'El nombre de la unidad es requerido');
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
      Alert.alert('Éxito', modalMode === 'create' ? 'Unidad creada correctamente' : 'Unidad actualizada correctamente');
    } catch (error: any) {
      console.error('Error al guardar unidad:', error);
      const mensaje = error.response?.data?.message || 'Error al guardar la unidad';
      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEstadoUnidad = async (unidad: Unidad) => {
    try {
      setIsLoading(true);
      await MedicionesApi.patch(`/unidades/${unidad.id}/toggle-active`);
      await cargarUnidades();
      Alert.alert('Éxito', `Unidad ${unidad.activa ? 'desactivada' : 'activada'} correctamente`);
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      const mensaje = error.response?.data?.message || 'Error al cambiar el estado';
      Alert.alert('Error', mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarUnidad = (unidad: Unidad) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la unidad "${unidad.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await MedicionesApi.delete(`/unidades/${unidad.id}`);
              await cargarUnidades();
              Alert.alert('Éxito', 'Unidad eliminada correctamente');
            } catch (error: any) {
              console.error('Error al eliminar unidad:', error);
              const mensaje = error.response?.data?.message || 'Error al eliminar la unidad';
              Alert.alert('Error', mensaje);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  return (
    <View style={styles.container}>
      {/* Header con botón crear */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Unidades</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openModal('create')}
        >
          <Icons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {unidades.map((unidad) => (
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
                onPress={() => eliminarUnidad(unidad)}
              >
                <Icons name="trash-outline" size={16} color="white" />
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalMode === 'create' ? 'Crear Unidad' : 'Editar Unidad'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Icons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ingrese el nombre de la unidad"
                value={formData.nombre}
                onChangeText={(text) => setFormData({...formData, nombre: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Ingrese una descripción"
                value={formData.descripcion}
                onChangeText={(text) => setFormData({...formData, descripcion: text})}
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.inputLabel}>Estado</Text>
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
                <Text style={styles.switchLabel}>
                  {formData.activa ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
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
                <Text style={styles.saveButtonText}>
                  {modalMode === 'create' ? 'Crear' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Usuarios de la Unidad</Text>
            <TouchableOpacity onPress={closeUsuariosModal}>
              <Icons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.usuariosContainer}>
            {usuariosUnidad.length > 0 ? (
              usuariosUnidad.map((usuario, index) => (
                <View key={index} style={styles.usuarioItem}>
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
        </Animated.View>
      </Modal>

      {isLoading && <LoadingModal visible={true} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Padding.p_base,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f0a12',
  },
  addButton: {
    backgroundColor: '#f08fb8',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Padding.p_base,
  },
  unidadCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f08fb8',
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
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f0a12',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f0a12',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#f08fb8',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  switchLabel: {
    fontSize: 16,
    color: '#1f0a12',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#f08fb8',
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
  usuariosContainer: {
    maxHeight: 400,
    padding: 20,
  },
  usuarioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
    backgroundColor: '#f08fb8',
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