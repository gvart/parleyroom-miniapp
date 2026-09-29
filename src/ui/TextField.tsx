import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

export function FieldLabel({ children }: { children: ReactNode }) {
  return <div className="eyebrow field-label">{children}</div>
}

function FieldMessage({ error, hint }: { error?: string | null; hint?: ReactNode }) {
  if (!hint && !error) return null
  return (
    <div
      style={{
        fontSize: 'var(--text-caption)',
        fontWeight: error ? 700 : 400,
        color: error ? 'var(--coral-ink)' : 'var(--ink-3)',
        marginTop: 6,
      }}
    >
      {error ?? hint}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: string | null
  hint?: ReactNode
  trailing?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, trailing, style, className, ...rest },
  ref,
) {
  return (
    <div style={{ width: '100%' }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          aria-invalid={error ? true : undefined}
          {...rest}
          className={`glass-field${className ? ` ${className}` : ''}`}
          style={{ paddingRight: trailing ? 44 : undefined, ...style }}
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
      <FieldMessage error={error} hint={hint} />
    </div>
  )
})

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  error?: string | null
  hint?: ReactNode
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, style, className, rows = 3, ...rest },
  ref,
) {
  return (
    <div style={{ width: '100%' }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        {...rest}
        className={`glass-field${className ? ` ${className}` : ''}`}
        style={{ resize: 'vertical', ...style }}
      />
      <FieldMessage error={error} hint={hint} />
    </div>
  )
})
