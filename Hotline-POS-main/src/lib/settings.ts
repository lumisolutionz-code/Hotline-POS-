// POS Settings Utilities
// Manages shop settings and keyboard shortcuts via localStorage

// ============================================
// Types
// ============================================

export interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  email: string;
  footerMessage: string;
  barcodeEnabled: boolean;
}

export interface ScannerDevice {
  id: string;
  name: string;
  type: "USB HID" | "Bluetooth / Wireless" | "Keyboard Wedge (Auto-Detected)";
  vendorId?: string | number;
  productId?: string | number;
  status: "active" | "paused";
  lastSeen?: string;
}

export interface KeyboardShortcuts {
  payNow: string;
  clearCart: string;
  openRepairs: string;
  openSales: string;
  focusSearch: string;
  logout: string;
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: "New Challenge (Pvt) Ltd",
  address: "No 27, Katuwana Road, Homagama",
  phone: "0777309726 / 0777476279",
  email: "hotlinephoneshop@gmail.com",
  footerMessage: "Thank you for shopping at Hotline Cellular! Official Warranty Included.",
  barcodeEnabled: true,
};

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcuts = {
  payNow: "F1",
  clearCart: "F2",
  openRepairs: "F3",
  openSales: "F4",
  focusSearch: "F5",
  logout: "F12",
};

// ============================================
// Storage Keys
// ============================================

const SHOP_SETTINGS_KEY = "pos_shop_settings";
const KEYBOARD_SHORTCUTS_KEY = "pos_keyboard_shortcuts";

// ============================================
// Shop Settings Functions
// ============================================

export function getShopSettings(): ShopSettings {
  try {
    const stored = localStorage.getItem(SHOP_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate legacy default name if present
      if (!parsed.shopName || parsed.shopName === "Hotline Cellular") {
        parsed.shopName = "New Challenge (Pvt) Ltd";
      }
      // Migrate address/phone/email if they were previous defaults
      if (!parsed.address || parsed.address.includes("Galle Road")) {
        parsed.address = "No 27, Katuwana Road, Homagama";
      }
      if (!parsed.phone || parsed.phone === "+94 76 123 4567") {
        parsed.phone = "0777309726 / 0777476279";
      }
      if (!parsed.email || parsed.email === "support@hotline.lk") {
        parsed.email = "hotlinephoneshop@gmail.com";
      }
      // Receipt bottom should be Hotline Cellular instead of New Challenge
      if (!parsed.footerMessage || parsed.footerMessage.includes("New Challenge")) {
        parsed.footerMessage = "Thank you for shopping at Hotline Cellular! Official Warranty Included.";
      }
      return { ...DEFAULT_SHOP_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load shop settings:", e);
  }
  return DEFAULT_SHOP_SETTINGS;
}

export function saveShopSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(SHOP_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save shop settings:", e);
  }
}

// ============================================
// Scanner Devices Functions
// ============================================

export const SCANNER_DEVICES_KEY = "pos_scanner_devices";

export function getSavedScannerDevices(): ScannerDevice[] {
  try {
    const stored = localStorage.getItem(SCANNER_DEVICES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load scanner devices:", e);
  }
  return [
    {
      id: "default-laser-scanner",
      name: "USB Hardware Barcode Reader (Laser / CCD)",
      type: "Keyboard Wedge (Auto-Detected)",
      status: "active",
      lastSeen: new Date().toLocaleTimeString(),
    },
  ];
}

export function saveScannerDevices(devices: ScannerDevice[]): void {
  try {
    localStorage.setItem(SCANNER_DEVICES_KEY, JSON.stringify(devices));
  } catch (e) {
    console.error("Failed to save scanner devices:", e);
  }
}

// ============================================
// Keyboard Shortcuts Functions
// ============================================

export function getKeyboardShortcuts(): KeyboardShortcuts {
  try {
    const stored = localStorage.getItem(KEYBOARD_SHORTCUTS_KEY);
    if (stored) {
      return { ...DEFAULT_KEYBOARD_SHORTCUTS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load keyboard shortcuts:", e);
  }
  return DEFAULT_KEYBOARD_SHORTCUTS;
}

export function saveKeyboardShortcuts(shortcuts: KeyboardShortcuts): void {
  try {
    localStorage.setItem(KEYBOARD_SHORTCUTS_KEY, JSON.stringify(shortcuts));
  } catch (e) {
    console.error("Failed to save keyboard shortcuts:", e);
  }
}

// ============================================
// Receipt Header Generator
// ============================================

export function getReceiptHeader(): string {
  const settings = getShopSettings();
  let header = "";
  
  if (settings.shopName) {
    header += `${settings.shopName}\n`;
  }
  if (settings.address) {
    header += `${settings.address}\n`;
  }
  if (settings.phone) {
    header += `Phone: ${settings.phone}\n`;
  }
  if (settings.email) {
    header += `Email: ${settings.email}\n`;
  }
  
  return header;
}

export function getReceiptFooter(): string {
  const settings = getShopSettings();
  return settings.footerMessage || "Thank you for your business!";
}

// ============================================
// Key Display Names
// ============================================

export const SHORTCUT_LABELS: Record<keyof KeyboardShortcuts, string> = {
  payNow: "Pay Now / Complete Sale",
  clearCart: "Clear Cart",
  openRepairs: "Open Repairs Panel",
  openSales: "Open Sales Panel",
  focusSearch: "Focus Search Box",
  logout: "Logout",
};
