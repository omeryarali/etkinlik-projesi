"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { getAdminToken } from "../../lib/auth";
import AdminLayout from "../../components/AdminLayout";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardStats() {
    try {
      const token = getAdminToken();

      if (!token) {
        window.location.href = "/login";
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

  useEffect(() => {
    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout
        title="Dashboard"
        description="Sistem genel istatistikleri"
      >
        <p className="text-gray-600">Yükleniyor...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      description="Sistem genel istatistikleri"
    >
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} href="/users" />
          <StatCard title="Aktif Kullanıcı" value={stats.activeUsers} href="/users" />
          <StatCard title="Pasif Kullanıcı" value={stats.passiveUsers} href="/users" />
          <StatCard title="Toplam Organizatör" value={stats.totalOrganizers} href="/organizers" />

          <StatCard title="Bekleyen Organizatör" value={stats.pendingOrganizers} href="/organizers" />
          <StatCard title="Onaylı Organizatör" value={stats.approvedOrganizers} href="/organizers" />
          <StatCard title="Reddedilen Organizatör" value={stats.rejectedOrganizers} href="/organizers" />
          <StatCard title="Askıdaki Organizatör" value={stats.suspendedOrganizers} href="/organizers" />

          <StatCard title="Toplam Etkinlik" value={stats.totalEvents} href="/events" />
          <StatCard title="Bekleyen Etkinlik" value={stats.pendingEvents} href="/events" />
          <StatCard title="Onaylı Etkinlik" value={stats.approvedEvents} href="/events" />
          <StatCard title="Reddedilen Etkinlik" value={stats.rejectedEvents} href="/events" />

          <StatCard title="İptal Etkinlik" value={stats.cancelledEvents} href="/events" />
          <StatCard title="Tamamlanan Etkinlik" value={stats.completedEvents} href="/events" />
          <StatCard title="Toplam Katılım Kaydı" value={stats.totalParticipants} />
          <StatCard title="Aktif Katılım" value={stats.joinedParticipants} />

          <StatCard title="İptal Katılım" value={stats.cancelledParticipants} />
          <StatCard title="Geldi" value={stats.attendedParticipants} />
          <StatCard title="Gelmedi" value={stats.noShowParticipants} />
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({ title, value, href }) {
  const content = (
    <div className="rounded-xl bg-white p-5 shadow-sm border hover:shadow-md transition">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">{value ?? 0}</p>
      {href && (
        <p className="mt-3 text-xs font-medium text-blue-600">
          Detaylara git
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}