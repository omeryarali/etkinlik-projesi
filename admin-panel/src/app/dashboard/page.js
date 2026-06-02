"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem("adminToken");
      const userRaw = localStorage.getItem("adminUser");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      if (userRaw) {
        setAdminUser(JSON.parse(userRaw));
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

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/login";
  }

  useEffect(() => {
    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Etkinlik Projesi Admin Panel
            </h1>
            <p className="text-sm text-gray-500">
              {adminUser?.fullName} - {adminUser?.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white text-sm hover:bg-red-700"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="mt-1 text-gray-500">
          Sistem genel istatistikleri
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {stats && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} />
            <StatCard title="Aktif Kullanıcı" value={stats.activeUsers} />
            <StatCard title="Pasif Kullanıcı" value={stats.passiveUsers} />
            <StatCard title="Toplam Organizatör" value={stats.totalOrganizers} />

            <StatCard title="Bekleyen Organizatör" value={stats.pendingOrganizers} />
            <StatCard title="Onaylı Organizatör" value={stats.approvedOrganizers} />
            <StatCard title="Askıdaki Organizatör" value={stats.suspendedOrganizers} />
            <StatCard title="Toplam Etkinlik" value={stats.totalEvents} />

            <StatCard title="Bekleyen Etkinlik" value={stats.pendingEvents} />
            <StatCard title="Onaylı Etkinlik" value={stats.approvedEvents} />
            <StatCard title="İptal Etkinlik" value={stats.cancelledEvents} />
            <StatCard title="Tamamlanan Etkinlik" value={stats.completedEvents} />

            <StatCard title="Toplam Katılım Kaydı" value={stats.totalParticipants} />
            <StatCard title="Aktif Katılım" value={stats.joinedParticipants} />
            <StatCard title="Geldi" value={stats.attendedParticipants} />
            <StatCard title="Gelmedi" value={stats.noShowParticipants} />
          </div>
        )}
      </section>
    </main>
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