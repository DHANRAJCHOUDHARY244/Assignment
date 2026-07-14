"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminUserCard } from "@/components/admin/AdminUserCard";
import { AdminUserDetailModal } from "@/components/admin/AdminUserDetailModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import {
  ADMIN_USERS_PAGE_SIZE,
  fetchAdminUserDetail,
  fetchAdminUsers,
  updateAdminUserStatus,
} from "@/lib/adminUsers";
import { getAccessToken } from "@/lib/session";
import type { AdminUserDetail, AdminUserSummary, UserStatus } from "@/types";

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

  const loadPage = useCallback(async (targetPage: number) => {
    if (!getAccessToken()) {
      setError("Session expired. Log in again as admin.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers(targetPage, ADMIN_USERS_PAGE_SIZE);
      setUsers(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(page);
  }, [page, loadPage]);

  async function openUserDetail(user: AdminUserSummary) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await fetchAdminUserDetail(user.id);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user detail");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleStatusChange(user: AdminUserSummary, status: UserStatus) {
    setStatusBusyId(user.id);
    setError(null);
    try {
      await updateAdminUserStatus(user.id, status);
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, status } : item)),
      );
      if (detail?.user.id === user.id) {
        setDetail((prev) =>
          prev ? { ...prev, user: { ...prev.user, status } } : prev,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update user status",
      );
    } finally {
      setStatusBusyId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_USERS_PAGE_SIZE));

  return (
    <div className="space-y-6">
      {error ? (
        <ErrorState message={error} onRetry={() => void loadPage(page)} />
      ) : null}

      <div>
        <h2 className="text-lg font-medium">Users</h2>
        <p className="text-sm text-muted">
          {total} registered users · block to stop login, unblock to restore access
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: ADMIN_USERS_PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="card-soft h-64 animate-pulse bg-accent-soft/20 motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="card-soft p-10 text-center text-sm text-muted">
          No users yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <AdminUserCard
              key={user.id}
              user={user}
              onView={(item) => void openUserDetail(item)}
              onStatusChange={(item, status) => void handleStatusChange(item, status)}
              statusBusy={statusBusyId === user.id}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        itemLabel="users"
        onPageChange={setPage}
      />

      <AdminUserDetailModal
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
        }}
      />
    </div>
  );
}
