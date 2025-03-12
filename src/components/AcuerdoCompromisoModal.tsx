import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  Animated, 
  Dimensions 
} from 'react-native';
import { useAutorizacionStore } from '../../src/store/Autorizacion/Autorizacion.store';
import { Color, FontFamily, FontSize, Padding } from '../theme/GlobalStyles';
import { LoadingModal } from './Loading/LoadingModal';

interface AcuerdoCompromisoModalProps {
  visible: boolean;
}

export const AcuerdoCompromisoModal: React.FC<AcuerdoCompromisoModalProps> = ({ visible }) => {
  const aceptarAcuerdo = useAutorizacionStore(state => state.aceptarAcuerdo);
  const rechazarAcuerdo = useAutorizacionStore(state => state.rechazarAcuerdo);
  const [isLoading, setIsLoading] = useState(false);
  
  // Referencias para animaciones
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  // Función para animar la entrada del modal
  const animateIn = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Función para animar la salida del modal
  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
      if (callback) callback();
    });
  };

  // Efecto para gestionar visibilidad
  useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      if (modalVisible) {
        animateOut(null);
      }
    }
  }, [visible]);

  const handleAceptar = async () => {
    setIsLoading(true);
    animateOut(async () => {
      await aceptarAcuerdo();
      setIsLoading(false);
    });
  };

  const handleRechazar = () => {
    animateOut(() => {
      rechazarAcuerdo();
    });
  };

  return (
    <>
      {/* StatusBar para el modal - similar a ModalContainer */}
      {Platform.OS === 'android' && modalVisible && (
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" translucent />
      )}
      
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleRechazar}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View 
            style={[
              styles.centeredView, 
              { opacity: fadeAnim }
            ]}
          >
            <Animated.View 
              style={[
                styles.modalView,
                {
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.title}>Acuerdo de Compromiso</Text>
              </View>
              <ScrollView style={styles.scrollView}>
                <Text style={styles.contentIntro}>
                  Al utilizar esta aplicación, usted se compromete a:
                </Text>
                <View style={styles.pointContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.point}>Mantener la confidencialidad de los datos de los pacientes.</Text>
                </View>
                <View style={styles.pointContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.point}>Utilizar la información únicamente para fines médicos autorizados.</Text>
                </View>
                <View style={styles.pointContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.point}>No compartir su cuenta o contraseña con terceros.</Text>
                </View>
                <View style={styles.pointContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.point}>Reportar inmediatamente cualquier uso no autorizado o brecha de seguridad.</Text>
                </View>
                <View style={styles.pointContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.point}>Cumplir con todas las políticas y procedimientos de seguridad de la información.</Text>
                </View>
                <Text style={styles.contentOutro}>
                  El incumplimiento de este acuerdo puede resultar en la terminación de su acceso a la aplicación y posibles acciones legales.
                </Text>
                <Text style={styles.cameraConsent}>
                  Al aceptar, también autoriza el uso de la cámara del dispositivo para escanear códigos QR.
                </Text>
              </ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={handleAceptar}
                >
                  <Text style={styles.buttonText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={handleRechazar}
                >
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </SafeAreaView>
      </Modal>
      <LoadingModal visible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalView: {
    margin: 20,
    backgroundColor: Color.colorWhite,
    borderRadius: 20,
    padding: Padding.p_base,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  scrollView: {
    marginBottom: 20,
    width: '100%',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: FontSize.size_lg,
    fontFamily: FontFamily.publicSansBold,
    color: Color.colorPalevioletred_100,
  },
  contentIntro: {
    marginBottom: 10,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansBold,
    color: Color.colorBlack,
  },
  pointContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    fontSize: FontSize.size_base,
    marginRight: 5,
    color: Color.colorPalevioletred_100,
  },
  point: {
    flex: 1,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansRegular,
    color: Color.colorBlack,
  },
  contentOutro: {
    marginTop: 10,
    marginBottom: 15,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansRegular,
    color: Color.colorBlack,
  },
  cameraConsent: {
    marginBottom: 15,
    fontSize: FontSize.size_sm,
    fontFamily: FontFamily.publicSansMedium,
    color: Color.colorPalevioletred_100,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: Color.colorPalevioletred_100,
  },
  rejectButton: {
    backgroundColor: Color.colorGrey,
  },
  buttonText: {
    color: Color.colorWhite,
    fontFamily: FontFamily.publicSansBold,
    textAlign: 'center',
  },
});