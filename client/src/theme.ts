// Design system theme for Feedback360
export const theme = {
  colors: {
    primaryDarkBlue: '#0A2342', // azul escuro
    black: '#000000',
    lightBrown: 'rgb(125, 105, 94)', // marrom claro
    background: '#0F172A',
    surface: '#111827',
    textPrimary: '#E5E7EB',
    textSecondary: '#9CA3AF',
    border: '#1F2937',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  },
  spacing: (factor: number) => `${factor * 8}px`,
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px'
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 4px 10px rgba(0,0,0,0.2)'
  }
} as const;

export type AppTheme = typeof theme;

