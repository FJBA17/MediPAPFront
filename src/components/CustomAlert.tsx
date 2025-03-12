import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Definimos el valor de opacidad en una constante para asegurar consistencia
const BACKGROUND_OPACITY = 0.5;
const BACKGROUND_COLOR = `rgba(0, 0, 0, ${BACKGROUND_OPACITY})`;

interface CustomAlertProps {
  visible: boolean;
  title: string;
  onCancel?: () => void;
  onConfirm: () => void;
  confirmText?: string;
  showCancelButton?: boolean;
  cancelText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  showCancelButton = true
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
    >
      {/* Establecemos el mismo valor de opacidad para el StatusBar */}
      {visible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}

      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={[
            styles.buttonContainer,
            !showCancelButton && styles.singleButtonContainer
          ]}>
            {showCancelButton && (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                !showCancelButton && styles.singleButton
              ]} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR, // Usamos la misma constante aquí
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.8, 
    maxWidth: 400 
  },
  modalTitle: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
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
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#9E76AB',
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  singleButtonContainer: {
    justifyContent: 'center',
  },
  singleButton: {
    minWidth: 150,
  },
});

export default CustomAlert;