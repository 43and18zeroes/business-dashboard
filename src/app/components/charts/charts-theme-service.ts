import { DOCUMENT, inject, Injectable } from '@angular/core';

export type ChartThemeTokens = {
  textColor: string;
  axisColor: string;
  gridColor: string;
  tooltipBg: string;
};
@Injectable({ providedIn: 'root' })
export class ChartsThemeService {
  private readonly doc = inject(DOCUMENT);

  private readonly fallbackLight: ChartThemeTokens = {
    textColor: '#44474e',
    axisColor: '#74777f',
    gridColor: '#74777f4D',
    tooltipBg: '#f8f9fa',
  };

  private readonly fallbackDark: ChartThemeTokens = {
    textColor: '#e0e2ec',
    axisColor: '#8e9099',
    gridColor: '#8e90994D',
    tooltipBg: '#292a2c',
  };

  private readonly tooltipSpecs = {
    borderWidth: 1,
  }

  getTooltipsSpec() {
    return {
      borderWidth: this.tooltipSpecs.borderWidth,
    }
  }

  getTheme(isDark: boolean): ChartThemeTokens {
    const fallback = isDark ? this.fallbackDark : this.fallbackLight;

    return {
      textColor: this.pickFromCssVar('--elements-text-color', isDark) ?? fallback.textColor,
      axisColor: this.pickFromCssVar('--elements-axis-color', isDark) ?? fallback.axisColor,
      gridColor: this.pickFromCssVar('--elements-grid-color', isDark) ?? fallback.gridColor,
      tooltipBg: this.pickFromCssVar('--elements-tooltip-bg', isDark) ?? fallback.tooltipBg,
    };
  }

  getColorFromCssVar(cssVar: string, isDark: boolean, fallback: string): string {
    return this.pickFromCssVar(cssVar, isDark) ?? fallback;
  }

  private getCssVar(name: string): string {
    return getComputedStyle(this.doc.documentElement).getPropertyValue(name).trim();
  }

  private pickFromCssVar(cssVar: string, isDark: boolean): string | undefined {
    const raw = this.getCssVar(cssVar);
    if (!raw) return undefined;

    const matches = raw.match(/#[a-fA-F0-9]{3,}/g);
    if (!matches?.length) return undefined;

    const idx = isDark ? 1 : 0;
    return matches[idx] ?? matches[0];
  }
}