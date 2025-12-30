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
  zIndex: 50,
  animation: 'fadeIn 150ms ease-in-out'
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
  maxWidth: '32rem',
  maxHeight: '90vh',
  overflow: 'auto',
  zIndex: 51,
  animation: 'slideIn 200ms ease-in-out',
  border: `1px solid ${themeVars.colors.border}`,
  padding: 0,
  display: 'flex',
  flexDirection: 'column'
})

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs,
  padding: themeVars.spacing.md,
  borderBottom: `1px solid ${themeVars.colors.border}`,
  position: 'relative'
})

export const title = style({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: themeVars.colors.foreground,
  margin: 0
})

export const description = style({
  fontSize: '0.875rem',
  color: themeVars.colors.mutedForeground,
  margin: 0
})

export const closeButton = style({
  position: 'absolute',
  top: themeVars.spacing.md,
  right: themeVars.spacing.md,
  padding: '0.25rem',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: themeVars.colors.foreground,
  borderRadius: '0.5rem',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: themeVars.colors.muted
  }
})

export const body = style({
  padding: themeVars.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.md,
  flex: 1,
  overflowY: 'auto'
})

export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: themeVars.spacing.md,
  padding: themeVars.spacing.xl,
  color: themeVars.colors.mutedForeground
})

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: themeVars.spacing.sm,
  padding: themeVars.spacing.md,
  borderTop: `1px solid ${themeVars.colors.border}`,
  backgroundColor: 'rgba(var(--muted-rgb), 0.3)'
})

export const fieldLabel = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: themeVars.spacing.xs
})

export const charCount = style({
  fontSize: '0.75rem',
  color: themeVars.colors.mutedForeground
})

export const optionalLabel = style({
  fontSize: '0.75rem',
  color: themeVars.colors.mutedForeground,
  fontWeight: 'normal'
})

export const uploadModeToggle = style({
  display: 'flex',
  gap: '0.5rem',
  marginBottom: themeVars.spacing.md,
  padding: '0.25rem',
  backgroundColor: themeVars.colors.muted,
  borderRadius: '0.5rem'
})

export const uploadModeButton = style({
  flex: 1,
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: 'transparent',
  color: themeVars.colors.mutedForeground
})

export const uploadModeButtonActive = style({
  flex: 1,
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: themeVars.colors.background,
  color: themeVars.colors.foreground,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
})

export const uploadArea = style({
  border: `2px dashed ${themeVars.colors.border}`,
  borderRadius: themeVars.radius.lg,
  aspectRatio: '1 / 1',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  overflow: 'hidden',
  position: 'relative',
  ':hover': {
    backgroundColor: 'rgba(var(--muted-rgb), 0.5)'
  }
})

export const uploadPlaceholder = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: themeVars.spacing.sm,
  padding: themeVars.spacing.lg,
  color: themeVars.colors.mutedForeground
})

export const uploadHint = style({
  fontSize: '0.875rem',
  marginTop: '0.25rem'
})

export const previewImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: themeVars.radius.lg
})

export const urlInputContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.md
})

export const imagePreview = style({
  width: '100%',
  aspectRatio: '1',
  borderRadius: themeVars.radius.lg,
  overflow: 'hidden',
  border: `1px solid ${themeVars.colors.border}`
})

export const urlInputWrapper = style({
  display: 'flex',
  gap: '0.5rem'
})

export const errorText = style({
  fontSize: '0.75rem',
  color: themeVars.colors.destructive,
  marginTop: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem'
})

export const errorBanner = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: themeVars.spacing.sm,
  backgroundColor: 'rgba(var(--destructive-rgb), 0.1)',
  border: `1px solid ${themeVars.colors.destructive}`,
  borderRadius: themeVars.radius.md,
  color: themeVars.colors.destructive,
  fontSize: '0.875rem'
})

export const warningBanner = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: themeVars.spacing.sm,
  backgroundColor: 'rgba(251, 191, 36, 0.1)',
  border: '1px solid rgb(251, 191, 36)',
  borderRadius: themeVars.radius.md,
  color: 'rgb(251, 191, 36)',
  fontSize: '0.875rem'
})

export const spinner = style({
  animation: `${spin} 1s linear infinite`
})
