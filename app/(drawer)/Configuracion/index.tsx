import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TouchableOpacity } from 'react-native';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { Icon } from 'react-native-elements';
import { useFocusEffect } from 'expo-router';
import { PapCamposVisible } from '../../../src/interfaces/papCamposVisibles.interface';
import { FontFamily, FontSize, Color, Border, Padding } from '../../../src/theme/GlobalStyles';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';
import CustomAlert from '../../../src/components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';

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
      if (Array.isArray(response.data)) {
        const ordenados = response.data.sort((a, b) => a.id - b.id);
        setCamposOriginales(ordenados);
        setCamposModificados(ordenados);
        const todosSonVisibles = ordenados.every(c => c.visible);
        setTodosVisibles(todosSonVisibles);
        setSwitchGeneralIndeterminado(false);
      }
    } catch (error) {
      console.error('Error al cargar campos:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCampos();
    }, [fetchCampos])
  );

  const toggleSwitch = (id: number) => {
    setCamposModificados(campos => {
      const nuevos = campos.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
      const todos = nuevos.every(c => c.visible);
      const ninguno = nuevos.every(c => !c.visible);
      setTodosVisibles(todos);
      setSwitchGeneralIndeterminado(!todos && !ninguno);
      return nuevos;
    });
    setHasChanges(true);
  };

  const toggleTodos = (value: boolean) => {
    setTodosVisibles(value);
    setSwitchGeneralIndeterminado(false);
    setCamposModificados(campos => campos.map(c => ({ ...c, visible: value })));
    setHasChanges(true);
  };

  const handleSave = () => {
    setAlertTitle('¿Deseas guardar los cambios?');
    setConfirmText('Guardar');
    setShowCancelButton(true);
    setAlertVisible(true);
  };

  const saveChanges = async () => {
    setIsLoading(true);
    try {
      for (const campo of camposModificados) {
        const original = camposOriginales.find(c => c.id === campo.id);
        if (original && campo.visible !== original.visible) {
          await MedicionesApi.patch(`/pap/campo/${campo.nombreCampo}`, { visible: campo.visible });
        }
      }
      setCamposOriginales(camposModificados);
      setAlertTitle('Cambios guardados correctamente');
      setConfirmText('OK');
      setShowCancelButton(false);
      setAlertVisible(true);
      setHasChanges(false);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingModal visible={true} />;

  return (
    <LinearGradient colors={['#b52e69', 'white']} style={styles.gradient}>
      <View style={styles.container}>
        {loadError ? (
          <Text style={styles.noFieldsText}>Error al cargar campos.</Text>
        ) : camposModificados.length === 0 ? (
          <Text style={styles.noFieldsText}>No hay campos configurables.</Text>
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
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <View style={styles.fieldInfo}>
                    <Icon name={item.icono} type="material" size={22} color={Color.colorPlum} />
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

            <Text style={styles.totalFields}>Total de campos: {camposModificados.length}</Text>

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
          confirmText={confirmText}
          showCancelButton={showCancelButton}
          onCancel={() => setAlertVisible(false)}
          onConfirm={() => {
            if (showCancelButton) saveChanges();
            else setAlertVisible(false);
          }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Padding.p_base,
  },
  switchTodosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Padding.p_3xs,
    borderRadius: Border.br_xs,
    marginBottom: Padding.p_base,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  switchTodosLabel: {
    fontFamily: FontFamily.publicSansBold,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Padding.p_3xs,
    borderRadius: Border.br_xs,
    marginBottom: Padding.p_5xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  fieldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldName: {
    marginLeft: Padding.p_2xs,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.publicSansRegular,
    color: Color.colorBlack,
  },
  noFieldsText: {
    textAlign: 'center',
    fontSize: FontSize.size_base,
    color: Color.colorWhite,
    marginTop: Padding.p_xl,
    fontFamily: FontFamily.publicSansRegular,
  },
  totalFields: {
    textAlign: 'center',
    marginTop: Padding.p_base,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
    fontFamily: FontFamily.publicSansBold,
  },
  saveButton: {
    backgroundColor: Color.colorPlum,
    marginTop: Padding.p_base,
    paddingVertical: Padding.p_base,
    borderRadius: Border.br_xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: FontSize.size_base,
    color: Color.colorWhite,
    fontFamily: FontFamily.publicSansMedium,
  },
  disabledButton: {
    backgroundColor: Color.colorThistle,
  },
});
