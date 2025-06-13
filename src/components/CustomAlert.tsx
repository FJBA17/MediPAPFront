import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
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
    backgroundColor: BACKGROUND_COLOR,
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    width: width * 0.8,
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#e6e6e6',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#b52e69',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
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
