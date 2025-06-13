import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  StatusBar,
  TouchableWithoutFeedback,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { orderOptions, OrderOptionValue } from '../../../src/constans/orderOptions';
import { Color, Padding } from '@/src/theme/GlobalStyles';
import { Icons } from "@/src/components/Icons";

export default function PantallaSeguimientoPap() {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigation = useNavigation();

  // Estado para ordenamiento
  const [orden, setOrden] = useState('AZ');
  const [busqueda, setBusqueda] = useState('');
  // Estados para el modal de ordenamiento
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const orderModalY = useRef(new Animated.Value(1000)).current;
  const orderOverlayOpacity = useRef(new Animated.Value(0)).current;

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'contactada':
        return '#E91E63'; // Rosa
      case 'no contactada':
        return '#9E9E9E'; // Gris
      case 'finalizada':
        return '#4CAF50'; // Verde
      case 'en seguimiento':
        return '#FF9800'; // Naranja
      default:
        return '#9E9E9E'; // Gris por defecto
    }
  };

  const getEstadoBackgroundColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'contactada':
        return '#FCE4EC'; // Rosa claro
      case 'no contactada':
        return '#F5F5F5'; // Gris claro
      case 'finalizada':
        return '#E8F5E8'; // Verde claro
      case 'en seguimiento':
        return '#FFF3E0'; // Naranja claro
      default:
        return '#F5F5F5'; // Gris claro por defecto
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{ paddingHorizontal: 10}}
        >
          <Ionicons name="menu-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

   useFocusEffect(
    useCallback(() => {
      const fetchSeguimientos = async () => {
        try {
          const response = await MedicionesApi.get('/seguimientoPap');
          const data = Array.isArray(response.data.data) ? response.data.data : [];

          const dataConEstado = await Promise.all(
            data.map(async (paciente) => {
              try {
                const estadoRes = await MedicionesApi.get(`/seguimientoEstado/ultimoEstado/${paciente.rut}`);
                return {
                  ...paciente,
                  estadoActual: estadoRes.data.data?.estado || 'Sin estado'
                };
              } catch (error) {
                return {
                  ...paciente,
                  estadoActual: 'Sin estado'
                };
              }
            })
          );

          setSeguimientos(dataConEstado);
        } catch (error) {
          console.error('Error cargando seguimientos:', error);
          setLoadError(true);
        } finally {
          setLoading(false);
        }
      };

      fetchSeguimientos();
    }, [])
  );

  // Funciones modal Ordenamiento
  const openOrderModal = () => {
    setIsOrderModalVisible(true);
    orderModalY.setValue(1000);
    orderOverlayOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(orderModalY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 15,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      }),
      Animated.timing(orderOverlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeOrderModal = () => {
    Animated.parallel([
      Animated.spring(orderModalY, {
        toValue: 1000,
        useNativeDriver: true,
        tension: 65,
        friction: 15,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      }),
      Animated.timing(orderOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsOrderModalVisible(false);
    });
  };

  // Función para manejar el cambio de orden
  const handleOrderChange = (orderValue: OrderOptionValue) => {
    setOrden(orderValue);
    closeOrderModal();
  };

  if (loading) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Cargando seguimientos...</Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  if (loadError) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ffffff" />
            <Text style={styles.errorText}>Error cargando datos</Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  if (seguimientos.length === 0) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color="#ffffff" />
            <Text style={styles.emptyText}>No hay seguimientos disponibles</Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  // Ordenar los seguimientos
  const seguimientosOrdenados = [...seguimientos].sort((a, b) => {
    switch (orden) {
      case 'AZ':
        return a.nombreCompleto.localeCompare(b.nombreCompleto);
      case 'ZA':
        return b.nombreCompleto.localeCompare(a.nombreCompleto);
      default:
        return a.nombreCompleto.localeCompare(b.nombreCompleto);
    }
  });
  
  // Filtrar por búsqueda
  const seguimientosFiltrados = seguimientosOrdenados.filter(item =>
    item.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.rut.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Search and Filter Section */}
          <View style={styles.searchSection}>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons name="search-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                <TextInput
                  style={styles.modernInput}
                  placeholder="Buscar por nombre o RUT..."
                  placeholderTextColor="#abaaad"
                  value={busqueda}
                  onChangeText={setBusqueda}
                />
                <TouchableOpacity style={styles.filterButton} onPress={openOrderModal}>
                  <Ionicons name="options-outline" size={20} color="#a33d69" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Results Section */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {seguimientosFiltrados.length} paciente{seguimientosFiltrados.length !== 1 ? 's' : ''} encontrado{seguimientosFiltrados.length !== 1 ? 's' : ''}
            </Text>
            
            {seguimientosFiltrados.map((item) => (
              <TouchableOpacity
                key={item.rut.toString()}
                onPress={() => navigation.navigate('DetalleSeguimientoPap', { rut: item.rut })}
                style={styles.patientCard}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{item.nombreCompleto}</Text>
                    <Text style={styles.patientRut}>RUT: {item.rut}</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={20} color="#a33d69" />
                </View>
                
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getEstadoBackgroundColor(item.estadoActual) }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getEstadoColor(item.estadoActual) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getEstadoColor(item.estadoActual) }
                    ]}>
                      {item.estadoActual}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Modal de ordenamiento */}
        <Modal
          visible={isOrderModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeOrderModal}
          statusBarTranslucent={true}
        >
          <Animated.View style={[styles.overlay, { opacity: orderOverlayOpacity }]}>
            <TouchableWithoutFeedback onPress={closeOrderModal}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View
            style={[
              styles.modalView,
              { transform: [{ translateY: orderModalY }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ordenar por</Text>
              <TouchableOpacity onPress={closeOrderModal}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {orderOptions
                .filter(option => option.value === 'AZ' || option.value === 'ZA')
                .map((option, index, filteredOptions) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    index < filteredOptions.length - 1 && styles.optionBorder,
                    orden === option.value && styles.selectedOption
                  ]}
                  onPress={() => handleOrderChange(option.value)}
                >
                  <View style={styles.optionContent}>
                    <Ionicons
                      name={option.value === 'AZ' ? 'arrow-down-outline' : 'arrow-up-outline'}
                      size={20}
                      color={orden === option.value ? '#b52e69' : '#666666'}
                    />
                    <Text style={[
                      styles.optionText,
                      orden === option.value && styles.selectedOptionText
                    ]}>
                      {option.value === "AZ" ? "Nombre A-Z" : "Nombre Z-A"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Modal>
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

  // Search Section
  searchSection: {
    paddingTop : 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
  filterButton: {
    padding: 8,
  },

  // Results Section
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f0a12',
    marginBottom: 15,
  },

  // Patient Cards
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f0a12',
    marginBottom: 4,
  },
  patientRut: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Loading States
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },

  // Modal Styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ebc7d6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f0a12',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#b52e69',
    fontWeight: 'bold',
  },
  optionsContainer: {
    paddingVertical: 10,
  },
  optionItem: {
    padding: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ebc7d6',
  },
  optionText: {
    fontSize: 16,
    color: '#666666',
  },
  selectedOption: {
    backgroundColor: 'rgba(181, 46, 105, 0.1)',
  },
  selectedOptionText: {
    color: '#b52e69',
    fontWeight: 'bold',
  },
});