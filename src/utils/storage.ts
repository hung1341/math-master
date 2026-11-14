import { DAILY_HINT_LIMIT, HINT_PRICES } from '../constants/gameConfig';
import type { AppStorage, PlayerProfile } from '../types/game';

const STORAGE_KEY = 'math_master_6_storage_v1';

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetweenIso(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

export function createNewProfile(name: string): PlayerProfile {
  const today = getTodayIso();
  return {
    name,
    money: 0,
    diamonds: 0,
    xp: 0,
    level: 0,
    streak: 1,
    lastDate: today,
    claimedDate: '',
    hintDate: today,
    hintCount: 0,
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    autoFreeze: true,
    history: [],
  };
}

export function computeLevel(xp: number): number {
  return Math.min(1000000, Math.floor(xp / 100));
}

export function refreshProfileDailyState(profile: PlayerProfile): PlayerProfile {
  const today = getTodayIso();
  const updated: PlayerProfile = { ...profile };

  if (updated.hintDate !== today) {
    updated.hintDate = today;
    updated.hintCount = 0;
  }

  if (!updated.lastDate) {
    updated.streak = 1;
    updated.lastDate = today;
  } else {
    const gap = daysBetweenIso(updated.lastDate, today);
    if (gap === 1) {
      updated.streak += 1;
      updated.lastDate = today;
    } else if (gap > 1) {
      let missed = gap - 1;
      if (updated.autoFreeze) {
        const used = Math.min(missed, updated.diamonds);
        updated.diamonds -= used;
        missed -= used;
      }
      updated.streak = missed > 0 ? 1 : updated.streak + gap;
      updated.lastDate = today;
    }
  }

  updated.level = computeLevel(updated.xp);
  return updated;
}

export function getNextHintPrice(profile: PlayerProfile): number {
  const today = getTodayIso();
  const count = profile.hintDate === today ? profile.hintCount : 0;
  return HINT_PRICES[count % DAILY_HINT_LIMIT];
}

export function loadAppStorage(): AppStorage {
  const defaultPlayerName = 'Hiệp sĩ Toán';
  const fallback: AppStorage = {
    activePlayer: defaultPlayerName,
    players: {
      [defaultPlayerName]: createNewProfile(defaultPlayerName),
    },
    theme: 'dark',
    soundEnabled: true,
    graphicsQuality: 'high',
    cameraPreset: 'auto',
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppStorage(fallback);
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<AppStorage>;
    if (!parsed || !parsed.players || Object.keys(parsed.players).length === 0) {
      saveAppStorage(fallback);
      return fallback;
    }

    const activeName =
      parsed.activePlayer && parsed.players[parsed.activePlayer]
        ? parsed.activePlayer
        : Object.keys(parsed.players)[0];

    const refreshedPlayers: Record<string, PlayerProfile> = {};
    for (const [key, prof] of Object.entries(parsed.players)) {
      refreshedPlayers[key] = refreshProfileDailyState({
        ...createNewProfile(key),
        ...prof,
        name: key,
        history: Array.isArray(prof.history) ? prof.history : [],
      });
    }

    const result: AppStorage = {
      activePlayer: activeName,
      players: refreshedPlayers,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      soundEnabled: parsed.soundEnabled !== false,
      graphicsQuality: parsed.graphicsQuality === 'low' ? 'low' : 'high',
      cameraPreset:
        parsed.cameraPreset === 'duel' || parsed.cameraPreset === 'overview'
          ? parsed.cameraPreset
          : 'auto',
    };
    saveAppStorage(result);
    return result;
  } catch {
    return fallback;
  }
}

export function saveAppStorage(data: AppStorage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN');
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
