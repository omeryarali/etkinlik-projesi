"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  ActionButton,
  AdminSurface,
  EmptyPanel,
  HeroAsidePanel,
  HeroMiniStat,
  LoadingPanel,
  Notice,
  PageHero,
  StatusPill,
} from "../../components/admin-ui";
import { apiFetch } from "../../lib/api";
import { getAdminToken, redirectToLogin } from "../../lib/auth";

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
      const token = getAdminToken();

      if (!token) {
        redirectToLogin();
        return;
      }

      const data = await apiFetch("/api/Category", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Kategoriler alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(event) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const token = getAdminToken();

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
      setLoading(true);
      await loadCategories();
    } catch (err) {
      setError(err.message || "Kategori oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  }

  async function activateCategory(id) {
    const confirmed = window.confirm(
      "Bu kategoriyi aktif hale getirmek istediğinize emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    await runCategoryAction(id, `/api/Category/${id}/activate`);
  }

  async function deactivateCategory(id) {
    const confirmed = window.confirm(
      "Bu kategoriyi pasif hale getirmek istediğinize emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    await runCategoryAction(id, `/api/Category/${id}/deactivate`);
  }

  async function runCategoryAction(id, path) {
    try {
      setActionLoadingId(id);
      setError("");
      setSuccess("");

      const token = getAdminToken();

      await apiFetch(path, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Kategori durumu güncellendi.");
      setLoading(true);
      await loadCategories();
    } catch (err) {
      setError(err.message || "İşlem başarısız oldu.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      try {
        const token = getAdminToken();

        if (!token) {
          redirectToLogin();
          return;
        }

        const data = await apiFetch("/api/Category", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) {
          return;
        }

        setCategories(data || []);
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message || "Kategoriler alınamadı.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  const activeCount = categories.filter((item) => item.isActive).length;

  return (
    <AdminLayout
      title="Kategoriler"
      description="Etkinlik sınıflarını düzenle, aktif/pasif durumlarını yönet ve içerik yapısını temiz tut."
    >
      <div className="space-y-6">
        <PageHero
          eyebrow="İçerik mimarisi"
          title="Kategori yapısını düzenli ve okunur tut."
          description="BiKatıl akışının doğru sınıflandırılması; keşif deneyimi, filtreleme kalitesi ve organizer yönlendirmesi için kritik."
          aside={
            <HeroAsidePanel>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Kategori özeti
                </p>
                <div className="rounded-[22px] border border-[#d39a7b]/20 bg-[linear-gradient(180deg,rgba(255,239,227,0.12),rgba(255,255,255,0.05))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,250,246,0.08)]">
                  <p className="text-sm text-[#ead8cb]">Toplam kategori</p>
                  <p className="mt-2 font-[family:var(--font-admin-display)] text-4xl text-white">
                    {categories.length}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Aktif" value={activeCount} />
                  <MiniStat label="Pasif" value={categories.length - activeCount} />
                </div>
              </div>
            </HeroAsidePanel>
          }
        >
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="contrast">{activeCount} aktif kategori</StatusPill>
          </div>
        </PageHero>

        {error ? (
          <Notice
            tone="danger"
            title="Kategori işlemi başarısız"
            description={error}
          />
        ) : null}

        {success ? (
          <Notice
            tone="success"
            title="İşlem tamamlandı"
            description={success}
          />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <AdminSurface className="space-y-5">
            <div className="space-y-2">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#a16846]">
                Yeni kategori
              </p>
              <h3 className="font-[family:var(--font-admin-display)] text-3xl text-[#241a16]">
                İçerik başlığı ekle
              </h3>
              <p className="text-sm leading-6 text-[#6f5a4f]">
                Keşif akışında kullanılacak yeni kategori başlığını ve açıklamasını oluştur.
              </p>
            </div>

            <form onSubmit={createCategory} className="space-y-4">
              <Field
                label="Kategori adı"
                value={name}
                onChange={setName}
                placeholder="Örn: Networking"
              />

              <Field
                label="Açıklama"
                value={description}
                onChange={setDescription}
                placeholder="Bu kategorinin keşif akışındaki yerini açıkla"
                multiline
              />

              <ActionButton
                type="submit"
                tone="primary"
                disabled={creating}
                className="w-full"
              >
                {creating ? "Kategori ekleniyor..." : "Kategori Ekle"}
              </ActionButton>
            </form>
          </AdminSurface>

          {loading ? (
            <LoadingPanel
              title="Kategori listesi hazırlanıyor"
              description="Mevcut kategori yapısı kısa süre içinde bu alanda görünecek."
            />
          ) : categories.length === 0 ? (
            <EmptyPanel
              title="Kategori bulunamadı"
              description="İlk kategoriyi oluşturarak içerik yapısını başlatabilirsin."
            />
          ) : (
            <AdminSurface padded={false} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-[#eee1d5] bg-[#fbf6f1]">
                    <tr>
                      <HeaderCell>ID</HeaderCell>
                      <HeaderCell>Kategori</HeaderCell>
                      <HeaderCell>Durum</HeaderCell>
                      <HeaderCell align="right">İşlemler</HeaderCell>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#f0e4d8]">
                    {categories.map((category) => (
                      <tr key={category.id} className="bg-white/72 transition hover:bg-[#fcf7f2]">
                        <Cell>{category.id}</Cell>
                        <Cell>
                          <div>
                            <p className="font-semibold text-[#241a16]">{category.name}</p>
                            <p className="mt-1 text-xs leading-5 text-[#816e63]">
                              {category.description || "Açıklama girilmedi."}
                            </p>
                          </div>
                        </Cell>
                        <Cell>
                          <StatusPill tone={category.isActive ? "success" : "danger"}>
                            {category.isActive ? "Aktif" : "Pasif"}
                          </StatusPill>
                        </Cell>
                        <Cell align="right">
                          {category.isActive ? (
                            <ActionButton
                              tone="warning"
                              onClick={() => deactivateCategory(category.id)}
                              disabled={actionLoadingId === category.id}
                            >
                              Pasif Yap
                            </ActionButton>
                          ) : (
                            <ActionButton
                              tone="success"
                              onClick={() => activateCategory(category.id)}
                              disabled={actionLoadingId === category.id}
                            >
                              Aktif Yap
                            </ActionButton>
                          )}
                        </Cell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminSurface>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, placeholder, multiline = false }) {
  const baseClassName =
    "min-h-12 rounded-[22px] border border-[#e4d5c8] bg-white/92 px-4 text-[#241a16] outline-none transition focus:border-[#c47a53] focus:ring-2 focus:ring-[#f2d4be]";

  return (
    <label className="grid gap-2 text-sm text-[#6f5a4f]">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${baseClassName} min-h-32 py-3`}
          placeholder={placeholder}
          rows={5}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${baseClassName} py-3`}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function HeaderCell({ children, align = "left" }) {
  return (
    <th
      className={`px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c7769] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Cell({ children, align = "left" }) {
  return (
    <td
      className={`px-5 py-4 align-top text-[#645347] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function MiniStat({ label, value }) {
  const toneMap = {
    Aktif: "warm",
    Pasif: "rose",
  };

  return <HeroMiniStat label={label} value={value} tone={toneMap[label] || "neutral"} />;
}
