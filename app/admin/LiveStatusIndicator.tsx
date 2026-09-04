"use client";

import React, { useState, useEffect } from "react";
import { useLiveOrders } from "./LiveOrdersContext";

export default function LiveStatusIndicator({ compact = false }: { compact?: boolean }) {
  const { isSyncing, lastSync, soundEnabled, toggleSound, testSound, refresh } =
    useLiveOrders();
  const [timeAgo, setTimeAgo] = useState<string>("just now");

  useEffect(() => {
    function update() {
      if (!lastSync) {
        setTimeAgo("connecting...");
        return;
      }
      const sec = Math.floor((Date.now() - lastSync.getTime()) / 1000);
      if (sec < 5) setTimeAgo("just now");
      else if (sec < 60) setTimeAgo(`${sec}s ago`);
      else setTimeAgo(`${Math.floor(sec / 60)}m ago`);
    }

    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [lastSync]);

  return (
    <div className={`live-status-pill ${compact ? "compact" : ""}`}>
      <div className="live-pulse-wrapper" title="Real-time order polling active">
        <span className="live-dot" />
        <span className="live-dot-ping" />
        <span className="live-text">Live</span>
      </div>

      {!compact && (
        <span className="live-time" title={lastSync?.toLocaleTimeString()}>
          {timeAgo}
        </span>
      )}

      <div className="live-actions">
        <button
          type="button"
          className={`live-icon-btn ${!soundEnabled ? "muted" : ""}`}
          onClick={toggleSound}
          title={soundEnabled ? "Order chime: ON (click to mute)" : "Order chime: MUTED (click to unmute)"}
          aria-label="Toggle order chime sound"
        >
          {soundEnabled ? "🔔" : "🔕"}
        </button>

        {soundEnabled && !compact && (
          <button
            type="button"
            className="live-text-btn"
            onClick={testSound}
            title="Test sound chime"
          >
            Test
          </button>
        )}

        <button
          type="button"
          className={`live-icon-btn refresh-btn ${isSyncing ? "spinning" : ""}`}
          onClick={refresh}
          disabled={isSyncing}
          title="Refresh orders now"
          aria-label="Refresh orders now"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
