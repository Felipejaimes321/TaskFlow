import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, Animated, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/context/authStore';
import { useTheme } from '@/context/themeContext';
import { useToast } from '@/components/Toast';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function InputField({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize,
  icon, rightIcon, onRightIconPress, editable,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder: string; secureTextEntry?: boolean;
  keyboardType?: any; autoCapitalize?: any;
  icon: IoniconsName; rightIcon?: IoniconsName; onRightIconPress?: () => void;
  editable?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={20} color={colors.textTertiary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text, flex: rightIcon ? 1 : undefined }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          editable={editable !== false}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.eyeBtn}>
            <Ionicons name={rightIcon} size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function AuthScreen() {
  const [isSignUp, setIsSignUp]         = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [fullName, setFullName]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp } = useAuthStore();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [isSignUp]);

  const toggleMode = () => { 
    setIsSignUp(!isSignUp); 
    setEmail(''); 
    setPassword(''); 
    setFullName(''); 
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    scaleAnim.setValue(0.95);
  };

  const handleAuth = async () => {
    if (!email || !password) { showToast({ message: 'Completa todos los campos.', type: 'error' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast({ message: 'Correo no válido.', type: 'error' }); return; }
    if (password.length < 6) { showToast({ message: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' }); return; }
    if (isSignUp && !fullName.trim()) { showToast({ message: 'Ingresa tu nombre.', type: 'error' }); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName.trim());
        showToast({ message: '¡Cuenta creada! Ahora inicia sesión.', type: 'success' });
        setIsSignUp(false); setEmail(''); setPassword(''); setFullName('');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      const raw = error?.message || JSON.stringify(error) || 'Error desconocido';
      showToast({ message: 'Error de acceso: ' + raw, type: 'error', duration: 5000 });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }]}>
          
          <View style={styles.header}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {isSignUp ? 'Crear cuenta' : 'Bienvenido'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isSignUp ? 'Comienza a organizar tu vida hoy.' : 'Nos alegra verte de nuevo.'}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <InputField
                label="Nombre completo" icon="person-outline"
                placeholder="Ej: María García" value={fullName}
                onChangeText={setFullName} autoCapitalize="words" editable={!loading}
              />
            )}

            <InputField
              label="Correo electrónico" icon="mail-outline"
              placeholder="tucorreo@ejemplo.com" value={email}
              onChangeText={setEmail} keyboardType="email-address" editable={!loading}
            />

            <InputField
              label="Contraseña" icon="lock-closed-outline"
              placeholder="Mínimo 6 caracteres" value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }, loading && styles.btnDisabled]}
              onPress={handleAuth} disabled={loading} activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnText}>{isSignUp ? 'Crear mi cuenta' : 'Iniciar sesión'}</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={toggleMode} disabled={loading} style={styles.toggleBtn}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isSignUp ? '¿Ya tienes cuenta? ' : '¿Primera vez? '}
              <Text style={[styles.toggleHighlight, { color: colors.primary }]}>
                {isSignUp ? 'Inicia sesión' : 'Créala gratis'}
              </Text>
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 10, color: colors.textTertiary, textAlign: 'center', marginTop: 40 }}>
            Diagnóstico DB: {process.env.EXPO_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING'}
          </Text>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1 },
  scroll:    { flexGrow: 1, paddingHorizontal: 28, justifyContent: 'center' },
  content:   { width: '100%', maxWidth: 400, alignSelf: 'center', paddingVertical: 60 },
  header:    { marginBottom: 40 },
  logoBox:   { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  title:     { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, marginBottom: 8 },
  subtitle:  { fontSize: 16, lineHeight: 22 },
  form:      { gap: 20 },
  fieldWrap: {},
  inputLabel:{ fontSize: 13, fontWeight: '700', marginBottom: 8, paddingLeft: 4 },
  inputBox:  { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input:     { fontSize: 16, flex: 1, fontWeight: '500' },
  eyeBtn:    { padding: 8, marginRight: -8 },
  btn:       { borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  btnText:   { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  toggleBtn: { marginTop: 32, alignItems: 'center', padding: 10 },
  toggleText:{ fontSize: 15, fontWeight: '500' },
  toggleHighlight: { fontWeight: '800' },
});
