"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell, GenericForm } from "@/components/form";
import { SIGNUP_FIELDS } from "@/constants/forms";
import { signup } from "@/lib/auth";
import type { FormValues } from "@/types";

export default function SignupPage() {
  const router = useRouter();

  async function handleSubmit(values: FormValues) {
    await signup({
      fullName: String(values["fullName"] ?? ""),
      email: String(values["email"] ?? ""),
      password: String(values["password"] ?? ""),
    });
    router.push("/");
  }

  return (
    <AuthShell>
      <GenericForm
        title="Create account"
        description="Sign up to like, share, and comment on videos."
        fields={SIGNUP_FIELDS}
        submitLabel="Sign up"
        loadingLabel="Creating…"
        onSubmit={handleSubmit}
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent underline-offset-2 hover:underline">
              Log in
            </Link>
          </>
        }
      />
    </AuthShell>
  );
}
