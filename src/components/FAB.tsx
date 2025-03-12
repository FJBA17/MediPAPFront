import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Border, Color } from '../theme/GlobalStyles';

interface FABProps {
  onPress: ( ) => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({ onPress }) => {
  return (
    <FAB
      icon={<Ionicons name="add-outline" color="white" size={24} />}
      color={Color.colorPink}
      placement="right"
      size="large"
      onPress={onPress}
      style={styles.fab}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: Border.br_xs,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});