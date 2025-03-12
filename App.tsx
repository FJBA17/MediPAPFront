import { ExpoRoot } from 'expo-router';
import { registerRootComponent } from 'expo';

// Este archivo configura Expo Router para que use la carpeta app/
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);