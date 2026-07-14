"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ROLE } from "@/constants/roles";
import { getAccessToken, getStoredUser } from "@/lib/session";
import type { AuthGuardProps } from "@/types";

export function AuthGuard({ children, role }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (role && user.role !== role) {
      router.replace("/");
      return;
    }

    setReady(true);
  }, [pathname, role, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background text-sm text-muted">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminGuard({
  children,
}: Pick<AuthGuardProps, "children">) {
  return <AuthGuard role={ROLE.ADMIN}>{children}</AuthGuard>;
}
