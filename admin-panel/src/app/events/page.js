"use client";

import { Suspense, useEffect, useState } from "react";
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

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageFallback />}>
      <EventsPageContent />
    </Suspense>
  );
}

function EventsPageContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function loadEvents(selectedStatus = status, selectedPage = page) {
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

      const data = await apiFetch(`/api/Admin/events?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(data.items || []);
      setPageInfo(data);
      setError("");
    } catch (err) {
      setError(err.message || "Etkinlikler alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function approveEvent(id) {
    const confirmed = window.confirm("Bu etkinliği onaylamak istediğinize emin misiniz?");

    if (!confirmed) {
      return;
    }

    await runEventAction(id, `/api/Admin/events/${id}/approve`);
  }

  async function rejectEvent(id) {
    const confirmed = window.confirm("Bu etkinliği reddetmek istediğinize emin misiniz?");

    if (!confirmed) {
      return;
    }

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

      setSelectedEvent(null);
      await loadEvents(status, page);
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

    async function fetchEvents() {
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

        const data = await apiFetch(`/api/Admin/events?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) {
          return;
        }

        setEvents(data.items || []);
        setPageInfo(data);
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message || "Etkinlikler alınamadı.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchEvents();

    return () => {
      active = false;
    };
  }, [page, status]);

  const pendingCount = events.filter((item) => item.status === "Pending").length;

  return (
    <AdminLayout
      title="Etkinlikler"
      description="Onay sürecindeki ve yayındaki etkinlikleri kalite odaklı şekilde yönet."
    >
      <div className="space-y-6">
        <PageHero
          eyebrow="Etkinlik kontrolü"
          title="Başvurudan yayına kadar tüm etkinlikleri tek merkezden değerlendir."
          description="Organizatör kalitesi, içerik netliği, kapasite dengesi ve konum doğruluğu için etkinlik kuyruğunu düzenli takip et."
          aside={
            <HeroAsidePanel>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Kuyruk özeti
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
            <StatusPill tone="contrast">{pendingCount} bekleyen kayıt</StatusPill>
          </div>
        </PageHero>

        <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <FilterSelect label="Durum filtresi" value={status} onChange={handleStatusChange}>
            <option value="">Tümü</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </FilterSelect>

          <div className="rounded-[24px] border border-[#eadccf] bg-[#f7f0e7]/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
              Sayfa özeti
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f5a4f]">
              Bu görünümde {events.length} etkinlik listeleniyor.
            </p>
          </div>
        </AdminSurface>

        {error ? (
          <Notice
            tone="danger"
            title="Etkinlik verileri alınamadı"
            description={error}
          />
        ) : null}

        {loading ? (
          <LoadingPanel
            title="Etkinlik kuyruğu hazırlanıyor"
            description="Başvuru durumu, kapasite ve içerik bilgileri kısa süre içinde tabloya yerleşecek."
          />
        ) : events.length === 0 ? (
          <EmptyPanel
            title="Etkinlik bulunamadı"
            description="Seçtiğin filtreye uygun etkinlik görünmüyor. Farklı bir durum filtresiyle yeniden deneyebilirsin."
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
                    <HeaderCell>Etkinlik</HeaderCell>
                    <HeaderCell>Organizatör</HeaderCell>
                    <HeaderCell>Kategori</HeaderCell>
                    <HeaderCell>Konum</HeaderCell>
                    <HeaderCell>Tarih</HeaderCell>
                    <HeaderCell>Kontenjan</HeaderCell>
                    <HeaderCell>Durum</HeaderCell>
                    <HeaderCell align="right">İşlemler</HeaderCell>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0e4d8]">
                  {events.map((event) => (
                    <tr key={event.id} className="bg-white/72 transition hover:bg-[#fcf7f2]">
                      <Cell>{event.id}</Cell>
                      <Cell>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#241a16]">{event.title}</p>
                          <p className="max-w-xs text-xs leading-5 text-[#816e63]">
                            {event.description || "Açıklama girilmedi."}
                          </p>
                          <p className="text-xs font-medium text-[#b06a47]">
                            {event.isPaid ? `${event.price ?? 0} TL` : "Ücretsiz"}
                          </p>
                        </div>
                      </Cell>
                      <Cell>{event.organizerName}</Cell>
                      <Cell>{event.categoryName}</Cell>
                      <Cell>
                        <div className="space-y-1">
                          <p>{event.city} / {event.district}</p>
                          <p className="text-xs text-[#8a7668]">{event.locationName}</p>
                        </div>
                      </Cell>
                      <Cell>{formatAdminDate(event.startDate)}</Cell>
                      <Cell>{event.participantCount} / {event.capacity}</Cell>
                      <Cell>
                        <EventStatusBadge status={event.status} />
                      </Cell>
                      <Cell align="right">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            tone="secondary"
                            onClick={() => setSelectedEvent(event)}
                          >
                            Detay
                          </ActionButton>

                          {event.status === "Pending" ? (
                            <>
                              <ActionButton
                                tone="success"
                                onClick={() => approveEvent(event.id)}
                                disabled={actionLoadingId === event.id}
                              >
                                Onayla
                              </ActionButton>
                              <ActionButton
                                tone="danger"
                                onClick={() => rejectEvent(event.id)}
                                disabled={actionLoadingId === event.id}
                              >
                                Reddet
                              </ActionButton>
                            </>
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
          open={!!selectedEvent}
          title={selectedEvent?.title}
          subtitle={
            selectedEvent
              ? `${selectedEvent.categoryName} · ${selectedEvent.organizerName}`
              : ""
          }
          onClose={() => setSelectedEvent(null)}
          footer={
            selectedEvent?.status === "Pending" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <ActionButton
                  tone="danger"
                  onClick={() => rejectEvent(selectedEvent.id)}
                  disabled={actionLoadingId === selectedEvent.id}
                >
                  Reddet
                </ActionButton>
                <ActionButton
                  tone="success"
                  onClick={() => approveEvent(selectedEvent.id)}
                  disabled={actionLoadingId === selectedEvent.id}
                >
                  Onayla
                </ActionButton>
              </div>
            ) : null
          }
        >
          {selectedEvent ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <EventStatusBadge status={selectedEvent.status} />
                <StatusPill tone={selectedEvent.isPaid ? "warning" : "success"}>
                  {selectedEvent.isPaid ? "Ücretli" : "Ücretsiz"}
                </StatusPill>
              </div>

              <InfoSection title="Temel bilgiler">
                <InfoRow label="Başlık" value={selectedEvent.title} />
                <InfoRow label="Açıklama" value={selectedEvent.description} />
                <InfoRow label="Organizatör" value={selectedEvent.organizerName} />
                <InfoRow label="Kategori" value={selectedEvent.categoryName} />
              </InfoSection>

              <InfoSection title="Tarih ve konum">
                <InfoRow label="Başlangıç" value={formatAdminDate(selectedEvent.startDate)} />
                <InfoRow label="Bitiş" value={formatAdminDate(selectedEvent.endDate)} />
                <InfoRow
                  label="Şehir / ilçe"
                  value={`${selectedEvent.city} / ${selectedEvent.district}`}
                />
                <InfoRow label="Konum adı" value={selectedEvent.locationName} />
                <InfoRow label="Adres" value={selectedEvent.address} />
              </InfoSection>

              <InfoSection title="Katılım ve içerik">
                <InfoRow
                  label="Kontenjan"
                  value={`${selectedEvent.participantCount} / ${selectedEvent.capacity}`}
                />
                <InfoRow
                  label="Ücret"
                  value={
                    selectedEvent.isPaid ? `${selectedEvent.price ?? 0} TL` : "Ücretsiz"
                  }
                />
                <InfoRow label="Kurallar" value={selectedEvent.rules || "-"} />
                <InfoRow label="Kapak görseli" value={selectedEvent.coverImageUrl || "-"} />
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
    Filtre: "sand",
  };

  return <HeroMiniStat label={label} value={value} tone={toneMap[label] || "neutral"} />;
}

function EventStatusBadge({ status }) {
  const tones = {
    Pending: "warning",
    Approved: "success",
    Rejected: "danger",
    Cancelled: "neutral",
    Completed: "info",
  };

  return <StatusPill tone={tones[status] || "neutral"}>{status}</StatusPill>;
}

function EventsPageFallback() {
  return (
    <AdminLayout
      title="Etkinlikler"
      description="Onay surecindeki ve yayindaki etkinlikleri kalite odakli sekilde yonet."
    >
      <LoadingPanel
        title="Etkinlik paneli hazirlaniyor"
        description="Filtreler ve etkinlik kuyrugu yukleniyor."
      />
    </AdminLayout>
  );
}
