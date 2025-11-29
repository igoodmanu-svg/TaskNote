
export interface Task {
  id: string;
  text: string;
  color: string;
  createdAt: number;
  completedAt?: number;
  isCompleted: boolean;
  rotation: number;
}

// Morandi Color Palette (Sticky Notes)
export const COLORS = {
  PINK: "#FFC8C8",    // Lighter Pink
  BLUE: "#BDE0FE",    // Lighter Blue
  YELLOW: "#FDFD96",  // Lighter Yellow
  GREEN: "#C1E1C1",   // Lighter Green
  PURPLE: "#E2C6E8",  // Lighter Purple
};

export const COLOR_ARRAY = Object.values(COLORS);

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

export const getRandomColor = () => {
  return COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)];
};

export const getRandomRotation = () => {
  return Math.random() * 6 - 3;
};
