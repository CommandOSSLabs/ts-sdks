import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { themeVars } from '~/theme.css'

export const banner = recipe({
  base: {
    position: 'relative',
    isolation: 'isolate',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: themeVars.spacing.xs,
    overflow: 'hidden',
    borderRadius: themeVars.radius.lg,
    marginTop: themeVars.spacing.sm,
    borderWidth: '1px',
    borderStyle: 'solid',
    paddingTop: themeVars.spacing.xs,
    paddingBottom: themeVars.spacing.xs,
    paddingLeft: themeVars.spacing.sm,
    paddingRight: '3rem',
    '@media': {
      'screen and (min-width: 640px)': {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: themeVars.spacing.sm,
        paddingBottom: themeVars.spacing.sm
      }
    }
  },
  variants: {
    variant: {
      info: {
        background:
          'linear-gradient(to right, oklch(0.951 0.026 236.824 / 0.8), oklch(0.882 0.059 254.128 / 0.8))',
        borderColor: 'oklch(0.546 0.245 262.881 / 0.15)',
        selectors: {
          '.dark &': {
            background:
              'linear-gradient(to right, oklch(0.282 0.091 267.935 / 0.6), oklch(0.379 0.146 265.522 / 0.6))',
            borderColor: 'oklch(0.746 0.16 232.661 / 0.2)'
          }
        }
      },
      success: {
        background:
          'linear-gradient(to right, oklch(0.95 0.052 163.051 / 0.8), oklch(0.925 0.084 155.995 / 0.8))',
        borderColor: 'oklch(0.627 0.194 149.214 / 0.15)',
        selectors: {
          '.dark &': {
            background:
              'linear-gradient(to right, oklch(0.262 0.051 172.552 / 0.6), oklch(0.393 0.095 152.535 / 0.6))',
            borderColor: 'oklch(0.792 0.209 151.711 / 0.2)'
          }
        }
      },
      warning: {
        background:
          'linear-gradient(to right, oklch(0.962 0.059 95.617 / 0.8), oklch(0.973 0.071 103.193 / 0.8))',
        borderColor: 'oklch(0.666 0.179 58.318 / 0.15)',
        selectors: {
          '.dark &': {
            background:
              'linear-gradient(to right, oklch(0.279 0.077 45.635 / 0.6), oklch(0.421 0.095 57.708 / 0.6))',
            borderColor: 'oklch(0.828 0.189 84.429 / 0.2)'
          }
        }
      },
      alert: {
        background:
          'linear-gradient(to right, oklch(0.954 0.038 75.164 / 0.8), oklch(0.954 0.038 75.164 / 0.8))',
        borderColor: 'oklch(0.646 0.222 41.116 / 0.15)',
        selectors: {
          '.dark &': {
            background:
              'linear-gradient(to right, oklch(0.266 0.079 36.259 / 0.6), oklch(0.408 0.123 38.172 / 0.6))',
            borderColor: 'oklch(0.75 0.183 55.934 / 0.2)'
          }
        }
      },
      error: {
        background:
          'linear-gradient(to right, oklch(0.936 0.032 17.717 / 0.8), oklch(0.892 0.058 10.001 / 0.8))',
        borderColor: 'oklch(0.577 0.245 27.325 / 0.15)',
        selectors: {
          '.dark &': {
            background:
              'linear-gradient(to right, oklch(0.258 0.092 26.042 / 0.6), oklch(0.41 0.159 10.272 / 0.6))',
            borderColor: 'oklch(0.704 0.191 22.216 / 0.2)'
          }
        }
      }
    }
  },
  defaultVariants: {
    variant: 'info'
  }
})

export const gridPattern = style({
  pointerEvents: 'none',
  position: 'absolute',
  inset: 0,
  color: 'oklch(0 0 0 / 0.3)',
  mixBlendMode: 'overlay',
  maskImage: 'linear-gradient(to right, oklch(0 0 0), transparent)',
  '@media': {
    'screen and (min-width: 768px)': {
      maskImage: 'linear-gradient(to right, oklch(0 0 0) 60%, transparent)'
    }
  },
  selectors: {
    '.dark &': {
      color: 'oklch(1 0 0 / 0.2)'
    }
  }
})

export const content = style({
  display: 'flex',
  alignItems: 'center',
  gap: themeVars.spacing.sm,
  position: 'relative',
  zIndex: 10
})

export const iconContainer = recipe({
  base: {
    display: 'none',
    borderRadius: '9999px',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: themeVars.spacing.xs,
    boxShadow: 'inset 0 0 1px 1px oklch(1 0 0)',
    '@media': {
      'screen and (min-width: 640px)': {
        display: 'block'
      }
    },
    selectors: {
      '.dark &': {
        boxShadow: 'inset 0 0 1px 1px oklch(1 0 0 / 0.1)'
      }
    }
  },
  variants: {
    variant: {
      info: {
        backgroundColor: 'oklch(1 0 0 / 0.5)',
        borderColor: 'oklch(0.546 0.245 262.881 / 0.5)',
        selectors: {
          '.dark &': {
            backgroundColor: 'oklch(0.282 0.091 267.935 / 0.4)',
            borderColor: 'oklch(0.746 0.16 232.661 / 0.4)'
          }
        }
      },
      success: {
        backgroundColor: 'oklch(1 0 0 / 0.5)',
        borderColor: 'oklch(0.627 0.194 149.214 / 0.5)',
        selectors: {
          '.dark &': {
            backgroundColor: 'oklch(0.262 0.051 172.552 / 0.4)',
            borderColor: 'oklch(0.792 0.209 151.711 / 0.4)'
          }
        }
      },
      warning: {
        backgroundColor: 'oklch(1 0 0 / 0.5)',
        borderColor: 'oklch(0.666 0.179 58.318 / 0.5)',
        selectors: {
          '.dark &': {
            backgroundColor: 'oklch(0.279 0.077 45.635 / 0.4)',
            borderColor: 'oklch(0.828 0.189 84.429 / 0.4)'
          }
        }
      },
      alert: {
        backgroundColor: 'oklch(1 0 0 / 0.5)',
        borderColor: 'oklch(0.646 0.222 41.116 / 0.5)',
        selectors: {
          '.dark &': {
            backgroundColor: 'oklch(0.266 0.079 36.259 / 0.4)',
            borderColor: 'oklch(0.75 0.183 55.934 / 0.4)'
          }
        }
      },
      error: {
        backgroundColor: 'oklch(1 0 0 / 0.5)',
        borderColor: 'oklch(0.577 0.245 27.325 / 0.5)',
        selectors: {
          '.dark &': {
            backgroundColor: 'oklch(0.258 0.092 26.042 / 0.4)',
            borderColor: 'oklch(0.704 0.191 22.216 / 0.4)'
          }
        }
      }
    }
  }
})

export const icon = recipe({
  base: {},
  variants: {
    variant: {
      info: {
        color: 'oklch(0.424 0.199 265.638)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.809 0.105 251.813)'
          }
        }
      },
      success: {
        color: 'oklch(0.448 0.119 151.328)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.845 0.143 164.978)'
          }
        }
      },
      warning: {
        color: 'oklch(0.473 0.137 46.201)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.879 0.169 91.605)'
          }
        }
      },
      alert: {
        color: 'oklch(0.47 0.157 37.304)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.837 0.128 66.29)'
          }
        }
      },
      error: {
        color: 'oklch(0.444 0.177 26.899)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.808 0.114 19.571)'
          }
        }
      }
    }
  }
})

export const textContainer = style({
  display: 'flex',
  flexDirection: 'column'
})

export const title = recipe({
  base: {
    fontSize: '0.875rem',
    fontWeight: 600
  },
  variants: {
    variant: {
      info: {
        color: 'oklch(0.379 0.146 265.522)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.932 0.032 255.585)'
          }
        }
      },
      success: {
        color: 'oklch(0.393 0.095 152.535)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.962 0.044 156.743)'
          }
        }
      },
      warning: {
        color: 'oklch(0.414 0.112 45.904)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.962 0.059 95.617)'
          }
        }
      },
      alert: {
        color: 'oklch(0.408 0.123 38.172)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.954 0.038 75.164)'
          }
        }
      },
      error: {
        color: 'oklch(0.396 0.141 25.723)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.936 0.032 17.717)'
          }
        }
      }
    }
  }
})

export const description = recipe({
  base: {
    fontSize: '0.75rem'
  },
  variants: {
    variant: {
      info: {
        color: 'oklch(0.424 0.199 265.638 / 0.8)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.882 0.059 254.128 / 0.7)'
          }
        }
      },
      success: {
        color: 'oklch(0.448 0.119 151.328 / 0.8)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.905 0.093 164.15 / 0.7)'
          }
        }
      },
      warning: {
        color: 'oklch(0.473 0.137 46.201 / 0.8)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.924 0.12 95.746 / 0.7)'
          }
        }
      },
      alert: {
        color: 'oklch(0.47 0.157 37.304 / 0.8)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.901 0.076 70.697 / 0.7)'
          }
        }
      },
      error: {
        color: 'oklch(0.444 0.177 26.899 / 0.8)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.885 0.062 18.334 / 0.7)'
          }
        }
      }
    }
  }
})

export const closeButton = recipe({
  base: {
    position: 'absolute',
    right: themeVars.spacing.sm,
    top: '50%',
    transform: 'translateY(-50%)',
    transition: 'colors 0.2s ease-in-out',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: 0,
    '@media': {
      'screen and (min-width: 640px)': {
        position: 'relative',
        right: 0,
        transform: 'none'
      }
    }
  },
  variants: {
    variant: {
      info: {
        color: 'oklch(0.546 0.245 262.881 / 0.5)',
        ':hover': {
          color: 'oklch(0.546 0.245 262.881)'
        },
        selectors: {
          '.dark &': {
            color: 'oklch(0.746 0.16 232.661 / 0.5)'
          },
          '.dark &:hover': {
            color: 'oklch(0.809 0.105 251.813)'
          }
        }
      },
      success: {
        color: 'oklch(0.627 0.194 149.214 / 0.5)',
        ':hover': {
          color: 'oklch(0.627 0.194 149.214)'
        },
        selectors: {
          '.dark &': {
            color: 'oklch(0.792 0.209 151.711 / 0.5)'
          },
          '.dark &:hover': {
            color: 'oklch(0.845 0.143 164.978)'
          }
        }
      },
      warning: {
        color: 'oklch(0.666 0.179 58.318 / 0.5)',
        ':hover': {
          color: 'oklch(0.666 0.179 58.318)'
        },
        selectors: {
          '.dark &': {
            color: 'oklch(0.828 0.189 84.429 / 0.5)'
          },
          '.dark &:hover': {
            color: 'oklch(0.879 0.169 91.605)'
          }
        }
      },
      alert: {
        color: 'oklch(0.646 0.222 41.116 / 0.5)',
        ':hover': {
          color: 'oklch(0.646 0.222 41.116)'
        },
        selectors: {
          '.dark &': {
            color: 'oklch(0.75 0.183 55.934 / 0.5)'
          },
          '.dark &:hover': {
            color: 'oklch(0.837 0.128 66.29)'
          }
        }
      },
      error: {
        color: 'oklch(0.577 0.245 27.325 / 0.5)',
        ':hover': {
          color: 'oklch(0.577 0.245 27.325)'
        },
        selectors: {
          '.dark &': {
            color: 'oklch(0.704 0.191 22.216 / 0.5)'
          },
          '.dark &:hover': {
            color: 'oklch(0.808 0.114 19.571)'
          }
        }
      }
    }
  }
})

export const closeIcon = style({
  width: '1.25rem',
  height: '1.25rem'
})

export const link = recipe({
  base: {
    fontWeight: 600,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    transition: 'opacity 0.2s ease-in-out',
    ':hover': {
      opacity: 0.8
    }
  },
  variants: {
    variant: {
      info: {
        color: 'oklch(0.424 0.199 265.638)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.809 0.105 251.813)'
          }
        }
      },
      success: {
        color: 'oklch(0.448 0.119 151.328)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.845 0.143 164.978)'
          }
        }
      },
      warning: {
        color: 'oklch(0.473 0.137 46.201)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.879 0.169 91.605)'
          }
        }
      },
      alert: {
        color: 'oklch(0.47 0.157 37.304)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.837 0.128 66.29)'
          }
        }
      },
      error: {
        color: 'oklch(0.444 0.177 26.899)',
        selectors: {
          '.dark &': {
            color: 'oklch(0.808 0.114 19.571)'
          }
        }
      }
    }
  }
})
