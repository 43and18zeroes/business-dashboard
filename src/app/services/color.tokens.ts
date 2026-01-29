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
    'Infra Red': { primary: '#DC3545', secondary: '#FF4D6D' },
    'Sunset Grid': { primary: '#FD7E14', secondary: '#FFC107' },
    'Neon Orchid': { primary: '#6F42C1', secondary: '#E83E8C' },
} as const; 

export type AppColor = keyof typeof COLORS;

export const APP_COLORS = Object.keys(COLORS) as AppColor[];