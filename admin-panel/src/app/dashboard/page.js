"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  AdminSurface,
  HeroAsidePanel,
  HeroMiniStat,
  MetricCard,
  Notice,
  PageHero,
  StatusPill,
} from "../../components/admin-ui";
import { apiFetch } from "../../lib/api";
import { getAdminToken, redirectToLogin } from "../../lib/auth";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const token = getAdminToken();

        if (!token) {
          redirectToLogin();
          return;
        }

        const data = await apiFetch("/api/Admin/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(data);
      } catch (err) {
        setError(err.message || "Dashboard verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  const overviewCards = [
    {
      eyebrow: "Kullanıcılar",
      title: "Toplam kullanıcı",
      value: stats?.totalUsers,
      helper: `${stats?.activeUsers ?? 0} aktif, ${stats?.passiveUsers ?? 0} pasif hesap`,
      href: "/users",
      tone: "accent",
    },
    {
      eyebrow: "Organizer",
      title: "Toplam organizer",
      value: stats?.totalOrganizers,
      helper: `${stats?.pendingOrganizers ?? 0} bekliyor, ${stats?.approvedOrganizers ?? 0} onaylı`,
      href: "/organizers",
      tone: "default",
    },
    {
      eyebrow: "Etkinlikler",
      title: "Toplam etkinlik",
      value: stats?.totalEvents,
      helper: `${stats?.pendingEvents ?? 0} onay bekliyor, ${stats?.approvedEvents ?? 0} yayında`,
      href: "/events",
      tone: "muted",
    },
    {
      eyebrow: "Katılım",
      title: "Toplam katılım",
      value: stats?.totalParticipants,
      helper: `${stats?.attendedParticipants ?? 0} geldi, ${stats?.noShowParticipants ?? 0} gelmedi`,
      href: "/events",
      tone: "accent",
    },
  ];

  const quickLinks = [
    {
      title: "Bekleyen organizer başvuruları",
      value: stats?.pendingOrganizers ?? 0,
      href: "/organizers?status=Pending",
      tone: "warning",
    },
    {
      title: "Bekleyen etkinlik onayları",
      value: stats?.pendingEvents ?? 0,
      href: "/events?status=Pending",
      tone: "warning",
    },
    {
      title: "Askıdaki organizer hesapları",
      value: stats?.suspendedOrganizers ?? 0,
      href: "/organizers?status=Suspended",
      tone: "danger",
    },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      description="Sistem genel görünümü, operasyon yoğunluğu ve hızlı müdahale alanları."
    >
      <div className="space-y-6">
        <PageHero
          eyebrow="Operasyon görünümü"
          title="BiKatıl platformunun nabzı burada atıyor."
          description="Kullanıcı artışını, organizer kuyruğunu, etkinlik onay akışını ve katılım kalitesini tek panelden takip et."
          aside={
            <HeroAsidePanel>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                    Öncelikli alan
                  </p>
                  <h3 className="mt-2 font-[family:var(--font-admin-display)] text-3xl text-white">
                    Günlük kontrol listesi
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[22px] border border-[#d39a7b]/20 bg-[linear-gradient(180deg,rgba(255,239,227,0.12),rgba(255,255,255,0.05))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,250,246,0.08)]">
                    <p className="text-sm font-semibold text-white">
                      {stats?.pendingEvents ?? 0} etkinlik onay bekliyor
                    </p>
                    <p className="mt-1 text-sm text-[#ecd6c7]">
                      İçerik kalitesi ve tarih doğruluğu için hızlı inceleme yap.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-[#d39a7b]/20 bg-[linear-gradient(180deg,rgba(255,239,227,0.12),rgba(255,255,255,0.05))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,250,246,0.08)]">
                    <p className="text-sm font-semibold text-white">
                      {stats?.pendingOrganizers ?? 0} organizer başvurusu açık
                    </p>
                    <p className="mt-1 text-sm text-[#ecd6c7]">
                      Topluluk güveni için kimlik ve bölge bilgilerini netleştir.
                    </p>
                  </div>
                </div>
              </div>
            </HeroAsidePanel>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <StatusStrip
              label="Yayındaki etkinlik"
              value={stats?.approvedEvents ?? 0}
              tone="warm"
            />
            <StatusStrip
              label="Aktif kullanıcı"
              value={stats?.activeUsers ?? 0}
              tone="sand"
            />
            <StatusStrip
              label="Onaylı organizer"
              value={stats?.approvedOrganizers ?? 0}
              tone="rose"
            />
          </div>
        </PageHero>

        {error ? (
          <Notice
            tone="danger"
            title="Dashboard verileri alınamadı"
            description={error}
          />
        ) : null}

        <div className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
          {overviewCards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>

        {loading ? (
          <AdminSurface tone="muted">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e6d3c2] bg-white/80">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dba17f] border-t-transparent" />
              </div>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#a16846]">
                  Canlı veri
                </p>
                <h3 className="font-[family:var(--font-admin-display)] text-3xl text-[#241a16]">
                  Dashboard hazırlanıyor
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#6f5a4f]">
                  İstatistik panelleri yüklenirken öncelikli alanlar kısa süre içinde dolacak.
                </p>
              </div>
            </div>
          </AdminSurface>
        ) : null}

        {stats ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <AdminSurface className="space-y-5">
              <div className="space-y-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#a16846]">
                  Hızlı müdahale
                </p>
                <h3 className="font-[family:var(--font-admin-display)] text-3xl text-[#241a16]">
                  Öncelikli işlem kutusu
                </h3>
                <p className="text-sm leading-6 text-[#6f5a4f]">
                  Platformın bugün en fazla aksiyon gerektiren başlıkları.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(59,38,28,0.1)] ${quickLinkToneClasses[item.tone] || quickLinkToneClasses.neutral}`}
                  >
                    <StatusPill tone={item.tone}>{item.value} kayıt</StatusPill>
                    <p className="mt-4 text-lg font-semibold text-[#241a16]">
                      {item.title}
                    </p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#be6d44]">
                      Listeyi aç
                    </p>
                  </Link>
                ))}
              </div>
            </AdminSurface>

            <AdminSurface tone="muted" className="space-y-5">
              <div className="space-y-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#a16846]">
                  Sistem dengesi
                </p>
                <h3 className="font-[family:var(--font-admin-display)] text-3xl text-[#241a16]">
                  Operasyon notları
                </h3>
              </div>

              <InsightRow
                label="Katılım kalitesi"
                value={`${stats.attendedParticipants ?? 0} geldi / ${stats.noShowParticipants ?? 0} gelmedi`}
              />
              <InsightRow
                label="Organizer kalitesi"
                value={`${stats.approvedOrganizers ?? 0} onaylı / ${stats.rejectedOrganizers ?? 0} reddedildi`}
              />
              <InsightRow
                label="Etkinlik sağlığı"
                value={`${stats.completedEvents ?? 0} tamamlandı / ${stats.cancelledEvents ?? 0} iptal edildi`}
              />
              <InsightRow
                label="Kullanıcı canlılığı"
                value={`${stats.activeUsers ?? 0} aktif / ${stats.passiveUsers ?? 0} pasif`}
              />
            </AdminSurface>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function StatusStrip({ label, value, tone }) {
  return (
    <HeroMiniStat
      label={label}
      value={value ?? 0}
      tone={tone}
      valueClassName="font-[family:var(--font-admin-display)] text-4xl"
    />
  );
}

function InsightRow({ label, value }) {
  return (
    <div className="rounded-[22px] border border-[#e3d1c2] bg-[linear-gradient(180deg,rgba(255,251,247,0.95),rgba(246,236,227,0.9))] px-4 py-4 shadow-[0_12px_30px_rgba(59,38,28,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#322520]">{value}</p>
    </div>
  );
}

const quickLinkToneClasses = {
  neutral:
    "border-[#e1cfbf] bg-[linear-gradient(180deg,rgba(255,251,245,0.96),rgba(244,234,223,0.92))]",
  warning:
    "border-[#ead3b5] bg-[linear-gradient(180deg,rgba(255,249,239,0.96),rgba(246,232,208,0.92))]",
  danger:
    "border-[#e4c3bc] bg-[linear-gradient(180deg,rgba(255,246,244,0.98),rgba(248,228,224,0.94))]",
  info:
    "border-[#d7dff4] bg-[linear-gradient(180deg,rgba(247,249,255,0.98),rgba(233,239,251,0.94))]",
};
