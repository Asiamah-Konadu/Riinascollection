"use client";

import { usePathname, useRouter } from "next/navigation";
import { LiveOrdersProvider } from "./LiveOrdersContext";
import AdminHeader from "./AdminHeader";
import NewOrderToast from "./NewOrderToast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <LiveOrdersProvider>
      <div className="admin-shell">
        <AdminHeader onLogout={handleLogout} />
        <NewOrderToast />
        <main className="admin-main">
          <div className="wrap">{children}</div>
        </main>
      </div>
    </LiveOrdersProvider>
  );
}
