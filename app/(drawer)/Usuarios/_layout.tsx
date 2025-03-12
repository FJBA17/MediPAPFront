import { Stack } from 'expo-router';

export default function UsuariosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#F8ECF4', // Color.colorLavenderblush
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Gestión de Usuarios',
        }}
      />
      <Stack.Screen
        name="CrearUsuarioForm"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom',
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="EditarUsuarioForm"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom',
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </Stack>
  );
}