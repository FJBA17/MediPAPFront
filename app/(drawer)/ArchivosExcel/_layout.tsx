import { Stack } from 'expo-router';

export default function ArchivosLayout() {
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
          title: 'Gestión de Archivos',
        }}
      />
    </Stack>
  );
}