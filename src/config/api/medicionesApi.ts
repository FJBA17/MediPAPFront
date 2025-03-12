import { Platform, Alert, Linking } from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, APP_VERSION } from '@env';

// Usamos directamente las variables de entorno con react-native-dotenv
const baseURL: string = API_URL;

console.log("🔹 BASE_URL:", baseURL);
console.log("🔹 APP_VERSION:", APP_VERSION);

const MedicionesApi = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 📌 Agregar logs en el interceptor de requests
MedicionesApi.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('token');

      config.headers = { 
        'X-App-Version': APP_VERSION 
      };

      if (token) {
        config.headers = { 
          Authorization: `Bearer ${token}`, 
          'X-App-Version': APP_VERSION 
        };
      }

      // console.log("📤 Enviando petición a:", config.baseURL + config.url);
      // console.log("📤 Método:", config.method?.toUpperCase());
      // console.log("📤 Headers:", config.headers);
      // console.log("📤 Data:", config.data || "Sin datos");

      return config;
    } catch (error) {
      console.error("❌ Error en interceptor de request:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("❌ Error en la solicitud:", error);
    return Promise.reject(error);
  }
);

// 📌 Agregar logs en el interceptor de responses
MedicionesApi.interceptors.response.use(
  async (response) => {
    // console.log("✅ Respuesta recibida de:", response.config.url);
    // console.log("✅ Estado:", response.status);
    // console.log("✅ Headers:", response.headers);
    // console.log("✅ Data:", response.data);

    return response;
  },
  (error) => {
    // Verificar si es un 404 de la ruta de PAP (caso esperado)
    if (error.response && 
        error.response.status === 404 && 
        error.config?.url?.includes('/pap/') &&
        error.response.data?.message?.includes('No se encontraron PAPs')) {
      
      // Convertir este error en una respuesta exitosa
      return {
        data: {
          encontrados: false,
          resultados: [],
          message: error.response.data.message || 'No se encontraron datos para el RUT ingresado.'
        }
      };
    }

    // Para todos los demás errores, mantener el comportamiento actual
    console.error("❌ Error en respuesta de:", error.config?.url || "Desconocido");
    if (error.response) {
      console.error("❌ Código de estado:", error.response.status);
      console.error("❌ Headers de respuesta:", error.response.headers);
      console.error("❌ Data de error:", error.response.data);
    } else if (error.request) {
      console.error("❌ No hubo respuesta del servidor (request):", error.request);
    } else {
      console.error("❌ Error al configurar la petición:", error.message);
    }
    return Promise.reject(error);
  }
);

export { MedicionesApi };