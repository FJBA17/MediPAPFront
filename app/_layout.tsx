import { Slot, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { View, Platform, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAutorizacionStore } from "../src/store/Autorizacion/Autorizacion.store";
import * as NavigationBar from "expo-navigation-bar";

// Prevenir que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Si falla, no es crítico */
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { checkToken } = useAutorizacionStore();

  // Configurar la barra de navegación Android
  useEffect(() => {
    const setupNavigationBar = async () => {
      // Solo aplicar en Android
      if (Platform.OS !== "android") return;

      try {
        // Hacer la barra de navegación transparente
        await NavigationBar.setBackgroundColorAsync("transparent");
        
        // Configurar estilo de botones (puedes ajustar según tu tema)
        await NavigationBar.setButtonStyleAsync("dark");
        
        // Aplicar comportamiento overlay-swipe
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } catch (error) {
        console.error("Error configurando barra de navegación:", error);
      }
    };

    setupNavigationBar();
  }, []);

  useEffect(() => {
    // Configuración inicial de la aplicación
    const prepareApp = async () => {
      try {
        // Verificar autenticación y esperar a que se complete
        await checkToken();
        
        // Darle tiempo al sistema para que registre todas las rutas
        await new Promise(resolve => setTimeout(resolve, 500));

        // Marcar la app como lista
        setAppIsReady(true);
      } catch (error) {
        console.error("Error preparando la aplicación:", error);
        setAppIsReady(true);
      }
    };

    prepareApp();
  }, []);

  // Ocultar la pantalla de splash solo cuando la app esté lista
  useEffect(() => {
    if (appIsReady) {
      // Ocultar la pantalla de splash
      SplashScreen.hideAsync().catch(() => {
        /* Si falla, no es crítico */
      });
    }
  }, [appIsReady]);

  // No renderizar nada hasta que la app esté lista
  if (!appIsReady) {
    return null;
  }

  return (
    // Usamos StyleSheet.absoluteFill para que el contenido se extienda por toda la pantalla
    <View style={styles.container}>
      <StatusBar 
        style="dark" 
        backgroundColor="transparent" 
        translucent
      />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Eliminamos backgroundColor fijo para permitir que cada pantalla defina su propio color
    // Usamos estos estilos para asegurar que el contenido pueda extenderse por toda la pantalla
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }
});