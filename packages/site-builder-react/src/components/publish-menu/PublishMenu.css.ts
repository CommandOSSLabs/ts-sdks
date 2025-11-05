import { style } from '@vanilla-extract/css'
import { themeVars } from '~/theme.css'

export const content = style({
  minWidth: '20rem',
  maxWidth: '24rem',
  backgroundColor: themeVars.colors.background,
  borderRadius: themeVars.radius.lg,
  padding: themeVars.spacing.sm,
  boxShadow:
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${themeVars.colors.border}`,
  zIndex: 50
})

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeVars.spacing.sm,
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.md}`,
  fontSize: '0.875rem',
  borderRadius: themeVars.radius.sm,
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  transition: 'all 0.15s ease-in-out',
  color: themeVars.colors.foreground,
  ':hover': {
    backgroundColor: themeVars.colors.accent,
    color: themeVars.colors.accentForeground
  },
  ':focus': {
    backgroundColor: themeVars.colors.accent,
    color: themeVars.colors.accentForeground
  },
  selectors: {
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none'
    }
  }
})

export const header = style({
  padding: `${themeVars.spacing.md} ${themeVars.spacing.md} ${themeVars.spacing.md}`
})

export const title = style({
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: themeVars.spacing.xs,
  color: themeVars.colors.foreground
})

export const description = style({
  fontSize: '0.75rem',
  lineHeight: 1.5,
  color: themeVars.colors.mutedForeground
})

export const link = style({
  color: themeVars.colors.cyan,
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' }
})

export const footer = style({
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.sm}`
})

export const buttonGroup = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: themeVars.spacing.sm
})

export const separator = style({
  height: '1px',
  backgroundColor: themeVars.colors.border,
  margin: `${themeVars.spacing.xs} 0`
})
