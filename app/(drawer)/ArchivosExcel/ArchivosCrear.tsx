import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import * as Progress from 'react-native-progress';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';

interface ArchivosCrearProps {
  onArchivoCreado: () => void;
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

  const handleSubmit = async () => {
    if (!selectedFile || selectedFile.canceled || selectedFile.assets.length === 0) {
      setError('Por favor, selecciona un archivo Excel');
      return;
    }
    
    const file = selectedFile.assets[0];
    setLoading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: file.name
      } as any);
      
      // Usar Axios para subir el archivo con seguimiento de progreso
      const response = await MedicionesApi.post('/pap/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.loaded / progressEvent.total;
          setUploadProgress(percentCompleted);
        },
      });
      
      setLoading(false);
      onArchivoCreado();
    } catch (err) {
      console.error('Error al subir el archivo:', err);
      setError('Error al subir el archivo. Por favor, intenta de nuevo.');
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
      <Button
        title="Subir Archivo"
        onPress={handleSubmit}
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