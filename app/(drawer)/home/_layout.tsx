import { Stack } from 'expo-router';
import { Color } from '../../../src/theme/GlobalStyles';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Color.colorLavenderblush,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
    </Stack>
  );
}