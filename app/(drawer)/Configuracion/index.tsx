import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TouchableOpacity } from 'react-native';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { Icon } from 'react-native-elements';
import { useFocusEffect } from 'expo-router';
import { PapCamposVisible } from '../../../src/interfaces/papCamposVisibles.interface';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import CustomAlert from '../../../src/components/CustomAlert';

export default function ConfigurarCamposPAP() {
  const [camposOriginales, setCamposOriginales] = useState<PapCamposVisible[]>([]);
  const [camposModificados, setCamposModificados] = useState<PapCamposVisible[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [todosVisibles, setTodosVisibles] = useState(true);
  const [switchGeneralIndeterminado, setSwitchGeneralIndeterminado] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [showCancelButton, setShowCancelButton] = useState(true);
  const [confirmText, setConfirmText] = useState('Confirmar');
  const [loadError, setLoadError] = useState(false);

  const fetchCampos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const response = await MedicionesApi.get('/pap/campos');
      if (Array.isArray(response.data) && response.data.length > 0) {
        const camposOrdenados = response.data.sort((a, b) => a.id - b.id);
        setCamposOriginales(camposOrdenados);
        setCamposModificados(camposOrdenados);
        const todosSonVisibles = camposOrdenados.every(campo => campo.visible);
        setTodosVisibles(todosSonVisibles);
        setSwitchGeneralIndeterminado(false);
      } else {
        setCamposOriginales([]);
        setCamposModificados([]);
        setTodosVisibles(false);
        setSwitchGeneralIndeterminado(false);
      }
    } catch (error) {
      console.error('Error al cargar campos:', error);
      setCamposOriginales([]);
      setCamposModificados([]);
      setTodosVisibles(false);
      setSwitchGeneralIndeterminado(false);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Usando useFocusEffect de expo-router en lugar de @react-navigation/native
  useFocusEffect(
    useCallback(() => {
      fetchCampos();
    }, [fetchCampos])
  );

  const toggleSwitch = (id: number) => {
    setCamposModificados(campos => {
      const nuevosCampos = campos.map(campo =>
        campo.id === id ? { ...campo, visible: !campo.visible } : campo
      );
      const todosSonVisibles = nuevosCampos.every(campo => campo.visible);
      const todosNoVisibles = nuevosCampos.every(campo => !campo.visible);
      setTodosVisibles(todosSonVisibles);
      setSwitchGeneralIndeterminado(!todosSonVisibles && !todosNoVisibles);
      return nuevosCampos;
    });
    setHasChanges(true);
  };

  const toggleTodos = (value: boolean) => {
    setTodosVisibles(value);
    setSwitchGeneralIndeterminado(false);
    setCamposModificados(campos =>
      campos.map(campo => ({ ...campo, visible: value }))
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setAlertTitle('¿Estás seguro de que quieres guardar los cambios?');
    setShowCancelButton(true);
    setConfirmText('Guardar');
    setAlertVisible(true);
  };

  const showSuccessAlert = () => {
    setAlertTitle('Los cambios se han guardado correctamente');
    setShowCancelButton(false);
    setConfirmText('OK');
    setAlertVisible(true);
  };

  const saveChanges = async () => {
    setIsLoading(true);
    try {
      for (const campo of camposModificados) {
        if (campo.visible !== camposOriginales.find(c => c.id === campo.id)?.visible) {
          await MedicionesApi.patch(`/pap/campo/${campo.nombreCampo}`, { visible: campo.visible });
        }
      }
      setCamposOriginales(camposModificados);
      showSuccessAlert();
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
    } finally {
      setIsLoading(false);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return <LoadingModal visible={true} />;
  }

  return (
    <View style={styles.container}>
      {loadError ? (
        <Text style={styles.noFieldsText}>No se pudieron cargar los campos. Por favor, intente más tarde.</Text>
      ) : camposModificados.length === 0 ? (
        <Text style={styles.noFieldsText}>No se encontraron campos. Total: 0</Text>
      ) : (
        <>
          <View style={styles.switchTodosContainer}>
            <Text style={styles.switchTodosLabel}>Todos los campos visibles</Text>
            <Switch
              value={todosVisibles}
              onValueChange={toggleTodos}
              trackColor={{ false: Color.colorLavenderblush, true: Color.colorPink }}
              thumbColor={switchGeneralIndeterminado ? Color.colorThistle : todosVisibles ? Color.colorPlum : Color.colorGrey}
            />
          </View>
          <FlatList
            data={camposModificados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.fieldInfo}>
                  <Icon name={item.icono} type="material" size={24} color={Color.colorPlum} />
                  <Text style={styles.fieldName}>{item.label}</Text>
                </View>
                <Switch
                  value={item.visible}
                  onValueChange={() => toggleSwitch(item.id)}
                  trackColor={{ false: Color.colorLavenderblush, true: Color.colorPink }}
                  thumbColor={item.visible ? Color.colorPlum : Color.colorGrey}
                />
              </View>
            )}
          />
          <Text style={styles.totalFields}>Número de campos: {camposModificados.length}</Text>
          <TouchableOpacity
            style={[styles.saveButton, !hasChanges && styles.disabledButton]}
            onPress={handleSave}
            disabled={!hasChanges}
          >
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          </TouchableOpacity>
        </>
      )}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => {
          if (showCancelButton) {
            saveChanges();
          }
          setAlertVisible(false);
        }}
        confirmText={confirmText}
        showCancelButton={showCancelButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Padding.p_base,
    backgroundColor: Color.colorLavenderblush,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Padding.p_3xs,
    // borderBottomWidth: 3,
    // borderBottomColor: Color.colorThistle,
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    marginBottom: Padding.p_5xs,
    padding: Padding.p_3xs,
  },
  fieldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldName: {
    marginLeft: Padding.p_3xs,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansRegular,
    color: Color.colorBlack,
  },
  noFieldsText: {
    textAlign: 'center',
    marginTop: Padding.p_xl,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansRegular,
    color: Color.colorBlack,
  },
  totalFields: {
    textAlign: 'center',
    marginVertical: Padding.p_base,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansBold,
    color: Color.colorBlack,
  },
  switchTodosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Padding.p_3xs,
    // borderBottomWidth: 1,
    // borderBottomColor: Color.colorThistle,
    marginBottom: Padding.p_3xs,
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    padding: Padding.p_3xs,
  },
  switchTodosLabel: {
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansBold,
    color: Color.colorBlack,
  },
  saveButton: {
    backgroundColor: Color.colorPlum,
    padding: Padding.p_3xs,
    alignItems: 'center',
    borderRadius: Border.br_xs,
    marginTop: Padding.p_base,
  },
  saveButtonText: {
    color: Color.colorWhite,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansMedium,
  },
  disabledButton: {
    backgroundColor: Color.colorThistle,
  },
});