"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell, GenericForm } from "@/components/form";
import { LOGIN_FIELDS } from "@/constants/forms";
import { ROLE } from "@/constants/roles";
import { login } from "@/lib/auth";
import type { FormValues } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  async function handleSubmit(values: FormValues) {
    const result = await login({
      email: String(values["email"] ?? ""),
      password: String(values["password"] ?? ""),
      rememberMe: Boolean(values["rememberMe"]),
    });

    router.push(result.user.role === ROLE.ADMIN ? "/admin" : next);
  }

  return (
    <GenericForm
      title="Log in"
      description="Access your account. Admins go to the dashboard."
      fields={LOGIN_FIELDS}
      submitLabel="Sign in"
      loadingLabel="Signing in…"
      onSubmit={handleSubmit}
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-medium text-accent underline-offset-2 hover:underline">
            Sign up
          </Link>
        </>
      }
    />
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
