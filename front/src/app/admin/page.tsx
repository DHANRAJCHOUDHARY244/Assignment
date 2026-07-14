"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminGuard } from "@/components/AuthGuard";
import { useStoredUser } from "@/hooks/useStoredUser";
import { logout } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useStoredUser();

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <AdminGuard>
      <main className="page-shell max-w-6xl">
        <div className="card-soft mb-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <span className="pill">Dashboard</span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-muted">
              {user?.email} · {user?.role}
            </p>
          </div>
          <button type="button" onClick={() => void onLogout()} className="btn-secondary">
            Log out
          </button>
        </div>

        <AdminDashboard />

        <Link href="/" className="btn-ghost mt-8">
          ← Back home
        </Link>
      </main>
    </AdminGuard>
  );
}
