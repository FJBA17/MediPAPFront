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
        <Text style={{ color: 'red', fontSize: 16 }}>❌ Error cargando datos</Text>
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
    <KeyboardAvoidingView style={{flex: 1}}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.bodyFlexBox}>              
          {/* Buscador */}
          <Input
            placeholder="Buscar por nombre o RUT..."
            inputContainerStyle={styles.searchBarInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor="#888"
            leftIcon={
              <Icons name="search" size={30} color="#f08fb8" />
            }
          />
          {/* Botón de ordenamiento */}
          <Pressable
            style={styles.orderButton}
            onPress={openOrderModal}
          >
            <Icons
              name="filter-circle-sharp"
              color="white"
              size={20}
            />
            <Text style={styles.orderText}>
              {orden === 'AZ' ? 'Nombre A-Z' : orden === 'ZA' ? 'Nombre Z-A' : 'Nombre'}
            </Text>
          </Pressable>
          
        </View>      

        {/* Lista de seguimientos */}
        <ScrollView style={styles.scrollViewContainer}>
          {seguimientosFiltrados.map((item) => (
            <Pressable
              key={item.rut.toString()}
              onPress={() => navigation.navigate('DetalleSeguimientoPap', { rut: item.rut })}
              style={[styles.tarjeta, styles.tarjetaBorder]}
            >
              <Text style={styles.userTitle}>
                {item.nombreCompleto}
              </Text>
              <Text style={styles.textTarjeta}>RUT: {item.rut}</Text>
              <Text style={styles.textTarjeta}>Estado actual: {item.estadoActual}</Text>
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
          {isOrderModalVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}
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
                      color={orden === option.value ? '#f08fb8' : '#666666'}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Estilos base
  container: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
    padding: Padding.p_base,
  },
  bodyFlexBox: {
    flexGrow: 1,
    width: '100%',
    marginBottom: 10
  },
  
  // Estilos para la lista de seguimientos
  scrollViewContainer: {
    flex: 1,
    width: '100%',
    paddingBottom: 32,
  },
  tarjeta: {
    borderRadius: 15,
    width: '100%',
    padding: 15,
    marginVertical: 8,
  },
  tarjetaBorder: {
    borderWidth: 1,
    borderColor: "#f08fb8",
    backgroundColor: "#fff",
  },
  userTitle: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18
  },
  textTarjeta: {
    color: 'black',
    marginTop: 2
  },

  // Estilo para Busqueda
  searchBarInput: {
    backgroundColor: Color.colorLavenderblush_200,
    borderRadius: 20,
    borderColor: 'transparent',
    paddingHorizontal : 10,
  },

  // Estilos del botón de ordenamiento
  orderButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#f08fb8',
    gap: 5,
    paddingHorizontal: 15,
  },
  orderText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
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
    color: '#f08fb8',
    fontWeight: 'bold',
  },
  
  // Estilos de las opciones del modal
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
    backgroundColor: '#fdd6e4',
  },
  selectedOptionText: {
    color: '#f08fb8',
    fontWeight: 'bold',
  },
});