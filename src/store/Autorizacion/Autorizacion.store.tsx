import { StateCreator, create } from 'zustand';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as jwtDecode from 'jwt-decode';
import { Alert } from 'react-native';
import { Usuario } from '../../interfaces/usuario.interface';
import { MedicionesApi } from '../../config/api/medicionesApi';
import axios from 'axios';
import { APP_VERSION } from '@env';

interface AutorizacionState {
  token: string | null;
  user: Usuario | null;
  status: 'checking' | 'authenticated' | 'not-authenticated';
  alertVisible: boolean;
  alertTitle: string;
  alertConfirmAction: () => void;
  showAcuerdo: boolean;
  signIn: (userName: string, password: string) => Promise<void>;
  showAlert: (title: string, confirmAction: () => void) => void;
  hideAlert: () => void;
  checkToken: () => void;
  logOut: () => void;
  signUp: (registerData: Usuario) => void;
  actualizarUsuario: (nuevosDatos: Partial<Usuario>) => void;
  aceptarAcuerdo: () => Promise<void>;
  rechazarAcuerdo: () => void;
}

const AutorizacionStore: StateCreator<AutorizacionState> = ((set, get) => ({
  token: null,
  user: null,
  status: 'not-authenticated',
  alertVisible: false,
  alertTitle: '',
  alertConfirmAction: () => {},
  showAcuerdo: false,

  checkToken: async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      set((state) => ({
        status: 'not-authenticated',
      }));
      return;
    }
    try {
      set((state) => ({
        status: 'checking',
        token: token,
      }));

      const resp = await MedicionesApi.get('/auth/checkToken');
      if (resp.status !== 200) {
        set((state) => ({
          status: 'not-authenticated',
        }));
        return;
      }
      const token = resp.data.token;
      try {
        const decoded = jwtDecode.jwtDecode(token);
        set((state) => ({
          status: 'authenticated',
          token: token,
          user: { ...decoded },
          showAcuerdo: !decoded.acuerdo_firmado
        }));
      } catch (error) {
        Alert.alert(`Error de Logueo, Token inválido `);
      }
      await AsyncStorage.setItem('token', resp.data.token);

    } catch (error) {
      set((state) => ({
        status: 'not-authenticated',
      }));
    }
  },

  showAlert: (title: string, confirmAction: () => void) => {
    set({
      alertVisible: true,
      alertTitle: title,
      alertConfirmAction: confirmAction,
    });
  },

  hideAlert: () => {
    set({
      alertVisible: false,
      alertTitle: '',
      alertConfirmAction: () => {},
    });
  },

  signIn: async (userName: string, password: string) => {
    set((state) => ({
      status: 'checking',
    }));
    try {
      console.log({APP_VERSION})
      const { data } = await MedicionesApi.post('/auth/login', { userName, password });
      const token = data.token;
      try {
        const decoded = jwtDecode.jwtDecode(token);
        set((state) => ({
          status: 'authenticated',
          token: data.token,
          user: { ...decoded },
          showAcuerdo: !decoded.acuerdo_firmado
        }));
        await AsyncStorage.setItem('token', data.token);
      } catch (error) {
        get().showAlert('Error de Logueo: Token inválido', () => {});
      }
    } catch (error: any) {
      set((state) => ({
        status: 'not-authenticated',
      }));
      console.log("Error en el login:", error);
      let errorMessage = "Error desconocido";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 'Error en el Login. Por favor, inténtalo más tarde.';
      }
      get().showAlert(errorMessage, () => {});
    }
  },
  
  logOut: async () => {
    await AsyncStorage.removeItem('token');
    set((state) => ({
      token: "",
      user: null,
      status: 'not-authenticated',
    }));
  },

  signUp: async (usuarioNuevo: Usuario) => {
    try {
      // Aquí iría la lógica para crear un nuevo usuario
    } catch (error: any) {
      set((state) => ({
        status: 'not-authenticated',
      }));
      Alert.alert("Error al crear Usuario", error.toString());
    }
  },

  actualizarUsuario: (nuevosDatos: Partial<Usuario>) => set((state) => ({
    user: state.user ? { ...state.user, ...nuevosDatos } : null
  })),

  aceptarAcuerdo: async () => {
    try {
      const { data } = await MedicionesApi.patch(`/usuarios/${get().user?.userName}/actualizar-acuerdo`, { aceptar: true });
      set((state) => ({
        user: { ...state.user, acuerdo_firmado: true },
        showAcuerdo: false
      }));
    } catch (error) {
      console.error("Error al aceptar el acuerdo:", error);
      get().showAlert('Error al aceptar el acuerdo. Por favor, intenta de nuevo.', () => {});
    }
  },

  rechazarAcuerdo: () => {
    set((state) => ({
      showAcuerdo: false
    }));
    get().logOut();
  },
}));

export const useAutorizacionStore = create<AutorizacionState>()(
  AutorizacionStore
);