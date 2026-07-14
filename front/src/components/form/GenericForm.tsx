"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { FormFieldConfig, FormValues, GenericFormProps } from "@/types";

function buildInitialValues(
  fields: FormFieldConfig[],
  initialValues?: FormValues,
): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    if (field.type === "checkbox") {
      values[field.name] = initialValues?.[field.name] ?? false;
    } else {
      values[field.name] = (initialValues?.[field.name] as string) ?? "";
    }
  }
  return values;
}

export function GenericForm({
  title,
  description,
  fields,
  submitLabel,
  loadingLabel = "Please wait…",
  footer,
  initialValues,
  onSubmit,
}: GenericFormProps) {
  const defaults = useMemo(
    () => buildInitialValues(fields, initialValues),
    [fields, initialValues],
  );
  const [values, setValues] = useState<FormValues>(defaults);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, type, checked, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {fields.map((field) =>
          field.type === "checkbox" ? (
            <label
              key={field.name}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="checkbox"
                name={field.name}
                checked={Boolean(values[field.name])}
                onChange={onChange}
                className="size-4 rounded border-border"
              />
              {field.label}
            </label>
          ) : (
            <label key={field.name} className="block text-sm">
              <span className="mb-1 block text-foreground/80">{field.label}</span>
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                minLength={field.minLength}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                value={String(values[field.name] ?? "")}
                onChange={onChange}
                className="input-field"
              />
            </label>
          ),
        )}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5"
        >
          {loading ? loadingLabel : submitLabel}
        </button>
      </form>

      {footer ? <div className="mt-6 text-sm text-muted">{footer}</div> : null}
    </div>
  );
}
