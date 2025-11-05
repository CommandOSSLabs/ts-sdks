import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  TextareaHTMLAttributes
} from 'react'
import { type FC, forwardRef, type ReactNode } from 'react'
import {
  input,
  label as labelStyle,
  textarea as textareaStyle
} from './Input.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return <input ref={ref} className={`${input} ${className}`} {...props} />
  }
)

Input.displayName = 'Input'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode
}

export const Label: FC<LabelProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Label will be associated with input when used
    <label className={`${labelStyle} ${className}`} {...props}>
      {children}
    </label>
  )
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: FC<TextareaProps> = ({ className = '', ...props }) => {
  return <textarea className={`${textareaStyle} ${className}`} {...props} />
}
