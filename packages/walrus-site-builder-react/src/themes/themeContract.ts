import { createGlobalThemeContract } from '@vanilla-extract/css'

const themeContractValues = {
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
}

export type ThemeVars = typeof themeContractValues

/**
 * Partial theme overrides for light or dark mode
 */
export type ThemeOverride = {
  light?: Partial<ThemeVars>
  dark?: Partial<ThemeVars>
}

export const themeVars = createGlobalThemeContract(
  themeContractValues,
  (_, path) => `site-builder-react-${path.join('-')}`
)
