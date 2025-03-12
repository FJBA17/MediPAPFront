import { create } from 'zustand';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme, darkSheetStyle, lightSheetStyle } from '../../theme/index';
// import { StyleSheet } from 'react-native';

type DarkSheetStyleType = typeof darkSheetStyle;


interface ThemeGlobalState {
  darkMode: boolean;
  theme: {};
  styles: DarkSheetStyleType,
  toggleTheme: () => void;
}

export const useThemeGlobalStore = create<ThemeGlobalState>((set, get) => ({
  darkMode: false,
  styles: lightSheetStyle,
  theme: lightTheme, 
  toggleTheme: async () => {
    // Cambia entre 'lightTheme' y 'darkTheme' cuando se llama a 'toggleTheme'
    set((state) => ({
      darkMode: !state.darkMode,
      theme: !state.darkMode ? darkTheme : lightTheme, // Invierte el tema
      styles: !state.darkMode ? darkSheetStyle :  lightSheetStyle,      
    }));
    
    // Guarda el nuevo valor en AsyncStorage
    await AsyncStorage.setItem("theme", JSON.stringify(get().darkMode));
  },
}));
