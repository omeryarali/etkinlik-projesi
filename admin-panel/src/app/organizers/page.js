"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import {
  ActionButton,
  AdminSurface,
  DetailModal,
  EmptyPanel,
  FilterSelect,
  HeroAsidePanel,
  HeroMiniStat,
  InfoRow,
  InfoSection,
  LoadingPanel,
  Notice,
  PageHero,
  PaginationBar,
  StatusPill,
  formatAdminDate,
} from "../../components/admin-ui";
import { apiFetch } from "../../lib/api";
import { getAdminToken, redirectToLogin } from "../../lib/auth";

export default function OrganizersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [organizers, setOrganizers] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function loadOrganizers(selectedStatus = status, selectedPage = page) {
    try {
      const token = getAdminToken();

      if (!token) {
        redirectToLogin();
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
      setError("");
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

  function handleStatusChange(event) {
    const selectedStatus = event.target.value;
    setLoading(true);
    setError("");
    setStatus(selectedStatus);
    setPage(1);
  }

  function goToPage(newPage) {
    setLoading(true);
    setError("");
    setPage(newPage);
  }

  useEffect(() => {
    let active = true;

    async function fetchOrganizers() {
      try {
        const token = getAdminToken();

        if (!token) {
          redirectToLogin();
          return;
        }

        const queryParams = new URLSearchParams();

        if (status) {
          queryParams.append("status", status);
        }

        queryParams.append("page", page);
        queryParams.append("pageSize", 10);

        const data = await apiFetch(`/api/Admin/organizers?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) {
          return;
        }

        setOrganizers(data.items || []);
        setPageInfo(data);
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message || "Organizatörler alınamadı.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchOrganizers();

    return () => {
      active = false;
    };
  }, [page, status]);

  const pendingCount = organizers.filter((item) => item.status === "Pending").length;

  return (
    <AdminLayout
      title="Organizatörler"
      description="Başvuruları değerlendir, aktif organizer hesaplarını denetle ve topluluk güvenini koru."
    >
      <div className="space-y-6">
        <PageHero
          eyebrow="Organizer ağı"
          title="Topluluğu taşıyan organizer katmanını düzenli yönet."
          description="Başvuru kalitesini yükseltmek, bölgesel dağılımı net görmek ve askıya alınması gereken profilleri hızlıca ayırmak için bu paneli kullan."
          aside={
            <HeroAsidePanel>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Başvuru özeti
                </p>
                <div className="rounded-[22px] border border-[#d39a7b]/20 bg-[linear-gradient(180deg,rgba(255,239,227,0.12),rgba(255,255,255,0.05))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,250,246,0.08)]">
                  <p className="text-sm text-[#ead8cb]">Toplam sonuç</p>
                  <p className="mt-2 font-[family:var(--font-admin-display)] text-4xl text-white">
                    {pageInfo?.totalCount ?? 0}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Bekleyen" value={pendingCount} />
                  <MiniStat label="Filtre" value={status || "Tümü"} />
                </div>
              </div>
            </HeroAsidePanel>
          }
        >
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="contrast">{status || "Tüm durumlar"}</StatusPill>
            <StatusPill tone="contrast">{pendingCount} bekleyen başvuru</StatusPill>
          </div>
        </PageHero>

        <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <FilterSelect label="Durum filtresi" value={status} onChange={handleStatusChange}>
            <option value="">Tümü</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Suspended">Suspended</option>
          </FilterSelect>

          <div className="rounded-[24px] border border-[#eadccf] bg-[#f7f0e7]/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
              Sayfa özeti
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f5a4f]">
              Bu görünümde {organizers.length} organizer kaydı listeleniyor.
            </p>
          </div>
        </AdminSurface>

        {error ? (
          <Notice
            tone="danger"
            title="Organizer verileri alınamadı"
            description={error}
          />
        ) : null}

        {loading ? (
          <LoadingPanel
            title="Organizer listesi hazırlanıyor"
            description="Başvuru durumları ve bölgesel bilgiler kısa süre içinde tabloya yerleşecek."
          />
        ) : organizers.length === 0 ? (
          <EmptyPanel
            title="Organizer kaydı bulunamadı"
            description="Seçtiğin filtreye uygun organizer görünmüyor. Farklı bir durum filtresiyle yeniden deneyebilirsin."
            actionLabel="Filtreyi Temizle"
            onAction={() => {
              setLoading(true);
              setError("");
              setStatus("");
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
                    <HeaderCell>Organizatör</HeaderCell>
                    <HeaderCell>Tip</HeaderCell>
                    <HeaderCell>Konum</HeaderCell>
                    <HeaderCell>Telefon</HeaderCell>
                    <HeaderCell>Durum</HeaderCell>
                    <HeaderCell align="right">İşlemler</HeaderCell>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0e4d8]">
                  {organizers.map((organizer) => (
                    <tr key={organizer.id} className="bg-white/72 transition hover:bg-[#fcf7f2]">
                      <Cell>{organizer.id}</Cell>
                      <Cell>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#241a16]">
                            {organizer.organizerName}
                          </p>
                          <p className="max-w-xs text-xs leading-5 text-[#816e63]">
                            {organizer.description || "Açıklama girilmedi."}
                          </p>
                        </div>
                      </Cell>
                      <Cell>{organizer.organizerType}</Cell>
                      <Cell>{organizer.city} / {organizer.district}</Cell>
                      <Cell>{organizer.phoneNumber}</Cell>
                      <Cell>
                        <OrganizerStatusBadge status={organizer.status} />
                      </Cell>
                      <Cell align="right">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            tone="secondary"
                            onClick={() => setSelectedOrganizer(organizer)}
                          >
                            Detay
                          </ActionButton>

                          {organizer.status === "Pending" ? (
                            <ActionButton
                              tone="success"
                              onClick={() => approveOrganizer(organizer.id)}
                              disabled={actionLoadingId === organizer.id}
                            >
                              Onayla
                            </ActionButton>
                          ) : null}

                          {organizer.status === "Approved" ? (
                            <ActionButton
                              tone="warning"
                              onClick={() => suspendOrganizer(organizer.id)}
                              disabled={actionLoadingId === organizer.id}
                            >
                              Askıya Al
                            </ActionButton>
                          ) : null}

                          {organizer.status === "Suspended" ? (
                            <ActionButton
                              tone="primary"
                              onClick={() => reactivateOrganizer(organizer.id)}
                              disabled={actionLoadingId === organizer.id}
                            >
                              Aktif Et
                            </ActionButton>
                          ) : null}
                        </div>
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

        <DetailModal
          open={!!selectedOrganizer}
          title={selectedOrganizer?.organizerName}
          subtitle={
            selectedOrganizer
              ? `Organizer ID: ${selectedOrganizer.id} · Kullanıcı ID: ${selectedOrganizer.userId}`
              : ""
          }
          onClose={() => setSelectedOrganizer(null)}
          footer={
            selectedOrganizer ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {selectedOrganizer.status === "Pending" ? (
                  <ActionButton
                    tone="success"
                    onClick={() => approveOrganizer(selectedOrganizer.id)}
                    disabled={actionLoadingId === selectedOrganizer.id}
                  >
                    Onayla
                  </ActionButton>
                ) : null}
                {selectedOrganizer.status === "Approved" ? (
                  <ActionButton
                    tone="warning"
                    onClick={() => suspendOrganizer(selectedOrganizer.id)}
                    disabled={actionLoadingId === selectedOrganizer.id}
                  >
                    Askıya Al
                  </ActionButton>
                ) : null}
                {selectedOrganizer.status === "Suspended" ? (
                  <ActionButton
                    tone="primary"
                    onClick={() => reactivateOrganizer(selectedOrganizer.id)}
                    disabled={actionLoadingId === selectedOrganizer.id}
                  >
                    Aktif Et
                  </ActionButton>
                ) : null}
              </div>
            ) : null
          }
        >
          {selectedOrganizer ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <OrganizerStatusBadge status={selectedOrganizer.status} />
              </div>

              <InfoSection title="Organizer bilgileri">
                <InfoRow label="Organizer adı" value={selectedOrganizer.organizerName} />
                <InfoRow label="Organizer tipi" value={selectedOrganizer.organizerType} />
                <InfoRow label="Açıklama" value={selectedOrganizer.description} />
                <InfoRow label="Telefon" value={selectedOrganizer.phoneNumber} />
                <InfoRow label="Instagram" value={selectedOrganizer.instagramUrl || "-"} />
              </InfoSection>

              <InfoSection title="Konum ve tarih">
                <InfoRow
                  label="Şehir / ilçe"
                  value={`${selectedOrganizer.city} / ${selectedOrganizer.district}`}
                />
                <InfoRow
                  label="Oluşturulma tarihi"
                  value={formatAdminDate(selectedOrganizer.createdAt)}
                />
                <InfoRow
                  label="Onay tarihi"
                  value={formatAdminDate(selectedOrganizer.approvedAt)}
                />
              </InfoSection>

              <InfoSection title="Durum notu">
                <InfoRow
                  label="Red sebebi"
                  value={selectedOrganizer.rejectionReason || "-"}
                />
              </InfoSection>
            </div>
          ) : null}
        </DetailModal>
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
    Bekleyen: "warm",
    Filtre: "rose",
  };

  return <HeroMiniStat label={label} value={value} tone={toneMap[label] || "neutral"} />;
}

function OrganizerStatusBadge({ status }) {
  const tones = {
    Pending: "warning",
    Approved: "success",
    Rejected: "danger",
    Suspended: "info",
  };

  return <StatusPill tone={tones[status] || "neutral"}>{status}</StatusPill>;
}
