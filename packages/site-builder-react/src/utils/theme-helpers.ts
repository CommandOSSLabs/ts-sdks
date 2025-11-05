import type { ThemeOverride, ThemeVars } from '~/themes/themeContract'
import { themeVars } from '~/themes/themeContract'

/**
 * Deep merge theme overrides into base theme
 */
function mergeTheme(base: ThemeVars, override?: Partial<ThemeVars>): ThemeVars {
  if (!override) return base

  return {
    colors: { ...base.colors, ...override.colors },
    radius: { ...base.radius, ...override.radius },
    spacing: { ...base.spacing, ...override.spacing }
  }
}

/**
 * Convert ThemeVars to CSS variables object
 */
function themeToCssVars(theme: ThemeVars): Record<string, string> {
  const cssVars: Record<string, string> = {}

  // Colors
  for (const [key, value] of Object.entries(theme.colors)) {
    cssVars[themeVars.colors[key as keyof typeof theme.colors]] = value
  }

  // Radius
  for (const [key, value] of Object.entries(theme.radius)) {
    cssVars[themeVars.radius[key as keyof typeof theme.radius]] = value
  }

  // Spacing
  for (const [key, value] of Object.entries(theme.spacing)) {
    cssVars[themeVars.spacing[key as keyof typeof theme.spacing]] = value
  }

  return cssVars
}

/**
 * Generate inline styles for theme overrides
 */
export function generateThemeStyles(
  baseLight: ThemeVars,
  baseDark: ThemeVars,
  overrides?: ThemeOverride
): { light: Record<string, string>; dark: Record<string, string> } {
  const lightTheme = mergeTheme(baseLight, overrides?.light)
  const darkTheme = mergeTheme(baseDark, overrides?.dark)

  return {
    light: themeToCssVars(lightTheme),
    dark: themeToCssVars(darkTheme)
  }
}
