import { keyframes, style } from '@vanilla-extract/css'
import { themeVars } from '~/theme.css'

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
})

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
  maxWidth: '42rem',
  maxHeight: '90vh',
  overflow: 'auto',
  zIndex: 51,
  border: `1px solid ${themeVars.colors.border}`,
  padding: themeVars.spacing.md,
  display: 'flex',
  flexDirection: 'column'
})

export const loadingOverlay = style({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  borderRadius: themeVars.radius.lg
})

export const loadingContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: themeVars.spacing.md
})

export const spinner = style({
  width: '2rem',
  height: '2rem',
  animation: `${spin} 1s linear infinite`,
  color: 'white'
})

export const header = style({
  position: 'relative',
  marginBottom: themeVars.spacing.sm
})

export const title = style({
  fontSize: '1rem',
  fontWeight: 600,
  color: themeVars.colors.foreground,
  marginBottom: '0.25rem'
})

export const description = style({
  fontSize: '0.875rem',
  color: themeVars.colors.mutedForeground
})

export const closeButton = style({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: '0.25rem',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: themeVars.colors.foreground,
  borderRadius: themeVars.radius.md,
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: themeVars.colors.muted
  }
})

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.sm,
  flex: 1,
  overflow: 'auto'
})

export const formSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.sm
})

export const fieldGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem'
})

export const dateInputWrapper = style({
  position: 'relative'
})

export const dateIcon = style({
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: themeVars.colors.mutedForeground,
  pointerEvents: 'none'
})

export const inputError = style({
  borderColor: themeVars.colors.destructive
})

export const infoText = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.75rem',
  color: themeVars.colors.mutedForeground
})

export const errorText = style({
  fontSize: '0.75rem',
  color: themeVars.colors.destructive
})

export const summaryGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: themeVars.spacing.sm,
  marginTop: '0.5rem',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  }
})

export const summaryCard = style({
  borderRadius: themeVars.radius.md,
  border: `1px solid ${themeVars.colors.border}`,
  backgroundColor: `${themeVars.colors.muted}40`,
  padding: themeVars.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  transition: 'all 0.2s ease',
  ':hover': {
    borderColor: themeVars.colors.border,
    backgroundColor: `${themeVars.colors.muted}60`
  }
})

export const summaryHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.75rem',
  color: themeVars.colors.mutedForeground,
  marginBottom: '0.25rem'
})

export const summaryContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
})

export const summaryValue = style({
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: themeVars.colors.foreground
})

export const summarySubtext = style({
  fontSize: '0.75rem',
  color: themeVars.colors.mutedForeground
})

export const summaryError = style({
  fontSize: '0.75rem',
  color: themeVars.colors.destructive
})

export const summaryList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs
})

export const summaryRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.875rem',
  color: themeVars.colors.mutedForeground,
  paddingTop: themeVars.spacing.xs,
  borderTop: `1px solid ${themeVars.colors.border}50`,
  ':first-child': {
    borderTop: 'none',
    paddingTop: 0
  }
})

export const footer = style({
  display: 'flex',
  gap: themeVars.spacing.sm,
  justifyContent: 'flex-end',
  marginTop: themeVars.spacing.sm,
  paddingTop: themeVars.spacing.sm,
  borderTop: `1px solid ${themeVars.colors.border}`
})

export const costSection = style({
  borderRadius: themeVars.radius.md,
  border: `1px solid ${themeVars.colors.border}`,
  backgroundColor: `${themeVars.colors.muted}40`,
  padding: themeVars.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginTop: '0.5rem',
  transition: 'all 0.2s ease',
  ':hover': {
    borderColor: themeVars.colors.border,
    backgroundColor: `${themeVars.colors.muted}60`
  }
})

export const costHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: themeVars.colors.foreground,
  marginBottom: '0.25rem'
})

export const costContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem'
})

export const costRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.8125rem'
})

export const costLabel = style({
  color: themeVars.colors.mutedForeground
})

export const costValue = style({
  fontWeight: 500,
  color: themeVars.colors.foreground
})

export const costLoading = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.875rem',
  color: themeVars.colors.mutedForeground,
  padding: '0.5rem',
  justifyContent: 'center'
})

export const costError = style({
  fontSize: '0.875rem',
  color: themeVars.colors.destructive,
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  justifyContent: 'center',
  borderRadius: themeVars.radius.sm,
  backgroundColor: `${themeVars.colors.destructive}10`
})

export const costWarning = style({
  fontSize: '0.75rem',
  color: themeVars.colors.mutedForeground,
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.375rem',
  borderRadius: themeVars.radius.sm,
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  border: '1px solid rgba(245, 158, 11, 0.2)',
  marginTop: '0.25rem'
})

export const costDivider = style({
  height: '1px',
  backgroundColor: themeVars.colors.border,
  margin: '0.5rem 0'
})

export const costTotalRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '0.5rem',
  marginTop: '0.25rem',
  borderTop: `1px solid ${themeVars.colors.border}`
})

export const costTotalLabel = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: themeVars.colors.foreground
})

export const costTotalValue = style({
  fontSize: '0.9375rem',
  fontWeight: 700,
  color: themeVars.colors.foreground
})

export const estimatedBadge = style({
  fontSize: '0.625rem',
  fontWeight: 600,
  padding: '0.125rem 0.375rem',
  borderRadius: themeVars.radius.sm,
  backgroundColor: 'rgba(245, 158, 11, 0.2)',
  color: '#f59e0b',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  marginLeft: 'auto'
})
