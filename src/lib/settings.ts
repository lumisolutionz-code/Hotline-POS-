// POS Settings Utilities
// Manages shop settings and keyboard shortcuts via localStorage

// ============================================
// Types
// ============================================

export interface ShopSettings {
  shopName: string;
  regNo?: string;
  address: string;
  phone: string;
  email: string;
  footerMessage: string;
  barcodeEnabled?: boolean;
  usePreprintedPaper?: boolean;
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
  regNo: "PV 00301591",
  address: "No 27, Katuwana Road, Homagama",
  phone: "0777309726 / 0777476279",
  email: "hotlinephoneshop@gmail.com",
  footerMessage: "Thank you for shopping at Hotline Cellular! Official Warranty Included.",
  barcodeEnabled: true,
  usePreprintedPaper: true,
};

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcuts = {
  payNow: "F1",
  clearCart: "F6",
  openRepairs: "F3",
  openSales: "F4",
  focusSearch: "F2",
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
    let parsed: any = {};
    if (stored) {
      parsed = JSON.parse(stored);
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
    }

    // Resolve current active branch details from logged-in POS session if available
    let branchAddress = "";
    let branchBusinessName = "";
    let branchRegNo = "";
    let branchPhone = "";
    let branchEmail = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const b = u?.currentSession?.branch || u?.branch;
        if (b) {
          if (b.businessName) branchBusinessName = String(b.businessName).trim();
          if (b.regNo) branchRegNo = String(b.regNo).trim();
          if (b.phone) branchPhone = String(b.phone).trim();
          if (b.email) branchEmail = String(b.email).trim();
          if (b.address) {
            if (typeof b.address === "string") {
              branchAddress = b.address.trim();
            } else if (typeof b.address === "object") {
              const parts = [b.address.street, b.address.city, b.address.province, b.address.postalCode].filter(Boolean);
              branchAddress = parts.length > 0 ? parts.join(", ") : Object.values(b.address).filter(Boolean).join(", ");
            }
          }
        }
      }
    } catch (_) {}

    const effectiveAddress = branchAddress || parsed.address || DEFAULT_SHOP_SETTINGS.address;
    const effectiveShopName = parsed.shopName || branchBusinessName || DEFAULT_SHOP_SETTINGS.shopName;
    const effectiveRegNo = parsed.regNo || branchRegNo || DEFAULT_SHOP_SETTINGS.regNo;
    const effectivePhone = parsed.phone || branchPhone || DEFAULT_SHOP_SETTINGS.phone;
    const effectiveEmail = parsed.email || branchEmail || DEFAULT_SHOP_SETTINGS.email;

    return {
      ...DEFAULT_SHOP_SETTINGS,
      ...parsed,
      shopName: effectiveShopName,
      regNo: effectiveRegNo,
      address: effectiveAddress,
      phone: effectivePhone,
      email: effectiveEmail,
    };
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
