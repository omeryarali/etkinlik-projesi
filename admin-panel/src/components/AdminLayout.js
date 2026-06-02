"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminUser, isAdminLoggedIn, logoutAdmin } from "../lib/auth";

export default function AdminLayout({ children, title, description }) {
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      logoutAdmin();
      return;
    }

    setAdminUser(getAdminUser());
    setCheckingAuth(false);
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Organizatörler",
      href: "/organizers",
    },
    {
      label: "Etkinlikler",
      href: "/events",
    },
    {
      label: "Kullanıcılar",
      href: "/users",
    },
    {
      label: "Kategoriler",
      href: "/categories",
    },
  ];

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Yetki kontrol ediliyor...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-900 text-white hidden md:flex md:flex-col">
          <div className="px-6 py-5 border-b border-gray-800">
            <h1 className="text-lg font-bold">Etkinlik Admin</h1>
            <p className="text-xs text-gray-400 mt-1">Yönetim Paneli</p>

            {adminUser && (
              <div className="mt-4 rounded-lg bg-gray-800 px-3 py-2">
                <p className="text-sm font-medium text-white">
                  {adminUser.fullName}
                </p>
                <p className="text-xs text-gray-400">{adminUser.email}</p>
              </div>
            )}
          </div>

          <nav className="flex-1 px-4 py-5 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-2 text-sm ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={logoutAdmin}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <header className="bg-white border-b">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                {description && (
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
              </div>

              <button
                onClick={logoutAdmin}
                className="md:hidden rounded-lg bg-red-600 px-4 py-2 text-white text-sm hover:bg-red-700"
              >
                Çıkış
              </button>
            </div>
          </header>

          <div className="p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}