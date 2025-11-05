import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Link2,
  XCircle
} from 'lucide-react'
import type { FC, ReactNode } from 'react'
import {
  banner,
  closeButton,
  closeIcon,
  content,
  description,
  gridPattern,
  icon,
  iconContainer,
  link,
  textContainer,
  title
} from './Banner.css'

type BannerVariant = 'info' | 'success' | 'warning' | 'alert' | 'error'

export interface BannerProps {
  title: string
  description?: string
  icon?: ReactNode
  showIcon?: boolean
  className?: string
  variant?: BannerVariant
  onClose?: () => void
  url?: string
  urlName?: string
}

const defaultIcons: Record<BannerVariant, ReactNode> = {
  info: <Link2 style={{ width: '1rem', height: '1rem' }} strokeWidth={1.5} />,
  success: (
    <CheckCircle style={{ width: '1rem', height: '1rem' }} strokeWidth={1.5} />
  ),
  warning: (
    <AlertTriangle
      style={{ width: '1rem', height: '1rem' }}
      strokeWidth={1.5}
    />
  ),
  alert: (
    <AlertCircle style={{ width: '1rem', height: '1rem' }} strokeWidth={1.5} />
  ),
  error: <XCircle style={{ width: '1rem', height: '1rem' }} strokeWidth={1.5} />
}

export const Banner: FC<BannerProps> = ({
  title: titleText,
  description: descriptionText,
  icon: customIcon,
  showIcon = true,
  className = '',
  variant = 'info',
  onClose,
  url,
  urlName
}) => {
  return (
    <div className={`${banner({ variant })} ${className}`}>
      {/* Grid pattern overlay */}
      <svg
        className={gridPattern}
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={`grid-pattern-${variant}`}
            x="-1"
            y="-2"
            width="13"
            height="13"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 13 0 L 0 0 0 13"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="1"
            >
              <title>Grid pattern</title>
            </path>
          </pattern>
        </defs>
        <rect
          fill={`url(#grid-pattern-${variant})`}
          width="100%"
          height="100%"
        />
      </svg>

      {/* Content */}
      <div className={content}>
        {showIcon && (
          <div className={iconContainer({ variant })}>
            <div className={icon({ variant })}>
              {customIcon || defaultIcons[variant]}
            </div>
          </div>
        )}
        <div className={textContainer}>
          <h3 className={title({ variant })}>{titleText}</h3>
          {descriptionText && (
            <p className={description({ variant })}>
              {descriptionText}
              {url && urlName && (
                <>
                  {' '}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link({ variant })}
                  >
                    {urlName}
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={closeButton({ variant })}
          aria-label="Close banner"
        >
          <svg
            className={closeIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            >
              <title>Close icon</title>
            </path>
          </svg>
        </button>
      )}
    </div>
  )
}
