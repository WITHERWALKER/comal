interface CheckoutFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export default function CheckoutField({
  label,
  name,
  error,
  hint,
  ...props
}: CheckoutFieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = error
    ? `${name}-error`
    : hint
      ? `${name}-hint`
      : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="px-1 text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
        {...props}
      />
      {error ? (
        <p id={`${name}-error`} className="px-1 text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="px-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
