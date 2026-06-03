"use client";

import { useEffect, useState } from "react";
import { customers as mockCustomers } from "@/lib/mock";
import type { Customer } from "@/lib/types";

type BackendMode = "checking" | "database" | "local";

interface CustomerListResponse {
  data?: Customer[] | null;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

export function useCustomerStore() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [backendMode, setBackendMode] = useState<BackendMode>("checking");
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      try {
        const response = await fetch("/api/customers", { cache: "no-store" });
        const payload = (await response.json()) as CustomerListResponse;

        if (cancelled) return;
        if (!response.ok) {
          throw new Error(payload.error?.message ?? "顧客情報を取得できませんでした。");
        }
        if (payload.mode !== "database" || !payload.data) {
          setBackendMode("local");
          return;
        }

        setCustomers(payload.data);
        setBackendMode("database");
        setSyncError(null);
      } catch (error) {
        if (cancelled) return;
        setBackendMode("local");
        setSyncError(
          error instanceof Error
            ? error.message
            : "顧客情報のDB接続を確認できませんでした。",
        );
      }
    }

    loadCustomers();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    customers,
    backendMode,
    syncError,
  };
}
