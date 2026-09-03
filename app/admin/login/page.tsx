"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed.");
      setSubmitting(false);
      return;
    }

    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img
            src="/Riinas_Collections_Logo_Combined.svg"
            alt="Riina's Collections Logo"
            className="login-logo-img"
            width={76}
            height={87}
          />
        </div>
        <h1>Admin login</h1>
        <p>Sign in to manage products and orders.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button className="btn" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
