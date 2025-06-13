// app/(drawer)/Dashboard/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Color, Padding } from '../../../src/theme/GlobalStyles';
import { MedicionesApi } from '../../../src/config/api/medicionesApi';
import { LoadingModal } from '../../../src/components/Loading/LoadingModal';

const { width } = Dimensions.get('window');

interface EstadisticasGenerales {
  resumen: {
    totalUsuarios: number;
    totalUnidades: number;
    unidadesActivas: number;
    totalPap: number;
    totalSeguimientos: number;
    totalBusquedas: number;
  };
  pap: {
    vigentes: number;
    vencidos: number;
    porcentajeVigencia: number;
  };
}

interface UsuariosPorUnidad {
  unidad: string;
  usuarios: number;
}

interface PapPorSector {
  sector: string;
  total: number;
  vigentes: number;
  vencidos: number;
  porcentajeVigencia: number;
}

interface ActividadReciente {
  ultimasBusquedas: {
    usuario: string;
    rut: string;
    paciente: string;
    fecha: string;
    hora: string;
  }[];
  busquedasPorDia: {
    fecha: string;
    busquedas: number;
  }[];
}

export default function DashboardScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasGenerales | null>(null);
  const [usuariosPorUnidad, setUsuariosPorUnidad] = useState<UsuariosPorUnidad[]>([]);
  const [papPorSector, setPapPorSector] = useState<PapPorSector[]>([]);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente | null>(null);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        cargarEstadisticasGenerales(),
        cargarUsuariosPorUnidad(),
        cargarPapPorSector(),
        cargarActividadReciente(),
      ]);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarEstadisticasGenerales = async () => {
    try {
      const response = await MedicionesApi.get('/dashboard/estadisticas-generales');
      setEstadisticasGenerales(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas generales:', error);
    }
  };

  const cargarUsuariosPorUnidad = async () => {
    try {
      const response = await MedicionesApi.get('/dashboard/usuarios-por-unidad');
      setUsuariosPorUnidad(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios por unidad:', error);
    }
  };

  const cargarPapPorSector = async () => {
    try {
      const response = await MedicionesApi.get('/dashboard/pap-por-sector');
      setPapPorSector(response.data);
    } catch (error) {
      console.error('Error al cargar PAP por sector:', error);
    }
  };

  const cargarActividadReciente = async () => {
    try {
      const response = await MedicionesApi.get('/dashboard/actividad-reciente');
      setActividadReciente(response.data);
    } catch (error) {
      console.error('Error al cargar actividad reciente:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDashboard();
    setRefreshing(false);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const getCardGradient = (type: string) => {
    switch (type) {
      case 'primary':
        return ['#b52e69', '#d1477a'];
      case 'secondary':
        return ['#9E76AB', '#b694c1'];
      case 'success':
        return ['#4CAF50', '#66BB6A'];
      case 'warning':
        return ['#FF9800', '#FFB74D'];
      default:
        return ['#b52e69', '#d1477a'];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#b52e69', 'white']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#b52e69"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerIcon}>
              <Ionicons name="analytics" size={50} color="white" />
            </View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Panel de Control General</Text>
          </View>

          {/* Main Content */}
          <View style={styles.contentSection}>
            {/* Estadísticas Generales */}
            {estadisticasGenerales && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumen General</Text>
                <View style={styles.statsGrid}>
                  <TouchableOpacity style={styles.statCardWrapper}>
                    <LinearGradient
                      colors={getCardGradient('primary')}
                      style={styles.statCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="people" size={32} color="white" />
                      <Text style={styles.statNumber}>{estadisticasGenerales.resumen.totalUsuarios}</Text>
                      <Text style={styles.statLabel}>Usuarios</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.statCardWrapper}>
                    <LinearGradient
                      colors={getCardGradient('secondary')}
                      style={styles.statCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="business" size={32} color="white" />
                      <Text style={styles.statNumber}>{estadisticasGenerales.resumen.unidadesActivas}</Text>
                      <Text style={styles.statLabel}>Unidades Activas</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.statCardWrapper}>
                    <LinearGradient
                      colors={getCardGradient('success')}
                      style={styles.statCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="document-text" size={32} color="white" />
                      <Text style={styles.statNumber}>{estadisticasGenerales.resumen.totalPap}</Text>
                      <Text style={styles.statLabel}>PAP Registrados</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.statCardWrapper}>
                    <LinearGradient
                      colors={getCardGradient('warning')}
                      style={styles.statCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="search" size={32} color="white" />
                      <Text style={styles.statNumber}>{estadisticasGenerales.resumen.totalBusquedas}</Text>
                      <Text style={styles.statLabel}>Búsquedas</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* PAP Vigencia Card */}
                <View style={styles.vigenciaCard}>
                  <LinearGradient
                    colors={['#f8f9fa', '#ffffff']}
                    style={styles.vigenciaGradient}
                  >
                    <View style={styles.vigenciaHeader}>
                      <Ionicons name="shield-checkmark-outline" size={24} color="#b52e69" />
                      <Text style={styles.vigenciaTitle}>Estado de PAP</Text>
                    </View>
                    <View style={styles.vigenciaStats}>
                      <View style={styles.vigenciaItem}>
                        <View style={styles.vigenciaCircle}>
                          <Text style={styles.vigenciaNumber}>{estadisticasGenerales.pap.vigentes}</Text>
                        </View>
                        <Text style={styles.vigenciaLabel}>Vigentes</Text>
                      </View>
                      <View style={styles.vigenciaDivider} />
                      <View style={styles.vigenciaItem}>
                        <View style={[styles.vigenciaCircle, styles.vigenciaCircleRed]}>
                          <Text style={styles.vigenciaNumber}>{estadisticasGenerales.pap.vencidos}</Text>
                        </View>
                        <Text style={styles.vigenciaLabel}>Vencidos</Text>
                      </View>
                      <View style={styles.vigenciaDivider} />
                      <View style={styles.vigenciaItem}>
                        <View style={[styles.vigenciaCircle, styles.vigenciaCircleGreen]}>
                          <Text style={[styles.vigenciaNumber, styles.vigenciaPercentage]}>
                            {estadisticasGenerales.pap.porcentajeVigencia}%
                          </Text>
                        </View>
                        <Text style={styles.vigenciaLabel}>Vigencia</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            )}

            {/* Usuarios por Unidad */}
            {usuariosPorUnidad.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Usuarios por Unidad</Text>
                <View style={styles.listContainer}>
                  {usuariosPorUnidad.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.listItem}>
                      <View style={styles.listItemLeft}>
                        <View style={styles.listItemIcon}>
                          <Ionicons name="business-outline" size={20} color="#b52e69" />
                        </View>
                        <View style={styles.listItemInfo}>
                          <Text style={styles.listItemTitle}>{item.unidad}</Text>
                          <Text style={styles.listItemSubtitle}>{item.usuarios} usuarios activos</Text>
                        </View>
                      </View>
                      <View style={styles.listItemBadge}>
                        <Text style={styles.listItemBadgeText}>{item.usuarios}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* PAP por Sector */}
            {papPorSector.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PAP por Sector</Text>
                <View style={styles.listContainer}>
                  {papPorSector.slice(0, 5).map((item, index) => (
                    <TouchableOpacity key={index} style={styles.sectorCard}>
                      <View style={styles.sectorHeader}>
                        <View style={styles.sectorIconContainer}>
                          <Ionicons name="location-outline" size={20} color="#b52e69" />
                        </View>
                        <Text style={styles.sectorName}>{item.sector}</Text>
                      </View>
                      <View style={styles.sectorContent}>
                        <View style={styles.sectorStatsRow}>
                          <View style={styles.sectorStatItem}>
                            <Text style={styles.sectorStatValue}>{item.total}</Text>
                            <Text style={styles.sectorStatLabel}>Total</Text>
                          </View>
                          <View style={styles.sectorStatItem}>
                            <Text style={[styles.sectorStatValue, styles.greenText]}>{item.vigentes}</Text>
                            <Text style={styles.sectorStatLabel}>Vigentes</Text>
                          </View>
                          <View style={styles.sectorStatItem}>
                            <Text style={[styles.sectorStatValue, styles.redText]}>{item.vencidos}</Text>
                            <Text style={styles.sectorStatLabel}>Vencidos</Text>
                          </View>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View style={styles.progressBarBackground}>
                            <View 
                              style={[
                                styles.progressBarFill, 
                                { width: `${item.porcentajeVigencia}%` }
                              ]} 
                            />
                          </View>
                          <Text style={styles.progressPercentage}>{item.porcentajeVigencia}%</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Actividad Reciente */}
            {actividadReciente && actividadReciente.ultimasBusquedas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actividad Reciente</Text>
                <View style={styles.listContainer}>
                  {actividadReciente.ultimasBusquedas.slice(0, 5).map((busqueda, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <Ionicons name="time-outline" size={20} color="#b52e69" />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityUser}>{busqueda.usuario}</Text>
                        <Text style={styles.activityDetail}>
                          Buscó RUT: {busqueda.rut}
                        </Text>
                        <Text style={styles.activityTime}>
                          {formatearFecha(busqueda.fecha)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {isLoading && <LoadingModal visible={true} />}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 30,
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Content Section
  contentSection: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 15,
    marginLeft: 5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  statCardWrapper: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  
  statCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
    fontWeight: '500',
  },

  // Vigencia Card
  vigenciaCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  
  vigenciaGradient: {
    padding: 20,
  },
  
  vigenciaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  vigenciaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f0a12',
    marginLeft: 10,
  },
  
  vigenciaStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  vigenciaItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  vigenciaCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#b52e69',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  vigenciaCircleRed: {
    backgroundColor: '#ff6b6b',
  },
  
  vigenciaCircleGreen: {
    backgroundColor: '#4CAF50',
  },
  
  vigenciaNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  
  vigenciaPercentage: {
    fontSize: 20,
  },
  
  vigenciaLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  vigenciaDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },

  // List Container
  listContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },

  // List Items
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  listItemInfo: {
    flex: 1,
  },
  
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f0a12',
    marginBottom: 2,
  },
  
  listItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  
  listItemBadge: {
    backgroundColor: '#b52e69',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  
  listItemBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Sector Cards
  sectorCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  sectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  sectorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  
  sectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f0a12',
    flex: 1,
  },
  
  sectorContent: {
    marginLeft: 42,
  },
  
  sectorStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  sectorStatItem: {
    alignItems: 'center',
  },
  
  sectorStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f0a12',
  },
  
  sectorStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  greenText: {
    color: '#4CAF50',
  },
  
  redText: {
    color: '#ff6b6b',
  },
  
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 45,
    textAlign: 'right',
  },

  // Activity Items
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f0a12',
    marginBottom: 2,
  },
  
  activityDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
});