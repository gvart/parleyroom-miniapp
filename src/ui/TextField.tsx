import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

const labelStyle = {
  fontSize: 11,
  color: 'var(--ink-3)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  fontWeight: 600,
  marginBottom: 8,
  display: 'block',
}

const inputBase = {
  width: '100%',
  minWidth: 0,
  padding: '12px 14px',
  background: 'var(--card)',
  color: 'var(--ink)',
  border: '1px solid var(--hair)',
  borderRadius: 14,
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <div style={labelStyle}>{children}</div>
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: string | null
  hint?: ReactNode
  trailing?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, trailing, style, ...rest },
  ref,
) {
  const hasError = Boolean(error)
  return (
    <div style={{ width: '100%' }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          {...rest}
          style={{
            ...inputBase,
            borderColor: hasError ? 'oklch(0.7 0.18 25)' : 'var(--hair)',
            paddingRight: trailing ? 42 : inputBase.padding,
            ...style,
          }}
        />
        {trailing && (
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-3)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {trailing}
          </span>
        )}
      </div>
      {(hint || error) && (
        <div
          style={{
            fontSize: 12,
            color: hasError ? 'oklch(0.5 0.18 25)' : 'var(--ink-3)',
            marginTop: 6,
          }}
        >
          {error ?? hint}
        </div>
      )}
    </div>
  )
})

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  error?: string | null
  hint?: ReactNode
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, style, rows = 3, ...rest },
  ref,
) {
  const hasError = Boolean(error)
  return (
    <div style={{ width: '100%' }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        ref={ref}
        rows={rows}
        {...rest}
        style={{
          ...inputBase,
          resize: 'vertical' as const,
          borderColor: hasError ? 'oklch(0.7 0.18 25)' : 'var(--hair)',
          ...style,
        }}
      />
      {(hint || error) && (
        <div
          style={{
            fontSize: 12,
            color: hasError ? 'oklch(0.5 0.18 25)' : 'var(--ink-3)',
            marginTop: 6,
          }}
        >
          {error ?? hint}
        </div>
      )}
    </div>
  )
})
