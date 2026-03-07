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

function useThemeInit() {
  useEffect(() => {
    async function initTheme() {
      const stored = await db.settings.get("theme");
      if (stored && (stored.value === "dark" || stored.value === "light")) {
        if (stored.value === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // No stored preference -- use system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        }
      }
    }
    initTheme();
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useStoragePersistence();
  useDeviceId();
  useThemeInit();
  return <>{children}</>;
}
