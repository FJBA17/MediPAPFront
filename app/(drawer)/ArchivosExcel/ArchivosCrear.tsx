import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import * as Progress from 'react-native-progress';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useAutorizacionStore } from '@/src/store/Autorizacion/Autorizacion.store';

interface ArchivosCrearProps {
  onArchivoCreado: () => void;
}

interface Base64FileUpload {
  fileName: string;
  mimeType: string;
  content: string;
  isBase64: boolean;
}

const invalidCharacters = /[^a-zA-Z0-9.]/g;
const formatFileName = (fileName: string): string => {
  return fileName.replace(invalidCharacters, '_');
};

const ArchivosCrear: React.FC<ArchivosCrearProps> = ({ onArchivoCreado }) => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = useAutorizacionStore(state => state.token);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      const formattedName = formatFileName(file.name);
      setSelectedFile({
        ...result,
        assets: [{ ...file, name: formattedName }]
      });
      setError('');
      setUploadProgress(0);
    } catch (err) {
      setError('Error al seleccionar el archivo');
      console.error(err);
    }
  };

  const handleSubmitBase64 = async () => {
    if (!selectedFile || selectedFile.canceled || selectedFile.assets.length === 0) {
      setError('Por favor, selecciona un archivo Excel o CSV');
      return;
    }
    
    const file = selectedFile.assets[0];
    setLoading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      console.log('📤 Iniciando subida Base64 para:', file.name);
      
      // Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      setUploadProgress(0.5); // 50% al leer el archivo
      console.log('📊 Archivo leído como Base64, tamaño:', base64.length);
      
      // Enviar como base64
      const response = await MedicionesApi.post('/pap/upload-base64', {
        fileName: file.name,
        mimeType: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        content: base64,
        isBase64: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });
      
      setUploadProgress(1); // 100%
      console.log('✅ Archivo subido exitosamente (base64):', response.data);
      setLoading(false);
      onArchivoCreado();
      
    } catch (err: any) {
      console.error('❌ Error al subir el archivo (base64):', err);
      
      let errorMessage = 'Error al subir el archivo. Por favor, intenta de nuevo.';
      
      if (err.response) {
        console.log('❌ Error response:', err.response.data);
        console.log('❌ Status:', err.response.status);
        errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
      } else if (err.request) {
        console.log('❌ Error request - No response from server');
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        console.log('❌ Error message:', err.message);
        errorMessage = err.message || 'Error desconocido';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getSelectedFileName = () => {
    if (selectedFile && !selectedFile.canceled && selectedFile.assets.length > 0) {
      return selectedFile.assets[0].name;
    }
    return 'Seleccionar archivo Excel';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filePicker} onPress={pickDocument}>
        <Ionicons name="document-attach" size={24} color={Color.colorPlum} style={styles.fileIcon} />
        <Text style={styles.filePickerText}>
          {getSelectedFileName()}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && (
        <View style={styles.progressContainer}>
          <Progress.Bar 
            progress={uploadProgress} 
            width={200} 
            color={Color.colorPlum}
            unfilledColor={Color.colorLavenderblush}
            borderColor={Color.colorPlum}
          />
          <Text style={styles.progressText}>{`${Math.round(uploadProgress * 100)}%`}</Text>
        </View>
      )}

      {/* ✅ SOLO el botón que usa Base64 */}
      <Button
        title="Subir Archivo"
        onPress={handleSubmitBase64}
        loading={loading}
        disabled={!selectedFile || selectedFile.canceled || loading}
        buttonStyle={styles.submitButton}
        titleStyle={styles.submitButtonText}
        disabledStyle={styles.disabledButton}
        disabledTitleStyle={styles.disabledButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Padding.p_base,
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: Color.colorThistle,
    padding: Padding.p_3xs,
    marginBottom: Padding.p_base,
    borderRadius: Border.br_xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: Padding.p_3xs,
  },
  filePickerText: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
  errorText: {
    color: Color.colorPalevioletred_100,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    marginBottom: Padding.p_3xs,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: Padding.p_base,
  },
  progressText: {
    marginTop: Padding.p_5xs,
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    color: Color.colorBlack,
  },
  submitButton: {
    backgroundColor: Color.colorPlum,
    borderRadius: Border.br_xs,
    padding: Padding.p_3xs,
  },
  submitButtonText: {
    fontFamily: FontFamily.publicSansMedium,
    fontSize: FontSize.size_base,
    color: Color.colorWhite,
  },
  disabledButton: {
    backgroundColor: Color.colorThistle,
  },
  disabledButtonText: {
    color: Color.colorGrey,
  },
});

export default ArchivosCrear;