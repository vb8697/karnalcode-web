import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

/* ───────────────────────── layout helpers ───────────────────────── */

/** Page content area. The skip link in the layout jumps here. */
export function Main({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main id="content" tabIndex={-1} className={`flex-1 outline-none ${className}`}>
      {children}
    </main>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ───────────────────────── feedback ───────────────────────── */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-segment motion-reduce:animate-none ${className}`} />;
}

export function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Small message shown in place of content that failed to load or is empty. */
export function Notice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border bg-white p-5 text-[15px] ${tone === "error" ? "border-error/30 text-error" : "border-line text-muted"}`}
    >
      {children}
    </div>
  );
}

type EmptyStateProps = { title: string; text: string; action?: { href: string; label: string } };

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[22px] border border-dashed border-line bg-white px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-peach text-2xl" aria-hidden>
        ✦
      </div>
      <h2 className="font-display text-xl font-extrabold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-[15px] text-muted">{text}</p>
      {action ? (
        <Link href={action.href} className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Avatar({ letter, size = "md" }: { letter: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-8 text-sm", md: "size-11 text-lg", lg: "size-24 text-4xl" } as const;
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-sun font-display font-extrabold text-indigo ${sizes[size]}`} aria-hidden>
      {letter}
    </span>
  );
}

const TAG_TONES = {
  peach: "bg-peach text-peach-text",
  indigo: "bg-indigo-tint text-indigo",
  teal: "bg-teal-tint text-teal-text",
  sun: "bg-sun-tint text-[#7a5b00]",
} as const;

export function Tag({ children, tone = "peach" }: { children: ReactNode; tone?: keyof typeof TAG_TONES }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${TAG_TONES[tone]}`}>{children}</span>;
}

/* ───────────────────────── form controls ───────────────────────── */

const inputBase =
  "w-full rounded-[14px] border-2 bg-white px-3.5 py-3 text-[15px] font-medium text-indigo placeholder:text-muted/70 outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-error">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16.5v.01" />
      </svg>
      {message}
    </p>
  );
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  /** Extra control inside the right edge of the field, e.g. a show/hide password button. */
  trailing?: ReactNode;
};

export function TextField({ label, error, hint, trailing, id, className = "", ...rest }: TextFieldProps) {
  const fieldId = id ?? `field-${slug(label)}`;
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-[13px] font-bold">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${inputBase} ${error ? "border-error" : "border-line"} ${trailing ? "pr-20" : ""} ${className}`}
          {...rest}
        />
        {trailing ? <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div> : null}
      </div>
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${fieldId}-error`} message={error} />
    </div>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string };

export function TextArea({ label, error, hint, id, className = "", ...rest }: TextAreaProps) {
  const fieldId = id ?? `field-${slug(label)}`;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 flex items-baseline justify-between text-[13px] font-bold">
        <span>{label}</span>
        {hint ? <span className="font-normal text-muted">{hint}</span> : null}
      </label>
      <textarea
        id={fieldId}
        rows={4}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${inputBase} resize-y ${error ? "border-error" : "border-line"} ${className}`}
        {...rest}
      />
      <FieldError id={`${fieldId}-error`} message={error} />
    </div>
  );
}

type ChipGroupProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/** A labelled row of buttons where exactly one can be picked. */
export function ChipGroup({ label, options, value, onChange, error }: ChipGroupProps) {
  const groupId = `group-${slug(label)}`;
  return (
    <div role="group" aria-labelledby={groupId} aria-describedby={error ? `${groupId}-error` : undefined}>
      <span id={groupId} className="mb-2 block text-[13px] font-bold">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-bold transition-colors ${
                selected ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary/50 hover:bg-peach/40"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <FieldError id={`${groupId}-error`} message={error} />
    </div>
  );
}

type SegmentedProps = { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void };

export function Segmented({ label, options, value, onChange }: SegmentedProps) {
  return (
    <div role="radiogroup" aria-label={label}>
      <span className="mb-2 block text-[13px] font-bold">{label}</span>
      <div className="flex gap-1 rounded-xl bg-segment p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-[9px] py-2.5 text-[13px] font-bold transition-colors ${
              o.value === value ? "bg-white text-indigo shadow-sm" : "text-muted hover:text-indigo"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── buttons ───────────────────────── */

type Variant = "primary" | "secondary" | "dark";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:opacity-90",
  secondary: "border-2 border-line bg-white text-indigo hover:border-primary/50",
  dark: "bg-indigo text-white hover:opacity-90",
};

const BUTTON_BASE =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean; children: ReactNode };

export function Button({ variant = "primary", loading = false, className = "", children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({ href, variant = "primary", className = "", children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

type SelectFieldProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
};

/** Native dropdown, best for long lists such as years. */
export function SelectField({ label, options, value, onChange, placeholder, error }: SelectFieldProps) {
  const fieldId = `field-${slug(label)}`;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-[13px] font-bold">
        {label}
      </label>
      <select
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${inputBase} ${error ? "border-error" : "border-line"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FieldError id={`${fieldId}-error`} message={error} />
    </div>
  );
}
