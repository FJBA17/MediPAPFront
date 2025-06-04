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
} from 'react-native';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { orderOptions, OrderOptionValue } from '../../../src/constans/orderOptions';
import { Color, Padding } from '@/src/theme/GlobalStyles';
import { Icons } from "@/src/components/Icons";
import { Input } from "react-native-elements";
import { color } from "@rneui/base";

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
  const orderOverlayOpacity = useRef(new Animated.Value(0)).current


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
          <Icons name="menu" size={24} color="#f08fb8" />
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

  // Funciones modal Orenamiento
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>Error cargando datos</Text>
      </View>
    );
  }

  if (seguimientos.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text>📭 No hay seguimientos disponibles.</Text>
      </View>
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
     <KeyboardAvoidingView style={styles.contentContainer}>
        {/* Contenedor de búsqueda y filtro en la misma fila */}
        <View style={styles.searchFilterContainer}>
          {/* Buscador */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icons name="search" size={20} color={Color.colorPalevioletred_100} style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar por nombre o RUT..."
                style={styles.searchInput}
                value={busqueda}
                onChangeText={setBusqueda}
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          {/* Botón de filtro */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={openOrderModal}
          >
            <Icons name="filter" size={20} color="#fffaf0" />
          </TouchableOpacity>
        </View>

        {/* Lista de seguimientos */}
        <ScrollView style={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
          {seguimientosFiltrados.map((item) => (
            <Pressable
              key={item.rut.toString()}
              onPress={() => navigation.navigate('DetalleSeguimientoPap', { rut: item.rut })}
              style={styles.tarjeta}
            >
              <View style={styles.tarjetaHeader}>
                <Text style={styles.nombrePaciente}>
                  {item.nombreCompleto}
                </Text>
                
              </View>
              
              <Text style={styles.rutPaciente}>RUT: {item.rut}</Text>
              
              <View style={[
                styles.estadoContainer,
                { backgroundColor: getEstadoBackgroundColor(item.estadoActual) }
              ]}>
                <Text style={[
                  styles.estadoText,
                  { color: getEstadoColor(item.estadoActual) }
                ]}>
                  {item.estadoActual}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Modal de ordenamiento */}
        <Modal
          visible={isOrderModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeOrderModal}
          statusBarTranslucent={true}
        >
          {isOrderModalVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" barStyle="light-content" />}
          <Animated.View
            style={[
              styles.overlay,
              { opacity: orderOverlayOpacity }
            ]}
          >
            <TouchableWithoutFeedback onPress={closeOrderModal}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View
            style={[
              styles.modalViewV2,
              {
                transform: [{ translateY: orderModalY }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ordenar por</Text>
              <TouchableOpacity onPress={closeOrderModal}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
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
                    <Icons
                      name={option.icon}
                      size={20}
                      color={orden === option.value ? '#E91E63' : '#666666'}
                    />
                    <Text style={[
                      styles.optionText,
                      orden === option.value && styles.selectedOptionText
                    ]}>
                      {(option.value === "AZ" ? "Nombre A-Z" : "Nombre Z-A")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Modal>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorWhite,
  },
  
  // Container principal
  contentContainer: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
  },
  
  // Contenedor de búsqueda y filtro
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: Color.colorLavenderblush,
  },
  
  // Estilos del buscador
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Color.colorGrey,
  },
  
  // Estilos del botón de filtro
  filterButton: {
    backgroundColor: Color.colorPink,
    borderRadius: 25,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  // Estilos para la lista de seguimientos
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Estilos de las tarjetas
  tarjeta: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nombrePaciente: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.colorPalevioletred_100,
    flex: 1,
  },
  menuDotsButton: {
    padding: 4,
  },
  rutPaciente: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  estadoContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Estilos del modal de ordenamiento
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalViewV2: {
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: 'bold',
  },
  optionsContainer: {
    maxHeight: '100%',
  },
  optionItem: {
    padding: 15,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: '#666666',
  },
  selectedOption: {
    backgroundColor: '#FCE4EC',
  },
  selectedOptionText: {
    color: '#E91E63',
    fontWeight: 'bold',
  },
});