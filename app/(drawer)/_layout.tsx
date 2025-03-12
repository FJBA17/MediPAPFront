import { Drawer } from "expo-router/drawer";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useRouter, useSegments } from "expo-router";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useAutorizacionStore } from "../../src/store/Autorizacion/Autorizacion.store";
import CustomAlert from "../../src/components/CustomAlert";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DrawerLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, logOut } = useAutorizacionStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user?.isAdmin === "true" || user?.isAdmin === true) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      const currentPath = segments.join('/');
      const restrictedPaths = ['Usuarios', 'ArchivosExcel', 'Reportes', 'Configuracion'];
      if (restrictedPaths.some(path => currentPath.includes(path))) {
        router.replace('/(drawer)/home');
      }
    }
  }, [user, segments]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      {user ? (
        <Drawer
          screenOptions={{
            headerStyle: { 
              backgroundColor: "#faf0f5", 
              elevation: 0,
              // No usar paddingTop aquí
            },
            // Usar headerStatusBarHeight para manejar el espacio para la barra de estado
            headerStatusBarHeight: Platform.OS === 'android' ? insets.top : undefined,
            headerTintColor: "#1f0a12",
            headerTitleStyle: { fontWeight: "bold" },
            drawerStyle: { 
              backgroundColor: "#faf0f5", 
              width: 280,
              // Aseguramos que el drawer respete la barra de navegación
              paddingBottom: insets.bottom,
            },
            drawerActiveTintColor: "#b52e69",
            drawerInactiveTintColor: "#1f0a12",
            drawerActiveBackgroundColor: "#f8e1ee",
            drawerItemStyle: { marginVertical: 2, borderRadius: 5, width: '100%' },
            // Hacemos que el contenido principal respete la barra de navegación
            contentStyle: {
              paddingBottom: insets.bottom,
            },
          }}
          drawerContent={(props) => (
            <CustomDrawerContent {...props} user={user} isAdmin={isAdmin} logOut={logOut} router={router} />
          )}
        >
          <Drawer.Screen
            name="home"
            options={{
              title: "Home",
              drawerIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />
            }}
          />
          <Drawer.Screen
            name="Cuenta/index"
            options={{
              title: "Mi Cuenta",
              drawerIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />
            }}
          />
          <Drawer.Screen
            name="Usuarios"
            options={{
              title: "Usuarios",
              drawerIcon: ({ color }) => <Ionicons name="people" size={22} color={color} />,
              drawerItemStyle: !isAdmin ? { display: 'none' } : undefined,
              unmountOnBlur: !isAdmin
            }}
            listeners={({ navigation }) => ({
              focus: () => {
                if (!isAdmin) {
                  navigation.navigate('home');
                }
              }
            })}
          />
          <Drawer.Screen
            name="ArchivosExcel"
            options={{
              title: "Archivos Excel",
              drawerIcon: ({ color }) => <Ionicons name="folder" size={22} color={color} />,
              drawerItemStyle: !isAdmin ? { display: 'none' } : undefined,
              unmountOnBlur: !isAdmin
            }}
            listeners={({ navigation }) => ({
              focus: () => {
                if (!isAdmin) {
                  navigation.navigate('home');
                }
              }
            })}
          />
          <Drawer.Screen
            name="Reportes/index"
            options={{
              title: "Reportes de Uso",
              drawerIcon: ({ color }) => <Ionicons name="document" size={22} color={color} />,
              drawerItemStyle: !isAdmin ? { display: 'none' } : undefined,
              unmountOnBlur: !isAdmin
            }}
            listeners={({ navigation }) => ({
              focus: () => {
                if (!isAdmin) {
                  navigation.navigate('home');
                }
              }
            })}
          />
          <Drawer.Screen
            name="Configuracion/index"
            options={{
              title: "Configurar Campos PAP",
              drawerIcon: ({ color }) => <Ionicons name="settings" size={22} color={color} />,
              drawerItemStyle: !isAdmin ? { display: 'none' } : undefined,
              unmountOnBlur: !isAdmin
            }}
            listeners={({ navigation }) => ({
              focus: () => {
                if (!isAdmin) {
                  navigation.navigate('home');
                }
              }
            })}
          />
        </Drawer>
      ) : (
        <View style={styles.loadingContainer}><Text>Cargando...</Text></View>
      )}
    </View>
  );
}

function CustomDrawerContent({ user, isAdmin, logOut, router, ...restProps }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Mantener la solución simple que funcionaba para el nombre
  let nombreUsuario = user?.nombre ? `${user.nombre} ${user.apellido ?? ""}`.trim() : "Usuario";

  const handleLogout = () => setAlertVisible(true);
  const confirmLogout = async () => {
    setAlertVisible(false);
    try {
      await logOut();
      router.push("/(auth)/login");
      setTimeout(() => router.replace("/(auth)/login"), 100);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.replace("/(auth)/login");
    }
  };

  // Filtrar las opciones del menú para no administradores
  const filteredState = (() => {
    if (isAdmin) {
      return restProps.state;
    }
    
    // Filtrar solo las rutas para no admin
    const routes = restProps.state.routes.filter(
      route => ['home', 'Cuenta/index'].includes(route.name)
    );
    
    return {
      ...restProps.state,
      routes,
      routeNames: restProps.state.routeNames.filter(
        name => ['home', 'Cuenta/index'].includes(name)
      )
    };
  })();

  return (
    <View style={styles.drawerContentContainer}>
      <DrawerContentScrollView 
        {...restProps} 
        contentContainerStyle={{ 
          paddingTop: 0,
          paddingBottom: insets.bottom
        }}
      >
        <View style={[styles.userSection, { paddingTop: insets.top + 30 }]}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={50} color="white" />
          </View>
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Hola,</Text>
            <Text style={styles.userName}>{user.nombre} {user.apellido}</Text>
          </View>
        </View>

        {/* Usar DrawerItemList con estado filtrado */}
        <DrawerItemList {...restProps} state={filteredState} />
      </DrawerContentScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out" size={23} color="#b52e69" style={styles.menuItemIcon} />
          <Text style={styles.menuItemText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title="¿Seguro que quieres salir?"
        onCancel={() => setAlertVisible(false)}
        onConfirm={confirmLogout}
        confirmText="Sí"
        cancelText="No"
        showCancelButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Esto permite que el contenido pase por debajo de la barra de navegación
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  drawerContentContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 0
  },
  drawerContent: {
    flex: 1,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
    marginBottom: 10,
  },
  avatarContainer: {
    backgroundColor: "#9E76AB",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    position: "relative",
  },
  encabezado: {
    flexDirection: "column",
    width: "70%",
  },
  titulo: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  userName: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    position: "relative",
    marginHorizontal: 15,
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    color: "#000",
    fontSize: 16,
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f8e1ee",
    marginTop: 10,
  },
});