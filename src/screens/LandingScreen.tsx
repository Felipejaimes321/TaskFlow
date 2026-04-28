import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark-done" size={40} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>TaskFlow</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Gestión de tareas basada en el respeto.
          </Text>
        </View>

        <View style={styles.featureList}>
          <FeatureItem 
            icon="people-outline" 
            title="Colabora, no impongas" 
            desc="Acepta o rechaza tareas asignadas con un motivo claro."
            colors={colors}
          />
          <FeatureItem 
            icon="flash-outline" 
            title="Progreso en vivo" 
            desc="Visualiza el avance de tu equipo en tiempo real."
            colors={colors}
          />
          <FeatureItem 
            icon="shield-checkmark-outline" 
            title="Diseño Premium" 
            desc="Una experiencia minimalista inspirada en lo mejor de iOS."
            colors={colors}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Auth', { isSignUp: true })}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Empezar ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Auth', { isSignUp: false })}
            activeOpacity={0.6}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              ¿Ya tienes cuenta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, desc, colors }: any) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  featureList: {
    gap: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
