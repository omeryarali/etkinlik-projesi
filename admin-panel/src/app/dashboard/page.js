"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem("adminToken");

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
          <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} />
          <StatCard title="Aktif Kullanıcı" value={stats.activeUsers} />
          <StatCard title="Pasif Kullanıcı" value={stats.passiveUsers} />
          <StatCard title="Toplam Organizatör" value={stats.totalOrganizers} />

          <StatCard title="Bekleyen Organizatör" value={stats.pendingOrganizers} />
          <StatCard title="Onaylı Organizatör" value={stats.approvedOrganizers} />
          <StatCard title="Reddedilen Organizatör" value={stats.rejectedOrganizers} />
          <StatCard title="Askıdaki Organizatör" value={stats.suspendedOrganizers} />

          <StatCard title="Toplam Etkinlik" value={stats.totalEvents} />
          <StatCard title="Bekleyen Etkinlik" value={stats.pendingEvents} />
          <StatCard title="Onaylı Etkinlik" value={stats.approvedEvents} />
          <StatCard title="Reddedilen Etkinlik" value={stats.rejectedEvents} />

          <StatCard title="İptal Etkinlik" value={stats.cancelledEvents} />
          <StatCard title="Tamamlanan Etkinlik" value={stats.completedEvents} />
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

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">{value ?? 0}</p>
    </div>
  );
}