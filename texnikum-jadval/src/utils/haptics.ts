import * as Haptics from 'expo-haptics';

export const triggerLightHaptic = () => {
  try {
    const res = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (res && typeof res.catch === 'function') {
      res.catch(() => {});
    }
  } catch {
    // Safely ignore on environments where haptics are unsupported
  }
};

export const triggerMediumHaptic = () => {
  try {
    const res = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (res && typeof res.catch === 'function') {
      res.catch(() => {});
    }
  } catch {
    // Safely ignore
  }
};

export const triggerSelectionHaptic = () => {
  try {
    const res = Haptics.selectionAsync();
    if (res && typeof res.catch === 'function') {
      res.catch(() => {});
    }
  } catch {
    // Safely ignore
  }
};
