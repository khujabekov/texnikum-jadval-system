import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from '../utils/crypto';

const AUTH_KEYS = {
  ADMIN_SESSION: '@texnikum_admin_session_v2',
  FAILED_ATTEMPTS: '@texnikum_auth_failed_attempts_v2',
  LOCKOUT_UNTIL: '@texnikum_auth_lockout_until_v2',
};

const SALT = '#Texnikum2026_Salt!ScheduleAuth';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

// Default admin: admin / admin123
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_HASH = sha256('admin123' + SALT);

export interface AdminLoginResult {
  success: boolean;
  error?: string;
  isLocked?: boolean;
  remainingSeconds?: number;
}

class AuthService {
  private failedAttempts = 0;
  private lockedUntil = 0;
  private isLoaded = false;

  private async loadState(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const attemptsStr = await AsyncStorage.getItem(AUTH_KEYS.FAILED_ATTEMPTS);
      const lockoutStr = await AsyncStorage.getItem(AUTH_KEYS.LOCKOUT_UNTIL);

      if (attemptsStr) this.failedAttempts = parseInt(attemptsStr, 10) || 0;
      if (lockoutStr) this.lockedUntil = parseInt(lockoutStr, 10) || 0;
      this.isLoaded = true;
    } catch {
      this.isLoaded = true;
    }
  }

  private async persistState(): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [AUTH_KEYS.FAILED_ATTEMPTS, this.failedAttempts.toString()],
        [AUTH_KEYS.LOCKOUT_UNTIL, this.lockedUntil.toString()],
      ]);
    } catch {}
  }

  /**
   * Checks if admin login is currently in lockout state
   */
  async getLockoutStatus(): Promise<{ isLocked: boolean; remainingSeconds: number }> {
    await this.loadState();
    const now = Date.now();
    if (this.lockedUntil > now) {
      const remainingSeconds = Math.ceil((this.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }
    // Lock expired
    if (this.lockedUntil > 0 && this.lockedUntil <= now) {
      this.lockedUntil = 0;
      this.failedAttempts = 0;
      await this.persistState();
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  /**
   * Authenticates admin with salted SHA-256 and brute-force protection
   */
  async loginAdmin(username: string, password: string): Promise<AdminLoginResult> {
    await this.loadState();

    const lockout = await this.getLockoutStatus();
    if (lockout.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: lockout.remainingSeconds,
        error: `Ko'p marta xato kiritildi. Tizim xavfsizlik maqsadida bloklandi. ${lockout.remainingSeconds} soniyadan so'ng qayta urinib ko'ring.`,
      };
    }

    const cleanUsername = username.trim().toLowerCase();
    const passwordHash = sha256(password.trim() + SALT);

    const isMatch =
      cleanUsername === DEFAULT_ADMIN_USERNAME &&
      passwordHash === DEFAULT_ADMIN_HASH;

    if (isMatch) {
      // Reset lockout counter on success
      this.failedAttempts = 0;
      this.lockedUntil = 0;
      await this.persistState();

      // Save isolated admin session
      await AsyncStorage.setItem(AUTH_KEYS.ADMIN_SESSION, 'true');
      return { success: true };
    }

    // Failed attempt
    this.failedAttempts += 1;

    if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      this.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      await this.persistState();
      return {
        success: false,
        isLocked: true,
        remainingSeconds: 60,
        error: "Login yoki parol 5 marta noto'g'ri kiritildi! Tizim 60 soniyaga bloklandi.",
      };
    }

    await this.persistState();
    const attemptsLeft = MAX_FAILED_ATTEMPTS - this.failedAttempts;
    return {
      success: false,
      error: `Login yoki parol noto'g'ri! (Standart: admin / admin123). Qolgan urinishlar: ${attemptsLeft}`,
    };
  }

  async logoutAdmin(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_KEYS.ADMIN_SESSION);
    } catch {}
  }

  async isAdminAuthenticated(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(AUTH_KEYS.ADMIN_SESSION);
      return val === 'true';
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
