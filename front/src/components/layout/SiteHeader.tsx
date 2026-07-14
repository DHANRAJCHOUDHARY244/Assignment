"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ROLE } from "@/constants/roles";
import { useStoredUser } from "@/hooks/useStoredUser";
import { logout } from "@/lib/auth";

function HeaderTitle({ subtitle }: { subtitle: string }) {
  return (
    <div>
      <p className="eyebrow">Assignment</p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground md:mt-2 md:text-2xl lg:text-4xl">
        Socially Approved
      </h1>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted md:mt-2">
        {subtitle}
      </p>
    </div>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { user, ready } = useStoredUser();

  async function onLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return (
      <header className="border-b border-border bg-black py-4 text-foreground md:py-5">
        <div className="flex min-h-[52px] items-center justify-between gap-4">
          <div className="h-6 w-40 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          <div className="h-9 w-36 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="border-b border-border bg-black py-4 text-foreground md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <HeaderTitle subtitle="Real guest moments. Hover to preview, tap to watch." />
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/login" className="btn-primary no-underline">
              Log in
            </Link>
            <Link href="/signup" className="btn-secondary no-underline">
              Sign up
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  const firstName = user.fullName?.split(" ")[0];
  const subtitle = firstName
    ? `Welcome back, ${firstName}. Pick a clip and join the conversation.`
    : "Welcome back. Pick a clip and join the conversation.";

  return (
    <header className="card-soft flex flex-wrap items-center justify-between gap-5 p-6 text-foreground md:p-8">
      <HeaderTitle subtitle={subtitle} />
      <nav className="flex flex-wrap items-center gap-2">
        <span className="pill max-w-[12rem] truncate" title={user.email}>
          {user.email}
        </span>
        {user.role === ROLE.ADMIN ? (
          <Link href="/admin" className="btn-secondary no-underline">
            Admin
          </Link>
        ) : null}
        <button type="button" onClick={() => void onLogout()} className="btn-ghost">
          Log out
        </button>
      </nav>
    </header>
  );
}
