import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Linking,
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

  const handleOpenTelegram = () => {
    triggerLightHaptic();
    Linking.openURL('https://t.me/khujabekov_b').catch(() => {});
  };

  const handleOpenEmail = () => {
    triggerLightHaptic();
    Linking.openURL('mailto:khujabekovbakhrom@gmail.com').catch(() => {});
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
                Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi
              </Text>
              <Text style={[styles.appSubtitle, { color: colors.secondaryText }]}>
                Talabalar dars jadvali axborot tizimi
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
          </NeumorphicView>

          {/* Dasturchi va Aloqa Ma'lumotlari Bloki */}
          <View style={styles.contactWrapper}>
            <NeumorphicView
              borderRadius={22}
              style={styles.contactCard}
              contentStyle={styles.contactCardContent}
            >
              <View style={styles.devRow}>
                <Ionicons name="code-slash" size={16} color={colors.accent} />
                <Text style={[styles.devText, { color: colors.secondaryText }]}>
                  Dasturchi:{' '}
                  <Text style={[styles.devBold, { color: colors.primaryText }]}>
                    Blitz Soft group
                  </Text>
                </Text>
              </View>

              <View
                style={[
                  styles.contactDivider,
                  { backgroundColor: colors.insetBorder },
                ]}
              />

              <View style={styles.contactButtonsRow}>
                <Pressable
                  onPress={handleOpenTelegram}
                  style={({ pressed }) => [
                    styles.contactButton,
                    {
                      backgroundColor: colors.base,
                      borderColor: colors.insetBorder,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Ionicons name="paper-plane" size={15} color="#0088cc" />
                  <Text
                    style={[styles.contactButtonText, { color: colors.primaryText }]}
                  >
                    @khujabekov_b
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleOpenEmail}
                  style={({ pressed }) => [
                    styles.contactButton,
                    {
                      backgroundColor: colors.base,
                      borderColor: colors.insetBorder,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Ionicons name="mail" size={15} color="#EA4335" />
                  <Text
                    style={[styles.contactButtonText, { color: colors.primaryText }]}
                  >
                    Email yozish
                  </Text>
                </Pressable>
              </View>
            </NeumorphicView>
          </View>
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
    marginVertical: 14,
  },
  heroOuter: {
    width: '100%',
  },
  heroInner: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 26,
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
  contactWrapper: {
    width: '100%',
    marginTop: 18,
  },
  contactCard: {
    width: '100%',
  },
  contactCardContent: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  devText: {
    fontSize: 13,
  },
  devBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  contactDivider: {
    width: '100%',
    height: 1,
    marginVertical: 12,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
