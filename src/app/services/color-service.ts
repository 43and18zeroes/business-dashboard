import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AppColor, COLORS, ColorTokens } from './color.tokens';
import { StorageService } from './storage-service';

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