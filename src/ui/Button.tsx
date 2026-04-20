import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

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

const sizeMap: Record<ButtonSize, CSSProperties> = {
  md: { padding: '14px', fontSize: 14, borderRadius: 999 },
  sm: { padding: '10px 14px', fontSize: 13, borderRadius: 999 },
}

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
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 0,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    width: block ? '100%' : undefined,
    fontFamily: 'inherit',
    transition: 'background .15s var(--ease), color .15s var(--ease), border-color .15s var(--ease)',
    ...sizeMap[size],
  }

  const variantStyle: CSSProperties = (() => {
    if (variant === 'primary') {
      return {
        background: isDisabled ? 'var(--hair-strong)' : 'var(--ink)',
        color: isDisabled ? 'var(--ink-3)' : 'var(--bg)',
      }
    }
    if (variant === 'secondary') {
      return {
        background: 'transparent',
        color: isDisabled ? 'var(--ink-3)' : 'var(--ink)',
        border: '1px solid var(--hair-strong)',
      }
    }
    if (variant === 'danger') {
      return {
        background: isDisabled ? 'var(--hair-strong)' : 'oklch(0.55 0.2 25)',
        color: isDisabled ? 'var(--ink-3)' : '#FFF',
      }
    }
    return {
      background: 'transparent',
      color: isDisabled ? 'var(--ink-3)' : 'var(--ink)',
    }
  })()

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={`tap${rest.className ? ` ${rest.className}` : ''}`}
      style={{ ...base, ...variantStyle, ...style }}
    >
      {leadingIcon && (
        <span className="ms fill" style={{ fontSize: size === 'md' ? 18 : 16 }}>
          {leadingIcon}
        </span>
      )}
      {loading ? <span style={{ opacity: 0.8 }}>{children}…</span> : children}
      {trailingIcon && (
        <span className="ms" style={{ fontSize: size === 'md' ? 18 : 16 }}>
          {trailingIcon}
        </span>
      )}
    </button>
  )
}
