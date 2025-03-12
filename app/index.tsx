import { Redirect } from 'expo-router';
import { useAutorizacionStore } from "../src/store/Autorizacion/Autorizacion.store";
import { useEffect } from 'react';

export default function Index() {
  const { status } = useAutorizacionStore();
  
  // Log para depuración (puedes quitarlo después)
  

  // Determinar la ruta inicial basada en el estado de autenticación
  if (status === 'authenticated') {
    return <Redirect href="/(drawer)/home" />;
  }
  
  // Por defecto, redirigir a login si no está autenticado o está en estado de verificación
  return <Redirect href="/(auth)/login" />;
}