import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SeguimientoPapLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b52e69',
          
         
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#ffffff',
        },
        headerStatusBarHeight: Platform.OS === 'android' ? insets.top : undefined,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Seguimiento PAP' }} />
      <Stack.Screen name="DetalleSeguimientoPap" options={{ title: 'Detalle Seguimiento' }} />
    </Stack>
  );
}
