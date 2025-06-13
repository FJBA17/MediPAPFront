import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { MedicionesApi } from '../config/api/medicionesApi';
import { FontFamily, FontSize, Color, Border, Padding } from '../theme/GlobalStyles';

const PasswordChangeSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Contraseña actual requerida'),
    newPassword: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('Nueva contraseña requerida'),
});

interface PasswordCambioFormProps {
    onPasswordChanged: () => void;
}

const PasswordCambioForm: React.FC<PasswordCambioFormProps> = ({ onPasswordChanged }) => {
    const [secureTextEntry, setSecureTextEntry] = useState({
        current: true,
        new: true,
    });

    const togglePasswordVisibility = (field: 'current' | 'new') => {
        setSecureTextEntry(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = async (values: { currentPassword: string; newPassword: string }, { setSubmitting, setErrors, resetForm }) => {
        try {
            await MedicionesApi.post('/usuarios/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
    
            resetForm();
            onPasswordChanged(); // Llamamos a onPasswordChanged sin mostrar la alerta aquí
        } catch (error) {
            if (error.response) {
                setErrors({ form: error.response.data.message || 'Error al cambiar la contraseña' });
            } else {
                setErrors({ form: 'Error al procesar la solicitud' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={{ currentPassword: '', newPassword: '' }}
            validationSchema={PasswordChangeSchema}
            onSubmit={handlePasswordChange}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <View style={styles.container}>
                    <PasswordInput
                        placeholder="Contraseña actual"
                        value={values.currentPassword}
                        onChangeText={handleChange('currentPassword')}
                        onBlur={handleBlur('currentPassword')}
                        secureTextEntry={secureTextEntry.current}
                        toggleVisibility={() => togglePasswordVisibility('current')}
                    />
                    {touched.currentPassword && errors.currentPassword && (
                        <Text style={styles.errorText}>{errors.currentPassword}</Text>
                    )}

                    <PasswordInput
                        placeholder="Nueva contraseña"
                        value={values.newPassword}
                        onChangeText={handleChange('newPassword')}
                        onBlur={handleBlur('newPassword')}
                        secureTextEntry={secureTextEntry.new}
                        toggleVisibility={() => togglePasswordVisibility('new')}
                    />
                    {touched.newPassword && errors.newPassword && (
                        <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}

                    {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

                    <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                        <Text style={styles.buttonText}>
                            {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </Formik>
    );
};

interface PasswordInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    secureTextEntry: boolean;
    toggleVisibility: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    placeholder,
    value,
    onChangeText,
    onBlur,
    secureTextEntry,
    toggleVisibility
}) => (
    <View style={styles.passwordContainer}>
        <TextInput
            style={styles.passwordInput}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
        />
        <TouchableOpacity onPress={toggleVisibility} style={styles.iconContainer}>
            <Icon
                name={secureTextEntry ? 'eye-off' : 'eye'}
                size={24}
                color={Color.colorGrey}
            />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: Padding.p_base,
        backgroundColor: Color.colorWhite,
        borderRadius: Border.br_xs,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: Color.colorThistle,
        borderWidth: 1,
        borderRadius: Border.br_xs,
        marginBottom: Padding.p_5xs,
    },
    passwordInput: {
        flex: 1,
        height: 40,
        paddingHorizontal: Padding.p_3xs,
        fontFamily: FontFamily.publicSansRegular,
        fontSize: FontSize.size_base,
        color: Color.colorBlack,
    },
    iconContainer: {
        padding: Padding.p_3xs,
    },
    errorText: {
        color: Color.colorPalevioletred_100,
        fontFamily: FontFamily.publicSansRegular,
        fontSize: FontSize.size_sm,
        marginBottom: Padding.p_5xs,
    },
    button: {
        backgroundColor: "#a33d69",
        padding: Padding.p_3xs,
        alignItems: 'center',
        borderRadius: Border.br_xs,
        marginTop: Padding.p_base,
    },
    buttonText: {
        color: Color.colorWhite,
        fontSize: FontSize.size_base,
        fontFamily: FontFamily.publicSansMedium,
    },
});

export default PasswordCambioForm;