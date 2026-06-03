"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { estimates as seedEstimates } from "./mock";
import type { Estimate } from "./types";

const STORAGE_KEY = "voice-estimate.estimates.v1";
const PLACEHOLDER_NO = "（保存時に自動採番）";

type BackendMode = "checking" | "database" | "local";

interface EstimateStorePayload {
  version: 1;
  updatedAt: string;
  estimates: Estimate[];
}

interface EstimateListResponse {
  data?: Estimate[];
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

interface EstimateSaveResponse {
  data?: Estimate;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

function cloneEstimate(estimate: Estimate): Estimate {
  return JSON.parse(JSON.stringify(estimate)) as Estimate;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSavedEstimates(): Estimate[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<EstimateStorePayload>;
    if (!Array.isArray(parsed.estimates)) return [];
    return parsed.estimates;
  } catch {
    return [];
  }
}

function writeSavedEstimates(estimates: Estimate[]) {
  if (!canUseStorage()) return;
  const payload: EstimateStorePayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    estimates,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function sortEstimates(estimates: Estimate[]): Estimate[] {
  return [...estimates].sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || a.estimateDate || "") || 0;
    const bTime = Date.parse(b.updatedAt || b.estimateDate || "") || 0;
    return bTime - aTime;
  });
}

export function mergeEstimates(savedEstimates: Estimate[]): Estimate[] {
  const byId = new Map<string, Estimate>();
  for (const estimate of seedEstimates) byId.set(estimate.id, cloneEstimate(estimate));
  for (const estimate of savedEstimates) byId.set(estimate.id, cloneEstimate(estimate));
  return sortEstimates(Array.from(byId.values()));
}

function existingEstimateNumbers(estimates: Estimate[]): number[] {
  return estimates
    .map((estimate) => estimate.estimateNo.match(/^Q-\d{4}-(\d{4,})$/)?.[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function nextEstimateNo(allEstimates: Estimate[], now = new Date()): string {
  const year = now.getFullYear();
  const max = Math.max(0, ...existingEstimateNumbers(allEstimates));
  return `Q-${year}-${String(max + 1).padStart(4, "0")}`;
}

function needsNewIdentity(estimate: Estimate): boolean {
  return estimate.id === "new" || estimate.id.trim() === "";
}

function needsEstimateNo(estimate: Estimate): boolean {
  return !estimate.estimateNo || estimate.estimateNo === PLACEHOLDER_NO;
}

function normalizeForLocalSave(estimate: Estimate, allEstimates: Estimate[]): Estimate {
  const now = new Date();
  return {
    ...cloneEstimate(estimate),
    id: needsNewIdentity(estimate) ? `local-${now.getTime()}` : estimate.id,
    estimateNo: needsEstimateNo(estimate) ? nextEstimateNo(allEstimates, now) : estimate.estimateNo,
    updatedAt: now.toISOString(),
    lines: estimate.lines.map((line, index) => ({ ...line, lineNo: index + 1 })),
  };
}

function replaceEstimate(estimates: Estimate[], saved: Estimate, previousId?: string): Estimate[] {
  return sortEstimates([
    saved,
    ...estimates.filter((item) => item.id !== saved.id && item.id !== previousId),
  ]);
}

async function fetchDatabaseEstimates(): Promise<Estimate[] | null> {
  const response = await fetch("/api/estimates", { cache: "no-store" });
  const payload = (await response.json()) as EstimateListResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? "見積データを取得できませんでした。");
  if (payload.mode !== "database") return null;
  return payload.data ?? [];
}

async function postDatabaseEstimate(estimate: Estimate): Promise<Estimate | null> {
  const response = await fetch("/api/estimates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estimate }),
  });
  const payload = (await response.json()) as EstimateSaveResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? "見積を保存できませんでした。");
  if (payload.mode !== "database") return null;
  if (!payload.data) throw new Error("保存結果を取得できませんでした。");
  return payload.data;
}

export function useEstimateStore() {
  const [savedEstimates, setSavedEstimates] = useState<Estimate[]>([]);
  const [databaseEstimates, setDatabaseEstimates] = useState<Estimate[]>([]);
  const [backendMode, setBackendMode] = useState<BackendMode>("checking");
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setSavedEstimates(readSavedEstimates());
    setReady(true);

    fetchDatabaseEstimates()
      .then((rows) => {
        if (cancelled) return;
        if (rows === null) {
          setBackendMode("local");
          return;
        }
        setDatabaseEstimates(rows);
        setBackendMode("database");
        setSyncError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setBackendMode("local");
        setSyncError(error instanceof Error ? error.message : "DB接続を確認できませんでした。");
      });

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setSavedEstimates(readSavedEstimates());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const activeSavedEstimates = backendMode === "database" ? databaseEstimates : savedEstimates;
  const estimates = useMemo(() => mergeEstimates(activeSavedEstimates), [activeSavedEstimates]);

  const getEstimate = useCallback(
    (id: string) => estimates.find((estimate) => estimate.id === id),
    [estimates],
  );

  const saveLocalEstimate = useCallback(
    (estimate: Estimate) => {
      const normalized = normalizeForLocalSave(estimate, estimates);
      setSavedEstimates((prev) => {
        const next = replaceEstimate(prev, normalized, estimate.id);
        writeSavedEstimates(next);
        return next;
      });
      return normalized;
    },
    [estimates],
  );

  const saveEstimate = useCallback(
    async (estimate: Estimate) => {
      if (backendMode !== "local") {
        const saved = await postDatabaseEstimate(estimate);
        if (saved) {
          setBackendMode("database");
          setSyncError(null);
          setDatabaseEstimates((prev) => replaceEstimate(prev, saved, estimate.id));
          return saved;
        }
        setBackendMode("local");
      }

      return saveLocalEstimate(estimate);
    },
    [backendMode, saveLocalEstimate],
  );

  const resetSavedEstimates = useCallback(() => {
    if (canUseStorage()) window.localStorage.removeItem(STORAGE_KEY);
    setSavedEstimates([]);
  }, []);

  return {
    ready,
    backendMode,
    syncError,
    estimates,
    savedEstimates: activeSavedEstimates,
    localSavedEstimates: savedEstimates,
    getEstimate,
    saveEstimate,
    resetSavedEstimates,
  };
}