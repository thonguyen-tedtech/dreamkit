"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Button } from "@/components/ui/button";
import { LoadingOverlay, Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { deleteUserApi, fetchUsersApi, updateUserRoleApi } from "@/lib/users-api";
import type { User, UserRole } from "@/lib/types";

const ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  admin: "Quản trị viên",
  customer: "Khách hàng",
};

export function UserManager() {
  const { accessToken, user: currentUser } = useAuthModal();
  const { showToast } = useToast();
  const [users, setUsers] = useState<readonly User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);
    const result = await fetchUsersApi(accessToken);
    if (result.ok) {
      setUsers(result.users);
    } else {
      showToast(result.message, "error");
    }
    setIsLoading(false);
  }, [accessToken, showToast]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [users],
  );

  async function handleRoleChange(id: string, role: UserRole) {
    if (!accessToken) {
      return;
    }
    setPendingId(id);
    const result = await updateUserRoleApi(accessToken, id, role);
    if (result.ok) {
      setUsers((current) =>
        current.map((entry) => (entry.id === id ? result.user : entry)),
      );
      showToast("Đã cập nhật vai trò.", "success");
    } else {
      showToast(result.message, "error");
    }
    setPendingId(null);
  }

  async function handleDelete(id: string) {
    if (!accessToken || !window.confirm("Xoá tài khoản này?")) {
      return;
    }
    setPendingId(id);
    const result = await deleteUserApi(accessToken, id);
    if (result.ok) {
      setUsers((current) => current.filter((entry) => entry.id !== id));
      showToast("Đã xoá tài khoản.", "success");
    } else {
      showToast(result.message, "error");
    }
    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Khách hàng</h1>
          <p className="mt-2 text-sm text-muted">
            Quản lý tài khoản và phân quyền người dùng.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadUsers()}>
          Tải lại
        </Button>
      </div>

      {isLoading ? (
        <LoadingOverlay label="Đang tải danh sách người dùng…" />
      ) : sortedUsers.length === 0 ? (
        <div className="rounded-card border border-dashed border-border py-20 text-center">
          <p className="font-display text-2xl text-foreground">Chưa có người dùng</p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-card border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Email xác minh</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => {
                  const isPending = pendingId === user.id;
                  const isSelf = currentUser?.id === user.id;
                  return (
                    <tr key={user.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-foreground">{user.phone || "—"}</p>
                        <p className="text-xs text-muted">{user.address || "—"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={user.role}
                          disabled={isPending || isSelf}
                          onChange={(event) =>
                            void handleRoleChange(user.id, event.target.value as UserRole)
                          }
                          className="h-10 rounded-card border border-border bg-background px-3 text-sm text-foreground disabled:opacity-50"
                          aria-label={`Vai trò của ${user.name}`}
                        >
                          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        {user.isEmailVerified ? "Đã xác minh" : "Chưa xác minh"}
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={isPending || isSelf}
                          onClick={() => void handleDelete(user.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline disabled:opacity-50"
                        >
                          {isPending ? <Spinner className="size-3" /> : null}
                          Xoá
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
