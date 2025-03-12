import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MedicionesApi } from '../config/api/medicionesApi';
import { FontFamily, FontSize, Color, Border, Padding } from '../theme/GlobalStyles';

interface AdminPasswordCambioFormProps {
  userName: string;
  onPasswordChanged: () => void;
}

const AdminPasswordCambioForm: React.FC<AdminPasswordCambioFormProps> = ({ userName, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState({
    new: true,
    confirm: true,
  });

  const validatePassword = (password: string): string | null => {
    if (password.length < 6 || password.length > 20) {
      return 'La contraseña debe tener entre 6 y 20 caracteres';
    }
    if (!/\d/.test(password)) {
      return 'La contraseña debe incluir al menos un número';
    }
    return null;
  };

  const toggleVisibility = (field: 'new' | 'confirm') => {
    setSecureTextEntry(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async () => {
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await MedicionesApi.post(`/usuarios/${userName}/admin-change-password`, { newPassword });
      onPasswordChanged();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error al cambiar la contraseña');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Nueva contraseña"
          secureTextEntry={secureTextEntry.new}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => toggleVisibility('new')} style={styles.iconContainer}>
          <Icon
            name={secureTextEntry.new ? 'eye-off' : 'eye'}
            size={24}
            color={Color.colorGrey}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmar contraseña"
          secureTextEntry={secureTextEntry.confirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => toggleVisibility('confirm')} style={styles.iconContainer}>
          <Icon
            name={secureTextEntry.confirm ? 'eye-off' : 'eye'}
            size={24}
            color={Color.colorGrey}
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Cambiar Contraseña</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Padding.p_base,
    backgroundColor: Color.colorWhite,
    borderRadius: Border.br_xs,
    marginTop: Padding.p_base,
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
    backgroundColor: Color.colorPlum,
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

export default AdminPasswordCambioForm;