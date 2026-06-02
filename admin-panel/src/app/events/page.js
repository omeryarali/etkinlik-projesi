"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiFetch } from "../../lib/api";
import { getAdminToken } from "../../lib/auth";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function loadEvents(selectedStatus = status, selectedPage = page) {
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

      const data = await apiFetch(`/api/Admin/events?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(data.items || []);
      setPageInfo(data);
    } catch (err) {
      setError(err.message || "Etkinlikler alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function approveEvent(id) {
    await runEventAction(id, `/api/Admin/events/${id}/approve`);
  }

  async function rejectEvent(id) {
    await runEventAction(id, `/api/Admin/events/${id}/reject`);
  }

  async function runEventAction(id, path) {
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

      await loadEvents(status, page);
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
    loadEvents(selectedStatus, 1);
  }

  function goToPage(newPage) {
    setPage(newPage);
    loadEvents(status, newPage);
  }

  function formatDate(dateValue) {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  useEffect(() => {
    loadEvents("", 1);
  }, []);

  return (
    <AdminLayout
      title="Etkinlikler"
      description="Etkinlik başvurularını ve mevcut etkinlikleri yönetin"
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
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
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
        ) : events.length === 0 ? (
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
                    Etkinlik
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Organizatör
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Konum
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Kontenjan
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
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 text-gray-600">
                      {event.id}
                    </td>

                    <td className="px-4 py-3 min-w-64">
                      <div>
                        <p className="font-medium text-gray-800">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {event.isPaid
                            ? `Ücretli - ${event.price ?? 0} TL`
                            : "Ücretsiz"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {event.organizerName}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {event.categoryName}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {event.city} / {event.district}
                      <p className="text-xs text-gray-400">
                        {event.locationName}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(event.startDate)}
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {event.participantCount} / {event.capacity}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={event.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {event.status === "Pending" && (
                          <>
                            <button
                              onClick={() => approveEvent(event.id)}
                              disabled={actionLoadingId === event.id}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              Onayla
                            </button>

                            <button
                              onClick={() => rejectEvent(event.id)}
                              disabled={actionLoadingId === event.id}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Reddet
                            </button>
                          </>
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

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-700",
    Completed: "bg-blue-100 text-blue-800",
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