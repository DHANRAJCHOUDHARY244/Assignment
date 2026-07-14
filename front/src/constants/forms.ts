import type { FormFieldConfig } from "@/types/form";

export const LOGIN_FIELDS: FormFieldConfig[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    autoComplete: "current-password",
  },
  {
    name: "rememberMe",
    label: "Remember me",
    type: "checkbox",
  },
];

export const SIGNUP_FIELDS: FormFieldConfig[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    required: true,
    minLength: 2,
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    minLength: 8,
    autoComplete: "new-password",
  },
];
