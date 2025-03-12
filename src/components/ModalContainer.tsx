import React, { useEffect, useRef } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Platform,
    Modal,
    ScrollView,
    Animated,
    Dimensions,
    BackHandler,
} from 'react-native';

import { useThemeGlobalStore } from '../store/index';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Divider } from 'react-native-paper';
import { Color } from '../theme/GlobalStyles';
import { StatusBar } from 'expo-status-bar';

// Definimos constantes similares a las de CustomAlert para mantener consistencia
const BACKGROUND_OPACITY = 0.5;
const BACKGROUND_COLOR = `rgba(0, 0, 0, ${BACKGROUND_OPACITY})`;

export const ModalContainer = ({ titulo, modalVisible, closeModal, children }: any) => {
    const themeGlobal = useThemeGlobalStore.getState().theme;
    const { height, width } = Dimensions.get('window');

    // Animated values for slide up effect
    const slideAnim = useRef(new Animated.Value(height)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (modalVisible) {
            // Animate modal opening - Usando spring para mayor fluidez
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 15,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Handle back button press on Android
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                handleCloseModal();
                return true;
            });

            return () => {
                backHandler.remove();
            };
        }
    }, [modalVisible]);

    const handleCloseModal = () => {
        // Animate modal closing - También usando spring para la salida
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: height,
                useNativeDriver: true,
                tension: 65,
                friction: 15,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200, // Reducido para una salida más rápida
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Llamamos a closeModal directamente después de la animación
            closeModal();
        });
    };

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="none" // We'll handle animations manually
            onRequestClose={handleCloseModal} // Android back button
            statusBarTranslucent={true} // Importante para que el StatusBar funcione correctamente
        >
            {/* StatusBar exactamente igual al de CustomAlert */}
            {modalVisible && <StatusBar translucent backgroundColor="rgba(0,0,0,0)" style="light" />}
            
            <View style={styles.modalBackground}>
                {/* Backdrop with touch to close */}
                <TouchableOpacity
                    style={styles.backdropTouchable}
                    activeOpacity={1}
                    onPress={handleCloseModal}
                >
                    <Animated.View
                        style={[
                            styles.backdrop,
                            { opacity: opacityAnim }
                        ]}
                    />
                </TouchableOpacity>

                {/* Modal Content */}
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            transform: [{ translateY: slideAnim }],
                            width: width // Full width of the screen
                        }
                    ]}
                >
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{titulo}</Text>
                        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                            <View style={styles.closeButtonBackground}>
                                <Text style={styles.modalCloseText}>Cerrar</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Divider style={{ marginBottom: 10 }} />

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end', // Align to bottom
        alignItems: 'center',
    },
    backdropTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backdrop: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR, // Usar la misma constante de opacidad que en CustomAlert
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%', // Limit maximum height
        paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Extra padding for iOS devices with home indicator
    },
    handleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 10,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#e0e0e0',
        marginBottom: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Color.colorBlack,
    },
    closeButton: {
        padding: 5,
    },
    closeButtonBackground: {
        borderRadius: 30,
        padding: 5,
    },
    scrollView: {
        width: '100%',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    modalCloseText: {
        fontSize: 16,
        color: '#f08fb8',
        fontWeight: 'bold',
    },
});