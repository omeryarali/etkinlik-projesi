"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiFetch } from "../../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const data = await apiFetch("/api/Category", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(data || []);
    } catch (err) {
      setError(err.message || "Kategoriler alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(e) {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!name.trim()) {
        setError("Kategori adı boş olamaz.");
        return;
      }

      await apiFetch("/api/Category", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      setName("");
      setDescription("");
      setSuccess("Kategori başarıyla oluşturuldu.");

      await loadCategories();
    } catch (err) {
      setError(err.message || "Kategori oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  }

  async function activateCategory(id) {
    await runCategoryAction(id, `/api/Category/${id}/activate`);
  }

  async function deactivateCategory(id) {
    await runCategoryAction(id, `/api/Category/${id}/deactivate`);
  }

  async function runCategoryAction(id, path) {
    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      await apiFetch(path, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Kategori durumu güncellendi.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "İşlem başarısız oldu.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <AdminLayout
      title="Kategoriler"
      description="Etkinlik kategorilerini yönetin"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1">
          <div className="rounded-xl bg-white border shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Yeni Kategori
            </h3>

            <form onSubmit={createCategory} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 outline-none focus:border-blue-500"
                  placeholder="Örn: Turnuva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 outline-none focus:border-blue-500"
                  placeholder="Kategori açıklaması"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {creating ? "Ekleniyor..." : "Kategori Ekle"}
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-2">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="rounded-xl bg-white border shadow-sm overflow-hidden">
            {loading ? (
              <p className="p-6 text-gray-500">Yükleniyor...</p>
            ) : categories.length === 0 ? (
              <p className="p-6 text-gray-500">Kategori bulunamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Kategori
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
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-4 py-3 text-gray-600">
                          {category.id}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">
                            {category.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {category.description}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <CategoryStatusBadge isActive={category.isActive} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {category.isActive ? (
                              <button
                                onClick={() => deactivateCategory(category.id)}
                                disabled={actionLoadingId === category.id}
                                className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-60"
                              >
                                Pasif Yap
                              </button>
                            ) : (
                              <button
                                onClick={() => activateCategory(category.id)}
                                disabled={actionLoadingId === category.id}
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
        </section>
      </div>
    </AdminLayout>
  );
}

function CategoryStatusBadge({ isActive }) {
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