"use client";

import { useCallback, useEffect, useState } from "react";
import { customers as mockCustomers } from "@/lib/mock";
import type { Customer } from "@/lib/types";

type BackendMode = "checking" | "database" | "local";

export type CustomerDraft = Partial<Omit<Customer, "id">> & { id?: string };

const STORAGE_KEY = "voice-estimate.customers.v1";

const EMPTY_CUSTOMER_FIELDS: Omit<Customer, "id"> = {
  name: "",
  nameKana: "",
  postalCode: "",
  address: "",
  phone: "",
  email: "",
  contactName: "",
  note: "",
};

interface CustomerListResponse {
  data?: Customer[] | null;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

interface CustomerSaveResponse {
  data?: Customer | null;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

interface CustomerDeleteResponse {
  data?: { id: string } | null;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

interface CustomerStorePayload {
  version: 1;
  updatedAt: string;
  customers: Customer[];
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocalCustomers(): Customer[] | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CustomerStorePayload>;
    if (!Array.isArray(parsed.customers)) return null;
    return parsed.customers;
  } catch {
    return null;
  }
}

function writeLocalCustomers(customers: Customer[]) {
  if (!canUseStorage()) return;
  const payload: CustomerStorePayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    customers,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function sortCustomers(rows: Customer[]): Customer[] {
  return [...rows].sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

function replaceCustomer(rows: Customer[], customer: Customer): Customer[] {
  return sortCustomers([
    customer,
    ...rows.filter((row) => row.id !== customer.id),
  ]);
}

function normalizeLocalCustomer(draft: CustomerDraft): Customer {
  return {
    ...EMPTY_CUSTOMER_FIELDS,
    ...draft,
    id: draft.id?.trim() || `local-customer-${Date.now()}`,
    name: draft.name?.trim() || "未設定の顧客",
    nameKana: draft.nameKana?.trim() ?? "",
    postalCode: draft.postalCode?.trim() ?? "",
    address: draft.address?.trim() ?? "",
    phone: draft.phone?.trim() ?? "",
    email: draft.email?.trim() ?? "",
    contactName: draft.contactName?.trim() ?? "",
    note: draft.note?.trim() ?? "",
  };
}

export function useCustomerStore() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [backendMode, setBackendMode] = useState<BackendMode>("checking");
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const localCustomers = readLocalCustomers();
    if (localCustomers) setCustomers(localCustomers);

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

  const saveLocalCustomer = useCallback((draft: CustomerDraft) => {
    const saved = normalizeLocalCustomer(draft);
    setCustomers((prev) => {
      const next = replaceCustomer(prev, saved);
      writeLocalCustomers(next);
      return next;
    });
    return saved;
  }, []);

  const saveCustomer = useCallback(
    async (draft: CustomerDraft) => {
      if (backendMode !== "local") {
        try {
          const response = await fetch("/api/customers", {
            method: draft.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer: draft }),
          });
          const payload = (await response.json()) as CustomerSaveResponse;

          if (!response.ok) {
            throw new Error(payload.error?.message ?? "顧客情報を保存できませんでした。");
          }
          if (payload.mode === "database" && payload.data) {
            setBackendMode("database");
            setSyncError(null);
            setCustomers((prev) => replaceCustomer(prev, payload.data as Customer));
            return payload.data;
          }
        } catch (error) {
          if (backendMode === "database") throw error;
          setBackendMode("local");
          setSyncError(
            error instanceof Error
              ? error.message
              : "顧客情報のDB保存を確認できませんでした。",
          );
        }
      }

      return saveLocalCustomer(draft);
    },
    [backendMode, saveLocalCustomer],
  );

  const deleteCustomer = useCallback(
    async (customerId: string) => {
      if (backendMode !== "local") {
        try {
          const response = await fetch("/api/customers", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId }),
          });
          const payload = (await response.json()) as CustomerDeleteResponse;

          if (!response.ok) {
            throw new Error(payload.error?.message ?? "顧客情報を削除できませんでした。");
          }
          if (payload.mode === "database") {
            setBackendMode("database");
            setSyncError(null);
            setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
            return;
          }
        } catch (error) {
          if (backendMode === "database") throw error;
          setBackendMode("local");
          setSyncError(
            error instanceof Error
              ? error.message
              : "顧客情報のDB削除を確認できませんでした。",
          );
        }
      }

      setCustomers((prev) => {
        const next = prev.filter((customer) => customer.id !== customerId);
        writeLocalCustomers(next);
        return next;
      });
    },
    [backendMode],
  );

  return {
    customers,
    backendMode,
    syncError,
    saveCustomer,
    deleteCustomer,
  };
}
