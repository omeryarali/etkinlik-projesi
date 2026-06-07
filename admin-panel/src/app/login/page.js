"use client";

import { useEffect, useState } from "react";
import { ActionButton, AdminSurface, Notice, StatusPill } from "../../components/admin-ui";
import { apiFetch } from "../../lib/api";
import { getAdminToken, getAdminUser, saveAdminSession } from "../../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    const user = getAdminUser();

    if (token && user?.role === "Admin") {
      window.location.href = "/dashboard";
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.role !== "Admin") {
        setError("Bu panele sadece Admin rolündeki kullanıcılar giriş yapabilir.");
        return;
      }

      saveAdminSession(data.token, data);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Giriş yapılırken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-100px] top-10 h-72 w-72 rounded-full bg-[rgba(221,150,114,0.2)] blur-3xl" />
        <div className="absolute right-[-80px] top-0 h-80 w-80 rounded-full bg-[rgba(213,188,149,0.2)] blur-3xl" />
        <div className="absolute bottom-[-110px] left-1/3 h-96 w-96 rounded-full bg-[rgba(167,125,100,0.12)] blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-6 xl:grid-cols-[1.05fr_520px]">
        <AdminSurface tone="contrast" className="overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,_rgba(230,152,111,0.34),_transparent_48%)]" />
          <div className="relative space-y-8">
            <div className="space-y-4">
              <StatusPill tone="contrast">BiKatıl Control</StatusPill>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-[family:var(--font-admin-display)] text-5xl leading-[1.02] text-white sm:text-6xl">
                  Şehrin etkinlik akışını tek merkezden yönet.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[#e8d7ca] sm:text-base">
                  BiKatıl Admin; organizer başvuruları, etkinlik onayları,
                  kullanıcı hareketleri ve kategori yapısını aynı operasyon
                  katmanında toplar.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Organizer
                </p>
                <p className="mt-3 text-sm leading-6 text-[#e8d7ca]">
                  Başvuruları incele, aktifleri yönet ve gerektiğinde hızla aksiyon al.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Etkinlik
                </p>
                <p className="mt-3 text-sm leading-6 text-[#e8d7ca]">
                  Onay bekleyen etkinlikleri izle ve platform kalitesini koru.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Kullanıcı
                </p>
                <p className="mt-3 text-sm leading-6 text-[#e8d7ca]">
                  Hesap durumlarını, rollerini ve temel güvenlik akışlarını denetle.
                </p>
              </div>
            </div>
          </div>
        </AdminSurface>

        <AdminSurface className="relative">
          <div className="space-y-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#a16846]">
              Güvenli giriş
            </p>
            <h2 className="font-[family:var(--font-admin-display)] text-4xl text-[#221815]">
              Admin oturumu aç
            </h2>
            <p className="text-sm leading-7 text-[#6f5a4f]">
              Yalnızca yetkili yöneticiler bu kontrol merkezine erişebilir.
            </p>
          </div>

          {error ? (
            <Notice
              tone="danger"
              title="Giriş reddedildi"
              description={error}
              className="mt-6"
            />
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="grid gap-2 text-sm text-[#6f5a4f]">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
                E-posta
              </span>
              <input
                type="email"
                className="min-h-13 rounded-[22px] border border-[#e4d5c8] bg-white/90 px-4 text-[#241a16] outline-none transition focus:border-[#c47a53] focus:ring-2 focus:ring-[#f2d4be]"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@bikatil.com"
                required
              />
            </label>

            <label className="grid gap-2 text-sm text-[#6f5a4f]">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
                Şifre
              </span>
              <input
                type="password"
                className="min-h-13 rounded-[22px] border border-[#e4d5c8] bg-white/90 px-4 text-[#241a16] outline-none transition focus:border-[#c47a53] focus:ring-2 focus:ring-[#f2d4be]"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Şifreniz"
                required
              />
            </label>

            <ActionButton
              type="submit"
              tone="primary"
              disabled={loading}
              className="w-full min-h-13 rounded-[22px]"
            >
              {loading ? "Giriş hazırlanıyor..." : "Panele Gir"}
            </ActionButton>
          </form>
        </AdminSurface>
      </div>
    </main>
  );
}
