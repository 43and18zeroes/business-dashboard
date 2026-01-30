/* =========================
color.tokens.ts
========================= */

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