"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { userApi, ApiError, UserResponse } from "@/lib/api";
import { isAdmin } from "@/lib/auth";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-primary/10 text-primary",
  MANAGER: "bg-[#2980B9]/10 text-[#2980B9]",
  CASHIER: "bg-secondary/10 text-secondary",
};

export default function StaffUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      setLoading(false);
      return;
    }
    userApi
      .getAll()
      .then(setUsers)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load staff users.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (!isAdmin()) {
    return (
      <div className="p-8 text-center">
        <p className="text-error font-body-semibold">
          Only administrators can view staff accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-gutter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Staff Users</h1>
          <p className="text-secondary font-label-sm text-label-sm">
            Everyone with access to this store
          </p>
        </div>
        <Link
          href="/settings/users/new"
          className="bg-primary text-on-primary px-4 py-2 rounded-sm font-body-semibold hover:bg-primary-container transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add Staff
        </Link>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-surface-container shadow-sm">
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading staff…</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-center text-secondary">No staff accounts found.</p>
        ) : (
          <table className="w-full text-body-reg">
            <thead>
              <tr className="border-b border-surface-container text-label-sm text-secondary uppercase text-left">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-container last:border-0">
                  <td className="px-5 py-3 font-body-semibold">
                    {u.firstname} {u.lastname}
                  </td>
                  <td className="px-5 py-3 text-secondary">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-body-semibold ${
                        ROLE_BADGE[u.role] ?? "bg-secondary/10 text-secondary"
                      }`}
                    >
                      {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}