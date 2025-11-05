import { style } from '@vanilla-extract/css'
import { themeVars } from '~/theme.css'

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
  maxWidth: '56rem',
  maxHeight: '85vh',
  overflow: 'auto',
  zIndex: 51,
  animation: 'slideIn 200ms ease-in-out',
  border: `1px solid ${themeVars.colors.border}`,
  padding: themeVars.spacing.md
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
  paddingTop: themeVars.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.sm
})

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs,
  marginTop: themeVars.spacing.md
})

export const twoColumnSection = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1.5fr',
  gap: themeVars.spacing.lg,
  marginTop: themeVars.spacing.md,
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: themeVars.spacing.md
    }
  }
})

export const leftColumn = style({
  display: 'flex',
  flexDirection: 'column'
})

export const rightColumn = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start'
})

export const metadataFields = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.sm
})

export const fieldDisplay = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs
})

export const fieldValue = style({
  fontSize: '0.875rem',
  color: themeVars.colors.foreground,
  padding: themeVars.spacing.sm,
  backgroundColor: 'rgba(var(--muted-rgb), 0.3)',
  borderRadius: themeVars.radius.md,
  border: `1px solid ${themeVars.colors.border}`,
  minHeight: '2.5rem',
  display: 'flex',
  alignItems: 'center',
  wordBreak: 'break-word'
})

export const sectionTitle = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  paddingTop: themeVars.spacing.md,
  paddingBottom: themeVars.spacing.sm
})

export const buttonGroup = style({
  display: 'flex',
  gap: themeVars.spacing.sm,
  paddingTop: themeVars.spacing.sm
})

export const warningText = style({
  fontSize: '0.75rem',
  borderRadius: themeVars.radius.md,
  backgroundColor: themeVars.colors.muted,
  color: themeVars.colors.accentForeground,
  padding: themeVars.spacing.sm,
  marginTop: themeVars.spacing.sm
})

export const previewContainer = style({
  position: 'relative'
})

export const previewArea = style({
  border: `2px solid ${themeVars.colors.border}`,
  borderRadius: themeVars.radius.lg,
  backgroundColor: 'rgba(var(--muted-rgb), 0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  aspectRatio: '1 / 1',
  width: '100%',
  position: 'relative',
  overflow: 'hidden'
})

export const flickeringGrid = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0
})

export const maskLayer = style({
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  background: `radial-gradient(ellipse 40% 80% at center,  ${themeVars.colors.background}  50%, transparent 100%)`,
  opacity: 0.8,
  pointerEvents: 'none'
})

export const placeholderContent = style({
  position: 'absolute',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: themeVars.spacing.sm
})

export const previewImageWrapper = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

export const previewImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: themeVars.radius.lg
})

export const placeholderIcon = style({
  width: '64px',
  height: '64px',
  borderRadius: themeVars.radius.lg,
  border: `2px dashed ${themeVars.colors.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
  marginBottom: themeVars.spacing.sm,
  color: themeVars.colors.mutedForeground
})

export const editButton = style({
  position: 'absolute',
  top: themeVars.spacing.sm,
  right: themeVars.spacing.sm,
  padding: themeVars.spacing.sm,
  backgroundColor: themeVars.colors.background,
  border: `1px solid ${themeVars.colors.border}`,
  borderRadius: themeVars.radius.lg,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: themeVars.colors.muted
  }
})

export const metadataText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs
})

export const dialogOverlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 60
})

export const dialogContent = style({
  position: 'fixed',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  maxWidth: '42rem',
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: themeVars.colors.background,
  border: `1px solid ${themeVars.colors.border}`,
  borderRadius: themeVars.radius.lg,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  zIndex: 70
})

export const dialogHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: themeVars.spacing.md,
  borderBottom: `1px solid ${themeVars.colors.border}`,
  position: 'sticky',
  top: 0,
  backgroundColor: themeVars.colors.background,
  zIndex: 10
})

export const dialogBody = style({
  padding: themeVars.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.md
})

export const dialogBodyTwoColumn = style({
  padding: themeVars.spacing.md,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: themeVars.spacing.lg,
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: themeVars.spacing.md
    }
  }
})

export const dialogRightColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.md
})

export const dialogFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: themeVars.spacing.md,
  borderTop: `1px solid ${themeVars.colors.border}`,
  backgroundColor: 'rgba(var(--muted-rgb), 0.3)',
  position: 'sticky',
  bottom: 0
})

export const uploadArea = style({
  border: `2px dashed ${themeVars.colors.border}`,
  borderRadius: themeVars.radius.lg,
  padding: themeVars.spacing.lg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: 'rgba(var(--muted-rgb), 0.5)'
  }
})

export const uploadAreaSquare = style({
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
  padding: themeVars.spacing.lg
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

export const collapsibleTrigger = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: themeVars.spacing.sm,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: themeVars.colors.foreground,
  backgroundColor: themeVars.colors.muted,
  border: `1px solid ${themeVars.colors.border}`,
  borderRadius: themeVars.radius.md,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: 'rgba(var(--muted-rgb), 0.8)'
  }
})

export const collapsibleIcon = style({
  transition: 'transform 0.2s ease-in-out'
})

export const collapsibleIconExpanded = style({
  transform: 'rotate(180deg)'
})

export const collapsibleContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.xs,
  marginTop: themeVars.spacing.xs,
  overflow: 'hidden',
  transition: 'all 0.2s ease-in-out',
  padding: themeVars.spacing.sm
})

export const collapsibleContentHidden = style({
  maxHeight: 0,
  opacity: 0,
  marginTop: 0
})

export const collapsibleContentVisible = style({
  maxHeight: '500px',
  opacity: 1
})

export const storageCostSection = style({
  padding: themeVars.spacing.sm,
  backgroundColor: themeVars.colors.muted,
  borderRadius: themeVars.radius.md
})

export const storageCostSummary = style({
  display: 'flex',
  flexDirection: 'column'
})

export const storageCostLabel = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.875rem',
  color: themeVars.colors.foreground
})

export const storageCostValue = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.875rem'
})

export const storageDetailsGrid = style({
  display: 'flex',
  flexDirection: 'column',
  gap: themeVars.spacing.sm,
  marginTop: themeVars.spacing.sm
})

export const storageDetailsBox = style({
  padding: themeVars.spacing.xs,
  backgroundColor: themeVars.colors.muted,
  borderRadius: themeVars.radius.md
})
