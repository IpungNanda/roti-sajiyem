
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiShoppingBag,
  FiStar,
  FiGlobe,
  FiLogOut,
  FiX,
  FiMenu,
  FiCheckCircle,
} from "react-icons/fi";
import { auth } from "@/lib/firebase";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FiGrid,
  },
  {
    label: "Produk",
    href: "/admin/produk",
    icon: FiShoppingBag,
  },
  {
    label: "Rekomendasi",
    href: "/admin/rekomendasi",
    icon: FiStar,
  },
];

type AdminSidebarProps = {
  children: React.ReactNode;
};

export default function AdminSidebar({
  children,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Halaman login tidak menggunakan sidebar admin.
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout() {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin keluar dari panel admin?"
    );

    if (!confirmed) return;

    try {
      setLoggingOut(true);
      await signOut(auth);
      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout gagal:", error);
      window.alert("Gagal keluar. Silakan coba lagi.");
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function SidebarContent({
    mobile = false,
  }: {
    mobile?: boolean;
  }) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-green-100 px-5">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-700 font-bold text-white shadow-sm">
              RS
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-bold text-gray-900">
                Roti Sajiyem
              </h2>
              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>
          </Link>

          {mobile && (
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <FiX size={22} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Menu Utama
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-green-50 font-semibold text-green-800"
                      : "font-medium text-gray-600 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      active ? "text-green-700" : "text-gray-400"
                    }
                  />
                  {item.label}
                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-green-600" />
                  )}
                </Link>
              );
            })}
          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Sistem
          </p>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-800"
          >
            <FiGlobe size={20} className="text-gray-400" />
            Lihat Website
          </Link>
        </nav>

        <div className="shrink-0 border-t border-green-100 p-4">
          <div className="mb-3 rounded-xl bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-700" />
              <span className="text-xs font-semibold text-green-800">
                Sistem Administrator
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-green-700/70">
              Panel pengelolaan Roti Sajiyem
            </p>
          </div>

          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <FiLogOut size={20} />
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f7fbea]">
      {/* Sidebar desktop: tetap terlihat saat halaman berganti */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-green-100 lg:block">
        <SidebarContent />
      </aside>

      {/* Header mobile */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-green-100 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Buka menu navigasi"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-green-800 transition hover:bg-green-50"
        >
          <FiMenu size={24} />
        </button>

        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold text-gray-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-sm text-white">
            RS
          </span>
          Roti Sajiyem
        </Link>

        <span className="w-10" />
      </header>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Tutup menu navigasi"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 w-[min(82vw,300px)] shadow-2xl lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Semua halaman admin ditampilkan di sini */}
      <div className="min-w-0 lg:pl-64">{children}</div>
    </div>
  );
}
