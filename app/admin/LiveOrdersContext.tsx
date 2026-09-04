"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

export type OrderItem = { id: string; name: string; price: number; qty: number };

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  note: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

interface LiveOrdersContextValue {
  orders: Order[];
  pendingCount: number;
  isSyncing: boolean;
  lastSync: Date | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  testSound: () => void;
  newOrderBanner: Order | null;
  newOrderIds: Set<string>;
  dismissBanner: () => void;
  refresh: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<boolean>;
}

const LiveOrdersContext = createContext<LiveOrdersContextValue | null>(null);

// Boutique chime using Web Audio API (clean, pleasant luxury alert tone)
function playLuxuryChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    // Ascending warm chord: E5, G#5, B5, E6
    const notes = [
      { freq: 659.25, time: 0.0, dur: 0.35, gain: 0.18 },
      { freq: 830.61, time: 0.1, dur: 0.4, gain: 0.2 },
      { freq: 987.77, time: 0.2, dur: 0.45, gain: 0.22 },
      { freq: 1318.51, time: 0.32, dur: 0.65, gain: 0.25 }
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(note.gain, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  } catch {
    // Audio might fail if user hasn't interacted with document yet
  }
}

export function LiveOrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderBanner, setNewOrderBanner] = useState<Order | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Store existing order IDs to detect newly placed orders
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);
  const originalTitleRef = useRef<string>("");

  // Load sound setting from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      originalTitleRef.current = document.title;
      const saved = localStorage.getItem("riinas_admin_sound");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("riinas_admin_sound", String(next));
      }
      return next;
    });
  }, []);

  const testSound = useCallback(() => {
    playLuxuryChime();
  }, []);

  const dismissBanner = useCallback(() => {
    setNewOrderBanner(null);
    if (typeof window !== "undefined" && originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  }, []);

  const fetchOrders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsSyncing(true);
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
        headers: { Pragma: "no-cache" }
      });

      if (!res.ok) return;

      const data = await res.json();
      const freshOrders: Order[] = data.orders || [];

      setOrders(freshOrders);
      setLastSync(new Date());

      // Check for incoming new orders
      if (isInitialLoadRef.current) {
        // First load: just memorize all existing IDs
        knownOrderIdsRef.current = new Set(freshOrders.map((o) => o.id));
        isInitialLoadRef.current = false;
      } else {
        const newlyAdded = freshOrders.filter((o) => !knownOrderIdsRef.current.has(o.id));

        if (newlyAdded.length > 0) {
          // Play sound alert if enabled
          if (soundEnabled) {
            playLuxuryChime();
          }

          // Trigger toast for the latest order
          const latestOrder = newlyAdded[0];
          setNewOrderBanner(latestOrder);

          // Add to highlighted IDs
          setNewOrderIds((prev) => {
            const next = new Set(prev);
            newlyAdded.forEach((o) => next.add(o.id));
            return next;
          });

          // Flash tab title
          if (typeof window !== "undefined") {
            document.title = `🔔 (${newlyAdded.length}) New Order! — Riina's Admin`;
          }

          // Update known set
          newlyAdded.forEach((o) => knownOrderIdsRef.current.add(o.id));
        }
      }
    } catch {
      // Network hiccup - ignore silently, will retry next poll
    } finally {
      if (isManual) {
        setTimeout(() => setIsSyncing(false), 400);
      }
    }
  }, [soundEnabled]);

  // Initial fetch and polling loop
  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      // Only poll when the window is visible to save battery/bandwidth
      if (typeof document !== "undefined" && !document.hidden) {
        fetchOrders();
      }
    }, 6500); // 6.5s interval for snappy live updates

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab brought back into focus: immediately check
        fetchOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    // Optimistic UI update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        // Revert on failure
        fetchOrders();
        return false;
      }
      return true;
    } catch {
      fetchOrders();
      return false;
    }
  }, [fetchOrders]);

  const refresh = useCallback(async () => {
    await fetchOrders(true);
  }, [fetchOrders]);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <LiveOrdersContext.Provider
      value={{
        orders,
        pendingCount,
        isSyncing,
        lastSync,
        soundEnabled,
        toggleSound,
        testSound,
        newOrderBanner,
        newOrderIds,
        dismissBanner,
        refresh,
        updateOrderStatus
      }}
    >
      {children}
    </LiveOrdersContext.Provider>
  );
}

export function useLiveOrders() {
  const ctx = useContext(LiveOrdersContext);
  if (!ctx) {
    throw new Error("useLiveOrders must be used within a LiveOrdersProvider");
  }
  return ctx;
}
