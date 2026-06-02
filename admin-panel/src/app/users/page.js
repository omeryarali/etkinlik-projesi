"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiFetch } from "../../lib/api";
import { getAdminToken } from "../../lib/auth";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function loadUsers(selectedRole = role, selectedPage = page) {
    try {
      setLoading(true);
      setError("");

      const token = getAdminToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const queryParams = new URLSearchParams();

      if (selectedRole) {
        queryParams.append("role", selectedRole);
      }

      queryParams.append("page", selectedPage);
      queryParams.append("pageSize", 10);

      const data = await apiFetch(`/api/Admin/users?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(data.items || []);
      setPageInfo(data);
    } catch (err) {
      setError(err.message || "Kullanıcılar alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function activateUser(id) {
    await runUserAction(id, `/api/Admin/users/${id}/activate`);
  }

  async function deactivateUser(id) {
    await runUserAction(id, `/api/Admin/users/${id}/deactivate`);
  }

  async function runUserAction(id, path) {
    try {
      setActionLoadingId(id);
      setError("");

      const token = getAdminToken();

      await apiFetch(path, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadUsers(role, page);
    } catch (err) {
      setError(err.message || "İşlem başarısız oldu.");
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleRoleChange(e) {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setPage(1);
    loadUsers(selectedRole, 1);
  }

  function goToPage(newPage) {
    setPage(newPage);
    loadUsers(role, newPage);
  }

  function formatDate(dateValue) {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  useEffect(() => {
    loadUsers("", 1);
  }, []);

  return (
    <AdminLayout
      title="Kullanıcılar"
      description="Sistemdeki kullanıcıları görüntüleyin ve hesap durumlarını yönetin"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rol Filtresi
          </label>
          <select
            value={role}
            onChange={handleRoleChange}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500"
          >
            <option value="">Tümü</option>
            <option value="Participant">Participant</option>
            <option value="Organizer">Organizer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {pageInfo && (
          <p className="text-sm text-gray-500">
            Toplam kayıt: {pageInfo.totalCount}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white border shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Yükleniyor...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-gray-500">Kayıt bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Kullanıcı
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Kayıt Tarihi
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    İşlemler
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-gray-600">
                      {user.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 overflow-hidden">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.fullName?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {user.phoneNumber || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-4 py-3">
                      <UserStatusBadge isActive={user.isActive} />
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {user.isActive ? (
                          <button
                            onClick={() => deactivateUser(user.id)}
                            disabled={actionLoadingId === user.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Pasif Yap
                          </button>
                        ) : (
                          <button
                            onClick={() => activateUser(user.id)}
                            disabled={actionLoadingId === user.id}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            Aktif Yap
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={!pageInfo.hasPreviousPage}
            className="rounded-lg border bg-white px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            Önceki
          </button>

          <p className="text-sm text-gray-600">
            Sayfa {pageInfo.page} / {pageInfo.totalPages}
          </p>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={!pageInfo.hasNextPage}
            className="rounded-lg border bg-white px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </AdminLayout>
  );
}

function RoleBadge({ role }) {
  const styles = {
    Admin: "bg-purple-100 text-purple-800",
    Organizer: "bg-blue-100 text-blue-800",
    Participant: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[role] || "bg-gray-100 text-gray-700"
      }`}
    >
      {role}
    </span>
  );
}

function UserStatusBadge({ isActive }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? "Aktif" : "Pasif"}
    </span>
  );
}