import * as React from "react";
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Icons } from '../../../src/components/Icons';
import { Color, Padding } from '../../../src/theme/GlobalStyles';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { useEffect, useRef, useState } from "react";
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import { dateRanges } from '../../../src/constans/dateRange';
import { formatearFecha } from '../../../src/utils/date.utils';
import { orderOptions, OrderOptionValue } from '../../../src/constans/orderOptions';
import { StatusBar } from 'expo-status-bar';
import {
    ApiResponse,
    AcumuladorUsuarios,
    Usuario
} from '../../../src/types/reportes.types';

export default function ReportesScreen() {
    // Estados
    const [total, setTotal] = useState(0);
    const [totalActivos, setTotalActivos] = useState(0);
    const [totalInactivos, setTotalInactivos] = useState(0);
    const [totalNoEncontrados, setTotalNoEncontrados] = useState(0);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Estados para el picker modal
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const pickerYPosition = useRef(new Animated.Value(1000)).current;
    const pickerOverlayOpacity = useRef(new Animated.Value(0)).current;
    const [selectedRange, setSelectedRange] = useState("Mes actual");

    // Estados para el modal de detalles
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalYPosition] = useState(new Animated.Value(1000));
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

    // Primero, agregar los estados para el modal
    const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
    const orderModalY = useRef(new Animated.Value(1000)).current;
    const orderOverlayOpacity = useRef(new Animated.Value(0)).current;

    // Estados para filtros
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [filtroRut, setFiltroRut] = useState('');
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [orden, setOrden] = useState<'ASC' | 'DESC'>('ASC');
    const [ordenUsuarios, setOrdenUsuarios] = useState<OrderOptionValue>("MAYOR_MENOR");
    const [selectedOrder, setSelectedOrder] = useState<OrderOptionValue>("MAYOR_MENOR");

    // Effects
    useEffect(() => {
        // Solo establecer el rango inicial
        handleRangeChange("Semana actual");
        // ContadorReportes se ejecutará automáticamente por el otro useEffect
    }, []);

    // Agregar este useEffect
    useEffect(() => {
        if (fechaDesde && fechaHasta && selectedRange) {
            ContadorReportes();
        }
    }, [fechaDesde, fechaHasta, selectedRange]);

    // Handlers
    const handleRangeChange = (range: string) => {
        const selectedDateRange = dateRanges.find(r => r.label === range);
        if (selectedDateRange) {
            const { start, end } = selectedDateRange.getValue();
            setFechaDesde(start.toISOString().split('T')[0]);
            setFechaHasta(end.toISOString().split('T')[0]);
            setSelectedRange(range);
        }
    };

    // Funciones principales
    const ContadorReportes = async () => {
        try {
            setIsLoading(true);
            const response = await MedicionesApi.get<ApiResponse>('/historial-busqueda');
            const { historial } = response.data;

            // Limpiar resultados anteriores
            let ejecucionesFiltro = 0; // Contador para debug

            const historialFiltrado = historial.filter(item => {
                ejecucionesFiltro++; // Incrementar contador
                if (!fechaDesde && !fechaHasta) return true;

                const fechaItem = new Date(item.fecha);
                fechaItem.setHours(0, 0, 0, 0);

                const desde = fechaDesde ? new Date(fechaDesde) : null;
                const hasta = fechaHasta ? new Date(fechaHasta) : null;

                if (desde) desde.setHours(0, 0, 0, 0);
                if (hasta) hasta.setHours(23, 59, 59, 999);

                if (desde && hasta) {
                    return fechaItem >= desde && fechaItem <= hasta;
                }
                return true;
            });

            const usuariosBuscados = historialFiltrado.reduce<AcumuladorUsuarios>((acc, item) => {
                if (!acc[item.userName]) {
                    acc[item.userName] = {
                        count: 0,
                        activos: 0,
                        inactivos: 0,
                        noEncontrados: 0,
                        nombreuser: item.nombreuser,
                        apellidouser: item.apellidouser,
                        busquedas: [],
                    };
                }

                acc[item.userName].busquedas.push({
                    rut: item.rutBuscado,
                    fecha: item.fecha,
                    estado: item.resultadoPAP,
                    nombrepaciente: item.nombrepaciente
                });

                const busquedas = acc[item.userName].busquedas;
                acc[item.userName].count = busquedas.length;
                acc[item.userName].activos = busquedas.filter(b => b.estado === "SI").length;
                acc[item.userName].inactivos = busquedas.filter(b => b.estado === "NO").length;
                acc[item.userName].noEncontrados = busquedas.filter(b => b.estado === 'No Encontrado').length;

                return acc;
            }, {});

            const usuariosArray = Object.entries(usuariosBuscados).map(([userName, data]) => ({
                userName,
                count: data.count,
                activos: data.activos,
                inactivos: data.inactivos,
                noEncontrados: data.noEncontrados,
                nombre: data.nombreuser,
                apellido: data.apellidouser,
                busquedas: data.busquedas,
            }));

            const todasLasBusquedas = usuariosArray.flatMap(user => user.busquedas);
            setTotal(todasLasBusquedas.length);
            setTotalActivos(todasLasBusquedas.filter(b => b.estado === "SI").length);
            setTotalInactivos(todasLasBusquedas.filter(b => b.estado === "NO").length);
            setTotalNoEncontrados(todasLasBusquedas.filter(b => b.estado === 'No Encontrado').length);

            setUsuarios(usuariosArray);
        } catch (error) {
            console.error("Error al obtener el historial de búsqueda:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Funciones para el modal
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

    // Funciones de animación para el picker
    const openPicker = () => {
        setIsPickerVisible(true);
        pickerYPosition.setValue(1000);
        pickerOverlayOpacity.setValue(0);

        Animated.parallel([
            Animated.spring(pickerYPosition, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 15,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01
            }),
            Animated.timing(pickerOverlayOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const closePicker = () => {
        Animated.parallel([
            Animated.spring(pickerYPosition, {
                toValue: 1000,
                useNativeDriver: true,
                tension: 65,
                friction: 15,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01
            }),
            Animated.timing(pickerOverlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsPickerVisible(false);
        });
    };

    // Animaciones del modal de detalles
    const openModal = (usuario: Usuario) => {
        setSelectedUser(usuario);
        setIsModalVisible(true);
        Animated.parallel([
            Animated.spring(modalYPosition, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 15,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01
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
            Animated.spring(modalYPosition, {
                toValue: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsModalVisible(false);
        });
    };

    // Función para manejar el cambio de orden
    const handleOrderChange = (orderValue: OrderOptionValue) => {
        setOrdenUsuarios(orderValue);
        closeOrderModal();
    };

    return (
        <View style={styles.container}>
            <View style={styles.bodyFlexBox}>
                {/* Selector de fecha */}
                <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={openPicker}
                >
                    <Text style={styles.selectorButtonText}>{selectedRange}</Text>
                    <Icons name="chevron-down" color="#f08fb8" size={20} />
                </TouchableOpacity>

                <View style={styles.containerTotales}>
                    <Pressable style={[styles.tarjetaInfo, styles.tarjetaColorInfo]}>
                        <Icons name={"heart-sharp"} color="#f08fb8" size={23} />
                        <Text style={styles.textoTarjetas}>Busqueda Total: {total}</Text>
                    </Pressable>
                    <Pressable style={[styles.tarjetaInfo, styles.tarjetaColorInfo]}>
                        <Icons name={"heart-circle-sharp"} color="#f08fb8" size={27} />
                        <Text style={styles.textoTarjetas}>PAP Vigentes: {totalActivos}</Text>
                    </Pressable>
                    <Pressable style={[styles.tarjetaInfo, styles.tarjetaColorInfo]}>
                        <Icons name={"heart-half-sharp"} color="#f08fb8" size={23} />
                        <Text style={styles.textoTarjetas}>PAP No Vigentes: {totalInactivos}</Text>
                    </Pressable>
                    <Pressable style={[styles.tarjetaInfo, styles.tarjetaColorInfo]}>
                        <Icons name={"heart-dislike-sharp"} color="#f08fb8" size={23} />
                        <Text style={styles.textoTarjetas}>No Encontrados: {totalNoEncontrados}</Text>
                    </Pressable>
                </View>

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
                    {orderOptions.find(option => option.value === ordenUsuarios)?.label}
                    </Text>
                </Pressable>

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
                            {orderOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionItem,
                                        index < orderOptions.length - 1 && styles.optionBorder,
                                        ordenUsuarios === option.value && styles.selectedOption
                                    ]}
                                    onPress={() => handleOrderChange(option.value as OrderOptionValue)}
                                >
                                    <View style={styles.optionContent}>
                                        <Icons
                                            name={option.icon}
                                            size={20}
                                            color={ordenUsuarios === option.value ? '#f08fb8' : '#666666'}
                                        />
                                        <Text style={[
                                            styles.optionText,
                                            ordenUsuarios === option.value && styles.selectedOptionText
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </Modal>

                {/* Lista de usuarios */}
                <ScrollView style={styles.scrollViewContainer}>
                    {[...usuarios]
                        .sort((a, b) => {
                            switch (ordenUsuarios) {
                                case 'MAYOR_MENOR':
                                    return b.count - a.count;
                                case 'MENOR_MAYOR':
                                    return a.count - b.count;
                                case 'AZ':
                                    return a.nombre.localeCompare(b.nombre);
                                case 'ZA':
                                    return b.nombre.localeCompare(a.nombre);
                                default:
                                    return b.count - a.count; // Por defecto, mayor a menor
                            }
                        })
                        .map((usuario) => (
                            <View key={usuario.userName}>
                                <Pressable
                                    onPress={() => openModal(usuario)}
                                    style={[styles.tarjeta, styles.tarjetaBorder]}
                                >
                                    <Text style={styles.userTitle}>
                                        {usuario.nombre} {usuario.apellido}
                                    </Text>
                                    <Text style={styles.userName}>@{usuario.userName}</Text>
                                    <View style={[styles.ordenamientoTarjetasInfo, styles.contendeorinfo]}>
                                        <Text style={styles.userStat}>Total: {usuario.count}</Text>
                                        <Text style={styles.userStat}>Vigentes: {usuario.activos}</Text>
                                        <Text style={styles.userStat}>No Vigentes: {usuario.inactivos}</Text>
                                        <Text style={styles.userStat}>No Encontrados: {usuario.noEncontrados}</Text>
                                    </View>
                                </Pressable>
                            </View>
                        ))}
                </ScrollView>


                {/* Modal del picker */}
                <Modal
                    visible={isPickerVisible}
                    transparent
                    animationType="none"
                    onRequestClose={closePicker}
                    statusBarTranslucent={true}
                >
                    {isPickerVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}
                    <Animated.View
                        style={[styles.overlay, { opacity: pickerOverlayOpacity }]}
                    >
                        <TouchableWithoutFeedback onPress={closePicker}>
                            <View style={StyleSheet.absoluteFill} />
                        </TouchableWithoutFeedback>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.modalViewV2,
                            { transform: [{ translateY: pickerYPosition }] }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar rango</Text>
                            <TouchableOpacity onPress={closePicker}>
                                <Text style={styles.modalCloseText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.optionsContainer}>
                            {dateRanges.map((range, index) => (
                                <TouchableOpacity
                                    key={range.label}
                                    style={[
                                        styles.optionItem,
                                        index < dateRanges.length - 1 && styles.optionBorder,
                                        selectedRange === range.label && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        handleRangeChange(range.label);
                                        closePicker();
                                    }}
                                >
                                    <View style={styles.optionContent}>
                                        <Icons
                                            name={range.icon || 'default-icon'}
                                            size={20}
                                            color={selectedRange === range.label ? '#f08fb8' : '#666666'}
                                        />
                                        <Text style={[
                                            styles.optionText,
                                            selectedRange === range.label && styles.selectedOptionText
                                        ]}>
                                            {range.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </Modal>

                {/* Modal de detalles */}
                <Modal 
                    transparent 
                    visible={isModalVisible} 
                    animationType="none"
                    statusBarTranslucent={true}
                >
                    {isModalVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}
                    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                        <TouchableWithoutFeedback onPress={closeModal}>
                            <View style={StyleSheet.absoluteFill} />
                        </TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalView,
                                { transform: [{ translateY: modalYPosition }] }
                            ]}
                        >
                            {/* Filtros */}
                            <View style={styles.filtrosContainer}>
                                <View style={styles.toggleContainer}>
                                    <Pressable
                                        style={[
                                            styles.toggleButton,
                                            filtroEstado === 'TODOS' && styles.toggleButtonActive
                                        ]}
                                        onPress={() => setFiltroEstado('TODOS')}
                                    >
                                        <Text style={filtroEstado === 'TODOS' ? styles.toggleTextActive : styles.toggleTextInactive}>
                                            Todos
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[
                                            styles.toggleButton,
                                            filtroEstado === 'SI' && styles.toggleButtonActive
                                        ]}
                                        onPress={() => setFiltroEstado('SI')}
                                    >
                                        <Text style={filtroEstado === 'SI' ? styles.toggleTextActive : styles.toggleTextInactive}>
                                            Vigentes
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[
                                            styles.toggleButton,
                                            filtroEstado === 'NO' && styles.toggleButtonActive
                                        ]}
                                        onPress={() => setFiltroEstado('NO')}
                                    >
                                        <Text style={filtroEstado === 'NO' ? styles.toggleTextActive : styles.toggleTextInactive}>
                                            No Vigentes
                                        </Text>
                                    </Pressable>
                                </View>

                                <TextInput
                                    placeholder="Filtrar por RUT"
                                    value={filtroRut}
                                    onChangeText={(text) => setFiltroRut(text.replace(/[^0-9]/g, ''))}
                                    style={styles.inputFilter}
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    maxLength={12}
                                />

                                <Pressable
                                    style={styles.orderButton}
                                    onPress={() => setOrden(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                                >
                                    <Icons
                                        name={orden === 'ASC' ? 'arrow-up' : 'arrow-down'}
                                        color="white"
                                        size={20}
                                    />
                                    <Text style={styles.orderText}>
                                        {orden === 'ASC' ? 'Más antiguo' : 'Más reciente'}
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Lista de búsquedas filtradas */}
                            <ScrollView>
                                {selectedUser?.busquedas
                                    ?.filter(busqueda => {
                                        const cumpleEstado = filtroEstado === 'TODOS' || busqueda.estado === filtroEstado;
                                        const cumpleRut = !filtroRut || busqueda.rut.toLowerCase().includes(filtroRut.toLowerCase());
                                        return cumpleEstado && cumpleRut;
                                    })
                                    .sort((a, b) => {
                                        return orden === 'ASC'
                                            ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                                            : new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
                                    })
                                    .map((busqueda, index) => (
                                        <View
                                            key={index}
                                            style={busqueda.estado === "SI"
                                                ? styles.tarjetaInfoforUserActive
                                                : styles.tarjetaInfoforUserInactive}
                                        >
                                            <Text style={[
                                                busqueda.estado === "SI"
                                                    ? styles.textInfoforUserActive
                                                    : styles.textInfoforUserInactive
                                            ]}>
                                                <Text style={styles.boldText}>Paciente:</Text> {busqueda.nombrepaciente}
                                            </Text>
                                            <Text style={[
                                                busqueda.estado === "SI"
                                                    ? styles.textInfoforUserActive
                                                    : styles.textInfoforUserInactive
                                            ]}>
                                                <Text style={styles.boldText}>Rut:</Text> {busqueda.rut}
                                            </Text>
                                            <Text style={[
                                                busqueda.estado === "SI"
                                                    ? styles.textInfoforUserActive
                                                    : styles.textInfoforUserInactive
                                            ]}>
                                                <Text style={styles.boldText}>Fecha Búsqueda:</Text> {formatearFecha(busqueda.fecha)}
                                            </Text>
                                            <Text style={[
                                                busqueda.estado === "SI"
                                                    ? styles.textInfoforUserActive
                                                    : styles.textInfoforUserInactive
                                            ]}>
                                                <Text style={styles.boldText}>PAP Vigente: </Text> {busqueda.estado}
                                            </Text>
                                        </View>
                                    ))}
                            </ScrollView>

                            <Pressable style={styles.closeButton} onPress={closeModal}>
                                <View style={styles.closeButtonContent}>
                                    <Icons name={"close-outline"} color="black" size={25} />
                                    <Text style={styles.closeText}>Cerrar</Text>
                                </View>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </Modal>

                {isLoading && <LoadingModal visible={true} />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  userTitle: {
      color: 'black',
      fontWeight: 'bold',
      fontSize: 19
  },
  userName: {
      color: 'black'
  },
  userStat: {
      color: 'black'
  },
  // Estilos base
  container: {
      flex: 1,
      backgroundColor: Color.colorLavenderblush,
      padding: Padding.p_base,
  },
  bodyFlexBox: {
      flex: 1,
      width: '100%',
  },

  // Estilos del selector y botón de búsqueda
  selectorButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: '#f08fb8',
      backgroundColor: 'white',
      marginBottom: 10,
  },
  selectorButtonText: {
      fontSize: 16,
      color: '#000000',
  },
  bottonbuscar: {
      borderRadius: 15,
      backgroundColor: "#f08fb8",
      height: 45,
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      width: '100%',
      marginVertical: 10,
  },
  buscarText: {
      color: "white",
      fontSize: 17,
  },
  bottonPressed: {
      opacity: 0.6,
  },

  // Estilos de las tarjetas de totales
  containerTotales: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      padding: 0,
  },
  tarjetaInfo: {
      fontSize: 1,
      width: '48%',
      height: 50,
      paddingHorizontal: 7,
      gap: 5,
      borderRadius: 16,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  tarjetaColorInfo: {
      borderWidth: 1,
      borderColor: "#f08fb8",
      backgroundColor: "#fff",
      flexDirection: "row",
      alignItems: "center",
  },
  textoTarjetas: {
      fontSize: 14,
      color: 'black',
      fontWeight: 'bold',
  },

  // Estilos de la lista de usuarios
  scrollViewContainer: {
      flex: 1,
      width: '100%',
  },
  tarjeta: {
      borderRadius: 15,
      width: '100%',
      padding: 10,
      marginVertical: 10,
  },
  tarjetaBorder: {
      borderWidth: 1,
      borderColor: "#f08fb8",
      backgroundColor: "#fff",
  },
  contendeorinfo: {
      flexWrap: "wrap",
      alignContent: "center",
      rowGap: 15,
      columnGap: 10,
      alignSelf: "stretch",
  },
  ordenamientoTarjetasInfo: {
      marginVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
  },

  // Estilos de modales
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
      height: '75%',
      padding: 20,
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

  // Estilos de las opciones del picker
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

  // Estilos de filtros
  filtrosContainer: {
      gap: 10,
      marginBottom: 15,
      borderRadius: 15,
  },
  toggleContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
  },
  toggleButton: {
      flex: 1,
      padding: 10,
      borderRadius: 15,
      borderWidth: 3,
      borderColor: '#fdd6e4',
      alignItems: 'center',
  },
  toggleButtonActive: {
      backgroundColor: '#f08fb8',
  },
  toggleTextActive: {
      color: 'white',
      fontWeight: 'bold',
  },
  toggleTextInactive: {
      color: '#f08fb8',
  },
  inputFilter: {
      borderWidth: 3,
      borderColor: '#fdd6e4',
      backgroundColor: 'white',
      borderRadius: 15,
      height: 40,
      paddingHorizontal: 15,
      color: '#000',
  },

  // Estilos de botones de ordenamiento
  orderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 15,
      backgroundColor: '#f08fb8',
      gap: 5,
  },
  orderText: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
  },

  // Estilos de tarjetas de búsqueda
  tarjetaInfoforUserActive: {
      width: '100%',
      padding: 15,
      backgroundColor: '#f08fb8',
      borderRadius: 15,
      marginBottom: 15,
  },
  tarjetaInfoforUserInactive: {
      width: '100%',
      padding: 15,
      backgroundColor: 'white',
      borderRadius: 15,
      borderColor: '#f08fb8',
      borderWidth: 2,
      marginBottom: 15,
  },
  textInfoforUserActive: {
      fontSize: 17,
      color: 'white',
  },
  textInfoforUserInactive: {
      fontSize: 17,
      color: 'black',
  },
  boldText: {
      fontWeight: 'bold',
  },

  // Estilos del botón cerrar
  closeButton: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: 'white',
      height: 40,
      width: 130,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      bottom: 0,
      margin: 20,
      elevation: 5,
  },
  closeButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  closeText: {
      color: "black",
      fontSize: 18,
      fontWeight: 'bold',
  },
});