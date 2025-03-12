import { Platform, StyleSheet, Dimensions } from 'react-native';

export const colores = {
    // primary: '#5856D6',
    primary: '#FFF',
    Background: '#D51B24',
    disable:"#FFFEEE",
    trueOptionColor: '#8ABBF0',   // Celeste claro para la opción true
    falseOptionColor: '#D8E4EA',  // Otro color para la opción false
}


export const styles = StyleSheet.create({
    globalMargin: { marginHorizontal: 20},
    title: {
        fontSize: 30,
        marginBottom: 10,
        paddingTop: 10
    },    
    botonGrande: {
        width: 100,
        height: 100,
        backgroundColor: 'red',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    botonGrandeTexto: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 20
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 100
    },
    menuContainer: {
        marginVertical: 30,
        marginHorizontal: 20,
    },
    menuBoton: {
        marginVertical: 10
    },
    menuTexto: {
        fontSize: 20
    },

    buttonAcciones: {
      alignContent: "center", alignItems: "center", justifyContent: "center",
      borderRadius: 10,
      borderWidth: 2,
      borderColor: 'white',
      backgroundColor: colores.Background,
      width: 30,
      height: 30,
      marginLeft: 10,
    },
    buttonConfiguracion: {
      alignContent: "center", alignItems: "center", justifyContent: "center",
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colores.Background,
      // backgroundColor: colores.Background,
      width: 60,
      height: 60,
      marginLeft: 10,
    },
    headerContainer: {
      height: 35,
      zIndex: 999,
      top: 45,
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
      // top: 30,
      top: Platform.OS === 'ios'? 30:5,
      // justifyContent: 'center',
      // alignItems: 'center',
    },
    textField: {
      marginLeft: 10,
      color: 'gray',
      fontSize: 15,
      fontWeight: 'bold',
  
    },
    textInput: {
      height: 40,
      width: 350,
      margin: 10,
      backgroundColor: 'white',
      borderColor: 'gray',
      borderWidth: StyleSheet.hairlineWidth,
      // borderWidth: 2,
      borderRadius: 10,
      paddingLeft: 5,
      color: 'gray',
      fontSize: 11
  
    },
  
    // Item Lista
    listItem: {
      marginTop: 10,
      paddingVertical: 10,
      paddingHorizontal: 5,
      backgroundColor: '#fff',
      // flexDirection: 'row',
      alignContent: "center",
      alignItems: "flex-start",
      borderBottomWidth: 0.5,
      borderBottomColor: 'gray',
    },
    coverImage: {
      width: 50,
      height: 50,
      borderRadius: 8
    },
    metaInfo: {
      marginLeft: 5
    },
  
  
    dropdown3BtnStyle: {
      width: 200,
      height: 50,
      backgroundColor: '#FFF',
      paddingHorizontal: 0,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: '#444',
    },
    dropdown3BtnChildStyle: {
      flex: 1,
      flexDirection: 'row',
      // justifyContent: 'space-between',
      // justifyContent: 'flex-start',
      // alignItems: 'center',
      paddingHorizontal: 4,
    },
    dropdown3BtnImage: { width: 20, height: 25, resizeMode: 'cover' },
    dropdown3BtnTxt: {
      color: '#444',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 12,
      marginHorizontal: 2,
    },
    dropdown3DropdownStyle: { backgroundColor: 'slategray' },
    dropdown3RowStyle: {
      backgroundColor: 'slategray',
      borderBottomColor: '#444',
      height: 50,
    },
    dropdown3RowChildStyle: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 18,
    },
    dropdownRowImage: { width: 30, height: 30, resizeMode: 'cover' },
    dropdown3RowTxt: {
      color: '#F1F1F1',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 16,
      marginHorizontal: 12,
    },
  
    dropdown4BtnStyle: {
      width: '50%',
      height: 50,
      backgroundColor: '#FFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#444',
    },
    dropdown4BtnTxtStyle: { color: '#444', textAlign: 'left' },
    dropdown4DropdownStyle: { backgroundColor: '#EFEFEF' },
    dropdown4RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5' },
    dropdown4RowTxtStyle: { color: '#444', textAlign: 'left' },
  

  botonAccion: {
    alignContent: "center", alignItems: "center", justifyContent: "center",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: colores.Background,
    width: 40,
    height: 40,
    marginLeft: 10,
  },


  // Item Lista
  listItem2: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignContent: "center",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },


  title18: {
    fontSize: 18,
    width: 200,
    paddingTop: 10
  },
  botonAsociar:{
    width: 50, height: 50, resizeMode: 'cover', 
    marginLeft:100,
  },

  dropdown3BtnChildStyledropdown3BtnChildStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  iconContainer: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    // borderRadius: 10,
    // borderWidth: 0.5,
    // borderColor: 'black',
    width: 22,
    height: 22,
  
    marginRight:10,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  modalContainerCentro: {        
    alignSelf:'center',
    // width: Dimensions.get('window').width * 0.6,
    backgroundColor: 'black',
    opacity: 0.7,
    borderRadius: 10,
    padding: 10,
},
  modalContainer: {        
    alignSelf:'flex-end',
    width: Dimensions.get('window').width * 0.6,
    backgroundColor: 'black',
    opacity: 0.7,
    borderRadius: 10,
    padding: 10,
},
modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
},
modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
},
closeIcon: {
    width: 25,
    height: 25,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'white',     
    justifyContent: 'center',        
    alignItems:'center',
},
personContainer: {
    marginBottom: 10,
    alignItems: 'flex-end',
},
personName: {
    color: 'white',
    fontSize: 10,
},
  });