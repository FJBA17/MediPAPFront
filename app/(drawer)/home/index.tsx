import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import { useFocusEffect } from 'expo-router';
import { PapCamposVisible } from '../../../src/interfaces/papCamposVisibles.interface';
import { Color, Padding, FontFamily, Border, FontSize } from "../../../src/theme/GlobalStyles";
import CustomAlert from '../../../src/components/CustomAlert';
import QRScanner from '../../../src/components/QRScanner';
import VersionDisplay from '../../../src/components/VersionAPP';
import { AcuerdoCompromisoModal } from '../../../src/components/AcuerdoCompromisoModal';
import { useAutorizacionStore } from '../../../src/store/Autorizacion/Autorizacion.store';
import { useShallow } from 'zustand/react/shallow';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [rut, setRut] = useState('');
  const [pap, setPap] = useState<PapCamposVisible[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [camposVisibles, setCamposVisibles] = useState<any[]>([]);
  const [ordenamiento, setOrdenamiento] = useState<'configurado' | 'alfabetico'>('configurado');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertConfirmText, setAlertConfirmText] = useState('OK');
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [currentRut, setCurrentRut] = useState('');
  
  // Obtener usuario y verificar si es admin
  const user = useAutorizacionStore(useShallow(state => state.user));
  const isAdmin = user?.isAdmin === true || user?.isAdmin === "true";
  const showAcuerdo = useAutorizacionStore(state => state.showAcuerdo);

  const fetchCamposVisibles = useCallback(async () => {
    // Solo intentar cargar campos visibles si el usuario es admin
    if (!isAdmin) {
      setCamposVisibles([]);
      return;
    }
    
    try {
      const response = await MedicionesApi.get('/pap/campos');
      const camposVisibles = response.data.filter(campo => campo.visible);
      setCamposVisibles(camposVisibles);
    } catch (error) {
      console.log("Error al cargar campos visibles:", error);
      setCamposVisibles([]);
    }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      fetchCamposVisibles();
    }, [fetchCamposVisibles])
  );

  async function buscarPaciente(rutEscaneado?: string) {
    const rutABuscar = rutEscaneado || rut;

    if (!rutABuscar) {
      setAlertTitle('Por favor, ingrese un RUT válido.');
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await MedicionesApi.get(`/pap/${rutABuscar}`);

      if (response.data.encontrados) {
        const datos = response.data.resultados[0];
        const vigenciaPap = datos.find(item => item.label === 'Vigencia Pap')?.valor || 'No Encontrado';
        const nombrePaciente = datos.find(item => item.label === 'Nombre Completo')?.valor || 'No Encontrado';
        const rutCompleto = datos.find(item => item.label.toLowerCase().includes('rut'))?.valor || '';

        setPap(response.data.resultados);
        setCurrentRut(rutCompleto);

        // Mostrar botón flotante si vigenciaPap es "No"
        setShowFloatingButton(vigenciaPap === 'NO');

        // Intenta guardar el historial solo si es necesario (y maneja posibles errores silenciosamente)
        try {
          await MedicionesApi.post('/historial-busqueda', {
            userName: user?.userName,
            rutBuscado: rutABuscar,
            resultadoPAP: vigenciaPap,
            nombreuser: user?.nombre,
            apellidouser: user?.apellido,
            nombrePaciente
          });
        } catch (historialError) {
          console.log("Error al guardar historial (silenciado):", historialError);
        }
      } else {
        setPap(null);
        setShowFloatingButton(false);
        await guardarHistorial(rutABuscar, false);
        setAlertTitle('No se encontraron datos para el RUT ingresado.');
        setAlertVisible(true);
      }
    } catch (error) {
      await guardarHistorial(rutABuscar, false);
      setShowFloatingButton(false);
      
      // Manejo especial para errores 404 (No encontrado)
      if (error.response && error.response.status === 404) {
        setAlertTitle('No se encontraron datos para el RUT ingresado.');
      } else if (error.response) {
        setAlertTitle(error.response.data.message || 'Ocurrió un error al buscar los datos.');
      } else if (error.request) {
        setAlertTitle('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.');
      } else {
        setAlertTitle('Ocurrió un error al procesar la solicitud. Por favor, intente de nuevo.');
      }
      
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
      setPap(null);
    } finally {
      setIsLoading(false);
    }
  }

  const guardarHistorial = async (rutBuscado: string, encontrado: boolean) => {
    try {
      let vigenciaPap = 'No Encontrado';
      let nombrePaciente = 'No Encontrado';

      if (encontrado && pap?.[0]) {
        const datos = pap[0] || [];
        const vigenciaItem = datos.find(item => item.label === 'Vigencia Pap');
        const nombreItem = datos.find(item => item.label === 'Nombre Completo');

        vigenciaPap = vigenciaItem?.valor || 'No Encontrado';
        nombrePaciente = nombreItem?.valor || 'No Encontrado';
      }

      // Solo intentar guardar historial si hay información del usuario
      if (user?.userName) {
        await MedicionesApi.post('/historial-busqueda', {
          userName: user.userName,
          rutBuscado,
          resultadoPAP: vigenciaPap,
          nombreuser: user.nombre || '',
          apellidouser: user.apellido || '',
          nombrePaciente
        });
      }
    } catch (error) {
      // Silenciar error de historial para no interrumpir la experiencia del usuario
      console.error('Error guardar historial (silenciado):', error);
    }
  };

  const handleQRScan = useCallback((scannedRut: string) => {
    setRut(scannedRut);
    setShowQRScanner(false);
    buscarPaciente(scannedRut);
  }, []);

  const handleRutChange = (text: string): void => {
    const rutDigits = text.replace(/\D/g, '');
    setRut(rutDigits);
  };

  const ordenarCampos = useCallback((campos: any[], tipoOrden: 'configurado' | 'alfabetico') => {
    if (tipoOrden === 'configurado') {
      return [...campos].sort((a, b) => a.id - b.id);
    } else {
      return [...campos].sort((a, b) => a.label.localeCompare(b.label));
    }
  }, []);

  // Función para crear seguimiento PAP
  const crearSeguimientoPap = async () => {
    if (!currentRut || !user?.userName) {
      setAlertTitle('No se puede crear seguimiento: Información incompleta');
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Comprobar que el RUT tiene el formato correcto (con guión)
      if (!currentRut.includes('-')) {
        setAlertTitle('Error en el formato del RUT. Contacte al administrador.');
        setAlertConfirmText('OK');
        setShowCancelButton(false);
        setAlertVisible(true);
        setIsLoading(false);
        return;
      }
      
      // Crear seguimiento PAP
      await MedicionesApi.post('/seguimientoPap', {
        rut: currentRut
      });
      
      // Cambiar estado a "No Contactada"
      await MedicionesApi.post('/seguimientoEstado', {
        rut: currentRut,
        estado: "No Contactada",
        userName: user.userName
      });
      
      // Mostrar mensaje de éxito
      setAlertTitle('Seguimiento PAP creado exitosamente');
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
      
      // Ocultar el botón flotante después de crear el seguimiento
      setShowFloatingButton(false);
      
    } catch (error) {
      console.error("Error al crear seguimiento PAP:", error);
      
      let errorMsg = 'Error al crear seguimiento PAP. Intente nuevamente.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      }
      
      setAlertTitle(errorMsg);
      setAlertConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const PapItem = ({ item }: { item: PapCamposVisible[] }) => {
    const [expanded, setExpanded] = useState(true);
    const camposOrdenados = ordenarCampos(item, ordenamiento);

    const toggleExpand = () => {
      setExpanded(!expanded);
    };

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={toggleExpand} style={styles.headerContainer}>
          <Text style={styles.headerText}></Text>
          <Icon
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            type="material"
            size={24}
            color="#a33d69"
          />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.detailsContainer}>
            {camposOrdenados.map((campo, index) => (
              <View key={campo.id || index} style={styles.detailItem}>
                <View style={styles.detailIconLabelContainer}>
                  <Icon name={campo.icono || 'info'} type="material" size={20} color="#a33d69" />
                  <Text style={styles.detailLabel}>{campo.label}:</Text>
                </View>
                <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="tail">
                  {campo.valor !== null && campo.valor !== undefined ? campo.valor : 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderResults = () => (
    <ScrollView style={styles.resultsContainer}>
      <View style={styles.resultHeaderContainer}>
        <Text style={styles.resultTitle}>Ordenar por:</Text>
        <View style={styles.sortButtonsContainer}>
          <Button
            icon={
              <Icon
                name="sort"
                size={20}
                color={ordenamiento === 'configurado' ? '#fff' : '#a33d69'}
              />
            }
            onPress={() => setOrdenamiento('configurado')}
            containerStyle={styles.sortButtonContainer}
            buttonStyle={[styles.sortButton, ordenamiento === 'configurado' && styles.activeSortButton]}
          />
          
          <Button
            icon={
              <Icon
                name="sort-by-alpha"
                size={20}
                color={ordenamiento === 'alfabetico' ? '#fff' : '#a33d69'}
              />
            }
            onPress={() => setOrdenamiento('alfabetico')}
            containerStyle={styles.sortButtonContainer}
            buttonStyle={[styles.sortButton, ordenamiento === 'alfabetico' && styles.activeSortButton]}
          />
        </View>
      </View>
      {pap && (
        <FlatList
          data={pap}
          renderItem={({ item }) => <PapItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      <LinearGradient
        colors={['#b52e69', 'white']}
        style={styles.gradient}
      >
        {isLoading && <LoadingModal visible={true} />}
        {showQRScanner ? (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
            isActive={showQRScanner}
          />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.contentContainer}>
    
              {/* Search Section */}
              <View style={styles.searchSection}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="search-outline" size={20} color="#a33d69" style={styles.inputIcon} />
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Ingrese RUT del paciente"
                      placeholderTextColor="#abaaad"
                      value={rut}
                      onChangeText={handleRutChange}
                      maxLength={8}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() => setShowQRScanner(true)}
                    >
                      <Icon name="qr-code-scanner" type="material" size={24} color="#a33d69" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.searchButton} onPress={() => buscarPaciente()}>
                  <LinearGradient
                    colors={['#b52e69', '#b52e69']}
                    style={styles.searchButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.searchButtonText}>Buscar Paciente</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Results Section */}
              {pap && renderResults()}
              
              <View style={styles.spacer} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footerSection}>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.zdad-informaticos.com')}>
                <Text style={styles.footerText}>
                  Creado por www.zdad-informaticos.com
                </Text>
              </TouchableOpacity>
              <Text style={styles.versionText}>
                <VersionDisplay />
              </Text>
            </View>
            
            {/* Botón flotante para crear seguimiento PAP */}
            {showFloatingButton && (
              <View style={styles.floatingButtonContainer}>
                <TouchableOpacity 
                  style={styles.floatingButton}
                  onPress={crearSeguimientoPap}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#b52e69', '#a33d69']}
                    style={styles.floatingButtonGradient}
                  >
                    <Icon name="add-circle" type="material" size={28} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          onCancel={() => setAlertVisible(false)}
          onConfirm={() => setAlertVisible(false)}
          confirmText={alertConfirmText}
          showCancelButton={showCancelButton}
        />
        <AcuerdoCompromisoModal visible={showAcuerdo} />
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
  contentContainer: {
    flexGrow: 1,
  },
  spacer: {
    flex: 1,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop : 30
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
  qrButton: {
    padding: 8,
  },

  // Search Button
  searchButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#a33d69',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  searchButtonGradient: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Results Section
  resultsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  resultHeaderContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ebc7d6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f0a12',
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButtonContainer: {
    width: 50,
  },
  sortButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebc7d6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: 50,
    height: 50,
  },
  activeSortButton: {
    backgroundColor: '#b52e69',
    borderColor: '#b52e69',
  },

  // List Items
  listContainer: {
    padding: 15,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ebc7d6',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f0a12',
  },
  detailsContainer: {
    padding: 15,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailIconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f0a12',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#b52e69',
    marginLeft: 28,
    fontWeight: '500',
  },

  // Footer Section
  footerSection: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  footerText: {
    color: '#b52e69',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    color: '#b52e69',
    fontSize: 12,
  },

  // Floating Button
  floatingButtonContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    top: 0,
    pointerEvents: 'box-none',
    zIndex: 1000,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 120,
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
    zIndex: 1001,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
});