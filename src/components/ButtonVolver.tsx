import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,  
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import { useAutorizacionStore, useThemeGlobalStore } from '../stores/index'

export const ButtonVolver = ({ navigation, titulo, salir, }: any) => {

  const logOut = useAutorizacionStore(state => state.logOut);
  const stylesGlobal = useThemeGlobalStore.getState().styles;

  return (
    <SafeAreaView>
    <View style={{      
        ...styles.headerContainer,
          backgroundColor: stylesGlobal.container.backgroundColor,
          flexDirection: 'row',
          zIndex : 999,
       }}>
    <TouchableOpacity
        activeOpacity={0.8}
        style= {{
          ...styles.backButton,          
        }}
        onPress={ () => {             
          if (salir) logOut;      
          try {
            navigation.pop();  
          } catch (error) {
            // console.log({ navigation })
            // navigation.navigate('MenuLateral01'); 
          }                     
          } }
      >
        <View style={{ width:30, height:30 }}>
          <Icon 
              name="arrow-back-outline"
              color="white"
              size={30}
          />
        </View>
    </TouchableOpacity>
      <Text style={{
          ...styles.titulo,        
      }}>{ titulo }</Text>
    </View>
    </SafeAreaView>
  )
}



const styles = StyleSheet.create({
  headerContainer: {
    height: 35,
    top: Platform.OS === 'ios' ? 0 : 0,  // espacio entre borde superior y donde empieza la aplicación
    alignItems: 'center',
  },
  backButton: {
    left: 10,
  },
  titulo: {
    color: 'white',
    fontSize: 20,
    left: 20,
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginContainer: {
    width: '80%',
    alignItems: 'center',
    padding: 10,
    elevation: 10,
    backgroundColor: '#e6e6e6'
  },
  textInput: {
    height: 40,
    width: '100%',
    margin: 10,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },
});
