import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from 'react'
import { haptic } from '@/lib/haptics'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'md' | 'sm'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  block?: boolean
  leadingIcon?: string
  trailingIcon?: string
  children: ReactNode
  style?: CSSProperties
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-ghost',
  danger: 'btn-danger',
  ghost: 'btn-plain',
}

/** Liquid Glass 3D-squish button (portal `Button`). */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  style,
  className,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = [
    variantClass[variant],
    size === 'sm' && 'btn-sm',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const iconSize = size === 'md' ? 20 : 17
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if ((variant === 'primary' || variant === 'danger') && !disabled && !loading) haptic('light')
    onClick?.(event)
  }
  return (
    <button {...rest} disabled={disabled || loading} className={classes} style={style} onClick={handleClick}>
      {leadingIcon && (
        <span className="ms fill" style={{ fontSize: iconSize }} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      {loading ? <span style={{ opacity: 0.8 }}>{children}…</span> : children}
      {trailingIcon && (
        <span className="ms" style={{ fontSize: iconSize }} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  )
}
