import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
} from 'react-native';
import { MedicionesApi } from '@/src/config/api/medicionesApi';
import { Icons } from '@/src/components/Icons';
import { useFocusEffect } from '@react-navigation/native';

export default function DetalleSeguimientoPap() {
  const { rut } = useLocalSearchParams<{ rut: string }>();

  const [notas, setNotas] = useState([]);
  const [seguimiento, setSeguimiento] = useState(null);
  const [estadoActual, setEstadoActual] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const navigation = useNavigation();


  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}
        >
          <Icons name="arrow-back" size={24} color="#f08fb8" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [notasRes, seguimientoRes, estadoRes] = await Promise.all([
            MedicionesApi.get(`/seguimientoNota/historialNotas/${rut}`),
            MedicionesApi.get(`/seguimientoPap/rut/${rut}`),
            MedicionesApi.get(`/seguimientoEstado/ultimoEstado/${rut}`).catch(() => null)
          ]);

          //console.log('Seguimiento recibido:', seguimientoRes.data);

          const notasOrdenadas = (notasRes.data.data || []).sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );

          setNotas(notasOrdenadas);
          setSeguimiento(seguimientoRes.data.data?.[0] || null);
          setEstadoActual(estadoRes?.data?.data?.estado || 'Sin estado');
        } catch (error) {
          console.error('Error al obtener datos del seguimiento:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [rut])
  );


  const formatearFechaHora = (fechaIso: string) => {
    const fecha = new Date(fechaIso);
    return `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Datos de la Paciente</Text>
      {seguimiento ? (
        <View style={styles.card}>
          <Text><Text style={styles.title}>Nombre:</Text> {seguimiento.nombreCompleto}</Text>
          <Text><Text style={styles.title}>RUT:</Text> {seguimiento.rut}</Text>
          <Text><Text style={styles.title}>Edad:</Text> {seguimiento.edad || 'No registrada'}</Text>
          <Text><Text style={styles.title}>Fecha Nacimiento:</Text> {seguimiento.fechaNacimiento || 'No registrado'}</Text>
          <Text><Text style={styles.title}>Fono:</Text> {seguimiento.fono || 'No registrado'}</Text>
          <Text><Text style={styles.title}>Domicilio:</Text> {seguimiento.domicilio || 'No registrado'}</Text>
          <Text><Text style={styles.title}>Fecha Detección:</Text> {seguimiento.fechaDeteccion?.slice(0,10) || 'No registrada'}</Text>
          <Text><Text style={styles.title}>Fecha PAP:</Text> {seguimiento.fechaPap || 'No registrada'}</Text>
          <Text><Text style={styles.title}>Vigencia PAP:</Text> {seguimiento.vigenciaPap || 'No registrada'}</Text>
          <Text><Text style={styles.title}>Años PAP:</Text> {seguimiento.anosPap ?? 'No registrado'}</Text>
          <Text><Text style={styles.title}>Estado actual:</Text> {estadoActual}</Text>
        </View>
      ) : (
        <Text>No se encontró información del seguimiento.</Text>
      )}

      <Text style={styles.title}>Notas</Text>
      {notas.length === 0 ? (
        <Text style={styles.noNotas}>📭 No hay notas registradas</Text>
      ) : (
        notas.map((nota, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.fecha}>{formatearFechaHora(nota.fecha)}</Text>
            <Text style={styles.textoNota}>{nota.nota}</Text>
            <Text style={styles.autor}>Registrado por: {nota.usuarioRegistro}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noNotas: {
    fontStyle: 'italic',
    color: '#888',
  },
  card: {
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f08fb8',
    borderRadius: 12,
    backgroundColor: '#fdf6f8',
  },
  fecha: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textoNota: {
    fontSize: 15,
    marginBottom: 5,
  },
  autor: {
    fontSize: 13,
    color: '#666',
  },
});
