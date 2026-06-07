"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import {
  AdminSurface,
  cn,
} from "./admin-ui";
import {
  getAdminSessionSnapshot,
  getServerAdminSessionSnapshot,
  logoutAdmin,
  redirectToLogin,
  subscribeAdminSession,
} from "../lib/auth";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", code: "OV" },
  { label: "Organizatörler", href: "/organizers", code: "ORG" },
  { label: "Etkinlikler", href: "/events", code: "EVT" },
  { label: "Kullanıcılar", href: "/users", code: "USR" },
  { label: "Kategoriler", href: "/categories", code: "CAT" },
];

export default function AdminLayout({ children, title, description }) {
  const pathname = usePathname();
  const authState = useSyncExternalStore(
    subscribeAdminSession,
    getAdminSessionSnapshot,
    getServerAdminSessionSnapshot
  );

  useEffect(() => {
    if (authState.checked && !authState.isAuthenticated) {
      redirectToLogin();
    }
  }, [authState.checked, authState.isAuthenticated]);

  if (!authState.checked || !authState.isAuthenticated) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <AdminSurface tone="muted">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#e4d3c6] bg-white/85">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#cf7a52] border-t-transparent" />
              </div>

              <div className="space-y-1">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#a16846]">
                  BiKatıl Admin
                </p>
                <h1 className="font-[family:var(--font-admin-display)] text-3xl text-[#221815]">
                  Yetki kontrolü yapılıyor
                </h1>
                <p className="text-sm leading-6 text-[#6e5b50]">
                  Güvenli yönetim alanı hazırlanırken hesabın doğrulanıyor.
                </p>
              </div>
            </div>
          </AdminSurface>
        </div>
      </main>
    );
  }

  const { adminUser } = authState;

  return (
    <main className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-80px] top-16 h-64 w-64 rounded-full bg-[rgba(223,154,116,0.18)] blur-3xl" />
        <div className="absolute right-[-60px] top-10 h-72 w-72 rounded-full bg-[rgba(205,191,150,0.16)] blur-3xl" />
        <div className="absolute bottom-[-90px] left-1/3 h-80 w-80 rounded-full bg-[rgba(168,124,98,0.12)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1640px]">
        <aside className="hidden w-[320px] shrink-0 border-r border-white/45 bg-[#241c19] text-white xl:flex xl:flex-col">
          <div className="border-b border-white/8 px-8 py-8">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#efbf9d]">
              BiKatıl Control
            </p>
            <h1 className="mt-3 font-[family:var(--font-admin-display)] text-4xl leading-none">
              Admin paneli
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#d7c6b9]">
              Etkinlik, kullanıcı ve organizer operasyonlarını tek merkezden yönet.
            </p>

            {adminUser ? (
              <div className="mt-6 rounded-[24px] border border-white/8 bg-white/6 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                  Oturum
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {adminUser.fullName}
                </p>
                <p className="mt-1 text-sm text-[#d6c2b4]">{adminUser.email}</p>
              </div>
            ) : null}
          </div>

          <nav className="flex-1 space-y-2 px-5 py-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-4 rounded-[24px] px-4 py-3 transition",
                    isActive
                      ? "bg-[rgba(255,255,255,0.08)] text-white shadow-[0_20px_50px_rgba(10,7,6,0.18)]"
                      : "text-[#d7c6b9] hover:bg-white/6 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border text-[11px] font-semibold uppercase tracking-[0.18em]",
                      isActive
                        ? "border-[#edc2a4] bg-[rgba(237,194,164,0.16)] text-[#f6dbca]"
                        : "border-white/10 bg-white/4 text-[#efbf9d]"
                    )}
                  >
                    {item.code}
                  </span>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-[#a99587] group-hover:text-[#cfb8a9]">
                      {item.label} yönetimi
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/8 px-5 py-5">
            <div className="rounded-[24px] border border-white/8 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efbf9d]">
                Hızlı çıkış
              </p>
              <p className="mt-2 text-sm leading-6 text-[#d8c7bb]">
                Oturumu güvenli şekilde kapatıp giriş ekranına dön.
              </p>
              <button
                onClick={logoutAdmin}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#a64540] px-4 text-sm font-semibold text-white transition hover:bg-[#913934]"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <header className="sticky top-0 z-40 border-b border-white/40 bg-[rgba(250,244,238,0.76)] backdrop-blur-xl">
            <div className="px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#a16846]">
                    BiKatıl Admin
                  </p>
                  <h2 className="font-[family:var(--font-admin-display)] text-3xl text-[#221815] sm:text-4xl">
                    {title}
                  </h2>
                  {description ? (
                    <p className="max-w-3xl text-sm leading-6 text-[#6f5a4f]">
                      {description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {adminUser ? (
                    <div className="rounded-[22px] border border-white/60 bg-white/76 px-4 py-3 shadow-[0_18px_40px_rgba(59,38,28,0.06)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
                        Aktif yönetici
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#241a16]">
                        {adminUser.fullName}
                      </p>
                    </div>
                  ) : null}

                  <button
                    onClick={logoutAdmin}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#e3c4b1] bg-white/84 px-4 text-sm font-semibold text-[#6b4031] transition hover:border-[#d6a98f] hover:bg-white xl:hidden"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                        isActive
                          ? "border-[#d39a7c] bg-[#f2ddcf] text-[#6b4031]"
                          : "border-white/70 bg-white/70 text-[#6f5a4f] hover:border-[#e4c8b4]"
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-[0.18em]">
                        {item.code}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
