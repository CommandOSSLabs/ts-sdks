import { style } from '@vanilla-extract/css'
import { themeVars } from '~/theme.css'

export const input = style({
  display: 'flex',
  width: '100%',
  borderRadius: themeVars.radius.md,
  border: `1px solid ${themeVars.colors.border}`,
  backgroundColor: themeVars.colors.background,
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.md}`,
  fontSize: '0.875rem',
  color: themeVars.colors.foreground,
  transition: 'all 0.2s ease-in-out',
  outline: 'none',
  ':focus': {
    borderColor: themeVars.colors.primary,
    boxShadow: `0 0 0 1px ${themeVars.colors.primary}`
  },
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.5
  },
  '::placeholder': {
    color: themeVars.colors.mutedForeground
  }
})

export const label = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: themeVars.colors.foreground,
  display: 'block',
  marginBottom: themeVars.spacing.xs
})

export const textarea = style({
  display: 'flex',
  width: '100%',
  borderRadius: themeVars.radius.md,
  border: `1px solid ${themeVars.colors.border}`,
  backgroundColor: themeVars.colors.background,
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.md}`,
  fontSize: '0.875rem',
  color: themeVars.colors.foreground,
  transition: 'all 0.2s ease-in-out',
  outline: 'none',
  minHeight: '5rem',
  resize: 'vertical',
  ':focus': {
    borderColor: themeVars.colors.primary,
    boxShadow: `0 0 0 1px ${themeVars.colors.primary}`
  },
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.5
  },
  '::placeholder': {
    color: themeVars.colors.mutedForeground
  }
})
