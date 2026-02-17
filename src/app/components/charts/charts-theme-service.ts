import { DOCUMENT, inject, Injectable } from '@angular/core';

export type ThemeTokens = {
  textColor: string;
  axisColor: string;
  gridColor: string;
  tooltipBg: string;
};
@Injectable({ providedIn: 'root' })
export class ChartsThemeService {
  private readonly doc = inject(DOCUMENT);

  private readonly fallbackLight: ThemeTokens = {
    textColor: '#44474e',
    axisColor: '#74777f',
    gridColor: '#74777f4D',
    tooltipBg: '#e9e7eb',
  };

  private readonly fallbackDark: ThemeTokens = {
    textColor: '#e0e2ec',
    axisColor: '#8e9099',
    gridColor: '#8e90994D',
    tooltipBg: '#292a2c',
  };

  getTheme(isDark: boolean, rootEl?: HTMLElement): ThemeTokens {
    const fallback = isDark ? this.fallbackDark : this.fallbackLight;

    return {
      textColor: this.pickFromCssVar('--elements-text-color', isDark, rootEl) ?? fallback.textColor,
      axisColor: this.pickFromCssVar('--elements-axis-color', isDark, rootEl) ?? fallback.axisColor,
      gridColor: this.pickFromCssVar('--elements-grid-color', isDark, rootEl) ?? fallback.gridColor,
      tooltipBg: this.pickFromCssVar('--elements-tooltip-bg', isDark, rootEl) ?? fallback.tooltipBg,
    };
  }

  private getCssVar(name: string, rootEl?: HTMLElement): string {
    const el = rootEl ?? this.doc.documentElement;
    return getComputedStyle(el).getPropertyValue(name).trim();
  }

  private pickFromCssVar(cssVar: string, isDark: boolean, rootEl?: HTMLElement): string | undefined {
    const raw = this.getCssVar(cssVar, rootEl);
    if (!raw) return undefined;

    const hexRegex = /#[a-fA-F0-9]{3,}/g;
    const matches = raw.match(hexRegex);
    if (!matches?.length) return undefined;

    const idx = isDark ? 1 : 0;
    return matches[idx] ?? matches[0];
  }
}