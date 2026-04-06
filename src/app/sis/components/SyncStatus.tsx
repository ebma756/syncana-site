"use client";
import { useSync } from "./SyncProvider";

const STATUS_LABELS = {
  up_to_date: "Up to date",
  pending: "Pending",
  syncing: "Syncing",
  error: "Sync error",
};

export default function SyncStatus() {
  const { status, pendingCount = 0, lastSync, errorMessage } = useSync();
  const chipClass =
    status === "up_to_date"
      ? "chip-up"
      : status === "pending"
        ? "chip-pending"
        : status === "syncing"
          ? "chip-syncing"
          : "chip-error";
  return (
    <div className={`sis-chip ${chipClass}`} title={errorMessage} suppressHydrationWarning>
      <span className="sis-chip-dot" />
      <span>{STATUS_LABELS[status]}</span>
      {status === "pending" && pendingCount > 0 && <span>• {pendingCount} queued</span>}
      {lastSync && <span className="sis-chip-meta">• Last {new Date(lastSync).toLocaleTimeString()}</span>}
    </div>
  );
}
