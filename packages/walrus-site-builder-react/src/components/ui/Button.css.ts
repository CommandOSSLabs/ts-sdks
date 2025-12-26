import { recipe } from '@vanilla-extract/recipes'
import { themeVars } from '~/theme.css'

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: themeVars.spacing.sm,
    borderRadius: themeVars.radius.md,
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    whiteSpace: 'nowrap',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none'
    },
    ':focus-visible': {
      outline: `2px solid ${themeVars.colors.primary}`,
      outlineOffset: '2px'
    }
  },
  variants: {
    variant: {
      default: {
        backgroundColor: themeVars.colors.primary,
        color: themeVars.colors.primaryForeground,
        ':hover': {
          opacity: 0.9
        }
      },
      outline: {
        backgroundColor: 'transparent',
        border: `1px solid ${themeVars.colors.border}`,
        color: themeVars.colors.foreground,
        ':hover': {
          backgroundColor: themeVars.colors.accent,
          color: themeVars.colors.accentForeground
        }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: themeVars.colors.foreground,
        ':hover': {
          backgroundColor: themeVars.colors.accent,
          color: themeVars.colors.accentForeground
        }
      },
      destructive: {
        backgroundColor: themeVars.colors.destructive,
        color: themeVars.colors.destructiveForeground,
        ':hover': {
          opacity: 0.9
        }
      },
      gradient: {
        background: `linear-gradient(to right, ${themeVars.colors.blue}, ${themeVars.colors.cyan})`,
        color: '#ffffff',
        ':hover': {
          opacity: 0.9
        }
      }
    },
    size: {
      default: {
        height: '2.5rem',
        padding: `0 ${themeVars.spacing.md}`
      },
      sm: {
        height: '2rem',
        padding: `0 ${themeVars.spacing.sm}`,
        fontSize: '0.75rem'
      },
      lg: {
        height: '3rem',
        padding: `0 ${themeVars.spacing.lg}`,
        fontSize: '1rem'
      },
      icon: {
        height: '2.5rem',
        width: '2.5rem',
        padding: 0
      }
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
})
