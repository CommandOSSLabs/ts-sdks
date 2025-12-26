import { keyframes, style } from '@vanilla-extract/css'
import { themeVars } from '~/theme.css'

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
})

export const stepperContainer = style({
  width: '100%',
  marginTop: '0.5rem'
})

export const stepperWrapper = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  position: 'relative',
  paddingTop: '0.5rem'
})

export const stepContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  flex: 1
})

export const stepIndicator = style({
  width: '1rem',
  height: '1rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
})

export const stepIndicatorCompleted = style({
  backgroundColor: '#15803d',
  color: 'white'
})

export const stepIndicatorActive = style({
  backgroundColor: '#3b82f6',
  color: 'white'
})

export const stepIndicatorPending = style({
  backgroundColor: themeVars.colors.muted,
  color: themeVars.colors.mutedForeground
})

export const stepLine = style({
  position: 'absolute',
  top: '0.5rem',
  left: '50%',
  width: '100%',
  height: '0.125rem',
  transform: 'translateY(-50%) translateX(0.5rem)',
  transition: 'background-color 0.2s'
})

export const stepLineCompleted = style({
  backgroundColor: '#3b82f6'
})

export const stepLinePending = style({
  backgroundColor: themeVars.colors.border
})

export const stepLabel = style({
  marginTop: '0.25rem',
  fontSize: '0.625rem',
  fontWeight: 500,
  textAlign: 'center',
  transition: 'color 0.2s'
})

export const stepLabelActive = style({
  color: themeVars.colors.foreground
})

export const stepLabelInactive = style({
  color: themeVars.colors.mutedForeground
})

export const stepDot = style({
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  backgroundColor: 'currentColor'
})

export const stepSpinner = style({
  width: '0.75rem',
  height: '0.75rem',
  border: '2px solid white',
  borderTop: '2px solid transparent',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`
})
