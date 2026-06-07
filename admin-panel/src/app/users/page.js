"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import {
  ActionButton,
  AdminSurface,
  EmptyPanel,
  FilterSelect,
  HeroAsidePanel,
  HeroMiniStat,
  LoadingPanel,
  Notice,
  PageHero,
  PaginationBar,
  StatusPill,
  formatAdminDate,
} from "../../components/admin-ui";
import { apiFetch } from "../../lib/api";
import { getAdminToken, redirectToLogin } from "../../lib/auth";

export default function UsersPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "";

  const [users, setUsers] = useState([]);
  const [role, setRole] = useState(initialRole);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function loadUsers(selectedRole = role, selectedPage = page) {
    try {
      const token = getAdminToken();

      if (!token) {
        redirectToLogin();
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
      setError("");
    } catch (err) {
      setError(err.message || "Kullanıcılar alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function activateUser(id) {
    const confirmed = window.confirm(
      "Bu kullanıcıyı aktif hale getirmek istediğinize emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

    await runUserAction(id, `/api/Admin/users/${id}/activate`);
  }

  async function deactivateUser(id) {
    const confirmed = window.confirm(
      "Bu kullanıcıyı pasif hale getirmek istediğinize emin misiniz?"
    );

    if (!confirmed) {
      return;
    }

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

  function handleRoleChange(event) {
    const selectedRole = event.target.value;
    setLoading(true);
    setError("");
    setRole(selectedRole);
    setPage(1);
  }

  function goToPage(newPage) {
    setLoading(true);
    setError("");
    setPage(newPage);
  }

  useEffect(() => {
    let active = true;

    async function fetchUsers() {
      try {
        const token = getAdminToken();

        if (!token) {
          redirectToLogin();
          return;
        }

        const queryParams = new URLSearchParams();

        if (role) {
          queryParams.append("role", role);
        }

        queryParams.append("page", page);
        queryParams.append("pageSize", 10);

        const data = await apiFetch(`/api/Admin/users?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) {
          return;
        }

        setUsers(data.items || []);
        setPageInfo(data);
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message || "Kullanıcılar alınamadı.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchUsers();

    return () => {
      active = false;
    };
  }, [page, role]);

  const activeCount = users.filter((item) => item.isActive).length;
  const organizerCount = users.filter((item) => item.role === "Organizer").length;

  return (
    <AdminLayout
      title="Kullanıcılar"
      description="Sistemdeki hesapları, rollerini ve aktiflik durumlarını yönet."
    >
      <div className="space-y-6">
        <PageHero
          eyebrow="Hesap merkezi"
          title="Kullanıcı tablosunu net, hızlı ve güvenli yönet."
          description="Rol geçişlerini izle, pasif hesapları kontrol et ve platform kalitesini koruyan temel kullanıcı aksiyonlarını yönet."
          aside={
            <HeroAsidePanel>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Canlı özet
                </p>
                <div className="rounded-[22px] border border-[#d39a7b]/20 bg-[linear-gradient(180deg,rgba(255,239,227,0.12),rgba(255,255,255,0.05))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,250,246,0.08)]">
                  <p className="text-sm text-[#ead8cb]">Toplam sonuç</p>
                  <p className="mt-2 font-[family:var(--font-admin-display)] text-4xl text-white">
                    {pageInfo?.totalCount ?? 0}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Aktif" value={activeCount} />
                  <MiniStat label="Organizer" value={organizerCount} />
                </div>
              </div>
            </HeroAsidePanel>
          }
        >
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="contrast">{role || "Tüm roller"}</StatusPill>
            <StatusPill tone="contrast">{activeCount} aktif kayıt</StatusPill>
          </div>
        </PageHero>

        <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-2">
            <FilterSelect label="Rol filtresi" value={role} onChange={handleRoleChange}>
              <option value="">Tümü</option>
              <option value="Participant">Participant</option>
              <option value="Organizer">Organizer</option>
              <option value="Admin">Admin</option>
            </FilterSelect>
          </div>

          <div className="rounded-[24px] border border-[#eadccf] bg-[#f7f0e7]/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
              Sayfa özeti
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f5a4f]">
              Bu görünümde {users.length} kayıt listeleniyor.
            </p>
          </div>
        </AdminSurface>

        {error ? (
          <Notice
            tone="danger"
            title="Kullanıcı verileri alınamadı"
            description={error}
          />
        ) : null}

        {loading ? (
          <LoadingPanel
            title="Kullanıcı listesi hazırlanıyor"
            description="Rol ve durum bilgileri kısa süre içinde tabloya yerleşecek."
          />
        ) : users.length === 0 ? (
          <EmptyPanel
            title="Kullanıcı bulunamadı"
            description="Seçtiğin filtreye uygun hesap görünmüyor. Filtreyi genişletip tekrar deneyebilirsin."
            actionLabel="Filtreyi Temizle"
            onAction={() => {
              setLoading(true);
              setError("");
              setRole("");
              setPage(1);
            }}
          />
        ) : (
          <AdminSurface padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-[#eee1d5] bg-[#fbf6f1]">
                  <tr>
                    <HeaderCell>ID</HeaderCell>
                    <HeaderCell>Kullanıcı</HeaderCell>
                    <HeaderCell>Telefon</HeaderCell>
                    <HeaderCell>Rol</HeaderCell>
                    <HeaderCell>Durum</HeaderCell>
                    <HeaderCell>Kayıt Tarihi</HeaderCell>
                    <HeaderCell align="right">İşlemler</HeaderCell>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0e4d8]">
                  {users.map((user) => (
                    <tr key={user.id} className="bg-white/72 transition hover:bg-[#fcf7f2]">
                      <Cell>{user.id}</Cell>
                      <Cell>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#eadccf] bg-[#f7ede4] text-sm font-semibold text-[#7b523d]"
                            style={
                              user.profileImageUrl
                                ? {
                                    backgroundImage: `url(${user.profileImageUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : undefined
                            }
                          >
                            {user.profileImageUrl ? (
                              <span className="sr-only">{user.fullName}</span>
                            ) : (
                              user.fullName?.charAt(0)?.toUpperCase() || "U"
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#241a16]">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-[#816e63]">{user.email}</p>
                          </div>
                        </div>
                      </Cell>
                      <Cell>{user.phoneNumber || "-"}</Cell>
                      <Cell>
                        <RoleBadge role={user.role} />
                      </Cell>
                      <Cell>
                        <UserStatusBadge isActive={user.isActive} />
                      </Cell>
                      <Cell>{formatAdminDate(user.createdAt)}</Cell>
                      <Cell align="right">
                        {user.isActive ? (
                          <ActionButton
                            tone="danger"
                            onClick={() => deactivateUser(user.id)}
                            disabled={actionLoadingId === user.id}
                          >
                            Pasif Yap
                          </ActionButton>
                        ) : (
                          <ActionButton
                            tone="success"
                            onClick={() => activateUser(user.id)}
                            disabled={actionLoadingId === user.id}
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

        <PaginationBar
          pageInfo={pageInfo}
          onPrevious={() => goToPage(page - 1)}
          onNext={() => goToPage(page + 1)}
        />
      </div>
    </AdminLayout>
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
    Organizer: "sand",
  };

  return <HeroMiniStat label={label} value={value} tone={toneMap[label] || "neutral"} />;
}

function RoleBadge({ role }) {
  const tones = {
    Admin: "danger",
    Organizer: "info",
    Participant: "neutral",
  };

  return <StatusPill tone={tones[role] || "neutral"}>{role}</StatusPill>;
}

function UserStatusBadge({ isActive }) {
  return (
    <StatusPill tone={isActive ? "success" : "danger"}>
      {isActive ? "Aktif" : "Pasif"}
    </StatusPill>
  );
}
