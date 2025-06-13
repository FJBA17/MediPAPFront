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
import { LinearGradient } from 'expo-linear-gradient';
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

    // Estados para el modal de ordenamiento
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

    // Effects
    useEffect(() => {
        handleRangeChange("Semana actual");
    }, []);

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

            let ejecucionesFiltro = 0;

            const historialFiltrado = historial.filter(item => {
                ejecucionesFiltro++;
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

    // Funciones para modales con animaciones mejoradas
    const openOrderModal = () => {
        setIsOrderModalVisible(true);
        orderModalY.setValue(1000);
        orderOverlayOpacity.setValue(0);

        Animated.parallel([
            Animated.spring(orderModalY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01
            }),
            Animated.timing(orderOverlayOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start();
    };

    const closeOrderModal = () => {
        Animated.parallel([
            Animated.spring(orderModalY, {
                toValue: 1000,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
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

    const openPicker = () => {
        setIsPickerVisible(true);
        pickerYPosition.setValue(1000);
        pickerOverlayOpacity.setValue(0);

        Animated.parallel([
            Animated.spring(pickerYPosition, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
            }),
            Animated.timing(pickerOverlayOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start();
    };

    const closePicker = () => {
        Animated.parallel([
            Animated.spring(pickerYPosition, {
                toValue: 1000,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
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

    const openModal = (usuario: Usuario) => {
        setSelectedUser(usuario);
        setIsModalVisible(true);
        Animated.parallel([
            Animated.spring(modalYPosition, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.spring(modalYPosition, {
                toValue: 1000,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsModalVisible(false);
            setSelectedUser(null);
        });
    };

    const handleOrderChange = (orderValue: OrderOptionValue) => {
        setOrdenUsuarios(orderValue);
        closeOrderModal();
    };

    return (
        <LinearGradient colors={['#b52e69', '#f08fb8', 'white']} style={styles.gradient}>
            <View style={styles.container}>
                <View style={styles.bodyFlexBox}>
                    {/* Selector de fecha mejorado */}
                    <TouchableOpacity
                        style={styles.selectorButton}
                        onPress={openPicker}
                        activeOpacity={0.8}
                    >
                        <View style={styles.selectorContent}>
                            <Icons name="calendar" color="#b52e69" size={20} />
                            <Text style={styles.selectorButtonText}>{selectedRange}</Text>
                        </View>
                        <Icons name="chevron-down" color="#b52e69" size={20} />
                    </TouchableOpacity>

                    {/* Tarjetas de estadísticas mejoradas */}
                    <View style={styles.containerTotales}>
                        <View style={[styles.tarjetaInfo, styles.tarjetaTotal]}>
                            <LinearGradient 
                                colors={['#b52e69', '#f08fb8']} 
                                style={styles.gradientCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Icons name="search" color="white" size={24} />
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardNumber}>{total}</Text>
                                    <Text style={styles.cardLabel}>Búsquedas Total</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={[styles.tarjetaInfo, styles.tarjetaActivos]}>
                            <LinearGradient 
                                colors={['#4CAF50', '#8BC34A']} 
                                style={styles.gradientCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Icons name="checkmark-circle" color="white" size={24} />
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardNumber}>{totalActivos}</Text>
                                    <Text style={styles.cardLabel}>PAP Vigentes</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={[styles.tarjetaInfo, styles.tarjetaInactivos]}>
                            <LinearGradient 
                                colors={['#FF9800', '#FFC107']} 
                                style={styles.gradientCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Icons name="time" color="white" size={24} />
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardNumber}>{totalInactivos}</Text>
                                    <Text style={styles.cardLabel}>PAP No Vigentes</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={[styles.tarjetaInfo, styles.tarjetaNoEncontrados]}>
                            <LinearGradient 
                                colors={['#F44336', '#E91E63']} 
                                style={styles.gradientCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Icons name="close-circle" color="white" size={24} />
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardNumber}>{totalNoEncontrados}</Text>
                                    <Text style={styles.cardLabel}>No Encontrados</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Botón de ordenamiento mejorado */}
                    <TouchableOpacity
                        style={styles.orderButton}
                        onPress={openOrderModal}
                        activeOpacity={0.8}
                    >
                        <LinearGradient 
                            colors={['#b52e69', '#f08fb8']} 
                            style={styles.orderButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Icons name="filter-circle-sharp" color="white" size={20} />
                            <Text style={styles.orderText}>
                                {orderOptions.find(option => option.value === ordenUsuarios)?.label}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Lista de usuarios mejorada */}
                    <ScrollView 
                        style={styles.scrollViewContainer}
                        showsVerticalScrollIndicator={false}
                    >
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
                                        return b.count - a.count;
                                }
                            })
                            .map((usuario) => (
                                <TouchableOpacity
                                    key={usuario.userName}
                                    onPress={() => openModal(usuario)}
                                    style={styles.tarjeta}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.userCard}>
                                        <View style={styles.userHeader}>
                                            <View style={styles.userAvatarContainer}>
                                                <LinearGradient 
                                                    colors={['#b52e69', '#f08fb8']} 
                                                    style={styles.userAvatar}
                                                >
                                                    <Text style={styles.userInitials}>
                                                        {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                                    </Text>
                                                </LinearGradient>
                                            </View>
                                            <View style={styles.userInfo}>
                                                <Text style={styles.userTitle}>
                                                    {usuario.nombre} {usuario.apellido}
                                                </Text>
                                                <Text style={styles.userName}>@{usuario.userName}</Text>
                                            </View>
                                            <Icons name="chevron-forward" color="#b52e69" size={20} />
                                        </View>
                                        
                                        <View style={styles.statsContainer}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statNumber}>{usuario.count}</Text>
                                                <Text style={styles.statLabel}>Total</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={[styles.statNumber, styles.statVigentes]}>{usuario.activos}</Text>
                                                <Text style={styles.statLabel}>Vigentes</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={[styles.statNumber, styles.statNoVigentes]}>{usuario.inactivos}</Text>
                                                <Text style={styles.statLabel}>No Vigentes</Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <Text style={[styles.statNumber, styles.statNoEncontrados]}>{usuario.noEncontrados}</Text>
                                                <Text style={styles.statLabel}>No Encontrados</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>

                    {/* Resto de modales... (mantengo los mismos pero con estilos mejorados) */}
                    {/* Modal del picker de fechas */}
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
                                                name={range.icon || 'calendar'}
                                                size={20}
                                                color={selectedRange === range.label ? '#b52e69' : '#666666'}
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
                            style={[styles.overlay, { opacity: orderOverlayOpacity }]}
                        >
                            <TouchableWithoutFeedback onPress={closeOrderModal}>
                                <View style={StyleSheet.absoluteFill} />
                            </TouchableWithoutFeedback>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.modalViewV2,
                                { transform: [{ translateY: orderModalY }] }
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
                                                color={ordenUsuarios === option.value ? '#b52e69' : '#666666'}
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

                    {/* Modal de detalles mejorado */}
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
                                {/* Header del modal */}
                                <View style={styles.modalDetailHeader}>
                                    <View style={styles.userDetailInfo}>
                                        <Text style={styles.modalDetailTitle}>
                                            {selectedUser?.nombre} {selectedUser?.apellido}
                                        </Text>
                                        <Text style={styles.modalDetailSubtitle}>
                                            @{selectedUser?.userName}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={closeModal} style={styles.closeIconButton}>
                                        <Icons name="close" color="#666" size={24} />
                                    </TouchableOpacity>
                                </View>

                                {/* Filtros mejorados */}
                                <View style={styles.filtrosContainer}>
                                    <View style={styles.toggleContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.toggleButton,
                                                filtroEstado === 'TODOS' && styles.toggleButtonActive
                                            ]}
                                            onPress={() => setFiltroEstado('TODOS')}
                                        >
                                            <Text style={filtroEstado === 'TODOS' ? styles.toggleTextActive : styles.toggleTextInactive}>
                                                Todos
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.toggleButton,
                                                filtroEstado === 'SI' && styles.toggleButtonActive
                                            ]}
                                            onPress={() => setFiltroEstado('SI')}
                                        >
                                            <Text style={filtroEstado === 'SI' ? styles.toggleTextActive : styles.toggleTextInactive}>
                                                Vigentes
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.toggleButton,
                                                filtroEstado === 'NO' && styles.toggleButtonActive
                                            ]}
                                            onPress={() => setFiltroEstado('NO')}
                                        >
                                            <Text style={filtroEstado === 'NO' ? styles.toggleTextActive : styles.toggleTextInactive}>
                                                No Vigentes
                                            </Text>
                                        </TouchableOpacity>
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

                                    <TouchableOpacity
                                        style={styles.orderDetailButton}
                                        onPress={() => setOrden(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                                    >
                                        <LinearGradient 
                                            colors={['#b52e69', '#f08fb8']} 
                                            style={styles.orderDetailGradient}
                                        >
                                            <Icons
                                                name={orden === 'ASC' ? 'arrow-up' : 'arrow-down'}
                                                color="white"
                                                size={20}
                                            />
                                            <Text style={styles.orderText}>
                                                {orden === 'ASC' ? 'Más antiguo' : 'Más reciente'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>

                                {/* Lista de búsquedas mejorada */}
                                <ScrollView style={styles.detailScrollView}>
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
                                            <View key={index} style={styles.busquedaCard}>
                                                <View style={[
                                                    styles.busquedaIndicator,
                                                    busqueda.estado === "SI" && styles.vigenteBorder,
                                                    busqueda.estado === "NO" && styles.noVigenteBorder,
                                                    busqueda.estado === "No Encontrado" && styles.noEncontradoBorder,
                                                ]} />
                                                
                                                <View style={styles.busquedaContent}>
                                                    <View style={styles.busquedaHeader}>
                                                        <Text style={styles.pacienteNombre}>
                                                            {busqueda.nombrepaciente}
                                                        </Text>
                                                        <View style={[
                                                            styles.estadoBadge,
                                                            busqueda.estado === "SI" && styles.vigenteBackground,
                                                            busqueda.estado === "NO" && styles.noVigenteBackground,
                                                            busqueda.estado === "No Encontrado" && styles.noEncontradoBackground,
                                                        ]}>
                                                            <Text style={[
                                                                styles.estadoText,
                                                                busqueda.estado === "SI" && styles.vigenteText,
                                                                busqueda.estado === "NO" && styles.noVigenteText,
                                                                busqueda.estado === "No Encontrado" && styles.noEncontradoText,
                                                            ]}>
                                                                {busqueda.estado === "SI" ? "Vigente" : 
                                                                 busqueda.estado === "NO" ? "No Vigente" : "No Encontrado"}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    
                                                    <View style={styles.busquedaDetails}>
                                                        <View style={styles.detailRow}>
                                                            <Icons name="person" size={16} color="#666" />
                                                            <Text style={styles.detailLabel}>RUT:</Text>
                                                            <Text style={styles.detailValue}>{busqueda.rut}</Text>
                                                        </View>
                                                        
                                                        <View style={styles.detailRow}>
                                                            <Icons name="calendar" size={16} color="#666" />
                                                            <Text style={styles.detailLabel}>Fecha:</Text>
                                                            <Text style={styles.detailValue}>{formatearFecha(busqueda.fecha)}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                </ScrollView>
                            </Animated.View>
                        </Animated.View>
                    </Modal>

                    {isLoading && <LoadingModal visible={true} />}
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: Padding.p_base,
    },
    bodyFlexBox: {
        flex: 1,
        width: '100%',
    },

    // Estilos del selector mejorado
    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    selectorButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },

    // Estilos de las tarjetas de estadísticas mejoradas
    containerTotales: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 10,
    },
    tarjetaInfo: {
        width: '48%',
        height: 90,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    gradientCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    cardLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },

    // Estilos del botón de ordenamiento
    orderButton: {
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    orderButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 8,
    },
    orderText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Estilos de la lista de usuarios mejorada
    scrollViewContainer: {
        flex: 1,
    },
    tarjeta: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    userCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 20,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    userAvatarContainer: {
        marginRight: 12,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInitials: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    userName: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(181, 46, 105, 0.05)',
        borderRadius: 15,
        padding: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    statVigentes: {
        color: '#4CAF50',
    },
    statNoVigentes: {
        color: '#FF9800',
    },
    statNoEncontrados: {
        color: '#F44336',
    },

    // Estilos de modales mejorados
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    modalView: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '80%',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    modalViewV2: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        maxHeight: '70%',
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
        color: '#333',
    },
    modalCloseText: {
        fontSize: 16,
        color: '#b52e69',
        fontWeight: '600',
    },

    // Header del modal de detalles
    modalDetailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 16,
    },
    userDetailInfo: {
        flex: 1,
    },
    modalDetailTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    modalDetailSubtitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    closeIconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },

    // Estilos de las opciones del picker
    optionsContainer: {
        maxHeight: '100%',
        paddingBottom: 20,
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
        borderBottomColor: '#E0E0E0',
    },
    optionText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    selectedOption: {
        backgroundColor: 'rgba(181, 46, 105, 0.1)',
    },
    selectedOptionText: {
        color: '#b52e69',
        fontWeight: 'bold',
    },

    // Estilos de filtros mejorados
    filtrosContainer: {
        gap: 12,
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(181, 46, 105, 0.3)',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    toggleButtonActive: {
        backgroundColor: '#b52e69',
        borderColor: '#b52e69',
    },
    toggleTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    toggleTextInactive: {
        color: '#b52e69',
        fontWeight: '600',
    },
    inputFilter: {
        borderWidth: 2,
        borderColor: 'rgba(181, 46, 105, 0.3)',
        backgroundColor: 'white',
        borderRadius: 20,
        height: 48,
        paddingHorizontal: 16,
        color: '#333',
        fontSize: 16,
    },

    // Botón de ordenamiento en modal de detalles
    orderDetailButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    orderDetailGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 8,
    },

    // Estilos de las tarjetas de búsqueda mejoradas
    detailScrollView: {
        flex: 1,
        marginBottom: 60,
    },
    busquedaCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    busquedaIndicator: {
        width: 4,
        backgroundColor: '#E0E0E0',
    },
    vigenteBorder: {
        backgroundColor: '#4CAF50',
    },
    noVigenteBorder: {
        backgroundColor: '#FF9800',
    },
    noEncontradoBorder: {
        backgroundColor: '#F44336',
    },
    busquedaContent: {
        flex: 1,
        padding: 16,
    },
    busquedaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    pacienteNombre: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    estadoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    vigenteBackground: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
    },
    noVigenteBackground: {
        backgroundColor: 'rgba(255, 152, 0, 0.15)',
    },
    noEncontradoBackground: {
        backgroundColor: 'rgba(244, 67, 54, 0.15)',
    },
    estadoText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    vigenteText: {
        color: '#4CAF50',
    },
    noVigenteText: {
        color: '#FF9800',
    },
    noEncontradoText: {
        color: '#F44336',
    },
    busquedaDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        minWidth: 50,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 1,
    },

    // Estilos adicionales para mejorar la UI
    tarjetaTotal: {
        // Gradiente específico para total
    },
    tarjetaActivos: {
        // Gradiente específico para activos
    },
    tarjetaInactivos: {
        // Gradiente específico para inactivos  
    },
    tarjetaNoEncontrados: {
        // Gradiente específico para no encontrados
    },
});