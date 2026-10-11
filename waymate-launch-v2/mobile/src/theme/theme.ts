export const colors = {
  // Primary brand (Vibrant Green based on reference image)
  primary: '#10A356', // A vibrant, trusted green
  primaryDark: '#0B8243',
  primarySoft: '#E6F8EF',
  primaryPale: '#F2FCF7',
  
  // Secondary (Dark Navy/Slate for headings)
  navy: '#1A2B3C',
  navy2: '#0F1A24',
  
  // Backgrounds & Surfaces
  bg: '#F8F9FA', // Very light gray background
  white: '#FFFFFF',
  
  // Text
  text: '#1C1C1C',
  muted: '#6C757D',
  mutedLight: '#A0AAB2',
  
  // States & Borders
  border: '#E8EAED',
  success: '#10A356',
  successSoft: '#E6F8EF',
  red: '#E12D39',
  redSoft: '#FCEAEA',
  amber: '#F5A623',
  amberSoft: '#FEF6E9',
  
  // Keep legacy names mapped to new green so we don't break existing components
  green: '#10A356',
  greenDark: '#0B8243',
  greenSoft: '#E6F8EF',
  greenPale: '#F2FCF7',
  blue: '#10A356',
  blueSoft: '#E6F8EF',
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
