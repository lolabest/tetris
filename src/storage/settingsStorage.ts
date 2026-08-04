export interface UserSettings {
  readonly musicEnabled: boolean;
  readonly sfxEnabled: boolean;
  readonly volume: number;
  /** @deprecated kept for migration from older saves */
  readonly muted?: boolean;
}

export const defaultSettings: UserSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  volume: 0.55,
};

const SETTINGS_KEY = "piano-blocks:settings";

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultSettings.volume;
  }
  return Math.min(1, Math.max(0, value));
}

function normalizeSettings(value: Record<string, unknown>): UserSettings {
  const volume = clampVolume(
    typeof value["volume"] === "number"
      ? value["volume"]
      : defaultSettings.volume,
  );
  // Migrate legacy `muted`
  if (
    typeof value["musicEnabled"] === "boolean" ||
    typeof value["sfxEnabled"] === "boolean"
  ) {
    return {
      musicEnabled:
        typeof value["musicEnabled"] === "boolean"
          ? value["musicEnabled"]
          : !(value["muted"] === true),
      sfxEnabled:
        typeof value["sfxEnabled"] === "boolean"
          ? value["sfxEnabled"]
          : !(value["muted"] === true),
      volume,
    };
  }
  if (typeof value["muted"] === "boolean") {
    return {
      musicEnabled: !value["muted"],
      sfxEnabled: !value["muted"],
      volume,
    };
  }
  return { ...defaultSettings, volume };
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return defaultSettings;
    }
    return normalizeSettings(parsed as Record<string, unknown>);
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings): UserSettings {
  const next: UserSettings = {
    musicEnabled: settings.musicEnabled,
    sfxEnabled: settings.sfxEnabled,
    volume: clampVolume(settings.volume),
  };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
