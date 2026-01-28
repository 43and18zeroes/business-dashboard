import { computed, Injectable, signal } from '@angular/core';
import { AppColor, COLORS, ColorTokens } from './color.tokens';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private readonly _theme = signal<AppColor>('Cobalt Core');

  readonly theme = computed(() => this._theme());
  readonly tokens = computed<ColorTokens>(() => COLORS[this._theme()]);

  setTheme(theme: AppColor) {
    this._theme.set(theme);
    this.applyCssVars(COLORS[theme]);
  }

  init() {
    this.applyCssVars(this.tokens());
  }

  private applyCssVars(tokens: ColorTokens) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tokens.primary);
    root.style.setProperty('--color-secondary', tokens.secondary);
  }
}
