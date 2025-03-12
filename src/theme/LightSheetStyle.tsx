import { Dimensions, StyleSheet } from "react-native";
import { lightTheme } from "./LightTheme";
const { width } = Dimensions.get('window');



export const lightSheetStyle = StyleSheet.create(
    {
    // title: {
    //     backgroundColor:'red',
    //     color: 'white',
    //     fontSize: 30,
    //     fontWeight: 'bold',
    //     paddingVertical: 10,
    //     marginHorizontal:5,
    // },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20
    },
    ancho: {
        marginHorizontal: Dimensions.get('window').width / 99 , 
    },
    container: {
                flex: 1,
                backgroundColor: lightTheme.colors.Background,        
                // marginHorizontal:10,        
    },
    buttonReturn: {        
        borderWidth: 1,
        borderColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginVertical:10,
        marginHorizontal:10,
        borderRadius: 100,
        zIndex:99,      
    },
    buttonText: {
        fontSize: 18,
        color: 'white'
    },
    inputText: {
        height: 20,
        borderWidth: 1,
        borderTopStartRadius:5,
        borderTopEndRadius:0,
        borderColor: 'gray',
        textAlign: 'left',
        fontSize: 14,
        backgroundColor: 'white',
        elevation: 3,
        
    },
    label: {
        // marginTop: 20,
        marginLeft:5,
        color: 'white',
        fontWeight: 'bold',
        fontFamily:'arial'
    },
    buttonsContainer: {
    alignItems: 'flex-end',
    marginTop: 20,
    },
    reenviarButton: {
        marginTop: 20,
    },
    listItem: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
        // flexDirection: 'row',
        alignContent: "space-between",
        alignItems: "baseline",
        justifyContent:'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
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
      backgroundColor:  lightTheme.colors.Background,   
      width: 30,
      height: 30,
      marginLeft: 10,
    },
    buttonConfiguracion: {
      alignContent: "center", alignItems: "center", justifyContent: "center",
      borderRadius: 10,
      borderWidth: 2,
      borderColor:  lightTheme.colors.Background,   
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
    // container: {
    //   flex: 1,
    //   // top: 30,
    //   top: Platform.OS === 'ios'? 30:5,
    //   // justifyContent: 'center',
    //   // alignItems: 'center',
    // },
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
    // listItem: {
    //   marginTop: 10,
    //   paddingVertical: 10,
    //   paddingHorizontal: 5,
    //   backgroundColor: '#fff',
    //   // flexDirection: 'row',
    //   alignContent: "center",
    //   alignItems: "flex-start",
    //   borderBottomWidth: 0.5,
    //   borderBottomColor: 'gray',
    // },
    coverImage: {
      width: 50,
      height: 50,
      borderRadius: 8
    },
    metaInfo: {
      marginLeft: 5
    },
  
  
    // dropdown3BtnStyle: {
    //   width: 200,
    //   height: 50,
    //   backgroundColor: '#FFF',
    //   paddingHorizontal: 0,
    //   borderWidth: 1,
    //   borderRadius: 8,
    //   borderColor: '#444',
    // },
    // dropdown3BtnChildStyle: {
    //   flex: 1,
    //   flexDirection: 'row',      
    //   paddingHorizontal: 4,
    // },
    // dropdown3BtnImage: { width: 20, height: 25, resizeMode: 'cover' },
    // dropdown3BtnTxt: {
    //   color: '#444',
    //   textAlign: 'center',
    //   fontWeight: 'bold',
    //   fontSize: 12,
    //   marginHorizontal: 2,
    // },
    // dropdown3DropdownStyle: { backgroundColor: 'slategray' },
    // dropdown3RowStyle: {
    //   backgroundColor: 'slategray',
    //   borderBottomColor: '#444',
    //   height: 50,
    // },
    // dropdown3RowChildStyle: {
    //   flex: 1,
    //   flexDirection: 'row',
    //   justifyContent: 'flex-start',
    //   alignItems: 'center',
    //   paddingHorizontal: 18,
    // },
    // dropdownRowImage: { width: 30, height: 30, resizeMode: 'cover' },
    // dropdown3RowTxt: {
    //   color: '#F1F1F1',
    //   textAlign: 'center',
    //   fontWeight: 'bold',
    //   fontSize: 16,
    //   marginHorizontal: 12,
    // },
  
    // dropdown4BtnStyle: {
    //   width: '50%',
    //   height: 50,
    //   backgroundColor: '#FFF',
    //   borderRadius: 8,
    //   borderWidth: 1,
    //   borderColor: '#444',
    // },
    // dropdown4BtnTxtStyle: { color: '#444', textAlign: 'left' },
    // dropdown4DropdownStyle: { backgroundColor: '#EFEFEF' },
    // dropdown4RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5' },
    // dropdown4RowTxtStyle: { color: '#444', textAlign: 'left' },
  

  botonAccion: {
    alignContent: "center", alignItems: "center", justifyContent: "center",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor:  lightTheme.colors.Background,   
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

shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 10,
},
header: {
  flexDirection: 'row',
  width,
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F6F6F6',
},
headerTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
saveAreaViewContainer: { flex: 1, backgroundColor: '#FFF' },
viewContainer: { flex: 1, width, backgroundColor: '#FFF' },
scrollViewContainer: {
  flexGrow: 1,
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: '10%',
},
dropdownsRow: { flexDirection: 'row', width: '100%', paddingHorizontal: '5%' },

dropdown1BtnStyle: {
  flex: 1,
  height: 50,
  backgroundColor: '#FFF',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#444',
},
dropdown1BtnTxtStyle: { color: '#444', textAlign: 'left' },
dropdown1DropdownStyle: { backgroundColor: '#EFEFEF' },
dropdown1RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5' },
dropdown1RowTxtStyle: { color: '#444', textAlign: 'left' },
divider: { width: 12 },
dropdown2BtnStyle: {
  flex: 1,
  height: 50,
  backgroundColor: '#FFF',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#444',
},
dropdown2BtnTxtStyle: { color: '#444', textAlign: 'left' },
dropdown2DropdownStyle: { backgroundColor: '#EFEFEF' },
dropdown2RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5' },
dropdown2RowTxtStyle: { color: '#444', textAlign: 'left' },

dropdown3RowTxt: {
  color: '#F1F1F1',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: 16,
  marginHorizontal: 12,
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
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 18,
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
// textField: {
  // fontWeight: 'bold',

// }
  Acordiontitulo: {
    fontWeight: 'bold',
    color: 'black'
  },
  AcordionFondo: { backgroundColor: 'white', borderColor: 'black', borderWidth: 0.5 }
});
