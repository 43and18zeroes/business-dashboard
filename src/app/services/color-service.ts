import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage-service';

export interface ColorTokens {
  primary: string;
  secondary: string;
}

export const COLORS = {
  'Cobalt Core': { primary: '#007BFF', secondary: '#00D4FF' },
  'Emerald Edge': { primary: '#28A745', secondary: '#34E89E' },
  'Infra Red': { primary: '#DC3545', secondary: '#FF8FA3', },
  'Sunset Grid': { primary: '#FD7E14', secondary: '#FFC107' },
} as const;

export type AppColor = keyof typeof COLORS;

const COLOR_KEY = 'appColor';
const DEFAULT_COLOR: AppColor = 'Cobalt Core';

@Injectable({ providedIn: 'root' })

export class ColorService {
  private readonly storage = inject(StorageService);

  private readonly _color = signal<AppColor>(this.loadColor());

  readonly color = computed(() => this._color());
  readonly tokens = computed<ColorTokens>(() => COLORS[this._color()]);
  readonly availableColors = Object.keys(COLORS) as AppColor[];

  constructor() {
    effect(() => this.applyCssVars(this.tokens()));
  }

  setColor(color: AppColor) {
    this._color.set(color);
    this.storage.setString(COLOR_KEY, color);
  }

  getTokens(color: AppColor): ColorTokens {
    return COLORS[color];
  }

  private loadColor(): AppColor {
    const saved = this.storage.getString(COLOR_KEY);
    if (saved && saved in COLORS) return saved as AppColor;
    return DEFAULT_COLOR;
  }

  private applyCssVars(tokens: ColorTokens) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tokens.primary);
    root.style.setProperty('--color-secondary', tokens.secondary);
  }
}