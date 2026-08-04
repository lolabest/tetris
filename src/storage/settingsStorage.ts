export interface UserSettings {
  readonly muted: boolean;
  readonly volume: number;
}

export const defaultSettings: UserSettings = {
  muted: false,
  volume: 0.55,
};

const SETTINGS_KEY = "piano-blocks:settings";

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultSettings.volume;
  }
  return Math.min(1, Math.max(0, value));
}

function isSettings(value: unknown): value is UserSettings {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record["muted"] === "boolean" && typeof record["volume"] === "number"
  );
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isSettings(parsed)) {
      return defaultSettings;
    }
    return {
      muted: parsed.muted,
      volume: clampVolume(parsed.volume),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings): UserSettings {
  const next: UserSettings = {
    muted: settings.muted,
    volume: clampVolume(settings.volume),
  };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
