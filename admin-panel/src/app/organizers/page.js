"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiFetch } from "../../lib/api";
import { getAdminToken } from "../../lib/auth";

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function loadOrganizers(selectedStatus = status, selectedPage = page) {
    try {
      setLoading(true);
      setError("");

      const token = getAdminToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const queryParams = new URLSearchParams();

      if (selectedStatus) {
        queryParams.append("status", selectedStatus);
      }

      queryParams.append("page", selectedPage);
      queryParams.append("pageSize", 10);

      const data = await apiFetch(`/api/Admin/organizers?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrganizers(data.items || []);
      setPageInfo(data);
    } catch (err) {
      setError(err.message || "Organizatörler alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function approveOrganizer(id) {
    const confirmed = window.confirm(
      "Bu organizatör başvurusunu onaylamak istediğinize emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    await runOrganizerAction(id, `/api/Admin/organizers/${id}/approve`);
  }

  async function suspendOrganizer(id) {
    const confirmed = window.confirm(
      "Bu organizatörü askıya almak istediğinize emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    await runOrganizerAction(id, `/api/Admin/organizers/${id}/suspend`);
  }

  async function reactivateOrganizer(id) {
    const confirmed = window.confirm(
      "Bu organizatörü tekrar aktif hale getirmek istediğinize emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    await runOrganizerAction(id, `/api/Admin/organizers/${id}/reactivate`);
  }

  async function runOrganizerAction(id, path) {
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

      setSelectedOrganizer(null);
      await loadOrganizers(status, page);
    } catch (err) {
      setError(err.message || "İşlem başarısız oldu.");
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleStatusChange(e) {
    const selectedStatus = e.target.value;
    setStatus(selectedStatus);
    setPage(1);
    loadOrganizers(selectedStatus, 1);
  }

  function goToPage(newPage) {
    setPage(newPage);
    loadOrganizers(status, newPage);
  }

  function formatDate(dateValue) {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  useEffect(() => {
    loadOrganizers("", 1);
  }, []);

  return (
    <AdminLayout
      title="Organizatörler"
      description="Organizatör başvurularını ve mevcut organizatörleri yönetin"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Durum Filtresi
          </label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500"
          >
            <option value="">Tümü</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Suspended">Suspended</option>
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
        ) : organizers.length === 0 ? (
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
                    Organizatör
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Tip
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Konum
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    İşlemler
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {organizers.map((organizer) => (
                  <tr key={organizer.id}>
                    <td className="px-4 py-3 text-gray-600">
                      {organizer.id}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          {organizer.organizerName}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {organizer.description}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {organizer.organizerType}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {organizer.city} / {organizer.district}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {organizer.phoneNumber}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={organizer.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrganizer(organizer)}
                          className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          Detay
                        </button>

                        {organizer.status === "Pending" && (
                          <button
                            onClick={() => approveOrganizer(organizer.id)}
                            disabled={actionLoadingId === organizer.id}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            Onayla
                          </button>
                        )}

                        {organizer.status === "Approved" && (
                          <button
                            onClick={() => suspendOrganizer(organizer.id)}
                            disabled={actionLoadingId === organizer.id}
                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                          >
                            Askıya Al
                          </button>
                        )}

                        {organizer.status === "Suspended" && (
                          <button
                            onClick={() => reactivateOrganizer(organizer.id)}
                            disabled={actionLoadingId === organizer.id}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            Aktif Et
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

      {selectedOrganizer && (
        <OrganizerDetailModal
          organizer={selectedOrganizer}
          onClose={() => setSelectedOrganizer(null)}
          onApprove={approveOrganizer}
          onSuspend={suspendOrganizer}
          onReactivate={reactivateOrganizer}
          actionLoadingId={actionLoadingId}
          formatDate={formatDate}
        />
      )}
    </AdminLayout>
  );
}

function OrganizerDetailModal({
  organizer,
  onClose,
  onApprove,
  onSuspend,
  onReactivate,
  actionLoadingId,
  formatDate,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="border-b px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {organizer.organizerName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Organizatör ID: {organizer.id} | Kullanıcı ID: {organizer.userId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Kapat
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-700">Durum</p>
            <div className="mt-2">
              <StatusBadge status={organizer.status} />
            </div>
          </div>

          <InfoSection title="Organizatör Bilgileri">
            <InfoRow label="Organizatör Adı" value={organizer.organizerName} />
            <InfoRow label="Organizatör Tipi" value={organizer.organizerType} />
            <InfoRow label="Açıklama" value={organizer.description} />
            <InfoRow label="Telefon" value={organizer.phoneNumber} />
            <InfoRow label="Instagram" value={organizer.instagramUrl || "-"} />
          </InfoSection>

          <InfoSection title="Konum ve Tarih">
            <InfoRow label="Şehir / İlçe" value={`${organizer.city} / ${organizer.district}`} />
            <InfoRow label="Oluşturulma Tarihi" value={formatDate(organizer.createdAt)} />
            <InfoRow label="Onay Tarihi" value={formatDate(organizer.approvedAt)} />
          </InfoSection>

          <InfoSection title="Red / Durum Bilgisi">
            <InfoRow label="Red Sebebi" value={organizer.rejectionReason || "-"} />
          </InfoSection>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          {organizer.status === "Pending" && (
            <button
              onClick={() => onApprove(organizer.id)}
              disabled={actionLoadingId === organizer.id}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              Onayla
            </button>
          )}

          {organizer.status === "Approved" && (
            <button
              onClick={() => onSuspend(organizer.id)}
              disabled={actionLoadingId === organizer.id}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
            >
              Askıya Al
            </button>
          )}

          {organizer.status === "Suspended" && (
            <button
              onClick={() => onReactivate(organizer.id)}
              disabled={actionLoadingId === organizer.id}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Aktif Et
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-800 mb-3">
        {title}
      </h4>
      <div className="rounded-lg border divide-y">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-3 text-sm">
      <p className="font-medium text-gray-600">{label}</p>
      <p className="sm:col-span-2 text-gray-800 whitespace-pre-wrap">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Suspended: "bg-orange-100 text-orange-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}