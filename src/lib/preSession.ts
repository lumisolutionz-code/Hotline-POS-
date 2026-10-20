// Utility and service for Pre-Session early sales buffer
const API_URL = (import.meta.env.VITE_API_URL as string) || "https://api.hotlinecellular.lk/api/v1";

export interface AvailableStockImei {
  stockItemId: string;
  variantId?: string | null;
  imei?: string;
  imei2?: string;
  serialNumber?: string;
  branchName?: string;
  sellingPrice?: number;
}

export interface PreSessionLookupItem {
  productId: string;
  variantId?: string | null;
  stockItemId?: string | null;
  name: string;
  itemCode?: string;
  barcode?: string;
  imei?: string;
  serialNumber?: string;
  standardPrice: number;
  soldPrice: number;
  trackingType?: "IMEI" | "QUANTITY" | string;
  branch?: string | null;
  branchName?: string;
  availableImeis?: AvailableStockImei[];
}

export interface PreSessionRecord {
  _id: string;
  branch?: string | null;
  product?: any;
  variant?: any;
  stockItem?: any;
  name: string;
  itemCode?: string;
  barcode?: string;
  imei?: string;
  serialNumber?: string;
  standardPrice: number;
  soldPrice: number;
  quantity: number;
  trackingType?: string;
  notes?: string;
  createdAt?: string;
}

const LOCAL_STORAGE_KEY = "hotline_pre_session_records";

export function getLocalPreSessionRecords(): PreSessionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPreSessionRecords(records: PreSessionRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to save local pre-session records", err);
  }
}

/**
 * Fast lookup item by IMEI, Serial, Barcode, or Name
 */
export async function lookupPreSession(query: string, branchId?: string): Promise<PreSessionLookupItem> {
  const q = encodeURIComponent(query.trim());
  const b = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
  const res = await fetch(`${API_URL}/pre-session/lookup/${q}${b}`);
  const json = await res.json();
  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || `No item found for "${query}"`);
  }
  return json.data.item;
}

/**
 * Fetch all pending pre-session records from DB with local fallback
 */
export async function fetchPreSessionRecords(branchId?: string): Promise<PreSessionRecord[]> {
  try {
    const b = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
    const res = await fetch(`${API_URL}/pre-session${b}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data?.records)) {
        saveLocalPreSessionRecords(json.data.records);
        return json.data.records;
      }
    }
  } catch (err) {
    console.warn("Backend pre-session fetch failed, falling back to local storage:", err);
  }
  return getLocalPreSessionRecords();
}

/**
 * Save a new pre-session record to DB and localStorage
 */
export async function addPreSessionRecord(payload: {
  branch?: string | null;
  product?: string;
  variant?: string | null;
  stockItem?: string | null;
  name: string;
  itemCode?: string;
  barcode?: string;
  imei?: string;
  serialNumber?: string;
  standardPrice: number;
  soldPrice: number;
  quantity?: number;
  trackingType?: string;
  notes?: string;
}): Promise<PreSessionRecord> {
  const localId = `pre_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const localRecord: PreSessionRecord = {
    _id: localId,
    ...payload,
    quantity: payload.quantity || 1,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${API_URL}/pre-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status === "success" && json.data?.record) {
        const saved = json.data.record;
        const current = getLocalPreSessionRecords();
        saveLocalPreSessionRecords([saved, ...current.filter((r) => r._id !== localId)]);
        return saved;
      }
    }
  } catch (err) {
    console.warn("Backend pre-session save failed, stored locally:", err);
  }

  // Fallback to local storage
  const current = getLocalPreSessionRecords();
  const updated = [localRecord, ...current];
  saveLocalPreSessionRecords(updated);
  return localRecord;
}

/**
 * Delete a single pre-session record
 */
export async function removePreSessionRecord(id: string): Promise<void> {
  const current = getLocalPreSessionRecords();
  saveLocalPreSessionRecords(current.filter((r) => r._id !== id));

  try {
    await fetch(`${API_URL}/pre-session/${id}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Backend delete pre-session failed:", err);
  }
}

/**
 * Clear all pre-session records
 */
export async function clearAllPreSessionRecords(branchId?: string): Promise<void> {
  saveLocalPreSessionRecords([]);

  try {
    const b = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
    await fetch(`${API_URL}/pre-session${b}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Backend clear all pre-session failed:", err);
  }
}
