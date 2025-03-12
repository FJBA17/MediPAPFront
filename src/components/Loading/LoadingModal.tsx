import React from 'react';
import { View, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeGlobalStore } from '../../store/index';
import { Color, FontFamily, FontSize, Padding, Border } from '../../theme/GlobalStyles'; // Asegúrate de que la ruta de importación sea correcta

export const LoadingModal = ({ visible }: { visible: boolean }) => {
  const theme = useThemeGlobalStore(state => state.theme);

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator 
            animating={visible} 
            size="large" 
            color={Color.colorMediumvioletred} 
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 153, 169, 0.5)', 
  },
  activityIndicatorWrapper: {
    backgroundColor: Color.colorLavenderblush,
    padding: Padding.p_base,
    borderRadius: Border.br_xs,
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});