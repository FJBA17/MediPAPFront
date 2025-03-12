import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { useFocusEffect } from 'expo-router';
import { Button, Icon } from 'react-native-elements';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { FloatingActionButton } from '../../../src/components/FAB';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import { ModalContainer } from '../../../src/components/ModalContainer';
import { useCallback } from 'react';
import { Icons } from '../../../src/components/Icons';

// Importar componentes de los modales
import CrearUsuarioForm from './CrearUsuarioForm';
import EditarUsuarioForm from './EditarUsuarioForm';

interface Usuario {
  userName: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaCreacion: string;
  isAdmin: boolean;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);
  
  // Estados para controlar la visualización de los modales
  const [crearModalVisible, setCrearModalVisible] = useState(false);
  const [editarModalVisible, setEditarModalVisible] = useState(false);
  const [confirmarModalVisible, setConfirmarModalVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Usamos useFocusEffect para obtener los datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      fetchUsuarios();
      return () => {
        // Cleanup (opcional)
      };
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

  // Funciones para abrir modales
  const abrirModalCrearUsuario = () => {
    setCrearModalVisible(true);
  };

  const abrirModalEditarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setEditarModalVisible(true);
  };

  const abrirModalConfirmar = (userName: string) => {
    setUserToDelete(userName);
    setDeleteTitle(`¿Estás seguro de que quieres eliminar al usuario ${userName}?`);
    setConfirmarModalVisible(true);
  };

  // Funciones para cerrar modales
  const cerrarModalCrear = () => {
    setCrearModalVisible(false);
  };

  const cerrarModalEditar = () => {
    setEditarModalVisible(false);
    setUsuarioSeleccionado(null);
  };

  const cerrarModalConfirmar = () => {
    setConfirmarModalVisible(false);
    setUserToDelete(null);
  };

  // Funciones para manejar acciones de modales
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
Creado: ${new Date(item.fechaCreacion).toLocaleDateString()}`}</Text>
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

  if (loading) {
    return <LoadingModal visible={true} />;
  }

  if (error) {
    return <View style={styles.centered}><Text>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.userName}
        ListEmptyComponent={
          loadError
            ? <Text style={styles.emptyText}>Error al cargar los usuarios. Por favor, intente más tarde.</Text>
            : <Text style={styles.emptyText}>No hay usuarios para mostrar</Text>
        }
      />
      
      {!loadError && (
        <FloatingActionButton onPress={abrirModalCrearUsuario} />
      )}

      {/* Modal para crear usuario */}
      <ModalContainer
        titulo="Nuevo Usuario"
        modalVisible={crearModalVisible}
        closeModal={cerrarModalCrear}
      >
        <CrearUsuarioForm onUsuarioCreado={handleUsuarioCreado} />
      </ModalContainer>

      {/* Modal para editar usuario */}
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

      {/* Modal de confirmación para eliminar */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorLavenderblush,
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
    backgroundColor: Color.colorPlum,
  },
  deleteButton: {
    backgroundColor: Color.colorPink,
  },
  buttonText: {
    fontFamily: FontFamily.publicSansMedium,
    fontSize: FontSize.size_sm,
    color: Color.colorBlack,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.publicSansRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
    textAlign: 'center',
    marginTop: Padding.p_xl,
  },
  // Estilos para el modal de confirmación
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
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'space-between',
    paddingHorizontal : 20,
    width : '100%',
    marginTop : 10,
  },
  confirmButton: {
    borderRadius: 20,
    width: 150,
    height : 50,
    
  },
  cancelButton: {
    backgroundColor: Color.colorPlum,
  },
});