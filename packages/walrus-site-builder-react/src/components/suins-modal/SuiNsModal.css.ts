import { style } from '@vanilla-extract/css'
import { themeVars } from '~/theme.css'

export const overlay = style({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  inset: 0,
  zIndex: 50
})

export const content = style({
  backgroundColor: themeVars.colors.background,
  borderRadius: themeVars.radius.lg,
  boxShadow:
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '56rem',
  maxHeight: '85vh',
  overflow: 'auto',
  zIndex: 51,
  border: `1px solid ${themeVars.colors.border}`
})

export const header = style({
  padding: themeVars.spacing.md,
  paddingBottom: 0
})

export const title = style({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: themeVars.colors.foreground,
  marginBottom: themeVars.spacing.xs
})

export const description = style({
  fontSize: '0.875rem',
  color: themeVars.colors.mutedForeground
})

export const body = style({
  padding: themeVars.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs
})

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs
})

export const sectionTitle = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
})

export const domainList = style({
  border: `1px solid ${themeVars.colors.border}`,
  borderRadius: themeVars.radius.md,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
})

export const domainItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${themeVars.spacing.sm} ${themeVars.spacing.md}`,
  borderBottom: `1px solid ${themeVars.colors.border}`,
  ':last-child': {
    borderBottom: 'none'
  }
})

export const domainCardGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: themeVars.spacing.lg,
  maxHeight: '25rem',
  overflowY: 'auto',
  padding: themeVars.spacing.xs
})

export const domainCard = style({
  width: '9rem',
  height: '9rem',
  position: 'relative',
  padding: themeVars.spacing.md,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  background: 'none',
  selectors: {
    '&:hover:not(:disabled)': {
      transform: 'scale(0.98)',
      borderColor: themeVars.colors.primary
    },
    '&:active:not(:disabled)': {
      transform: 'scale(0.95)'
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
      filter: 'grayscale(1)'
    }
  }
})

export const domainCardBg = style({
  position: 'absolute',
  inset: 0,
  zIndex: -1,
  pointerEvents: 'none'
})

export const domainName = style({
  fontSize: '1.25rem',
  fontWeight: 700,
  background: 'linear-gradient(90deg, #4bffa6 0%, #ff794b 56%, #d962ff 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  wordBreak: 'break-all',
  lineHeight: 1.2
})

export const domainExpiry = style({
  fontSize: '0.75rem',
  color: '#DAD0FF'
})

export const infoPanel = style({
  display: 'flex',
  gap: themeVars.spacing.md,
  padding: themeVars.spacing.lg,
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: themeVars.radius.lg
})

export const link = style({
  color: themeVars.colors.cyan,
  textDecoration: 'none',
  wordBreak: 'break-all',
  ':hover': {
    textDecoration: 'underline'
  }
})

export const loadingSpinner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${themeVars.spacing.xl} 0`,
  color: themeVars.colors.mutedForeground
})
