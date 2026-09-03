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
            <a href="/admin" className="wordmark" style={{ color: "var(--cream)", textDecoration: "none" }}>
              <img
                src="/Riinas_Collections_Logo_Light.svg"
                alt="Riina's Collections"
                className="admin-logo-img"
                width={36}
                height={41}
              />
              <span className="brand-text-block">
                <span className="brand-title" style={{ color: "var(--cream)", fontSize: "1.05rem" }}>Riina&apos;s</span>
                <span className="brand-tagline" style={{ color: "var(--gold-light)" }}>Admin Portal</span>
              </span>
            </a>
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
