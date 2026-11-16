import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { storageService } from '../../services/storageService';
import { Group } from '../../types';
import { NeumorphicView } from '../../components/NeumorphicView';
import { NeumorphicInput } from '../../components/NeumorphicInput';
import { NeumorphicButton } from '../../components/NeumorphicButton';
import { ThemeToggle } from '../../components/ThemeToggle';
import { triggerLightHaptic } from '../../utils/haptics';
import { isValidJshshir, sanitizeJshshirInput } from '../../utils/formatters';

interface StudentLoginScreenProps {
  onLoginSuccess: (group: Group, jshshir: string) => void;
}

export const StudentLoginScreen: React.FC<StudentLoginScreenProps> = ({
  onLoginSuccess,
}) => {
  const { colors, mode } = useTheme();
  const [jshshir, setJshshir] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const cleaned = jshshir.trim();

    if (!cleaned) {
      setError('Iltimos, JSHSHIR raqamingizni kiriting');
      return;
    }

    if (!isValidJshshir(cleaned)) {
      setError('JSHSHIR 14 ta raqamdan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      const result = await storageService.findStudentByJshshir(cleaned);
      if (!result) {
        setError('Ushbu JSHSHIR bazada topilmadi. Ma\'muriyatga murojaat qiling.');
        return;
      }

      await storageService.saveStudentSession(cleaned, result.group);
      onLoginSuccess(result.group, cleaned);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Tizimga kirishda xatolik yuz berdi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFill = (code: string) => {
    triggerLightHaptic();
    setJshshir(code);
    setError(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.base }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      {/* Top Bar: Theme Toggle */}
      <View style={styles.topBar}>
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Branding Card */}
          <View style={styles.heroWrapper}>
            <NeumorphicView
              borderRadius={30}
              style={styles.heroOuter}
              contentStyle={styles.heroInner}
            >
              <View
                style={[styles.logoCircle, { backgroundColor: colors.accentLight }]}
              >
                <Ionicons name="school" size={42} color={colors.accent} />
              </View>

              <Text style={[styles.appTitle, { color: colors.primaryText }]}>
                Texnikum Dars Jadvali
              </Text>
              <Text style={[styles.appSubtitle, { color: colors.secondaryText }]}>
                Kasb-hunar ta'limi talabalarining dars jadvali axborot tizimi
              </Text>
            </NeumorphicView>
          </View>

          {/* Login Card */}
          <NeumorphicView
            borderRadius={24}
            style={styles.loginCard}
            contentStyle={styles.loginCardContent}
          >
            <View style={styles.formHeader}>
              <Ionicons name="finger-print" size={22} color={colors.accent} />
              <Text style={[styles.formTitle, { color: colors.primaryText }]}>
                Talaba identifikatsiyasi
              </Text>
            </View>

            <Text style={[styles.formDescription, { color: colors.secondaryText }]}>
              Dars jadvalingizni ko'rish uchun shaxsiy 14 xonali JSHSHIR raqamingizni kiriting.
            </Text>

            {/* Inset Neumorphic Input for JSHSHIR */}
            <NeumorphicInput
              label="JSHSHIR (14 ta raqam)"
              placeholder="12345678901234"
              value={jshshir}
              onChangeText={(text) => {
                const filtered = sanitizeJshshirInput(text);
                setJshshir(filtered);
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              maxLength={14}
              error={error || undefined}
              leftIcon={
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={jshshir.length === 14 ? colors.accent : colors.secondaryText}
                />
              }
              rightIcon={
                jshshir.length > 0 ? (
                  <Text style={[styles.counterText, { color: colors.secondaryText }]}>
                    {jshshir.length}/14
                  </Text>
                ) : undefined
              }
              showClearButton={jshshir.length > 0}
              onClear={() => setJshshir('')}
            />

            {/* Extruded Neumorphic Kirish Button */}
            <NeumorphicButton
              title={loading ? 'Tekshirilmoqda...' : 'Kirish'}
              variant="accent"
              size="large"
              onPress={handleLogin}
              disabled={loading}
              icon={
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={22}
                  color="#FFFFFF"
                />
              }
              style={styles.loginButton}
            />

            {/* Quick Test Seed Pill Shortcuts */}
            <View style={styles.quickFillSection}>
              <Text style={[styles.quickFillTitle, { color: colors.secondaryText }]}>
                Sinov uchun JSHSHIR namunalari:
              </Text>
              <View style={styles.chipsRow}>
                <Pressable
                  onPress={() => handleTestFill('12345678901234')}
                  style={[styles.testChip, { borderColor: colors.insetBorder, backgroundColor: colors.base }]}
                >
                  <Text style={[styles.chipText, { color: colors.accent }]}>
                    21-24 AT: 12345678901234
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleTestFill('98765432109876')}
                  style={[styles.testChip, { borderColor: colors.insetBorder, backgroundColor: colors.base }]}
                >
                  <Text style={[styles.chipText, { color: colors.accent }]}>
                    11-25 DT: 98765432109876
                  </Text>
                </Pressable>
              </View>
            </View>
          </NeumorphicView>

          {/* Footer Note */}
          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            O'zbekiston Respublikasi Oliy ta'lim, fan va innovatsiyalar vazirligi tizimi
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  heroWrapper: {
    width: '100%',
    marginVertical: 16,
  },
  heroOuter: {
    width: '100%',
  },
  heroInner: {
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 290,
  },
  loginCard: {
    width: '100%',
    marginVertical: 10,
  },
  loginCardContent: {
    padding: 22,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  formDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginBottom: 14,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  loginButton: {
    marginTop: 18,
  },
  quickFillSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160, 175, 195, 0.2)',
  },
  quickFillTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'column',
    gap: 8,
  },
  testChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
    maxWidth: 280,
  },
});
