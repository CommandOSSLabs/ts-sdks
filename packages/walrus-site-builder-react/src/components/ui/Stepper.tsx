import type { FC } from 'react'
import * as styles from './Stepper.css'

interface StepProps {
  title: string
  description?: string
  isCompleted?: boolean
  isActive?: boolean
  isLast?: boolean
  isLoading?: boolean
}

const Step: FC<StepProps> = ({
  title,
  isLoading,
  isCompleted,
  isActive,
  isLast
}) => {
  return (
    <div className={styles.stepContainer}>
      {/* Step indicator */}
      <div
        className={`${styles.stepIndicator} ${
          isCompleted
            ? styles.stepIndicatorCompleted
            : isActive
              ? styles.stepIndicatorActive
              : styles.stepIndicatorPending
        }`}
      >
        {isCompleted ? (
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Check</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : isLoading ? (
          <div className={styles.stepSpinner} />
        ) : (
          <div className={styles.stepDot} />
        )}
      </div>

      {/* Connection line */}
      {!isLast && (
        <div
          className={`${styles.stepLine} ${
            isCompleted ? styles.stepLineCompleted : styles.stepLinePending
          }`}
        />
      )}

      {/* Step label */}
      <span
        className={`${styles.stepLabel} ${
          isActive || isCompleted
            ? styles.stepLabelActive
            : styles.stepLabelInactive
        }`}
      >
        {title}
      </span>
    </div>
  )
}

interface StepperProps {
  steps: Array<{ title: string; description?: string }>
  currentStep: number
  isLoading?: boolean
}

export const Stepper: FC<StepperProps> = ({
  steps,
  currentStep,
  isLoading
}) => {
  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepperWrapper}>
        {steps.map((step, index) => (
          <Step
            key={step.title}
            title={step.title}
            description={step.description}
            isCompleted={index < currentStep}
            isLoading={isLoading && index === currentStep}
            isActive={index === currentStep}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
