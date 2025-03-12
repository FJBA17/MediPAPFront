import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Platform, Alert } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import QRFrameOverlay from './QRFrameOverlay';

const { width, height } = Dimensions.get('window');

interface QRScannerProps {
  onScan: (rut: string) => void;
  onClose: () => void;
  isActive: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isActive }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!permission?.granted) {
        const permissionResult = await requestPermission();
        
        // Si se deniega el permiso después de solicitarlo, mostrar una alerta
        if (!permissionResult.granted) {
          Alert.alert(
            "Se necesita permiso de cámara",
            "Para escanear códigos QR, necesitamos acceso a la cámara. Por favor, otorga este permiso en la configuración.",
            [
              { text: "Cancelar", onPress: onClose, style: "cancel" },
              { text: "Abrir Configuración", onPress: () => onClose() }  // Idealmente abriría la configuración
            ]
          );
        }
      }
    };

    if (isActive) {
      checkPermission();
      setIsScanning(true);
    }

    return () => {
      setIsScanning(false);
    };
  }, [isActive, permission, requestPermission]);

  if (!isActive) return null;

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (isScanning) {
      setIsScanning(false);
      console.log("Código escaneado:", data); // Para depuración
      
      // Primero intentamos extraer el RUT del formato estándar chileno (RUN=XXXXXXXX-Y)
      const rutMatch = data.match(/RUN=(\d{1,8})-[\dkK]/);
      if (rutMatch && rutMatch[1]) {
        // Si encontramos un RUT en formato RUN=XXXXXXXX-Y
        const rutSinDV = rutMatch[1];
        onScan(rutSinDV);
        return;
      }
      
      // Si no encontramos el formato RUN, verificamos si el código completo es un RUT numérico
      const rutRegex = /^\d{7,9}$/;
      if (rutRegex.test(data)) {
        onScan(data);
        return;
      }
      
      // Si no es ninguno de los formatos esperados, extraemos cualquier secuencia que parezca un RUT
      const anyRutMatch = data.match(/(\d{7,8})[\-]?[\dkK]?/);
      if (anyRutMatch && anyRutMatch[1]) {
        onScan(anyRutMatch[1]);
        return;
      }
      
      // Si todo falla, mostrar un mensaje y volver a activar el escaneo
      Alert.alert(
        "Código inválido",
        "El código escaneado no contiene un RUT válido. Por favor, intenta nuevamente.",
        [{ text: "OK", onPress: () => setIsScanning(true) }]
      );
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Gestión de permisos
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9E76AB" />
          <Text style={styles.permissionText}>Iniciando cámara...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="error-outline" size={40} color="#9E76AB" />
          <Text style={styles.permissionText}>Necesitamos acceso a la cámara</Text>
          <Text style={styles.permissionSubText}>Para escanear códigos QR, necesitamos acceso a la cámara de tu dispositivo.</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Dar Permiso</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={onClose}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "ean13", "code128", "code39"],
        }}
        flashMode={flashEnabled ? "torch" : "off"}
      />

      <QRFrameOverlay />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Escanear código QR</Text>
        <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
          <MaterialIcons 
            name={flashEnabled ? "flash-on" : "flash-off"} 
            size={28} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Alinea el código QR con el recuadro para escanear
        </Text>
        {!isScanning && (
          <Text style={styles.scanningText}>Procesando...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  iconButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scanningText: {
    color: '#f08fb8',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  permissionSubText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    marginBottom: 30,
  },
  actionButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#9E76AB',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default QRScanner;