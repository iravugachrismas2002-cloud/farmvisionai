"use client";

import type { ReactNode } from "react";

function stableId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function useInputId(prefix: string, hint?: string): string {
  const base = hint || prefix;
  return `${prefix}-${stableId(base)}`;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
  type = "text",
  disabled = false,
  required = false,
  minLength,
  maxLength,
  error,
  className,
  id,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  autoComplete?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string;
  className?: string;
  id?: string;
}) {
  const inputId = id || useInputId(name || "field");

  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        name={name}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none
          focus:ring-2 focus:ring-primary focus:ring-offset-background
          transition-colors ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${error ? "border-destructive" : ""}
        `}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
  rows = 3,
  disabled = false,
  required = false,
  minLength,
  maxLength,
  error,
  className,
  id,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  autoComplete?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string;
  className?: string;
  id?: string;
}) {
  const inputId = id || useInputId(name || "textarea");

  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        name={name}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none
          focus:ring-2 focus:ring-primary focus:ring-offset-background
          resize-none transition-colors ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${error ? "border-destructive" : ""}
        `}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
  options,
  disabled = false,
  required = false,
  error,
  className,
  id,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  autoComplete?: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
}) {
  const inputId = id || useInputId(name || "select");

  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        name={name}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none
          focus:ring-2 focus:ring-primary focus:ring-offset-background
          appearance-none bg-white bg-image no-repeat right-1.5 top-1/2 r-1.5
          placeholder-option
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${error ? "border-destructive" : ""}
        `}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({
  errors,
}: {
  errors: Array<{ path: string; message: string }>;
}) {
  return (
    <div className="mt-4 p-4 rounded-lg border border-destructive/20 bg-destructive/10" role="alert">
      <p className="text-sm text-destructive">{errors?.[0]?.message ?? "Validation failed"}</p>
    </div>
  );
}
