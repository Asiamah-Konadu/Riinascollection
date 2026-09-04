"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveOrders } from "./LiveOrdersContext";
import LiveStatusIndicator from "./LiveStatusIndicator";

function OrdersNavBadge() {
  const { pendingCount } = useLiveOrders();
  if (pendingCount <= 0) return null;
  return (
    <span className="admin-pending-badge" title={`${pendingCount} pending order${pendingCount > 1 ? "s" : ""}`}>
      {pendingCount}
    </span>
  );
}

export default function AdminHeader({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pendingCount } = useLiveOrders();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        </svg>
      ),
      active: pathname === "/admin"
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      ),
      active: pathname?.startsWith("/admin/products")
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      active: pathname?.startsWith("/admin/orders"),
      hasBadge: true
    }
  ];

  return (
    <header className="admin-header-root">
      {/* Subtle luxury top gradient border */}
      <div className="admin-header-gold-line" />

      <div className="admin-header-container">
        {/* Brand / Logo */}
        <div className="admin-brand-area">
          <Link href="/admin" className="admin-brand-link" title="Riina's Admin Dashboard">
            <div className="admin-logo-wrapper">
              <img
                src="/Riinas_Collections_Logo_Light.svg"
                alt="Riina's Collections Logo"
                className="admin-brand-logo"
                width={36}
                height={40}
              />
            </div>
            <div className="admin-brand-meta">
              <span className="admin-brand-title">Riina&apos;s</span>
              <span className="admin-brand-badge">ADMIN PORTAL</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="admin-nav-desktop" aria-label="Admin Navigation">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-tab ${item.active ? "active" : ""}`}
            >
              <span className="admin-nav-tab-icon">{item.icon}</span>
              <span className="admin-nav-tab-label">{item.label}</span>
              {item.hasBadge && <OrdersNavBadge />}
            </Link>
          ))}
        </nav>

        {/* Right Side Header Controls */}
        <div className="admin-header-right">
          {/* Real-time Live Status Indicator */}
          <div className="admin-status-wrapper">
            <LiveStatusIndicator compact />
          </div>

          {/* Quick View Shop Action (Desktop) */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-quick-shop-btn"
            title="Open Public Storefront in new tab"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>View Shop</span>
          </a>

          {/* Logout Action (Desktop) */}
          <button
            type="button"
            className="admin-logout-btn"
            onClick={onLogout}
            title="Sign out of Admin Portal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="admin-logout-text">Log out</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={`admin-mobile-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close admin menu" : "Open admin menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="admin-toggle-line line-1" />
            <span className="admin-toggle-line line-2" />
            <span className="admin-toggle-line line-3" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer / Dropdown Sheet */}
      {mobileMenuOpen && (
        <div className="admin-mobile-menu-drawer">
          <div className="admin-mobile-drawer-inner">
            {/* Admin User Info Card */}
            <div className="admin-mobile-profile-card">
              <div className="admin-profile-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <div className="admin-profile-info">
                <div className="admin-profile-header-row">
                  <span className="admin-profile-name">Riina Administrator</span>
                  <span className="admin-profile-tag">LIVE</span>
                </div>
                <span className="admin-profile-role">Management & Order Fulfillment</span>
              </div>
            </div>

            {/* Navigation List */}
            <div className="admin-mobile-nav-list">
              <div className="admin-mobile-section-label">MAIN NAVIGATION</div>
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-mobile-nav-card ${item.active ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="admin-mobile-nav-left">
                    <span className="admin-mobile-nav-icon">{item.icon}</span>
                    <span className="admin-mobile-nav-label">{item.label}</span>
                  </div>
                  <div className="admin-mobile-nav-right">
                    {item.hasBadge && pendingCount > 0 && (
                      <span className="admin-pending-badge">{pendingCount} pending</span>
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-chevron">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="admin-mobile-actions-group">
              <div className="admin-mobile-section-label">QUICK ACTIONS</div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-mobile-action-btn view-shop"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>View Customer Shop ↗</span>
              </a>

              <button
                type="button"
                className="admin-mobile-action-btn logout"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sign Out of Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar for Easy 1-Thumb Switching */}
      <div className="admin-bottom-nav-bar" aria-label="Mobile Navigation Bar">
        {navLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-bottom-tab ${item.active ? "active" : ""}`}
          >
            <div className="admin-bottom-tab-icon-wrap">
              {item.icon}
              {item.hasBadge && pendingCount > 0 && (
                <span className="admin-bottom-badge-dot" />
              )}
            </div>
            <span className="admin-bottom-tab-label">{item.label}</span>
          </Link>
        ))}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-bottom-tab"
          title="View Storefront"
        >
          <div className="admin-bottom-tab-icon-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
          <span className="admin-bottom-tab-label">Store ↗</span>
        </a>
      </div>
    </header>
  );
}
