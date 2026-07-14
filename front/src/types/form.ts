import type { ReactNode } from "react";

export type FormFieldType = "text" | "email" | "password" | "checkbox";

export type FormFieldConfig = {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
};

export type FormValues = Record<string, string | boolean>;

export type GenericFormProps = {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  submitLabel: string;
  loadingLabel?: string;
  footer?: ReactNode;
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
};
