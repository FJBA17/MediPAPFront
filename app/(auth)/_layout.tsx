import { Stack } from 'expo-router';
import { Color } from '../../src/theme/GlobalStyles';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
    <StatusBar style="dark" backgroundColor="transparent" />
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Color.colorLavenderblush,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Iniciar Sesión',
        }}
      />
      <Stack.Screen
        name="RecuperarContrasena"
        options={{
          title: 'Recuperar Contraseña',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
    </>
    
  );
}