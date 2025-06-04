import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
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


        //console.log('RUT completo encontrado:', rutCompleto);

        setPap(response.data.resultados);
        setCurrentRut(rutCompleto); // Guardar el RUT con formato completo

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
      //console.log('currentRut:', currentRut);

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
      
      console.log('Creando seguimiento para RUT:', currentRut);
      
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
            color={Color.colorPlum}
          />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.detailsContainer}>
            {camposOrdenados.map((campo, index) => (
              <View key={campo.id || index} style={styles.detailItem}>
                <View style={styles.detailIconLabelContainer}>
                  <Icon name={campo.icono} type="material" size={20} color={Color.colorPlum} />
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
        <Text style={styles.resultTitle}>Ordenar:</Text>
        <Button
          icon={
            <Icon
              name="sort"
              size={24}
              color={ordenamiento === 'configurado' ? Color.colorWhite : Color.colorBlack}
            />
          }
          onPress={() => setOrdenamiento('configurado')}
          containerStyle={styles.ordenamientoButton}
          buttonStyle={[styles.ordenamientoButtonStyle, ordenamiento === 'configurado' && styles.activeOrdenButton]}
        />
        <Button
          icon={
            <Icon
              name="sort-by-alpha"
              size={24}
              color={ordenamiento === 'alfabetico' ? Color.colorWhite : Color.colorBlack}
            />
          }
          onPress={() => setOrdenamiento('alfabetico')}
          containerStyle={styles.ordenamientoButton}
          buttonStyle={[styles.ordenamientoButtonStyle, ordenamiento === 'alfabetico' && styles.activeOrdenButton]}
        />
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
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
            <View style={styles.searchContainer}>
              <View style={styles.inputContainer}>
                <Input
                  placeholder="Ingrese RUT del paciente"
                  onChangeText={handleRutChange}
                  value={rut}
                  containerStyle={styles.searchBar}
                  inputContainerStyle={styles.searchBarInput}
                  maxLength={8}
                  keyboardType="numeric"
                  leftIcon={
                    <Icon name="search" size={30} color="#f08fb8" />
                  }
                />
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => setShowQRScanner(true)}
                >
                  <Icon name="qr-code-scanner" size={40} color="#f08fb8" />
                </TouchableOpacity>
              </View>
              <Button
                title="Buscar"
                onPress={() => buscarPaciente()}
                buttonStyle={styles.buttonStyle}
                titleStyle={styles.buttonText}
              />
            </View>
            {pap && renderResults()}
            <View style={styles.spacer} />
          </ScrollView>
          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.zdad-informaticos.com')}>
              <Text style={styles.footerText}>Creado por www.zdad-informaticos.com</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>
              <VersionDisplay />
            </Text>
          </View>
          
          {/* Botón flotante para crear seguimiento PAP */}
          {showFloatingButton && (
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={crearSeguimientoPap}
            >
              <Icon name="add-circle" type="material" size={24} color="white" />
            </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
  },
  contentContainer: {
    flexGrow: 1,
  },
  spacer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal : 10,
    
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent : 'center',
    
  },
  searchBar: {
    flex : 1,
    padding : 0,
    width : '100%',
  
    justifyContent : 'center',
    alignContent : 'center',
    paddingTop : 25,
  },
  searchBarInput: {
    backgroundColor: Color.colorLavenderblush_200,
    borderRadius: 20,
    borderColor: 'transparent',
    paddingHorizontal : 10,
    width : '100%',
    
  },
  qrButton: {
    alignSelf: 'center',
    
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  buttonStyle: {
    backgroundColor: "#f08fb8",
    height: 45,
    borderRadius: Border.br_xs,
    marginHorizontal : 12
  },
  buttonText: {
    fontFamily: FontFamily.publicSansBold,
    fontSize: 14,
    color: 'white',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
    borderTopLeftRadius: Border.br_xs,
    borderTopRightRadius: Border.br_xs,
  },
  resultHeaderContainer: {
    padding: Padding.p_base,
    borderBottomWidth: 1,
    borderBottomColor: Color.colorThistle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  resultTitle: {
    fontSize: FontSize.size_lg,
    fontFamily: FontFamily.publicSansBold,
    color: Color.colorBlack,
    marginBottom: Padding.p_3xs,
  },
  ordenamientoButton: {
    width: '30%',
  },
  ordenamientoButtonStyle: {
    backgroundColor: Color.colorLavenderblush,
    borderRadius: Border.br_xs,
  },
  ordenamientoButtonText: {
    color: Color.colorBlack,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
  },
  activeOrdenButton: {
    backgroundColor: Color.colorPlum,
  },
  activeOrdenButtonText: {
    color: Color.colorWhite,
    fontFamily: FontFamily.publicSansBold,
  },
  listContainer: {
    padding: Padding.p_3xs,
  },
  itemContainer: {
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    marginBottom: Padding.p_3xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Padding.p_base,
    borderBottomColor: Color.colorThistle,
  },
  headerText: {
    fontFamily: FontFamily.publicSansBold,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
  detailsContainer: {
    padding: Padding.p_base,
  },
  detailItem: {
    marginBottom: Padding.p_3xs,
  },
  detailIconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Padding.p_5xs,
  },
  detailLabel: {
    fontFamily: FontFamily.publicSansBold,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
    marginLeft: Padding.p_3xs,
  },
  detailValue: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorMediumvioletred,
    marginLeft: 28,
  },
  footerContainer: {
    padding: Padding.p_xs,
    backgroundColor: Color.colorLavenderblush,
    borderTopWidth: 1,
    borderTopColor: Color.colorThistle,
    alignItems: 'center',
  },
  footerText: {
    color: Color.colorGrey,
    fontFamily: FontFamily.publicSansMedium,
    fontSize: FontSize.size_sm,
    textAlign: 'center',
  },
  versionText: {
    color: Color.colorGrey,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    marginTop: 10,
  },
  // Estilos para el botón flotante
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Color.colorPlum,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});