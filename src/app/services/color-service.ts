import { computed, Injectable, signal } from '@angular/core';
import { AppColor, COLORS, ColorTokens } from './color.tokens'

@Injectable({ providedIn: 'root' })
export class ColorService {
  private readonly _color = signal<AppColor>('Cobalt Core');

  readonly color = computed(() => this._color());
  readonly tokens = computed<ColorTokens>(() => COLORS[this._color()]);

  readonly availableColors = Object.keys(COLORS) as AppColor[];

  setColor(color: AppColor) {
    this._color.set(color);
    this.applyCssVars(COLORS[color]);
  }

  initColor() {
    this.applyCssVars(this.tokens());
  }

  private applyCssVars(tokens: ColorTokens) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tokens.primary);
    root.style.setProperty('--color-secondary', tokens.secondary);
  }
}