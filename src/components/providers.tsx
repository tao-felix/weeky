"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";

function useStoragePersistence() {
  useEffect(() => {
    async function requestPersistence() {
      if (navigator.storage && navigator.storage.persist) {
        const granted = await navigator.storage.persist();
        if (!granted) {
          console.warn(
            "Weeky: Persistent storage not granted. Data may be evicted by the browser."
          );
        }
      }
    }
    requestPersistence();
  }, []);
}

function useDeviceId() {
  useEffect(() => {
    async function ensureDeviceId() {
      const existing = await db.settings.get("deviceId");
      if (!existing) {
        await db.settings.put({
          key: "deviceId",
          value: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    ensureDeviceId();
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useStoragePersistence();
  useDeviceId();
  return <>{children}</>;
}
