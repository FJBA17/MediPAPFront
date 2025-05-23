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

          //console.log('Seguimiento recibido:', seguimientoRes.data);

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
      //console.error(error);
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


  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1 }}>

        {/*Header*/}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Datos de la Paciente</Text>
          {seguimiento ? (
            <View style={styles.card}>
              <Text><Text style={styles.title}>Nombre:</Text> {seguimiento.nombreCompleto}</Text>
              <Text><Text style={styles.title}>RUT:</Text> {seguimiento.rut}</Text>
              <Text><Text style={styles.title}>Edad:</Text> {seguimiento.edad || 'No registrada'}</Text>
              <Text><Text style={styles.title}>Fecha Nacimiento:</Text> {seguimiento.fechaNacimiento || 'No registrado'}</Text>
              <Text><Text style={styles.title}>Fono:</Text> {seguimiento.fono || 'No registrado'}</Text>
              <Text><Text style={styles.title}>Domicilio:</Text> {seguimiento.domicilio || 'No registrado'}</Text>
              <Text><Text style={styles.title}>Fecha Detección:</Text> {formatearFechaHora(seguimiento.fechaDeteccion)?.slice(0,8) || 'No registrada'}</Text>
              <Text><Text style={styles.title}>Fecha PAP:</Text> {seguimiento.fechaPap || 'No registrada'}</Text>
              <Text><Text style={styles.title}>Vigencia PAP:</Text> {seguimiento.vigenciaPap || 'No registrada'}</Text>
              <Text><Text style={styles.title}>Años PAP:</Text> {seguimiento.anosPap ?? 'No registrado'}</Text>
              <Text><Text style={styles.title}>Estado actual:</Text> {estadoActual}</Text>
            </View>
          ) : (
            <Text>No se encontró información del seguimiento.</Text>
          )}

          <Text style={styles.title}>Notas</Text>
        </View>

        {/* Lista de notas */}
        <View style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {notas.length === 0 ? (
              <Text style={styles.noNotas}>No hay notas registradas</Text>
            ) : (
              notas.map((nota, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.fecha}>{formatearFechaHora(nota.fecha)}</Text>
                  <Text style={styles.textoNota}>{nota.nota}</Text>
                  <Text style={styles.autor}>Registrado por: {nota.usuarioRegistro}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        
        {/* Botón flotante */}
        <TouchableOpacity style={styles.floatingButton} onPress={openModal}>
          <Icon name="add-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal para crear*/}
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
          <Text style={styles.modalTitle}>Nueva Nota</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe la nota..."
            multiline
            value={nuevaNota}
            onChangeText={setNuevaNota}
          />
          <TouchableOpacity onPress={() => setShowEstadoOptions(!showEstadoOptions)} style={styles.selector}>
            <Text style={styles.selectorText}>{nuevoEstado}</Text>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={crearNotaYEstado}>
              <Text style={styles.modalButtonText}>Guardar</Text>
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
    flexGrow: 1,
    padding: 16,
    backgroundColor: Color.colorWhite,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Color.colorPalevioletred_100
  },
  noNotas: {
    fontStyle: 'italic',
    color: '#888',
  },
  headerContainer: {
    paddingHorizontal: 16,
    backgroundColor: Color.colorWhite,
  },
  scrollNotas: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  card: {
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f08fb8',
    borderRadius: 12,
    backgroundColor: Color.colorLavenderblush,
  },
  fecha: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textoNota: {
    fontSize: 15,
    marginBottom: 5,
  },
  autor: {
    fontSize: 13,
    color: '#666',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#f08fb8',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black'
  },
  input: {
    borderWidth: 1,
    borderColor: Color.colorLavenderblush_200,
    borderRadius: 10,
    padding: 10,
    height: 100,
    marginBottom: 15,
    textAlignVertical: 'top'
  },
  selector: {
    borderWidth: 1,
    borderColor: Color.colorLavenderblush_200,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  optionList: {
    marginBottom: 15,
  },
  optionItem: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    color: Color.colorPlum,
  },
  modalButton: {
    backgroundColor: Color.colorPlum,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
