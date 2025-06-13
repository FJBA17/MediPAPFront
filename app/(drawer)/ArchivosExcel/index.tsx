import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { useFocusEffect } from 'expo-router';
import { Button } from 'react-native-elements';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { FloatingActionButton } from '../../../src/components/FAB';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import { ModalContainer } from '../../../src/components/ModalContainer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ArchivosCrear from './ArchivosCrear';

interface Archivo {
  id: string;
  fechaRegistro: string;
  archivo: string;
  cantidadRegistros: number | null;
}

export default function Archivos() {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);

  const [crearModalVisible, setCrearModalVisible] = useState(false);
  const [confirmarModalVisible, setConfirmarModalVisible] = useState(false);
  const [archivoToDelete, setArchivoToDelete] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchArchivos();
    }, [])
  );

  const fetchArchivos = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await MedicionesApi.get('/pap/archivos');
      setArchivos(response.data);
    } catch (err) {
      console.error('Error al cargar archivos:', err);
      setArchivos([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrearArchivo = () => setCrearModalVisible(true);

  const abrirModalConfirmar = (id: string, nombreArchivo: string) => {
    setArchivoToDelete(id);
    setDeleteTitle(`¿Estás seguro de que quieres eliminar el archivo ${nombreArchivo}?`);
    setConfirmarModalVisible(true);
  };

  const cerrarModalCrear = () => setCrearModalVisible(false);
  const cerrarModalConfirmar = () => {
    setConfirmarModalVisible(false);
    setArchivoToDelete(null);
  };

  const handleArchivoCreado = () => {
    cerrarModalCrear();
    fetchArchivos();
  };

  const handleConfirmDelete = async () => {
    if (!archivoToDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await MedicionesApi.delete(`/pap/archivos/${archivoToDelete}`);
      setArchivos(prevArchivos => prevArchivos.filter(a => a.id !== archivoToDelete));
      cerrarModalConfirmar();
    } catch (err) {
      console.error('Error eliminando archivo:', err);
      Alert.alert("Error", "No se pudo eliminar el archivo. Por favor, intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderArchivo = ({ item }: { item: Archivo }) => (
    <View style={styles.tarjetaArchivo}>
      <View style={styles.rowtext}>
        <View style={styles.columtext}>
          <Text style={styles.nombreArchivo}>{item.archivo}</Text>
          <Text style={styles.infoArchivo}>{`Fecha de Registro: ${new Date(item.fechaRegistro).toLocaleDateString()}\nCantidad de Registros: ${item.cantidadRegistros ?? 'N/A'}`}</Text>
        </View>
      </View>
      <View style={styles.rowbutton}>
        <Button
          icon={<Ionicons name="trash" size={20} color={Color.colorWhite} />}
          buttonStyle={[styles.button, styles.deleteButton]}
          onPress={() => abrirModalConfirmar(item.id, item.archivo)}
        />
      </View>
    </View>
  );

  if (loading) return <LoadingModal visible={true} />;
  if (error) return <View style={styles.centered}><Text>{error}</Text></View>;

  return (
    <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
      <FlatList
        data={archivos}
        renderItem={renderArchivo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          loadError
            ? <Text style={styles.emptyText}>Error al cargar los archivos. Por favor, intente más tarde.</Text>
            : <Text style={styles.emptyText}>No hay archivos para mostrar</Text>
        }
      />

      {!loadError && (
        <FloatingActionButton onPress={abrirModalCrearArchivo} />
      )}

      <ModalContainer
        titulo="Nuevo Archivo"
        modalVisible={crearModalVisible}
        closeModal={cerrarModalCrear}
      >
        <ArchivosCrear onArchivoCreado={handleArchivoCreado} />
      </ModalContainer>

      <ModalContainer
        titulo="Confirmar acción"
        modalVisible={confirmarModalVisible}
        closeModal={cerrarModalConfirmar}
      >
        <View style={styles.confirmContent}>
          <Text style={styles.confirmTitle}>{deleteTitle}</Text>
          <View style={styles.confirmButtonsContainer}>
            <Button
              title="Cancelar"
              buttonStyle={[styles.confirmButton, styles.cancelButton]}
              onPress={cerrarModalConfirmar}
            />
            <Button
              title={isDeleting ? "Eliminando..." : "Confirmar"}
              buttonStyle={[styles.confirmButton, styles.deleteButton]}
              onPress={handleConfirmDelete}
              disabled={isDeleting}
            />
          </View>
        </View>
      </ModalContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: Padding.p_base,
    paddingBottom: 100,
  },
  tarjetaArchivo: {
    flexDirection: 'row',
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    padding: Padding.p_base,
    marginBottom: Padding.p_base,
    shadowColor: "rgba(0, 0, 0, 0.75)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 4,
  },
  rowtext: {
    flex: 1,
  },
  columtext: {
    flex: 1,
  },
  nombreArchivo: {
    fontFamily: FontFamily.publicSansBold,
    fontSize: FontSize.size_lg,
    color: Color.colorBlack,
    marginBottom: Padding.p_5xs,
    fontWeight: 'bold',
  },
  infoArchivo: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    color: Color.colorMediumvioletred,
  },
  rowbutton: {
    justifyContent: 'center',
    marginLeft: Padding.p_base,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: Border.br_xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Color.colorPink,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorWhite,
    textAlign: 'center',
    marginTop: Padding.p_xl,
  },
  confirmContent: {
    width: '100%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontFamily: FontFamily.publicSansMedium,
    fontSize: FontSize.size_lg,
    color: Color.colorBlack,
    marginBottom: Padding.p_base,
    textAlign: 'center',
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  confirmButton: {
    borderRadius: 20,
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Color.colorPlum,
  },
});
