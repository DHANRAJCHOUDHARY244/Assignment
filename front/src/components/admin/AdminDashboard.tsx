"use client";

import { useState } from "react";

import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { AdminVideoPanel } from "@/components/admin/AdminVideoPanel";

type AdminTab = "videos" | "users";

export function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("videos");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("videos")}
          className={
            tab === "videos"
              ? "rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
              : "btn-secondary"
          }
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => setTab("users")}
          className={
            tab === "users"
              ? "rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
              : "btn-secondary"
          }
        >
          Users
        </button>
      </div>

      {tab === "videos" ? <AdminVideoPanel /> : <AdminUsersPanel />}
    </div>
  );
}
