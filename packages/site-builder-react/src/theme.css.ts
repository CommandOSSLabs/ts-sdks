import { createGlobalTheme, createThemeContract } from '@vanilla-extract/css'

// Define the theme contract (structure shared between light and dark)
export const themeVars = createThemeContract({
  colors: {
    background: '',
    foreground: '',
    muted: '',
    mutedForeground: '',
    border: '',
    primary: '',
    primaryForeground: '',
    destructive: '',
    destructiveForeground: '',
    accent: '',
    accentForeground: '',
    blue: '',
    cyan: ''
  },
  radius: {
    sm: '',
    md: '',
    lg: ''
  },
  spacing: {
    xs: '',
    sm: '',
    md: '',
    lg: '',
    xl: ''
  }
})

// Light theme
createGlobalTheme(':root,.light', themeVars, {
  colors: {
    background: '#ffffff',
    foreground: '#09090b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
    primary: '#18181b',
    primaryForeground: '#fafafa',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    accent: '#f4f4f5',
    accentForeground: '#18181b',
    blue: '#2563eb',
    cyan: '#06b6d4'
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
})

// Dark theme
createGlobalTheme('.dark', themeVars, {
  colors: {
    background: '#09090b',
    foreground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    border: '#27272a',
    primary: '#fafafa',
    primaryForeground: '#18181b',
    destructive: '#dc2626',
    destructiveForeground: '#fafafa',
    accent: '#27272a',
    accentForeground: '#fafafa',
    blue: '#3b82f6',
    cyan: '#22d3ee'
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
})
