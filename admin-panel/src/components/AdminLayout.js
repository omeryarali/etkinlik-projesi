"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children, title, description }) {
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/login";
  }

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

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-900 text-white hidden md:flex md:flex-col">
          <div className="px-6 py-5 border-b border-gray-800">
            <h1 className="text-lg font-bold">Etkinlik Admin</h1>
            <p className="text-xs text-gray-400 mt-1">Yönetim Paneli</p>
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
              onClick={handleLogout}
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
                onClick={handleLogout}
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