import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { useFocusEffect } from 'expo-router';
import { Button } from 'react-native-elements';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { FloatingActionButton } from '../../../src/components/FAB';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import { ModalContainer } from '../../../src/components/ModalContainer';
import { Icons } from '../../../src/components/Icons';
import { LinearGradient } from 'expo-linear-gradient';

import CrearUsuarioForm from './CrearUsuarioForm';
import EditarUsuarioForm from './EditarUsuarioForm';

interface Usuario {
  userName: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaCreacion: string;
  isAdmin: boolean;
  unidad?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);

  const [crearModalVisible, setCrearModalVisible] = useState(false);
  const [editarModalVisible, setEditarModalVisible] = useState(false);
  const [confirmarModalVisible, setConfirmarModalVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchUsuarios();
    }, [])
  );

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await MedicionesApi.get('/usuarios');
      setUsuarios(response.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsuarios([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrearUsuario = () => setCrearModalVisible(true);
  const abrirModalEditarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setEditarModalVisible(true);
  };
  const abrirModalConfirmar = (userName: string) => {
    setUserToDelete(userName);
    setDeleteTitle(`¿Estás seguro de que quieres eliminar al usuario ${userName}?`);
    setConfirmarModalVisible(true);
  };

  const cerrarModalCrear = () => setCrearModalVisible(false);
  const cerrarModalEditar = () => {
    setEditarModalVisible(false);
    setUsuarioSeleccionado(null);
  };
  const cerrarModalConfirmar = () => {
    setConfirmarModalVisible(false);
    setUserToDelete(null);
  };

  const handleUsuarioCreado = () => {
    cerrarModalCrear();
    fetchUsuarios();
  };

  const handleUsuarioEditado = () => {
    cerrarModalEditar();
    fetchUsuarios();
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await MedicionesApi.delete(`/usuarios/${userToDelete}`);
      setUsuarios(usuarios.filter(user => user.userName !== userToDelete));
      cerrarModalConfirmar();
    } catch (err) {
      console.error('Error eliminando usuario:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.tarjetauser}>
      <View style={styles.rowtext}>
        <View style={styles.columtext}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.userInfo}>{`${item.nombre} ${item.apellido}
${item.email}
Admin: ${item.isAdmin ? 'Sí' : 'No'}
Unidad: ${item.unidad?.nombre || 'Sin asignar'}
`}</Text>
        </View>
      </View>
      <View>
        <Button
          icon={<Icons name="pencil" color={Color.colorWhite} size={20} />}
          buttonStyle={[styles.button, styles.editButton]}
          onPress={() => abrirModalEditarUsuario(item)}
        />
        <Button
          icon={<Icons name="trash" color={Color.colorWhite} size={20} />}
          buttonStyle={[styles.button, styles.deleteButton]}
          onPress={() => abrirModalConfirmar(item.userName)}
          disabled={item.userName === 'admin'}
        />
      </View>
    </View>
  );

  if (loading) return <LoadingModal visible={true} />;
  if (error) return <View style={styles.centered}><Text>{error}</Text></View>;

  return (
    <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
      <FlatList
        data={usuarios}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.userName}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          loadError
            ? <Text style={styles.emptyText}>Error al cargar los usuarios. Por favor, intente más tarde.</Text>
            : <Text style={styles.emptyText}>No hay usuarios para mostrar</Text>
        }
      />

      {!loadError && (
        <FloatingActionButton onPress={abrirModalCrearUsuario} />
      )}

      <ModalContainer
        titulo="Nuevo Usuario"
        modalVisible={crearModalVisible}
        closeModal={cerrarModalCrear}
      >
        <CrearUsuarioForm onUsuarioCreado={handleUsuarioCreado} />
      </ModalContainer>

      <ModalContainer
        titulo="Editar Usuario"
        modalVisible={editarModalVisible}
        closeModal={cerrarModalEditar}
      >
        {usuarioSeleccionado && (
          <EditarUsuarioForm
            usuario={usuarioSeleccionado}
            onUsuarioEditado={handleUsuarioEditado}
            origenNavegacion="listaUsuarios"
          />
        )}
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
  tarjetauser: {
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
    paddingBottom: Padding.p_3xs,
  },
  columtext: {
    flex: 1,
  },
  userName: {
    fontFamily: FontFamily.publicSansBold,
    fontSize: FontSize.size_lg,
    color: Color.colorBlack,
    marginBottom: Padding.p_5xs,
    fontWeight: 'bold',
  },
  userInfo: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_sm,
    color: Color.colorMediumvioletred,
  },
  button: {
    width: 80,
    height: 40,
    borderRadius: Border.br_xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Padding.p_xs,
  },
  editButton: {
    backgroundColor: '#b52e69',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    marginTop: 10,
  },
  confirmButton: {
    borderRadius: 20,
    width: 150,
    height: 50,
  },
  cancelButton: {
    backgroundColor: Color.colorPlum,
  },
});
