

export interface Task {
  id: string;
  text: string;
  color: string;
  createdAt: number;
  completedAt?: number;
  isCompleted: boolean;
  rotation: number;
}

// App Background Themes
export const THEMES = {
  // Light Themes
  DEFAULT: "#F3F4F6", // Light Gray
  BLUE: "#E0F2FE",    // Light Blue
  PURPLE: "#F3E8FF",  // Light Purple
  GREEN: "#DCFCE7",   // Light Green
  CREAM: "#FFFBEB",   // Cream
  
  // Dark Themes
  BOARD: "#2C2C2C",   // Original Blackboard Gray
  DARK: "#111827",    // Modern Dark
  MIDNIGHT: "#1e1b4b",// Midnight Blue
  FOREST: "#022c22",  // Deep Green
  EGGPLANT: "#3b0764",// Deep Purple
  CHOCOLATE: "#451a03"// Deep Brown
};

export type ThemeKey = keyof typeof THEMES;

export const isDarkTheme = (key: ThemeKey): boolean => {
  return ['BOARD', 'DARK', 'MIDNIGHT', 'FOREST', 'EGGPLANT', 'CHOCOLATE'].includes(key);
};

// --- STICKY NOTE STYLES (Solids Only) ---

export interface StickyStyle {
  id: string;
  bg: string;
  name: string;
  css?: string;
}

export const STICKY_STYLES: Record<string, StickyStyle> = {
  '#FFC8C8': { id: '#FFC8C8', bg: '#FFC8C8', name: 'Pink' },
  '#BDE0FE': { id: '#BDE0FE', bg: '#BDE0FE', name: 'Blue' },
  '#FDFD96': { id: '#FDFD96', bg: '#FDFD96', name: 'Yellow' },
  '#C1E1C1': { id: '#C1E1C1', bg: '#C1E1C1', name: 'Green' },
  '#E2C6E8': { id: '#E2C6E8', bg: '#E2C6E8', name: 'Purple' },
};

export const STYLE_KEYS = Object.keys(STICKY_STYLES);

// Helper to get style safely
export const getStickyStyle = (key: string): StickyStyle => {
  return STICKY_STYLES[key] || STICKY_STYLES['#FFC8C8'];
};

export const getRandomColor = () => {
  return STYLE_KEYS[Math.floor(Math.random() * STYLE_KEYS.length)];
};

export const getRandomRotation = () => {
  return Math.random() * 6 - 3;
};