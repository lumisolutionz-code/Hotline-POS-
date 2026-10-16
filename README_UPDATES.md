# Hotline POS - Updates & Modifications Changelog

This document provides a detailed breakdown of all updates, styling refinements, icon migrations, keyboard shortcuts, and resolution fixes applied to the **Hotline POS (Electron + React)** application.

---

## 1. Summary of Updates

### 🖥️ Resolution Scaling for 1366×768 Displays
- **Target File**: `src/index.css`
- **What Changed**:
  - Added media query: `@media screen and (max-width: 1366px) and (max-height: 800px) { body { zoom: 0.82; } }`
  - Fixed previous white margin / letterboxing bug caused by scaling `#root`. In Chromium/Electron, applying `body { zoom: 0.82; }` cleanly scales the entire UI down ~18% uniformly to comfortably fit standard 1366×768 POS monitors without cutting off tables or buttons.

### ⌨️ F2 Shortcut to Focus Search Bar
- **Target Files**:
  - `src/lib/settings.ts`:
    - `focusSearch` default changed to **`F2`** (previously `F5`).
    - `clearCart` default changed to **`F6`** (previously `F2`).
  - `src/pages/POS.tsx`:
    - Moved the search shortcut detection *before* the input-guard check.
    - Pressing **`F2`** now works globally from anywhere in the POS (even if focus is currently inside another input field).
    - Automatically calls `.select()` on the input so any current text is highlighted for instant overwriting or barcode scanning.
  - *Tip*: If cashiers had previously saved custom shortcuts, navigate to **Settings → Keyboard Shortcuts → Reset to Defaults**.

### 🎨 Modal & Form Input Color Fixes
- **Target File**: `src/index.css`
- **What Changed**:
  - Global CSS rules enforce high-contrast `#0f172a` (dark slate) text on all `<input>`, `<select>`, and `<textarea>` elements located inside modal dialogs and overlays.
  - Fixes unreadable white-on-white text in repairs, warranties, payments, and branch selector modals.
  - Added `.dark-input` utility class for screens that require dark-themed inputs (e.g. Sales panel).

### ✨ Emoji Replacement with Lucide Icons
Replaced all unicode emojis with proper, theme-matching SVG icons from `lucide-react`:
- **Panels**:
  - `src/components/pos/panels/RepairsPanel.tsx`: Replaced status emojis with `Wrench`, `Clock`, `CheckCircle2`, `AlertCircle`, `Filter`, `Search`, etc.
  - `src/components/pos/panels/SalesPanel.tsx`: Replaced payment and status emojis with `CreditCard`, `Banknote`, `QrCode`, `Receipt`.
  - `src/components/pos/panels/ReturnsPanel.tsx`: Replaced emojis with `RotateCcw`, `FileText`, `AlertTriangle`.
  - `src/components/pos/panels/WarrantyPanel.tsx`: Replaced emojis with `ShieldCheck`, `ShieldAlert`, `FileCheck`.
- **Modals**:
  - `src/components/pos/modals/CreateRepairModal.tsx`: Replaced emojis across all device inspection checklist items with `Smartphone`, `Check`, `XCircle`, `BatteryCharging`, etc.
  - `src/components/pos/modals/PaymentModal.tsx` & `RepairPaymentModal.tsx`: Replaced currency/payment emojis with clean Lucide icons.
  - `src/components/pos/modals/WarrantyClaimModal.tsx`: Replaced emojis with `ShieldAlert`, `CheckCircle2`, `ClipboardList`.
  - `src/components/pos/modals/BranchSelectorModal.tsx` & `PermissionOverrideModal.tsx`: Replaced emojis with `Store`, `MapPin`, `LockKeyhole`, `Shield`.
  - `src/components/pos/modals/VariantSelectionModal.tsx`: Replaced emojis with `Layers`, `Package`, `Check`.
- **Settings Page (`src/pages/Settings.tsx`)**:
  - Replaced emojis in navigation tabs with `Store`, `Keyboard`, `Palette`, `Plug`, `Rocket`.
  - Replaced hardware scanner status emojis with `Circle`, `PauseCircle`, `ScanBarcode`, `Zap`.
  - Replaced update alerts with `AlertTriangle`, `KeyRound`, `RefreshCw`, `Loader2`.
  - Fixed edge-to-edge layout so no unwanted white borders or horizontal bars appear.

### ⚙️ Electron Main Process
- **Target File**: `dist-electron/main.js`
- **What Changed**:
  - Disabled automatic opening of Chromium DevTools (`openDevTools()`) on application launch.
  - Enhanced error messaging for private GitHub release 404 updates.

---

## 2. Quick Reference for Future Developers

1. **Adding New Icons**:
   - Always import from `lucide-react`. Do not paste unicode emojis directly into `.tsx` components.
2. **Changing Resolution Zoom**:
   - Inspect `src/index.css`. Adjust the `zoom` percentage inside `@media screen and (max-width: 1366px) and (max-height: 800px)`.
3. **Adding Modals**:
   - All `<input>` tags inside modals automatically inherit readable dark text via `src/index.css`. If an input needs custom styling, use standard Tailwind classes or `.dark-input`.
