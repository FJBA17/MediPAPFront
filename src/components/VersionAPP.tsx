import React from 'react';
import { Text, View } from 'react-native';
import Constants from 'expo-constants';

const VersionDisplay = () => {
  // Accedemos a la versión desde Constants.expoConfig.extra
  const appVersion = Constants.expoConfig?.extra?.appVersion || '1.0.0';
  
  return (
    <View>
      <Text>Versión: {appVersion}</Text>
    </View>
  );
};

export default VersionDisplay;