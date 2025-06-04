import { Stack } from 'expo-router';

export default function SeguimientoPapLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Seguimientos PAP',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#faf0f5',
          },
        }}
      />
      <Stack.Screen
        name="DetalleSeguimientoPap"
        options={{
          title: 'Detalle',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            color: 'black',
          },
          headerStyle: {
            backgroundColor: '#faf0f5',
          },
        }}
      />
    </Stack>
  );
}

