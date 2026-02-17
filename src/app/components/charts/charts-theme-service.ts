import { DOCUMENT, inject, Injectable } from '@angular/core';

export type ThemeTokens = {
  textColor?: string;
  axisColor?: string;
  gridColor?: string;
  tooltipBg?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ChartsThemeService {
  private readonly doc = inject(DOCUMENT);

  getTheme(isDark: boolean, rootEl?: HTMLElement): ThemeTokens {
    return {
      textColor: this.pickFromCssVar('--elements-text-color', isDark, rootEl),
      axisColor: this.pickFromCssVar('--elements-axis-color', isDark, rootEl),
      gridColor: this.pickFromCssVar('--elements-grid-color', isDark, rootEl),
      tooltipBg: this.pickFromCssVar('--elements-tooltip-bg', isDark, rootEl),
    };
  }

  private getCssVar(name: string, rootEl?: HTMLElement): string {
    const el = rootEl ?? this.doc.documentElement;
    return getComputedStyle(el).getPropertyValue(name).trim();
  }

  private pickFromCssVar(cssVar: string, isDark: boolean, rootEl?: HTMLElement): string | undefined {
    const raw = this.getCssVar(cssVar, rootEl);
    if (!raw) return undefined;

    // erwartet z.B. "#111 #eee" in einer CSS-Var
    const hexRegex = /#[a-fA-F0-9]{3,}/g;
    const matches = raw.match(hexRegex);
    if (!matches?.length) return undefined;

    const idx = isDark ? 1 : 0;
    return matches[idx];
  }
}