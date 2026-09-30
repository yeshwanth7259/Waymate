export const colors = {
  // Primary brand (Vibrant Blue)
  primary: '#0F62FE',
  primaryDark: '#0043CE',
  primarySoft: '#EDF5FF',
  primaryPale: '#F4F8FF',
  
  // Secondary (Dark Navy for headings)
  navy: '#001D6C',
  navy2: '#001141',
  
  // Backgrounds & Surfaces
  bg: '#F8F9FB', // very light cool gray
  white: '#FFFFFF',
  
  // Text
  text: '#161616',
  muted: '#525252',
  mutedLight: '#8D8D8D',
  
  // States & Borders
  border: '#E0E0E0',
  success: '#198038',
  successSoft: '#DEFBE6',
  red: '#DA1E28',
  redSoft: '#FFF1F1',
  amber: '#F1C21B',
  amberSoft: '#FCF4D6',
  
  // Old legacy names kept for compatibility but mapped to blue
  green: '#0F62FE',
  greenDark: '#0043CE',
  greenSoft: '#EDF5FF',
  greenPale: '#F4F8FF',
  blue: '#0F62FE',
  blueSoft: '#EDF5FF',
};

export const spacing = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 };
export const radius = { sm: 12, md: 16, lg: 24, xl: 32, xxl: 999 }; // More rounded

export const shadows = {
  sm: {
    shadowColor: '#001D6C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#001D6C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  glow: {
    shadowColor: '#0F62FE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  }
};
