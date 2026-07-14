"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell, GenericForm } from "@/components/form";
import { DEMO_ADMIN } from "@/constants/admin";
import { LOGIN_FIELDS } from "@/constants/forms";
import { ROLE } from "@/constants/roles";
import { login } from "@/lib/auth";
import type { FormValues } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [formKey, setFormKey] = useState(0);
  const [prefill, setPrefill] = useState<FormValues | undefined>();

  async function handleSubmit(values: FormValues) {
    const result = await login({
      email: String(values["email"] ?? ""),
      password: String(values["password"] ?? ""),
      rememberMe: Boolean(values["rememberMe"]),
    });

    router.push(result.user.role === ROLE.ADMIN ? "/admin" : next);
  }

  function fillAdmin() {
    setPrefill({
      email: DEMO_ADMIN.email,
      password: DEMO_ADMIN.password,
      rememberMe: false,
    });
    setFormKey((key) => key + 1);
  }

  return (
    <>
      <div className="mb-6 rounded-lg border border-border bg-surface p-4 text-sm text-foreground">
        <p className="font-medium text-foreground">Admin login (demo)</p>
        <dl className="mt-2 space-y-1 text-muted">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-foreground/80">Email:</dt>
            <dd>
              <code className="text-accent">{DEMO_ADMIN.email}</code>
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-foreground/80">Password:</dt>
            <dd>
              <code className="text-accent">{DEMO_ADMIN.password}</code>
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-foreground/80">Dashboard:</dt>
            <dd>
              <Link href="/admin" className="text-accent underline-offset-2 hover:underline">
                /admin
              </Link>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={fillAdmin}
          className="btn-secondary mt-3 w-full sm:w-auto"
        >
          Fill admin credentials
        </button>
      </div>

      <GenericForm
        key={formKey}
        title="Log in"
        description="Sign in as a user or admin. Admins land on the dashboard."
        fields={LOGIN_FIELDS}
        submitLabel="Sign in"
        loadingLabel="Signing in…"
        initialValues={prefill}
        onSubmit={handleSubmit}
        footer={
          <>
            No account?{" "}
            <Link
              href="/signup"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Sign up
            </Link>
          </>
        }
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
