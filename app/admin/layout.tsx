"use client";

import { usePathname, useRouter } from "next/navigation";

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
    <div className="admin-shell">
      <div className="admin-header">
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="wordmark" style={{ color: "var(--cream)" }}>
              <span className="mark">RC</span>Admin
            </span>
            <button className="btn ghost" style={{ borderColor: "rgba(244,239,226,0.4)", color: "var(--cream)" }} onClick={handleLogout}>
              Log out
            </button>
          </div>
          <nav className="admin-nav">
            <a href="/admin" className={pathname === "/admin" ? "active" : ""}>
              Dashboard
            </a>
            <a href="/admin/products" className={pathname?.startsWith("/admin/products") ? "active" : ""}>
              Products
            </a>
            <a href="/admin/orders" className={pathname?.startsWith("/admin/orders") ? "active" : ""}>
              Orders
            </a>
            <a href="/" target="_blank" rel="noopener">
              View shop ↗
            </a>
          </nav>
        </div>
      </div>
      <main className="admin-main">
        <div className="wrap">{children}</div>
      </main>
    </div>
  );
}
