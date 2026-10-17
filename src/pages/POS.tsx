import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PERMISSIONS } from "../constants/permission";
import { api } from "../lib/api";
import { getKeyboardShortcuts, getShopSettings } from "../lib/settings";

// Global in-memory cache for product variants & live stock items for instant popup opening
const productVariantsCache = new Map<string, { data: any; timestamp: number }>();

// Import types from centralized types file
import {
  Category,
  Product,
  CartItem,
  RepairJob,
  Warranty,
  CategoriesResponse,
  ProductsResponse,
  RepairsResponse,
} from "../types/pos";

// Import extracted POS components
import {
  PaymentModal,
  RepairPaymentModal,
  ProductDetailModal,
  WarrantyClaimModal,
  VariantSelectionModal,
  CustomerRequestModal,
  ReportsModal,
  SalesPanel,
  RepairsPanel,
  ExpensesPanel,
  ReturnsPanel,
  WarrantyPanel,
  SimReloadPanel,
  CashDrawerModal,
} from "../components/pos";

import companyIcon from "../assets/company-icon.png";
import companyLogo from "../assets/logo.png";

import {
  Layers,
  Smartphone,
  Sparkles,
  Headphones,
  Cable,
  BatteryCharging,
  SlidersHorizontal,
  Phone,
  Watch,
  Laptop,
  Shield,
  Globe,
  Banknote,
} from "lucide-react";

const getCategoryIcon = (name: string, className = "w-4 h-4") => {
  const lower = (name || "").toLowerCase();

  if (/watch/i.test(lower)) {
    return <Watch className={className} />;
  }
  if (/button|keypad|basic\s*phone/i.test(lower)) {
    return <Phone className={className} />;
  }
  if (/part|spare|display|tool|repair|mod/i.test(lower)) {
    return <SlidersHorizontal className={className} />;
  }
  if (/power|charger|battery|adapter|charging/i.test(lower)) {
    return <BatteryCharging className={className} />;
  }
  if (/case|cover|pouch|guard|protector|glass|tempered/i.test(lower)) {
    return <Shield className={className} />;
  }
  if (/cable|cord|wire|lightning|type\s*c/i.test(lower)) {
    return <Cable className={className} />;
  }
  if (/audio|sound|speaker|headset|headphone|earphone|handsfree|bose|jbl|sony/i.test(lower)) {
    return <Headphones className={className} />;
  }
  if (/laptop|macbook|computer|asus|msi|lenovo|hp|acer|dell/i.test(lower)) {
    return <Laptop className={className} />;
  }
  if (/access/i.test(lower)) {
    return <Sparkles className={className} />;
  }
  if (/phone|cellular|smartphone|mobile|apple|samsung|oppo|redmi|xiaomi|huawei/i.test(lower)) {
    return <Smartphone className={className} />;
  }

  return <Sparkles className={className} />;
};

// In-memory & LocalStorage cache helpers for instant (0ms) POS startup
let memoryCategoryTreeCache: Category[] = [];
let memoryProductsCache: Product[] = [];

const getInitialCategoryTree = (): Category[] => {
  if (memoryCategoryTreeCache.length > 0) return memoryCategoryTreeCache;
  try {
    const raw = localStorage.getItem("pos_categories_cache");
    if (raw) {
      memoryCategoryTreeCache = JSON.parse(raw);
      return memoryCategoryTreeCache;
    }
  } catch {}
  return [];
};

const getInitialProducts = (): Product[] => {
  if (memoryProductsCache.length > 0) return memoryProductsCache;
  try {
    const raw = localStorage.getItem("pos_products_cache");
    if (raw) {
      memoryProductsCache = JSON.parse(raw);
      return memoryProductsCache;
    }
  } catch {}
  return [];
};

/* =======================
   POS Component
======================= */

export default function POS(): JSX.Element {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  // Permission checks
  const canApplyDiscount = hasPermission(PERMISSIONS.APPLY_DISCOUNT);
  const canVoidSale = hasPermission(PERMISSIONS.VOID_SALE);
  const canViewReports = hasPermission(PERMISSIONS.VIEW_SALES_REPORT);
  const canViewRepairs =
    hasPermission(PERMISSIONS.VIEW_REPAIRS) ||
    hasPermission(PERMISSIONS.COLLECT_REPAIR_PAYMENT);
  const canCollectRepairPayment = hasPermission(
    PERMISSIONS.COLLECT_REPAIR_PAYMENT,
  );
  const canProcessReturn = hasPermission(PERMISSIONS.CREATE_RETURN);
  const canViewWarranties = hasPermission(PERMISSIONS.VIEW_WARRANTIES);
  const canCreateWarrantyClaim = hasPermission(
    PERMISSIONS.CREATE_WARRANTY_CLAIM,
  );

  // State with Instant Cache Hydration (Stale-While-Revalidate)
  const [categoryTree, setCategoryTree] = useState<Category[]>(() => getInitialCategoryTree());
  const [products, setProducts] = useState<Product[]>(() => getInitialProducts());
  const [selectedParentCategory, setSelectedParentCategory] = useState<
    string | null
  >(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null,
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isGoogleReviewEnabled, setIsGoogleReviewEnabled] = useState<boolean>(false);
  const [googleReviewDiscount, setGoogleReviewDiscount] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productPage, setProductPage] = useState<number>(1);
  const PRODUCTS_PER_PAGE = 15;
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getInitialProducts();
    return cached.length === 0;
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    setProductPage(1);
  }, [searchQuery, selectedParentCategory, selectedSubCategory]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sales Panel State
  const [showSalesPanel, setShowSalesPanel] = useState<boolean>(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [salesLoading, setSalesLoading] = useState<boolean>(false);

  // Repairs Panel State
  const [showRepairsPanel, setShowRepairsPanel] = useState<boolean>(false);
  const [showExpensesPanel, setShowExpensesPanel] = useState<boolean>(false);
  const [showSimReloadPanel, setShowSimReloadPanel] = useState<boolean>(false);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [repairsLoading, setRepairsLoading] = useState<boolean>(false);
  const [selectedRepairForPayment, setSelectedRepairForPayment] =
    useState<RepairJob | null>(null);

  // Product Details Modal State
  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState<Product | null>(null);

  // Returns Panel State
  const [showReturnsPanel, setShowReturnsPanel] = useState<boolean>(false);
  const [exchangePayload, setExchangePayload] = useState<any | null>(null);

  // Warranty Panel State
  const [showWarrantyPanel, setShowWarrantyPanel] = useState<boolean>(false);
  const [selectedWarrantyForClaim, setSelectedWarrantyForClaim] =
    useState<Warranty | null>(null);

  // Modal State
  const [showVariantModal, setShowVariantModal] = useState<boolean>(false);
  const [isVariantModalLoading, setIsVariantModalLoading] = useState<boolean>(false);
  const [showCustomerRequestModal, setShowCustomerRequestModal] = useState<boolean>(false);
  const [showReportsModal, setShowReportsModal] = useState<boolean>(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingVariantId, setPendingVariantId] = useState<string | undefined>(undefined);
  const [pendingSerialNumber, setPendingSerialNumber] = useState<string | undefined>(undefined);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: "error" | "success" } | null>(null);

  // Cash Drawer Session State
  const [activeCashSession, setActiveCashSession] = useState<any | null>(null);
  const [expectedOpeningAmount, setExpectedOpeningAmount] = useState<number>(0);
  const [showCashDrawerModal, setShowCashDrawerModal] = useState<boolean>(false);
  const [cashDrawerModalMode, setCashDrawerModalMode] = useState<"OPEN" | "VIEW" | "CLOSE">("OPEN");
  const [sessionTimerDisplay, setSessionTimerDisplay] = useState<string>("00:00:00");
  const hasAutoPromptedDrawerRef = useRef<boolean>(false);

  const fetchCurrentSession = async (silent: boolean = false) => {
    try {
      const res = await api<any>("/cash-sessions/current");
      if (res.status === "success" && res.data) {
        if (res.data.hasActiveSession && res.data.session) {
          setActiveCashSession(res.data.session);
        } else {
          setActiveCashSession(null);
          setExpectedOpeningAmount(res.data.expectedOpeningAmount || 0);

          // Auto-prompt popup on first login when no session is active for the day/shift
          if (!hasAutoPromptedDrawerRef.current) {
            hasAutoPromptedDrawerRef.current = true;
            setCashDrawerModalMode("OPEN");
            setShowCashDrawerModal(true);
          }
        }
      }
    } catch (err) {
      if (!silent) console.error("Failed to check drawer session:", err);
    }
  };

  // Live session timer in POS header
  useEffect(() => {
    if (!activeCashSession?.openedAt) {
      setSessionTimerDisplay("00:00:00");
      return;
    }
    const updateTimer = () => {
      const startMs = new Date(activeCashSession.openedAt).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      const hrs = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      setSessionTimerDisplay(
        `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeCashSession?.openedAt]);

  const showError = (msg: string) => {
    setToastNotification({ message: msg, type: "error" });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.message === msg ? null : prev));
    }, 4000);
  };

  const showSuccess = (msg: string) => {
    setToastNotification({ message: msg, type: "success" });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.message === msg ? null : prev));
    }, 3000);
  };

  // SSO Navigation to Website Admin Panel
  const handleGoToWebsite = () => {
    try {
      const websiteBase = (
        import.meta.env.VITE_WEBSITE_URL ||
        ((import.meta.env.VITE_API_URL || "").includes("localhost") ||
        (import.meta.env.VITE_API_URL || "").includes("127.0.0.1")
          ? "http://localhost:8000"
          : "https://hotlinecellular.lk")
      ).replace(/\/+$/, "");

      // Retrieve credentials stored during login or active token
      const savedCredsRaw = localStorage.getItem("pos_auth_creds");
      const token = localStorage.getItem("accessToken") || "";
      let username = "";
      let password = "";

      if (savedCredsRaw) {
        try {
          const parsed = JSON.parse(savedCredsRaw);
          username = parsed.username || "";
          password = parsed.password || "";
        } catch {
          // ignore
        }
      }

      if (!username && user?.username) {
        username = user.username;
      }

      const ssoPayload = {
        username,
        password,
        token,
        timestamp: Date.now(),
      };

      const payloadStr = JSON.stringify(ssoPayload);
      const encodedData = btoa(
        encodeURIComponent(payloadStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );

      const ssoUrl = `${websiteBase}/admin/sso-login?sso_data=${encodeURIComponent(encodedData)}`;

      const ipc = (window as any).ipcRenderer;
      if (ipc && typeof ipc.invoke === "function") {
        ipc.invoke("open_external", ssoUrl).catch(() => {
          window.open(ssoUrl, "_blank");
        });
      } else {
        window.open(ssoUrl, "_blank");
      }
    } catch (err: any) {
      console.error("Failed to redirect to website:", err);
      showError("Failed to open website admin panel");
    }
  };

  // Helper to format variant display
  const formatVariantDisplay = (v: any) => {
    if (!v) return undefined;
    if (Array.isArray(v.attributes) && v.attributes.length > 0) {
      return v.attributes
        .map((a: any) => (typeof a === "object" ? (a.value || a.name || "") : String(a)))
        .filter(Boolean)
        .join(" - ");
    }
    return v.itemCode || v.sku || undefined;
  };

  // Helper to determine if a product or variant is an IMEI-tracked device
  const isImeiProduct = (prod: any, variant?: any): boolean => {
    if (!prod) return false;
    const rawProdTracking = String(prod.trackingType || "").toUpperCase();
    if (rawProdTracking === "IMEI") return true;
    if (variant && String(variant.trackingType || "").toUpperCase() === "IMEI") return true;
    if (Array.isArray(prod.variants) && prod.variants.some((v: any) => String(v.trackingType || "").toUpperCase() === "IMEI")) {
      return true;
    }
    if (Array.isArray(prod.stockItems) && prod.stockItems.some((s: any) => Boolean(s.imei1))) {
      return true;
    }
    if (rawProdTracking === "QUANTITY" || (variant && String(variant.trackingType || "").toUpperCase() === "QUANTITY")) {
      return false;
    }
    // Accessories are never IMEI tracked
    const isAccessory = /(cover|case|glass|protector|pouch|cable|charger|handsfree|headphone|earphone|adapter|battery|holder|strap|film|lens|power bank|speaker|back cover|tempered)/i.test(prod.name || "");
    if (isAccessory) return false;

    const catName = typeof prod.category === "object" ? prod.category?.name || "" : "";
    if (/phone|cellular|smartphone|tablet/i.test(catName) && !/accessory|accessories/i.test(catName)) return true;
    if (/\b(phone|smartphone|iphone|galaxy|pixel|redmi|xiaomi|oneplus|oppo|vivo|huawei)\b/i.test(prod.name || "")) return true;
    return false;
  };

  const productsRef = useRef<Product[]>(products);
  const cartRef = useRef<CartItem[]>(cart);
  const lastProcessedScanRef = useRef<{ code: string; time: number }>({ code: "", time: 0 });

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const processScannedBarcodeRef = useRef<(rawCode: string) => Promise<void>>(() => Promise.resolve());
  useEffect(() => {
    processScannedBarcodeRef.current = processScannedBarcode;
  });

  // Process scanned barcode, SKU, or IMEI/Serial
  const processScannedBarcode = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // Deduplicate rapid duplicate scans (within 400ms)
    const now = Date.now();
    if (
      lastProcessedScanRef.current.code.toLowerCase() === code.toLowerCase() &&
      now - lastProcessedScanRef.current.time < 400
    ) {
      return;
    }
    lastProcessedScanRef.current = { code, time: now };

    const currentProducts = productsRef.current && productsRef.current.length > 0 ? productsRef.current : products;
    const currentCart = cartRef.current || cart;

    // =========================================================================
    // STEP 1: INSTANT IN-MEMORY LOOKUP (< 0.1ms, zero network latency!)
    // Directly checks loaded products for variant or product barcode/SKU/itemCode
    // =========================================================================
    let targetProduct: any = null;
    let targetVariant: any = null;

    // Check if code matches a variant barcode/itemCode/sku/_id in memory
    for (const p of currentProducts) {
      if (p.variants && Array.isArray(p.variants)) {
        const matchingVariant = p.variants.find(
          (v: any) =>
            (v.itemCode && String(v.itemCode).trim().toLowerCase() === code.toLowerCase()) ||
            (v.barcode && String(v.barcode).trim().toLowerCase() === code.toLowerCase()) ||
            (v.sku && String(v.sku).trim().toLowerCase() === code.toLowerCase()) ||
            (v._id && String(v._id).toLowerCase() === code.toLowerCase())
        );
        if (matchingVariant) {
          targetProduct = p;
          targetVariant = matchingVariant;
          break;
        }
      }
    }

    // Check if code matches a product barcode, sku, or itemCode in memory
    if (!targetProduct) {
      targetProduct = currentProducts.find(
        (p: any) =>
          (p.barcode && String(p.barcode).trim().toLowerCase() === code.toLowerCase()) ||
          (p.sku && String(p.sku).trim().toLowerCase() === code.toLowerCase()) ||
          (p.itemCode && String(p.itemCode).trim().toLowerCase() === code.toLowerCase())
      );
    }

    // Check if code matches an IMEI or Serial in any product's stockItems directly in local memory (< 0.1ms)
    let matchedStockItem: any = null;
    let matchedStockItemProduct: any = null;

    if (!targetProduct) {
      const lowerCode = code.toLowerCase();
      for (const p of currentProducts as any[]) {
        if (Array.isArray(p.stockItems) && p.stockItems.length > 0) {
          const found = p.stockItems.find((si: any) =>
            (si.imei1 && String(si.imei1).trim().toLowerCase() === lowerCode) ||
            (si.imei2 && String(si.imei2).trim().toLowerCase() === lowerCode) ||
            (si.serialNumber && String(si.serialNumber).trim().toLowerCase() === lowerCode)
          );
          if (found) {
            matchedStockItemProduct = p;
            matchedStockItem = found;
            break;
          }
        }
      }
    }

    if (matchedStockItemProduct && matchedStockItem) {
      const liveCart = cartRef.current || currentCart;
      const alreadyInCart = liveCart.some(
        (item) =>
          (item.serialNumber && String(item.serialNumber).trim().toLowerCase() === code.toLowerCase()) ||
          (item.stockItemId && String(item.stockItemId) === String(matchedStockItem._id))
      );

      if (alreadyInCart) {
        showError(`Item with IMEI/Serial "${code}" is already in the cart!`);
        return;
      }

      // Resolve variant
      let variantObj: any = null;
      if (matchedStockItem.variant && Array.isArray(matchedStockItemProduct.variants)) {
        variantObj = matchedStockItemProduct.variants.find((v: any) =>
          String(v._id) === String(matchedStockItem.variant?._id || matchedStockItem.variant)
        );
      }
      if (!variantObj && Array.isArray(matchedStockItemProduct.variants) && matchedStockItemProduct.variants.length === 1) {
        variantObj = matchedStockItemProduct.variants[0];
      }

      addToCart(
        matchedStockItemProduct,
        code,
        variantObj || (typeof matchedStockItem.variant === "object" ? matchedStockItem.variant : undefined),
        matchedStockItem._id,
        matchedStockItem.sellingPrice || variantObj?.sellingPrice || matchedStockItemProduct.sellingPrice,
        true
      );
      return;
    }

    // Check if code matches a Serial number for non-IMEI (bulk/quantity) products directly in memory
    let matchedSerial: string | null = null;

    if (!targetProduct) {
      const lowerCode = code.toLowerCase();
      for (const p of currentProducts as any[]) {
        if (!isImeiProduct(p)) {
          if (p.serialNumber && String(p.serialNumber).trim().toLowerCase() === lowerCode) {
            targetProduct = p;
            matchedSerial = code;
            break;
          }
          if (Array.isArray(p.serialNumbers) && p.serialNumbers.some((s: string) => String(s).trim().toLowerCase() === lowerCode)) {
            targetProduct = p;
            matchedSerial = code;
            break;
          }
        }
      }
    }

    // If a Serial number of a quantity product was matched directly in local memory:
    if (targetProduct && matchedSerial) {
      const prodVariants = Array.isArray(targetProduct.variants) ? targetProduct.variants : [];
      if (prodVariants.length > 1 && !targetVariant) {
        setPendingProduct({ ...targetProduct, variants: prodVariants });
        setPendingVariantId(undefined);
        setPendingSerialNumber(code);
        setShowVariantModal(true);
        return;
      }
      addToCart(
        targetProduct,
        code,
        targetVariant || prodVariants[0] || undefined,
        undefined,
        targetVariant?.sellingPrice || targetProduct.sellingPrice,
        true
      );
      return;
    }

    // If product/variant found in local memory:
    if (targetProduct) {
      const prodVariants = Array.isArray(targetProduct.variants) ? targetProduct.variants : [];

      // If IMEI device: popup modal instantly
      if (isImeiProduct(targetProduct, targetVariant)) {
        const initialStock = Array.isArray(targetProduct.stockItems) ? targetProduct.stockItems : [];
        setPendingProduct({ ...targetProduct, variants: prodVariants, stockItems: initialStock });
        setPendingVariantId(targetVariant?._id || undefined);
        setPendingSerialNumber(undefined);
        setIsVariantModalLoading(true);
        setShowVariantModal(true);

        api<any>(`/products/${targetProduct._id}/with-variants`)
          .then((res) => {
            if (res && res.status === "success" && res.data) {
              productVariantsCache.set(targetProduct._id, { data: res.data, timestamp: Date.now() });
              applyWithVariantsData(targetProduct, res.data);
            }
          })
          .catch((err) => {
            console.error("Error fetching product variants in background:", err);
          })
          .finally(() => {
            setIsVariantModalLoading(false);
          });
        return;
      }

      // Quantity item: instant addition!
      if (targetVariant) {
        addToCart(
          targetProduct,
          undefined,
          targetVariant,
          undefined,
          targetVariant.sellingPrice || targetVariant.effectivePrice,
          true
        );
        return;
      }

      if (prodVariants.length === 0) {
        addToCart(targetProduct, undefined, undefined, undefined, undefined, true);
        return;
      }

      if (prodVariants.length === 1) {
        addToCart(
          targetProduct,
          undefined,
          prodVariants[0],
          undefined,
          prodVariants[0].sellingPrice || prodVariants[0].effectivePrice,
          true
        );
        return;
      }

      // Multiple variants and generic product barcode scanned:
      const initialStock = Array.isArray(targetProduct.stockItems) ? targetProduct.stockItems : [];
      setPendingProduct({ ...targetProduct, variants: prodVariants, stockItems: initialStock });
      setPendingVariantId(undefined);
      setPendingSerialNumber(undefined);
      setIsVariantModalLoading(true);
      setShowVariantModal(true);

      api<any>(`/products/${targetProduct._id}/with-variants`)
        .then((res) => {
          if (res && res.status === "success" && res.data) {
            productVariantsCache.set(targetProduct._id, { data: res.data, timestamp: Date.now() });
            applyWithVariantsData(targetProduct, res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching product variants in background:", err);
        })
        .finally(() => {
          setIsVariantModalLoading(false);
        });
      return;
    }

    // =========================================================================
    // STEP 2: PARALLEL BACKEND LOOKUP (Concurrently queries IMEI, Serial, and Barcode)
    // =========================================================================
    try {
      const isLikelyImei = /^\d{14,16}$/.test(code);
      let imeiRes: any = null;
      let serialRes: any = null;
      let barcodeRes: any = null;

      if (isLikelyImei) {
        imeiRes = await api<{ status?: string; data?: any }>(`/inventory/lookup/imei/${encodeURIComponent(code)}`).catch(() => null);
        if (!imeiRes || imeiRes.status !== "success" || !imeiRes.data?.stockItem) {
          [serialRes, barcodeRes] = await Promise.all([
            api<{ status?: string; data?: any }>(`/inventory/lookup/serial/${encodeURIComponent(code)}`).catch(() => null),
            api<{ status?: string; data?: { product?: any; variant?: any } }>(`/products/barcode/${encodeURIComponent(code)}`).catch(() => null)
          ]);
        }
      } else {
        [barcodeRes, serialRes, imeiRes] = await Promise.all([
          api<{ status?: string; data?: { product?: any; variant?: any } }>(`/products/barcode/${encodeURIComponent(code)}`).catch(() => null),
          api<{ status?: string; data?: any }>(`/inventory/lookup/serial/${encodeURIComponent(code)}`).catch(() => null),
          api<{ status?: string; data?: any }>(`/inventory/lookup/imei/${encodeURIComponent(code)}`).catch(() => null)
        ]);
      }

      // 1. Direct IMEI Lookup
      if (imeiRes && imeiRes.status === "success" && imeiRes.data?.stockItem) {
        const stockItem = imeiRes.data.stockItem;
        const liveCart = cartRef.current || currentCart;
        const alreadyInCart = liveCart.some(
          (item) =>
            (item.serialNumber && String(item.serialNumber).trim().toLowerCase() === code.toLowerCase()) ||
            (item.stockItemId && String(item.stockItemId) === String(stockItem._id))
        );

        if (alreadyInCart) {
          showError(`Item with IMEI "${code}" is already in the cart!`);
          return;
        }

        const itemProductId = stockItem.product?._id || stockItem.product || stockItem.stock?.product;
        let baseProduct = currentProducts.find((p) => String(p._id) === String(itemProductId));

        if (!baseProduct && stockItem.product) {
          baseProduct = {
            _id: String(itemProductId),
            name: stockItem.product.name || "Product",
            sku: stockItem.product.sku || stockItem.product.itemCode,
            sellingPrice: stockItem.product.sellingPrice || stockItem.sellingPrice || 0,
            costPrice: stockItem.product.costPrice || stockItem.costPrice || 0,
            stock: stockItem.qty || 1,
            trackingType: stockItem.product.trackingType || "IMEI",
            warrantyDuration: stockItem.product.warrantyDuration,
            warrantyType: stockItem.product.warrantyType,
          };
        }

        if (baseProduct) {
          addToCart(
            baseProduct,
            code,
            stockItem.variant,
            stockItem._id,
            stockItem.sellingPrice || stockItem.variant?.sellingPrice,
            true
          );
          return;
        }
      }

      // 2. Serial Number Lookup
      if (serialRes && serialRes.status === "success" && serialRes.data) {
        const data = serialRes.data;
        const stockItem = data.stockItem;

        if (data.isSerialNumber === true && stockItem) {
          const itemProductId = stockItem.product?._id || stockItem.product || stockItem.stock?.product;
          let targetProd = currentProducts.find((p) => String(p._id) === String(itemProductId));

          if (!targetProd && stockItem.product) {
            targetProd = {
              _id: String(itemProductId),
              name: stockItem.product.name || "Product",
              sku: stockItem.product.sku || stockItem.product.itemCode,
              sellingPrice: stockItem.sellingPrice || stockItem.product.sellingPrice || 0,
              costPrice: stockItem.costPrice || stockItem.product.costPrice || 0,
              stock: stockItem.qty || 1,
              trackingType: stockItem.product.trackingType || "QUANTITY",
              warrantyDuration: stockItem.product.warrantyDuration,
              warrantyType: stockItem.product.warrantyType,
            };
          }

          if (targetProd) {
            const isImei = isImeiProduct(targetProd, stockItem.variant);
            const liveCart = cartRef.current || currentCart;

            // Only block duplicate for unique IMEI devices; bulk items will increment quantity in addToCart!
            if (isImei) {
              const alreadyInCart = liveCart.some(
                (item) =>
                  (item.serialNumber && String(item.serialNumber).trim().toLowerCase() === code.toLowerCase()) ||
                  (item.stockItemId && String(item.stockItemId) === String(stockItem._id))
              );
              if (alreadyInCart) {
                showError(`Item with IMEI "${code}" is already in the cart!`);
                return;
              }
            }

            const serialVariants: any[] = Array.isArray(data.variants) && data.variants.length > 0
              ? data.variants
              : (stockItem.variant ? [stockItem.variant] : []);

            if (isImei) {
              const isActualImei = Boolean(
                (stockItem.imei1 && String(stockItem.imei1).trim().toLowerCase() === code.toLowerCase()) ||
                (stockItem.imei2 && String(stockItem.imei2).trim().toLowerCase() === code.toLowerCase())
              );

              // If user scanned a stock batch number (like STK-...) or there are multiple variants,
              // prompt for the physical phone IMEI via VariantSelectionModal
              if (!isActualImei || serialVariants.length > 1) {
                setPendingProduct({ ...targetProd, variants: serialVariants });
                setPendingVariantId(serialVariants[0]?._id);
                setPendingSerialNumber(code);
                setIsVariantModalLoading(true);
                setShowVariantModal(true);

                api<any>(`/products/${targetProd._id}/with-variants`)
                  .then((res) => {
                    if (res && res.status === "success" && res.data) {
                      productVariantsCache.set(targetProd._id, { data: res.data, timestamp: Date.now() });
                      applyWithVariantsData(targetProd, res.data);
                    }
                  })
                  .catch((err) => {
                    console.error("Error fetching product variants in background:", err);
                  })
                  .finally(() => {
                    setIsVariantModalLoading(false);
                  });
                return;
              }
            }

            if (serialVariants.length > 1) {
              setPendingProduct({ ...targetProd, variants: serialVariants });
              setPendingVariantId(serialVariants[0]?._id);
              setPendingSerialNumber(code);
              setShowVariantModal(true);
              return;
            } else {
              addToCart(
                targetProd,
                code,
                serialVariants[0] || stockItem.variant,
                stockItem._id,
                stockItem.sellingPrice,
                true
              );
              return;
            }
          }
        }

        if (data.isSerialNumber === false && data.product) {
          const p = data.product;
          const variants = data.variants || p.variants || [];
          const fullProd = { ...p, variants };

          if (isImeiProduct(fullProd)) {
            setPendingProduct(fullProd);
            setPendingVariantId(variants[0]?._id);
            setPendingSerialNumber(undefined);
            setIsVariantModalLoading(true);
            setShowVariantModal(true);
            api<any>(`/products/${fullProd._id}/with-variants`)
              .then((res) => {
                if (res && res.status === "success" && res.data) {
                  productVariantsCache.set(fullProd._id, { data: res.data, timestamp: Date.now() });
                  applyWithVariantsData(fullProd, res.data);
                }
              })
              .catch((err) => {
                console.error("Error fetching product variants in background:", err);
              })
              .finally(() => {
                setIsVariantModalLoading(false);
              });
            return;
          }

          if (variants.length > 1) {
            setPendingProduct(fullProd);
            setPendingVariantId(undefined);
            setPendingSerialNumber(undefined);
            setShowVariantModal(true);
            return;
          } else {
            addToCart(
              fullProd,
              undefined,
              variants[0] || undefined,
              stockItem?._id,
              stockItem?.sellingPrice || variants[0]?.sellingPrice || fullProd.sellingPrice,
              true
            );
            showSuccess(`Added "${fullProd.name}"`);
            return;
          }
        }
      }

      // 3. Direct Barcode Lookup (Product / Variant barcode from backend)
      if (barcodeRes && barcodeRes.status === "success" && barcodeRes.data?.product) {
        targetProduct = barcodeRes.data.product;
        if (barcodeRes.data.variant) {
          targetVariant = barcodeRes.data.variant;
        }
      }
    } catch (err) {
      console.error("Error during parallel IMEI/Serial/Barcode lookup:", err);
    }

    // =========================================================================
    // STEP 3: FALLBACK TO BACKEND SEARCH (Only if all direct lookups yielded nothing)
    // =========================================================================
    if (!targetProduct) {
      try {
        const prodRes = await api<{ status?: string; data?: { products?: any[] } }>(
          `/products?search=${encodeURIComponent(code)}`
        ).catch(() => null);

        if (prodRes && prodRes.status === "success" && prodRes.data?.products && prodRes.data.products.length > 0) {
          targetProduct = prodRes.data.products[0];
        }
      } catch (err) {
        console.error("Error fetching fallback product:", err);
      }
    }

    if (targetProduct) {
      const prodVariants = Array.isArray(targetProduct.variants) ? targetProduct.variants : [];
      if (isImeiProduct(targetProduct, targetVariant)) {
        setPendingProduct({ ...targetProduct, variants: prodVariants });
        setPendingVariantId(targetVariant?._id || undefined);
        setIsVariantModalLoading(true);
        setShowVariantModal(true);
        api<any>(`/products/${targetProduct._id}/with-variants`)
          .then((res) => {
            if (res && res.status === "success" && res.data) {
              productVariantsCache.set(targetProduct._id, { data: res.data, timestamp: Date.now() });
              applyWithVariantsData(targetProduct, res.data);
            }
          })
          .catch((err) => {
            console.error("Error fetching product variants in background:", err);
          })
          .finally(() => {
            setIsVariantModalLoading(false);
          });
        return;
      }
      addToCart(
        targetProduct,
        undefined,
        targetVariant || prodVariants[0] || undefined,
        undefined,
        targetVariant?.sellingPrice || targetProduct.sellingPrice,
        true
      );
      showSuccess(`Added "${targetProduct.name}"`);
      return;
    }

    // If not found in database at all
    showError(`Invalid barcode, Serial, or IMEI not found: "${code}"`);
  };

  const lastFetchTimeRef = useRef<number>(0);

  // Fetch data on mount & keep POS continuously synced in background
  useEffect(() => {
    // Initial fetch: silent if we already have cached products, spinner only if completely empty
    const hasCachedData = productsRef.current.length > 0;
    fetchData(hasCachedData);
    fetchCurrentSession(true);

    // Silent background sync every 60 seconds (no UI flicker or spinner)
    const interval = setInterval(() => {
      fetchData(true);
      fetchCurrentSession(true);
    }, 60000);

    // Immediate background sync when POS window/tab regains focus or visibility (throttled to 15s)
    const handleFocus = () => {
      if (Date.now() - lastFetchTimeRef.current > 15000) {
        fetchData(true);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetchTimeRef.current > 15000) {
        fetchData(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const notifiedRepairsRef = useRef<Set<string>>(new Set());
  const isInitialRepairsFetchRef = useRef<boolean>(true);

  // Polling for repairs
  useEffect(() => {
    if (!canViewRepairs) return;

    // Initial fetch
    fetchRepairs(true);

    const interval = setInterval(() => {
      fetchRepairs(true);
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [canViewRepairs]);

  // Search input ref
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productsGridRef = useRef<HTMLDivElement>(null);

  // Global Barcode Scanner handler
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  // Reset scanner state when all modals/panels close and user returns to home dashboard
  useEffect(() => {
    const isAnyModalOpen =
      showPaymentModal ||
      showCashDrawerModal ||
      showSalesPanel ||
      showRepairsPanel ||
      showExpensesPanel ||
      showReturnsPanel ||
      showWarrantyPanel ||
      showVariantModal ||
      showCustomerRequestModal ||
      showSimReloadPanel ||
      selectedRepairForPayment !== null ||
      selectedWarrantyForClaim !== null ||
      selectedProductForDetails !== null;

    if (!isAnyModalOpen) {
      barcodeBufferRef.current = "";
      lastKeyTimeRef.current = 0;
      // If any non-search input was focused, blur it so scanner isn't intercepted
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && activeEl !== searchInputRef.current && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        activeEl.blur();
      }
    }
  }, [
    showPaymentModal,
    showSalesPanel,
    showRepairsPanel,
    showExpensesPanel,
    showReturnsPanel,
    showWarrantyPanel,
    showVariantModal,
    showCustomerRequestModal,
    showSimReloadPanel,
    selectedRepairForPayment,
    selectedWarrantyForClaim,
    selectedProductForDetails,
  ]);

  useEffect(() => {
    const handleGlobalScan = (e: KeyboardEvent) => {
      const settings = getShopSettings();
      // Allow scanning unless explicitly toggled off (boolean false)
      if (settings.barcodeEnabled === false) return;

      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Ignore if any modal/panel is open
      if (
        showPaymentModal ||
        showCashDrawerModal ||
        showSalesPanel ||
        showRepairsPanel ||
        showExpensesPanel ||
        showReturnsPanel ||
        showWarrantyPanel ||
        showVariantModal ||
        showCustomerRequestModal ||
        showSimReloadPanel ||
        selectedRepairForPayment !== null ||
        selectedWarrantyForClaim !== null ||
        selectedProductForDetails !== null
      ) {
        barcodeBufferRef.current = "";
        return;
      }

      // Check target element: support search input or global dashboard screen
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      const isSearchInput = target === searchInputRef.current;

      if (isInput && !isSearchInput) {
        barcodeBufferRef.current = "";
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Barcode scanners type rapidly (allow up to 350ms for wireless/USB scanner latency)
      if (timeDiff > 350) {
        barcodeBufferRef.current = ""; // Reset if interval between keystrokes indicates slow manual typing
      }

      if (e.key === "Enter") {
        const scannedCode = (barcodeBufferRef.current || (isSearchInput ? searchQuery : "")).trim();
        barcodeBufferRef.current = "";

        if (scannedCode.length >= 2) {
          e.preventDefault();
          if (isSearchInput) {
            setSearchQuery("");
            if (searchInputRef.current) {
              searchInputRef.current.blur();
            }
          }
          processScannedBarcodeRef.current(scannedCode);
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalScan);
    return () => window.removeEventListener("keydown", handleGlobalScan);
  }, [
    showPaymentModal,
    showCashDrawerModal,
    showSalesPanel,
    showRepairsPanel,
    showExpensesPanel,
    showReturnsPanel,
    showWarrantyPanel,
    showVariantModal,
    showCustomerRequestModal,
    showSimReloadPanel,
    selectedRepairForPayment,
    selectedWarrantyForClaim,
    selectedProductForDetails,
    searchQuery,
  ]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcuts = getKeyboardShortcuts();
      const key = e.key.toUpperCase();

      // F2 (focusSearch) works globally — even if an input is focused
      // This allows the user to jump to the search bar from anywhere
      if (key === shortcuts.focusSearch.toUpperCase()) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // Don't trigger other shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (key === shortcuts.payNow.toUpperCase() && cart.length > 0) {
        e.preventDefault();
        setShowPaymentModal(true);
      } else if (key === shortcuts.clearCart.toUpperCase()) {
        e.preventDefault();
        setCart([]);
      } else if (
        key === shortcuts.openRepairs.toUpperCase() &&
        canViewRepairs
      ) {
        e.preventDefault();
        setShowRepairsPanel(true);
        fetchRepairs();
      } else if (key === shortcuts.openSales.toUpperCase() && canViewReports) {
        e.preventDefault();
        setShowSalesPanel(true);
        fetchSalesData();
      } else if (key === shortcuts.logout.toUpperCase()) {
        e.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, canViewRepairs, canViewReports]);

  const fetchData = async (silent: boolean = false): Promise<void> => {
    if (!silent && productsRef.current.length === 0) {
      setLoading(true);
    }
    lastFetchTimeRef.current = Date.now();
    try {
      const catPromise = api<CategoriesResponse>("/categories?tree=true").then((catData) => {
        if (catData?.status === "success" && catData.data?.categories) {
          memoryCategoryTreeCache = catData.data.categories;
          setCategoryTree(catData.data.categories);
          try {
            localStorage.setItem("pos_categories_cache", JSON.stringify(catData.data.categories));
          } catch (e) {}
        }
      });

      const prodPromise = api<ProductsResponse>("/products?limit=10000").then((prodData) => {
        if (prodData?.status === "success" && prodData.data?.products) {
          memoryProductsCache = prodData.data.products;
          setProducts(prodData.data.products);
          try {
            const cleanProducts = prodData.data.products.map((p: any) => ({
              _id: p._id,
              name: p.name,
              itemCode: p.itemCode,
              barcode: p.barcode,
              sku: p.sku,
              serialNumber: p.serialNumber,
              serialNumbers: p.serialNumbers,
              imeis: p.imeis,
              sellingPrice: p.sellingPrice,
              originalPrice: p.originalPrice,
              minVariantPrice: p.minVariantPrice,
              costPrice: p.costPrice,
              stock: p.stock,
              trackingType: p.trackingType,
              warrantyDuration: p.warrantyDuration,
              warrantyType: p.warrantyType,
              condition: p.condition,
              category: p.category ? { _id: p.category._id, name: p.category.name } : undefined,
              images: Array.isArray(p.images) && p.images.length > 0 ? [p.images[0]] : [],
              stockItems: Array.isArray(p.stockItems) ? p.stockItems.map((si: any) => ({
                _id: si._id,
                variant: si.variant,
                serialNumber: si.serialNumber,
                imei1: si.imei1,
                imei2: si.imei2,
                sellingPrice: si.sellingPrice,
              })) : [],
              variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({
                _id: v._id,
                itemCode: v.itemCode,
                barcode: v.barcode,
                sku: v.sku,
                sellingPrice: v.sellingPrice,
                effectivePrice: v.effectivePrice,
                originalPrice: v.originalPrice,
                stock: v.stock,
                attributes: v.attributes,
              })) : []
            }));
            localStorage.setItem("pos_products_cache", JSON.stringify(cleanProducts));
          } catch (e) {}
        }
      });

      await Promise.all([catPromise, prodPromise]);
    } catch (err) {
      if (!silent) console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async (filters?: { search?: string; startDate?: string; endDate?: string }) => {
    setSalesLoading(true);
    try {
      let queryStr = "/sales?limit=100";
      if (filters?.startDate) queryStr += `&startDate=${filters.startDate}`;
      if (filters?.endDate) queryStr += `&endDate=${filters.endDate}`;
      
      const salesReq = filters?.search 
        ? api<any>(`/sales/search?q=${encodeURIComponent(filters.search)}`)
        : api<any>(queryStr);

      const [salesRes, summaryRes] = await Promise.all([
        salesReq,
        api<any>("/sales/daily"),
      ]);
      if (salesRes.status === "success") {
        setSalesData(salesRes.data?.sales || []);
      }
      if (summaryRes.status === "success") {
        setDailySummary(summaryRes.data?.summary || null);
      }
    } catch (err) {
      console.error("Failed to fetch sales:", err);
    } finally {
      setSalesLoading(false);
    }
  };

  // Fetch repairs (all statuses for full visibility)
  const fetchRepairs = async (silent: boolean = false): Promise<RepairJob[]> => {
    if (!silent) setRepairsLoading(true);
    try {
      const res = await api<RepairsResponse>("/repairs?limit=100");
      if (res.status === "success" && res.data) {
        const fetchedRepairs = res.data.repairs || [];
        setRepairs(fetchedRepairs);

        if (isInitialRepairsFetchRef.current) {
          fetchedRepairs.forEach((repair) => {
            if (repair.status === "COMPLETED" && !repair.pickupDate) {
              notifiedRepairsRef.current.add(repair._id);
            }
          });
          isInitialRepairsFetchRef.current = false;
        } else {
          fetchedRepairs.forEach((repair) => {
            if (
              repair.status === "COMPLETED" &&
              !repair.pickupDate &&
              !notifiedRepairsRef.current.has(repair._id)
            ) {
              showError(`Repair ${repair.jobNumber} is COMPLETED!`);
              notifiedRepairsRef.current.add(repair._id);
            }
          });
        }
        return fetchedRepairs;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch repairs:", err);
      return [];
    } finally {
      if (!silent) setRepairsLoading(false);
    }
  };

  // Get subcategories
  const currentSubcategories: Category[] = useMemo(() => {
    if (!selectedParentCategory) return [];
    return categoryTree.find((c) => c._id === selectedParentCategory)?.subcategories || [];
  }, [selectedParentCategory, categoryTree]);

  const selectedCategoryIds = useMemo((): string[] => {
    if (selectedSubCategory) return [selectedSubCategory];
    if (selectedParentCategory) {
      const parent = categoryTree.find((c) => c._id === selectedParentCategory);
      const subIds = parent?.subcategories?.map((s) => s._id) || [];
      return [selectedParentCategory, ...subIds];
    }
    return [];
  }, [selectedSubCategory, selectedParentCategory, categoryTree]);

  // Filter products (searches by Name, SKU, ItemCode, Barcode, Serial Number, IMEI, and Variant attributes)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      let matchesSearch = true;
      let isSerialOrImeiMatch = false;

      if (q) {
        const name = (p?.name ? String(p.name) : "").toLowerCase();
        const sku = (p?.sku ? String(p.sku) : "").toLowerCase();
        const barcode = (p?.barcode ? String(p.barcode) : "").toLowerCase();
        const itemCode = (p?.itemCode ? String(p.itemCode) : "").toLowerCase();
        const serialNumber = (p?.serialNumber ? String(p.serialNumber) : "").toLowerCase();

        // Check serialNumbers array
        const matchesSerialNumbers = Array.isArray(p?.serialNumbers) && p.serialNumbers.some(
          (s) => String(s).toLowerCase().includes(q)
        );

        // Check imeis array
        const matchesImeis = Array.isArray(p?.imeis) && p.imeis.some(
          (i) => String(i).toLowerCase().includes(q)
        );

        // Check variants (itemCode, barcode, sku, serialNumber)
        const matchesVariants = Array.isArray(p?.variants) && p.variants.some(
          (v: any) =>
            (v.itemCode && String(v.itemCode).toLowerCase().includes(q)) ||
            (v.barcode && String(v.barcode).toLowerCase().includes(q)) ||
            (v.sku && String(v.sku).toLowerCase().includes(q)) ||
            (v.serialNumber && String(v.serialNumber).toLowerCase().includes(q))
        );

        const matchesPrimarySerial = Boolean(serialNumber && serialNumber.includes(q));

        isSerialOrImeiMatch = matchesPrimarySerial || matchesSerialNumbers || matchesImeis;

        matchesSearch =
          name.includes(q) ||
          sku.includes(q) ||
          barcode.includes(q) ||
          itemCode.includes(q) ||
          isSerialOrImeiMatch ||
          matchesVariants;
      }

      if (!matchesSearch) return false;

      // If a serial number or IMEI was matched, show the item immediately across all categories
      if (isSerialOrImeiMatch) return true;

      // Category matching logic:
      // - If no category selected, show all
      // - If parent category selected, show products with that category OR any of its subcategories
      // - If subcategory selected, show only products with that specific subcategory
      if (selectedCategoryIds.length === 0) {
        return true; // No category filter
      }

      // Check if product's category or subcategory matches selected categories
      const productCategoryId = p.category?._id || "";
      const productSubcategoryId = p.subcategory?._id || "";

      return (
        selectedCategoryIds.includes(productCategoryId) ||
        selectedCategoryIds.includes(productSubcategoryId)
      );
    });
  }, [products, searchQuery, selectedCategoryIds]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safeProductPage = Math.min(Math.max(1, productPage), totalProductPages);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (safeProductPage - 1) * PRODUCTS_PER_PAGE,
      safeProductPage * PRODUCTS_PER_PAGE
    );
  }, [filteredProducts, safeProductPage, PRODUCTS_PER_PAGE]);

  useEffect(() => {
    if (productsGridRef.current) {
      productsGridRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [safeProductPage]);


  const renderPaginationControls = () => {
    if (filteredProducts.length === 0) return null;

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      if (totalProductPages <= 7) {
        for (let i = 1; i <= totalProductPages; i++) pages.push(i);
      } else {
        if (safeProductPage <= 4) {
          pages.push(1, 2, 3, 4, 5, "...", totalProductPages);
        } else if (safeProductPage >= totalProductPages - 3) {
          pages.push(1, "...", totalProductPages - 4, totalProductPages - 3, totalProductPages - 2, totalProductPages - 1, totalProductPages);
        } else {
          pages.push(1, "...", safeProductPage - 1, safeProductPage, safeProductPage + 1, "...", totalProductPages);
        }
      }
      return pages;
    };

    const startItem = (safeProductPage - 1) * PRODUCTS_PER_PAGE + 1;
    const endItem = Math.min(safeProductPage * PRODUCTS_PER_PAGE, filteredProducts.length);

    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
          Showing <span className="font-bold text-slate-700">{startItem}-{endItem}</span> of <span className="font-bold text-slate-700">{filteredProducts.length}</span>
        </div>

        {totalProductPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => setProductPage((p) => Math.max(1, p - 1))}
              disabled={safeProductPage === 1}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 border transition-all cursor-pointer ${
                safeProductPage === 1
                  ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-60"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-2xs"
              }`}
              title="Previous Page"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-slate-400 select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = Number(p);
                const isActive = pageNum === safeProductPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setProductPage(pageNum)}
                    className={`min-w-[24px] h-6 px-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
              disabled={safeProductPage === totalProductPages}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 border transition-all cursor-pointer ${
                safeProductPage === totalProductPages
                  ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-60"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-2xs"
              }`}
              title="Next Page"
            >
              <span>Next</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  const resolveProductImage = (p: Product): string | null => {
    // 1. Direct product image
    let img = (p.images && p.images.length > 0 && p.images[0])
      ? p.images[0]
      : (p as any).image || (p as any).thumbnail;

    // 2. Variant image if product has variants
    if (!img && p.variants && Array.isArray(p.variants)) {
      for (const v of p.variants) {
        if (v.images && v.images.length > 0 && v.images[0]) {
          img = v.images[0];
          break;
        }
        if ((v as any).image) {
          img = (v as any).image;
          break;
        }
      }
    }

    // 3. Fallback to main category image
    if (!img) {
      const prodCatId = typeof p.category === "object" ? p.category?._id : p.category;
      const prodSubcatId = typeof p.subcategory === "object" ? p.subcategory?._id : p.subcategory;

      let matchedCat: Category | undefined;
      if (prodCatId) {
        matchedCat = categoryTree.find((c) => String(c._id) === String(prodCatId));
      }
      if (!matchedCat && (prodCatId || prodSubcatId)) {
        for (const root of categoryTree) {
          if (root.subcategories && root.subcategories.some((s) => String(s._id) === String(prodCatId) || String(s._id) === String(prodSubcatId))) {
            matchedCat = root;
            break;
          }
        }
      }

      if (typeof p.category === "object" && (p.category as any)?.image) {
        img = (p.category as any).image;
      } else if (matchedCat?.image) {
        img = matchedCat.image;
      } else {
        const catName = String((typeof p.category === "object" ? p.category?.name : matchedCat?.name) || "").toLowerCase();
        const prodName = (p.name || "").toLowerCase();
        if (catName.includes("audio") || prodName.includes("airpod") || prodName.includes("earbud") || prodName.includes("headset") || prodName.includes("speaker")) {
          img = "/uploads/categories/audio.jpg";
        } else if (catName.includes("phone") || prodName.includes("phone") || prodName.includes("galaxy") || prodName.includes("iphone") || prodName.includes("redmi") || prodName.includes("nokia")) {
          img = "/uploads/categories/mobile_phones.jpg";
        } else if (catName.includes("charger") || catName.includes("power") || catName.includes("cable") || prodName.includes("cable") || prodName.includes("charger") || prodName.includes("adapter")) {
          img = "/uploads/categories/chargers_power.jpg";
        } else if (catName.includes("repair") || catName.includes("battery") || prodName.includes("battery") || prodName.includes("display") || prodName.includes("screen")) {
          img = "/uploads/categories/repair_parts.jpg";
        } else {
          img = "/uploads/categories/accessories.jpg";
        }
      }
    }

    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img;
    const cleanPath = img.startsWith("/") ? img : `/${img}`;
    const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api\/v1\/?$/, "") : "https://api.hotlinecellular.lk");
    return `${apiBase}${cleanPath}`;
  };

  const getProductDisplayPrice = (p: Product): number => {
    if (p?.variants && p.variants.length > 0) {
      const variantPrices = p.variants
        .map((v: any) => Number(v.effectivePrice ?? v.sellingPrice))
        .filter((price: number) => !isNaN(price) && price > 0);
      if (variantPrices.length > 0) {
        return Math.min(...variantPrices);
      }
    }
    if (p?.effectivePrice && p.effectivePrice > 0) return p.effectivePrice;
    if (p?.sellingPrice && p.sellingPrice > 0) return p.sellingPrice;
    return 0;
  };

  const getProductOriginalPrice = (p: Product, displayPrice: number): number => {
    if (p?.variants && p.variants.length > 0) {
      const matchingVariant = p.variants.find(
        (v: any) => Number(v.effectivePrice ?? v.sellingPrice) === displayPrice
      );
      if (matchingVariant) {
        const vOrig = Number(matchingVariant.originalPrice ?? 0);
        if (vOrig > displayPrice) return vOrig;
        const vDisc = Number(matchingVariant.discountAmount ?? 0);
        if (vDisc > 0) return displayPrice + vDisc;
      }
      const variantOriginals = p.variants
        .map((v: any) => Number(v.originalPrice ?? 0))
        .filter((price: number) => !isNaN(price) && price > displayPrice);
      if (variantOriginals.length > 0) {
        return Math.min(...variantOriginals);
      }
    }
    const rawOrig = Number(p?.originalPrice ?? 0);
    if (rawOrig > displayPrice) return rawOrig;
    const disc = Number(p?.discountAmount ?? 0);
    if (disc > 0) return displayPrice + disc;
    const rawSelling = Number(p?.sellingPrice ?? 0);
    if (rawSelling > displayPrice) return rawSelling;
    return displayPrice;
  };

  const applyWithVariantsData = (originalProd: Product, data: any) => {
    const fetchedVariants = Array.isArray(data.variants) ? data.variants : [];
    const variants = fetchedVariants.length > 0 ? fetchedVariants : (originalProd.variants || []);

    const resolvedStock =
      data.product?.stock !== undefined && data.product?.stock !== null
        ? Number(data.product.stock)
        : (originalProd.stock !== undefined && originalProd.stock !== null ? Number(originalProd.stock) : 0);

    const catalogPrice = Number(originalProd.effectivePrice ?? originalProd.sellingPrice ?? 0);
    const resolvedSellingPrice =
      Number(data.product?.sellingPrice) > 0
        ? Number(data.product.sellingPrice)
        : catalogPrice;
    const resolvedOriginalPrice =
      Number(data.product?.originalPrice) > 0
        ? Number(data.product.originalPrice)
        : (Number(originalProd.originalPrice) > 0 ? Number(originalProd.originalPrice) : resolvedSellingPrice);
    const resolvedEffectivePrice =
      Number(data.product?.effectivePrice) > 0
        ? Number(data.product.effectivePrice)
        : resolvedSellingPrice;

    const stockItems = Array.isArray(data.stockItems) ? data.stockItems : [];

    setPendingProduct((prev) => {
      if (!prev || prev._id !== originalProd._id) return prev;
      return {
        ...prev,
        ...(data.product || {}),
        variants,
        stockItems,
        stock: resolvedStock,
        sellingPrice: resolvedSellingPrice,
        originalPrice: resolvedOriginalPrice,
        effectivePrice: resolvedEffectivePrice,
      };
    });

    setProducts((prev) =>
      prev.map((p) =>
        p._id === originalProd._id
          ? {
              ...p,
              ...(data.product || {}),
              variants,
              stockItems,
              stock: resolvedStock,
              sellingPrice: resolvedSellingPrice,
              originalPrice: resolvedOriginalPrice,
              effectivePrice: resolvedEffectivePrice,
            }
          : p
      )
    );
  };

  const handleProductClick = (product: Product) => {
    const existingVariants = Array.isArray(product.variants) ? product.variants : [];
    const isImei = isImeiProduct(product);

    // If product only has a single dummy variant (e.g. value === "None" or "Default"), auto-select it
    const firstVarAttrs = existingVariants[0]?.attributes;
    const isSingleDummyVariant =
      existingVariants.length === 1 &&
      (!firstVarAttrs ||
        (Array.isArray(firstVarAttrs) && (firstVarAttrs.length === 0 ||
          firstVarAttrs.some((a: any) =>
            typeof a === "object"
              ? !a.value || a.value === "None" || a.value === "Default"
              : a === "None" || a === "Default"
          ))));

    const needsModal = isImei || existingVariants.length > 1 || (existingVariants.length === 1 && !isSingleDummyVariant);

    // 1. Simple product -> Add to cart IMMEDIATELY (0ms, no network delay)!
    if (!needsModal) {
      if (existingVariants.length === 1 && isSingleDummyVariant) {
        const singleVar = {
          ...existingVariants[0],
          stock: (existingVariants[0] as any).stock ?? existingVariants[0].stockQty ?? product.stock,
          stockQty: existingVariants[0].stockQty ?? (existingVariants[0] as any).stock ?? product.stock,
        };
        addToCart(product, undefined, singleVar, undefined, undefined, true);
      } else {
        addToCart(product, undefined, undefined, undefined, undefined, true);
      }
      return;
    }

    // 2. Multi-variant or IMEI product -> OPEN POPUP IMMEDIATELY in 0ms!
    const initialStockItems = Array.isArray(product.stockItems) ? product.stockItems : [];
    setPendingProduct({ ...product, variants: existingVariants, stockItems: initialStockItems });
    setPendingVariantId(existingVariants[0]?._id);
    setPendingSerialNumber(undefined);
    setShowVariantModal(true);

    // Check in-memory cache first for instant populated response
    const cached = productVariantsCache.get(product._id);
    const now = Date.now();
    if (cached && now - cached.timestamp < 45000) {
      applyWithVariantsData(product, cached.data);
      setIsVariantModalLoading(false);
      return;
    }

    // Indicate live loading inside the modal box
    setIsVariantModalLoading(true);

    // Fetch fresh variants & stockItems in background
    api<any>(`/products/${product._id}/with-variants`)
      .then((res) => {
        if (res.status === "success" && res.data) {
          productVariantsCache.set(product._id, { data: res.data, timestamp: Date.now() });
          applyWithVariantsData(product, res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching product variants in background:", err);
      })
      .finally(() => {
        setIsVariantModalLoading(false);
      });
  };

  // Cart functions
  const addToCart = (product: Product, serialNumber?: string, variant?: any, stockItemId?: string, stockItemPrice?: number, skipSerial: boolean = false): void => {
    // If product has multiple variants and no specific variant was passed, open VariantSelectionModal first
    const hasMultipleVariants = Boolean(product.variants && product.variants.length > 1);
    if (hasMultipleVariants && !variant) {
      handleProductClick(product);
      return;
    }

    // Check if product is an IMEI-tracked device
    const isImei = isImeiProduct(product, variant);

    // If IMEI device and no serial/stockItemId passed, open VariantSelectionModal to scan/select IMEI
    if (isImei && !serialNumber && !stockItemId && !skipSerial) {
      handleProductClick(product);
      return;
    }

    const effectivePrice = stockItemPrice !== undefined ? stockItemPrice : (variant?.effectivePrice ?? product.effectivePrice ?? variant?.sellingPrice ?? product.sellingPrice ?? 0);
    const rawOrig = Number(variant?.originalPrice ?? product.originalPrice ?? 0);
    const discAmount = Number(variant?.discountAmount ?? product.discountAmount ?? 0);
    const originalPrice = rawOrig > effectivePrice
      ? rawOrig
      : (discAmount > 0
          ? effectivePrice + discAmount
          : (Number(variant?.sellingPrice ?? product.sellingPrice ?? effectivePrice) > effectivePrice
              ? Number(variant?.sellingPrice ?? product.sellingPrice)
              : effectivePrice));
    const discountAmount = Math.max(0, originalPrice - effectivePrice) || discAmount;
    const itemPrice = originalPrice;

    const trimmedSerial = serialNumber ? String(serialNumber).trim() : undefined;

    if (isImei) {
      // -----------------------------------------------------------------------
      // IMEI / Mobile Phone Branch:
      // Each physical phone is a distinct item in the cart with quantity: 1.
      // Scanning multiple IMEIs of the same phone model adds each as a separate
      // cart line, displaying its true variant attributes.
      // -----------------------------------------------------------------------
      const availableStock = stockItemId
        ? Math.max(1, (variant?.stock ?? variant?.stockQty ?? product?.stock ?? 1))
        : (variant ? (variant.stock ?? variant.stockQty ?? product?.stock ?? 0) : (product?.stock ?? 0));

      if (availableStock <= 0) {
        showError(variant ? "Selected variant is out of stock!" : "Product is out of stock!");
        return;
      }

      setCart((prevCart) => {
        // Prevent scanning the exact same IMEI or physical device twice
        if (trimmedSerial) {
          const serialExists = prevCart.some(
            (item) =>
              (item.serialNumber && item.serialNumber.trim().toLowerCase() === trimmedSerial.toLowerCase()) ||
              (stockItemId && item.stockItemId && String(item.stockItemId) === String(stockItemId))
          );
          if (serialExists) {
            showError(`Item with IMEI "${trimmedSerial}" is already in the cart!`);
            return prevCart;
          }
        } else if (stockItemId) {
          const stockExists = prevCart.some(
            (item) => item.stockItemId && String(item.stockItemId) === String(stockItemId)
          );
          if (stockExists) {
            showError("This device is already in the cart!");
            return prevCart;
          }
        }

        const newItem: CartItem = {
          ...product,
          sellingPrice: itemPrice,
          originalPrice: originalPrice,
          effectivePrice: effectivePrice,
          discountAmount: discountAmount,
          quantity: 1,
          serialNumber: trimmedSerial,
          variantId: variant?._id,
          trackingType: "IMEI",
          variantDisplay: formatVariantDisplay(variant),
          stockItemId: stockItemId,
          showWarranty: false,
        };

        const nextCart = [...prevCart, newItem];
        cartRef.current = nextCart;
        showSuccess(`Added "${product.name || "phone"}" (IMEI: ${trimmedSerial || "assigned"})`);
        return nextCart;
      });
    } else {
      // -----------------------------------------------------------------------
      // Quantity / Bulk Branch (e.g. Back Covers, Tempered Glass, Accessories):
      // Scanning an existing item increases its quantity.
      // Validates available stock before incrementing.
      // -----------------------------------------------------------------------
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex((item) => {
          if (item._id !== product._id) return false;
          const vMatch = variant?._id ? item.variantId === variant._id : !item.variantId;
          if (!vMatch) return false;
          if (trimmedSerial && item.serialNumber && item.serialNumber.trim().toLowerCase() !== trimmedSerial.toLowerCase()) {
            return false;
          }
          return true;
        });

        const availableStock = variant
          ? (variant.stock ?? variant.stockQty ?? product?.stock ?? 0)
          : (product?.stock ?? 0);

        if (existingIndex >= 0) {
          const existing = prevCart[existingIndex];
          if (availableStock <= 0) {
            showError(variant ? "Selected variant is out of stock!" : `"${product.name}" is out of stock!`);
            return prevCart;
          }
          if (availableStock > 0 && existing.quantity + 1 > availableStock) {
            showError(`Only ${availableStock} available in stock!`);
            return prevCart;
          }

          const nextCart = [...prevCart];
          nextCart[existingIndex] = {
            ...existing,
            quantity: existing.quantity + 1,
          };
          cartRef.current = nextCart;
          showSuccess(`Updated "${product.name}" quantity to ${existing.quantity + 1}`);
          return nextCart;
        } else {
          if (availableStock <= 0) {
            showError(variant ? "Selected variant is out of stock!" : `"${product.name}" is out of stock!`);
            return prevCart;
          }

          const newItem: CartItem = {
            ...product,
            sellingPrice: itemPrice,
            originalPrice: originalPrice,
            effectivePrice: effectivePrice,
            discountAmount: discountAmount,
            quantity: 1,
            serialNumber: trimmedSerial,
            variantId: variant?._id,
            trackingType: variant?.trackingType || product.trackingType || "QUANTITY",
            variantDisplay: formatVariantDisplay(variant),
            stockItemId: stockItemId,
            showWarranty: false,
          };

          const nextCart = [...prevCart, newItem];
          cartRef.current = nextCart;
          showSuccess(`Added "${product.name || "item"}" to order`);
          return nextCart;
        }
      });
    }
  };





  // Generate unique key for cart item (combines product ID with serial number if present)
  const getCartItemKey = (item: CartItem): string => {
    let key = item._id;
    if (item.variantId) key += `_${item.variantId}`;
    if (item.serialNumber) key += `_${item.serialNumber}`;
    return key;
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    serialNumber?: string,
    variantId?: string,
  ): void => {
    let itemKey = productId;
    if (variantId) itemKey += `_${variantId}`;
    if (serialNumber) itemKey += `_${serialNumber}`;

    if (quantity < 1) {
      showError("Quantity cannot be less than 1");
      return;
    }

    const currentCart = cartRef.current || cart;
    const item = currentCart.find((it) => getCartItemKey(it) === itemKey);
    const isImei = item ? isImeiProduct(item) : false;

    // For IMEI items, each unit must have quantity 1
    if (isImei && quantity > 1) {
      showError("Each item with IMEI must have quantity of 1");
      return;
    }

    // Check available stock
    const product = (productsRef.current || products).find((p) => p._id === productId);
    let availableStock = product?.stock ?? 0;
    if (item?.variantId && product?.variants) {
      const v = product.variants.find((vr: any) => vr._id === item.variantId);
      if (v?.stock !== undefined) {
        availableStock = v.stock;
      }
    }

    if (availableStock > 0 && quantity > availableStock) {
      showError(`Only ${availableStock} available!`);
      return;
    }

    setCart((prev) => {
      const next = prev.map((it) =>
        getCartItemKey(it) === itemKey ? { ...it, quantity } : it
      );
      cartRef.current = next;
      return next;
    });
  };

  const removeFromCart = (
    itemOrIndexOrId: CartItem | string | number,
    serialNumber?: string,
    variantId?: string
  ): void => {
    if (typeof itemOrIndexOrId === "number") {
      setCart((prev) => {
        const next = [...prev];
        const removed = next.splice(itemOrIndexOrId, 1)[0];
        if (removed?._id === "return-credit") {
          setExchangePayload(null);
        }
        cartRef.current = next;
        return next;
      });
      return;
    }

    if (typeof itemOrIndexOrId === "object" && itemOrIndexOrId !== null) {
      const targetKey = getCartItemKey(itemOrIndexOrId);
      setCart((prev) => {
        const next = prev.filter((item) => getCartItemKey(item) !== targetKey);
        cartRef.current = next;
        return next;
      });
      if (itemOrIndexOrId._id === "return-credit") {
        setExchangePayload(null);
      }
      return;
    }

    const productId = String(itemOrIndexOrId);
    let itemKey = productId;
    if (variantId) itemKey += `_${variantId}`;
    if (serialNumber) itemKey += `_${serialNumber}`;
    setCart((prev) => {
      const next = prev.filter((item) => getCartItemKey(item) !== itemKey);
      cartRef.current = next;
      return next;
    });

    if (productId === "return-credit") {
      setExchangePayload(null);
    }
  };

  const clearCart = (): void => {
    setCart([]);
    cartRef.current = [];
    setExchangePayload(null);
    setIsGoogleReviewEnabled(false);
    setGoogleReviewDiscount("");
  };

  // Calculate totals (use originalPrice and discountAmount)
  const getItemUnitPrice = (item: CartItem): number => {
    const orig = Number(item.originalPrice ?? item.sellingPrice ?? 0);
    const disc = Number(item.discountAmount ?? 0);
    if (disc > 0) {
      return Math.max(0, orig - disc);
    }
    return item.effectivePrice !== undefined && item.effectivePrice !== null && Number(item.effectivePrice) > 0
      ? Number(item.effectivePrice)
      : orig;
  };

  const getLineTotal = (item: CartItem): number => {
    return getItemUnitPrice(item) * item.quantity;
  };

  const rawSubtotal = cart.reduce(
    (sum, item) => sum + (Number(item.originalPrice ?? item.sellingPrice ?? 0) * item.quantity),
    0,
  );

  const itemDiscountsTotal = cart.reduce(
    (sum, item) => sum + (Number(item.discountAmount ?? 0) * item.quantity),
    0,
  );

  const parsedGoogleReviewDiscount = isGoogleReviewEnabled
    ? Math.max(0, parseFloat(googleReviewDiscount) || 0)
    : 0;

  const totalDiscount = itemDiscountsTotal + parsedGoogleReviewDiscount;

  const netSubtotal = Math.max(0, rawSubtotal - totalDiscount);

  const tax = cart.reduce((sum, item) => {
    const lineTotal = getLineTotal(item);
    return sum + lineTotal * ((item.taxRate ?? 0) / 100);
  }, 0);

  const subtotal = rawSubtotal;
  const total = Math.max(0, netSubtotal + tax);

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  const handleParentCategoryClick = (categoryId: string | null): void => {
    if (selectedParentCategory === categoryId) {
      setSelectedParentCategory(null);
      setSelectedSubCategory(null);
    } else {
      setSelectedParentCategory(categoryId);
      setSelectedSubCategory(null);
    }
  };

  const handleSubCategoryClick = (subCategoryId: string): void => {
    setSelectedSubCategory(
      selectedSubCategory === subCategoryId ? null : subCategoryId,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-sky-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-sm font-medium animate-pulse dark:text-slate-400">
            Loading POS System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#f0f4f9] flex overflow-hidden font-sans select-none relative">
      {/* Global Toast Notification */}
      {toastNotification && (
        <div 
          className="fixed top-6 right-6 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          style={{
            backgroundColor: toastNotification.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            borderColor: toastNotification.type === 'error' ? '#dc2626' : '#059669',
            boxShadow: toastNotification.type === 'error' ? '0 10px 30px -5px rgba(239, 68, 68, 0.4)' : '0 10px 30px -5px rgba(16, 185, 129, 0.4)'
          }}
        >
          {toastNotification.type === 'error' ? (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <span className="text-sm font-semibold tracking-wide">{toastNotification.message}</span>
          <button 
            onClick={() => setToastNotification(null)} 
            className="ml-2 text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 1. Left Dark Sidebar (Categories) */}
      <aside className="w-48 xl:w-52 2xl:w-56 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 h-full overflow-hidden border-r border-slate-800/80 z-10">
        {/* Logo & Brand Header */}
        <div className="flex items-center gap-2.5 p-3 xl:p-4 border-b border-slate-800/80 shrink-0">
          <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg xl:rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/10 overflow-hidden border border-slate-700/60">
            <img
              src={companyIcon}
              alt="Hotline Cellular Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = companyLogo;
              }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs xl:text-sm font-extrabold text-white tracking-tight leading-snug">
              Hotline POS
            </h1>
            <p className="text-[8.5px] xl:text-[9px] text-slate-400 font-bold tracking-wider uppercase">
              POINT OF SALE
            </p>
          </div>
        </div>

        {/* Categories Section Title */}
        <div className="px-3 pt-3 pb-1.5 shrink-0">
          <span className="text-[9px] xl:text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            CATEGORIES
          </span>
        </div>

        {/* Categories Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* All Products Button */}
          <button
            onClick={() => handleParentCategoryClick(null)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
              !selectedParentCategory
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            <Layers className={`w-3.5 h-3.5 shrink-0 ${!selectedParentCategory ? "text-white" : "text-blue-400"}`} />
            <span className="flex-1 truncate">All Products</span>
          </button>

          {/* Individual Category Items */}
          {categoryTree.map((cat) => {
            const isParentActive = selectedParentCategory === cat._id;
            return (
              <div key={cat._id}>
                <button
                  onClick={() => handleParentCategoryClick(cat._id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all cursor-pointer group ${
                    isParentActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <span className={`shrink-0 ${isParentActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {getCategoryIcon(cat.name, "w-3.5 h-3.5")}
                  </span>
                  <span className="flex-1 truncate text-xs">{cat.name}</span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <svg
                      className={`w-3 h-3 text-slate-500 transition-transform ${
                        isParentActive ? "rotate-90 text-white" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                {/* Subcategories */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isParentActive && cat.subcategories && cat.subcategories.length > 0
                      ? "max-h-96 opacity-100 mt-1 pl-2.5 space-y-0.5"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {cat.subcategories?.map((sub) => {
                    const isSubActive = selectedSubCategory === sub._id;
                    return (
                      <button
                        key={sub._id}
                        onClick={() => handleSubCategoryClick(sub._id)}
                        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left text-[11px] transition-all cursor-pointer ${
                          isSubActive
                            ? "bg-blue-500/20 text-sky-400 font-bold border-l-2 border-sky-400"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        <span className="truncate">{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Bottom - Block 1: Tools (Print & Refresh) */}
        <div className="p-2 xl:p-2.5 border-t border-slate-800/80 shrink-0">
          <div className="grid grid-cols-2 gap-1.5">
            {/* Reports & Analytics Modal Button (Print) */}
            <button
              onClick={() => setShowReportsModal(true)}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/50 transition-all cursor-pointer text-xs font-semibold shadow-2xs group"
              title="Reports & Business Analytics (Print / Export)"
            >
              <svg className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/50 transition-all cursor-pointer text-xs font-semibold shadow-2xs group disabled:opacity-50"
              title="Refresh Catalog Data"
            >
              <svg className={`w-3.5 h-3.5 text-sky-400 group-hover:text-sky-300 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Sidebar Bottom - Block 2: Profile & Logout */}
        <div className="p-2 xl:p-2.5 border-t border-slate-800/80 bg-slate-950/40 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md shrink-0 border border-blue-400/30">
              {(user?.username?.[0] || "C").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user?.username || "cashier1"}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">
                {user?.roles?.[0]?.name || "CASHIER"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all shrink-0 cursor-pointer"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* 2. Main Work Area (Top Header + Product Catalog + Cart) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f0f4f9]">
        {/* Top Header Bar */}
        <header className="px-3 xl:px-4 pt-2.5 pb-2 flex items-center justify-between gap-2 shrink-0">
          {/* Search Input with Scanner Icon */}
          <div className="relative flex-1 max-w-xs xl:max-w-sm 2xl:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim().length >= 3) {
                  e.preventDefault();
                  const code = searchQuery.trim();
                  setSearchQuery("");
                  if (searchInputRef.current) {
                    searchInputRef.current.blur();
                  }
                  processScannedBarcodeRef.current(code);
                }
              }}
              placeholder="Search products, SKU, IMEI (F2)..."
              className="w-full pl-9 pr-9 py-1.5 bg-white border border-slate-200/90 rounded-full text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs shadow-2xs"
              style={{ color: '#0f172a' }}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 7h1v10H7V7zm4 0h2v10h-2V7zm5 0h1v10h-1V7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Center Pill Action Buttons */}
          <div className="flex items-center gap-1 xl:gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {/* Request Item */}
            <button
              onClick={() => setShowCustomerRequestModal(true)}
              className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 bg-[#fef9ee] hover:bg-[#fef3c7] text-[#b45309] border border-[#fde68a] rounded-lg xl:rounded-xl text-[11px] xl:text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
              title="Customer Product Request"
            >
              <svg className="w-3 h-3 text-[#b45309]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Request Item</span>
            </button>

            {/* SIM & Reload */}
            <button
              onClick={() => setShowSimReloadPanel(true)}
              className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] border border-[#bfdbfe] rounded-lg xl:rounded-xl text-[11px] xl:text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
              title="SIM Cards & Mobile Reload"
            >
              <svg className="w-3 h-3 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM12 11h.01M9 11h.01M15 11h.01M12 14h.01M9 14h.01M15 14h.01" />
              </svg>
              <span>SIM & Reload</span>
            </button>

            {/* Sales */}
            <button
              onClick={() => {
                setShowSalesPanel(true);
                fetchSalesData();
              }}
              className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0] rounded-lg xl:rounded-xl text-[11px] xl:text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
              title="Sales Reports"
            >
              <svg className="w-3 h-3 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Sales</span>
            </button>

            {/* Repairs */}
            {canViewRepairs && (
              <button
                onClick={() => {
                  setShowRepairsPanel(true);
                  fetchRepairs();
                }}
                className="relative flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0] rounded-lg xl:rounded-xl text-[11px] xl:text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                title="Repairs"
              >
                <svg className="w-3 h-3 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Repairs</span>
                {repairs.filter((r) => {
                  const s = (r.status || "").toUpperCase().trim();
                  return s !== "CANCELLED" && s !== "COMPLETED";
                }).length > 0 && (
                  <span className="w-3.5 h-3.5 bg-blue-600 text-white text-[8.5px] font-bold rounded-full flex items-center justify-center -ml-0.5">
                    {repairs.filter((r) => {
                      const s = (r.status || "").toUpperCase().trim();
                      return s !== "CANCELLED" && s !== "COMPLETED";
                    }).length}
                  </span>
                )}
              </button>
            )}

            {/* Extras (Expenses & Notes) */}
            <button
              onClick={() => setShowExpensesPanel(true)}
              className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 bg-[#fff7ed] hover:bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] rounded-lg xl:rounded-xl text-[11px] xl:text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
              title="Extras (Expenses & Notes)"
            >
              <svg className="w-3 h-3 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Extras</span>
            </button>

            {/* Returns */}
            {canProcessReturn && (
              <button
                onClick={() => setShowReturnsPanel(true)}
                className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] rounded-lg xl:rounded-xl text-[11px] xl:text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                title="Returns"
              >
                <svg className="w-3 h-3 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>Returns</span>
              </button>
            )}

            {/* Warranty */}
            {canViewWarranties && (
              <button
                onClick={() => setShowWarrantyPanel(true)}
                className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 bg-[#faf5ff] hover:bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff] rounded-lg xl:rounded-xl text-[11px] xl:text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                title="Warranty Lookup"
              >
                <svg className="w-3 h-3 text-[#7e22ce]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Warranty</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center justify-center w-7 h-7 xl:w-8 xl:h-8 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg xl:rounded-xl text-slate-600 hover:text-slate-900 transition-all shadow-2xs shrink-0 cursor-pointer"
              title="Settings"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Right User Profile & Connectivity */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Cash Drawer Session Indicator & Timer Button */}
            <button
              onClick={() => {
                if (activeCashSession) {
                  setCashDrawerModalMode("VIEW");
                } else {
                  setCashDrawerModalMode("OPEN");
                }
                setShowCashDrawerModal(true);
              }}
              className={`flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer border ${
                activeCashSession
                  ? "px-2.5 py-1 rounded-full text-[11px] xl:text-xs font-bold bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border-emerald-300"
                  : "w-7 h-7 xl:w-8 xl:h-8 justify-center rounded-lg xl:rounded-xl bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200 hover:border-amber-300"
              }`}
              title={
                activeCashSession
                  ? `Active Shift (${sessionTimerDisplay}) - Click to view drawer statistics & timer`
                  : "Cash Drawer Closed - Click to open drawer & start day session"
              }
            >
              {activeCashSession ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-mono text-[11px]">{sessionTimerDisplay}</span>
                </>
              ) : (
                <div className="relative flex items-center justify-center">
                  <Banknote className="w-3.5 h-3.5 text-slate-600" />
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500 ring-1 ring-white" />
                </div>
              )}
            </button>

            {/* Website Direct Login Button */}
            <button
              onClick={handleGoToWebsite}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 text-[11px] xl:text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
              title="Go to Website Admin Panel"
            >
              <Globe className="w-3 h-3 text-blue-600" />
              <span>Website</span>
            </button>

            {/* Online Status */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-[10.5px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
        </header>

        {/* Catalog + Cart Columns */}
        <div className="flex-1 flex min-h-0 px-3 xl:px-4 pb-3 gap-2.5 xl:gap-3.5 overflow-hidden">
          {/* Middle: Product Catalog */}
          <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
            {/* Breadcrumb + Top Pagination Row */}
            <div className="flex items-center justify-between px-0.5 py-0.5 shrink-0 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] xl:text-xs font-medium text-slate-500">Showing</span>
                <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200/60 rounded-full text-blue-600 font-semibold text-[11px] xl:text-xs shadow-2xs">
                  {!selectedParentCategory
                    ? "All Products"
                    : categoryTree.find((c) => c._id === selectedParentCategory)?.name}
                </span>
                {selectedSubCategory && (
                  <>
                    <span className="text-slate-400 text-xs">/</span>
                    <span className="px-2.5 py-0.5 bg-sky-50 border border-sky-200/60 rounded-full text-sky-600 font-semibold text-[11px] xl:text-xs shadow-2xs">
                      {currentSubcategories.find((s) => s._id === selectedSubCategory)?.name}
                    </span>
                  </>
                )}
              </div>

              <div>
                {renderPaginationControls() || (
                  <span className="text-xs text-slate-500 font-medium">0 products</span>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div ref={productsGridRef} className="flex-1 overflow-y-auto pr-1 pb-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 xl:gap-3">
                {paginatedProducts.map((product) => {
                  const displayPrice = getProductDisplayPrice(product);
                  const originalPrice = getProductOriginalPrice(product, displayPrice);
                  const hasOffer =
                    (Boolean(product?.hasActiveOffer) ||
                      Boolean(
                        product?.offer?.isActive &&
                          product?.discountAmount &&
                          product.discountAmount > 0
                      )) && originalPrice > displayPrice;
                  const isOutOfStock = (product?.stock ?? 0) === 0;
                  const isLowStock =
                    (product?.stock ?? 0) > 0 && (product?.stock ?? 0) <= 10;
                  const productImg = resolveProductImage(product);
                  const firstVarAttrs = product.variants?.[0]?.attributes;
                  const hasOnlyDummyAttr = Array.isArray(firstVarAttrs) && (
                    firstVarAttrs.length === 0 ||
                    firstVarAttrs.some((a: any) =>
                      typeof a === "object"
                        ? !a.value || a.value === "None" || a.value === "Default"
                        : a === "None" || a === "Default"
                    )
                  );
                  const needsVariantSelection =
                    isImeiProduct(product) ||
                    (product.variants &&
                      product.variants.length > 0 &&
                      !(product.variants.length === 1 && (!firstVarAttrs || hasOnlyDummyAttr)));

                  return (
                    <div
                      key={product._id}
                      className={`bg-white rounded-xl xl:rounded-2xl p-2.5 xl:p-3 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-500 transition-all flex flex-col justify-between group ${
                        isOutOfStock ? "opacity-60" : ""
                      }`}
                    >
                      {/* Inner Image Container with Badges & Action */}
                      <div className="w-full bg-[#f0f4f9] rounded-lg xl:rounded-xl p-2 flex flex-col justify-between h-28 sm:h-30 xl:h-34 relative overflow-hidden group/img">
                        {/* Top Badge & Action Row */}
                        <div className="flex items-center justify-between w-full z-10 gap-1">
                          <div className="flex items-center gap-1 flex-wrap min-w-0">
                            {/* Stock Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] xl:text-[10px] font-semibold tracking-tight shadow-2xs ${
                                isOutOfStock
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : isLowStock
                                  ? "bg-amber-50 text-amber-800 border border-amber-200/70"
                                  : "bg-[#feeacc] text-[#92400e] border border-amber-200/60"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isOutOfStock ? "bg-red-500" : "bg-[#f59e0b]"
                                }`}
                              ></span>
                              {isOutOfStock ? "0 in stock" : `${product?.stock ?? 0} in stock`}
                            </span>

                            {/* Tracking Type Badge (IMEI / BULK) */}
                            {isImeiProduct(product) ? (
                              <span className="px-1.5 py-0.5 bg-[#e0edff] text-[#2563eb] text-[9px] font-extrabold rounded uppercase tracking-wider">
                                IMEI
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-extrabold rounded uppercase tracking-wider border border-slate-200/60">
                                BULK
                              </span>
                            )}
                            {product.condition && product.condition.toUpperCase() === "USED" && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded uppercase tracking-wider">
                                USED
                              </span>
                            )}
                          </div>

                          {/* Three Dots Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProductForDetails(product);
                            }}
                            className="w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shrink-0"
                            title="View Details"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>

                        {/* Centered Image */}
                        <div className="flex-1 w-full flex items-center justify-center my-0.5 overflow-hidden">
                          {productImg ? (
                            <img
                              src={productImg}
                              alt={product.name || "Product"}
                              loading="lazy"
                              decoding="async"
                              className="max-h-18 sm:max-h-20 xl:max-h-24 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const fallbackBase = "https://api.hotlinecellular.lk";
                                if (target.src && !target.src.includes("hotlinecellular.lk") && target.dataset.triedProduction !== "true") {
                                  target.dataset.triedProduction = "true";
                                  const path = target.src.replace(/^https?:\/\/[^\/]+/, "");
                                  target.src = `${fallbackBase}${path}`;
                                  return;
                                }
                                if (target.dataset.triedCategory !== "true") {
                                  target.dataset.triedCategory = "true";
                                  target.src = "https://api.hotlinecellular.lk/uploads/categories/accessories.jpg";
                                  return;
                                }
                                target.style.display = "none";
                                const next = target.nextElementSibling as HTMLElement;
                                if (next) next.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: productImg ? "none" : "flex" }}
                            className="w-10 h-10 rounded-lg bg-white/80 text-blue-600 flex items-center justify-center text-base font-bold shadow-2xs"
                          >
                            {(product?.name?.[0] || "P").toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Title & Price */}
                      <div className="mt-2">
                        <h3
                          className="text-xs xl:text-[13px] font-extrabold text-slate-800 uppercase tracking-tight truncate leading-snug"
                          title={product?.name}
                        >
                          {product?.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs sm:text-sm xl:text-[15px] font-extrabold text-[#2563eb] tracking-tight">
                            Rs. {displayPrice.toLocaleString()}
                          </span>
                          {hasOffer && originalPrice > displayPrice && (
                            <span className="text-[10px] text-slate-400 line-through font-medium">
                              Rs. {originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Add / Select Variant Button */}
                      <button
                        onClick={() => handleProductClick(product)}
                        disabled={isOutOfStock}
                        className={`w-full py-1.5 xl:py-2 px-2.5 rounded-lg xl:rounded-xl font-bold text-[11px] xl:text-xs transition-all duration-150 flex items-center justify-center gap-1 mt-2 cursor-pointer shadow-2xs active:scale-[0.98] ${
                          isOutOfStock
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100 hover:text-slate-400"
                            : needsVariantSelection
                            ? "bg-[#0f172a] text-white hover:bg-[#2563eb] hover:text-white group-hover:bg-[#2563eb] group-hover:text-white"
                            : "bg-[#ebf3ff] text-[#2563eb] hover:bg-[#2563eb] hover:text-white group-hover:bg-[#2563eb] group-hover:text-white"
                        }`}
                      >
                        + {needsVariantSelection ? "Select IMEI / Variant" : "Add to Order"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-xs mt-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-2.5">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5">No products found</h3>
                  <p className="text-[11px] text-slate-400 text-center max-w-sm">
                    Try adjusting your search or category filter to find products.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Current Order (Cart) */}
          <aside className="w-68 xl:w-74 2xl:w-80 bg-white rounded-xl xl:rounded-2xl p-3 xl:p-4 shadow-2xs border border-slate-200/90 flex flex-col h-full shrink-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">
                    Current Order
                  </h2>
                  {cart.length > 0 && (
                    <span className="text-[9.5px] text-slate-400 font-medium">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  )}
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto py-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-8">
                  <div className="w-14 h-14 rounded-full bg-blue-50/80 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5">
                    No items yet
                  </h3>
                  <p className="text-[11px] text-slate-400 text-center max-w-[180px]">
                    Add products from catalog to start an order
                  </p>
                </div>
              ) : (
                cart.map((item, index) => {
                  const hasItemOffer =
                    item.hasActiveOffer ||
                    (item.offer?.isActive && (item.discountAmount ?? 0) > 0);
                  const itemImg = resolveProductImage(
                    products.find((p) => p._id === item._id) || (item as Product)
                  );
                  return (
                    <div
                      key={
                        item.serialNumber
                          ? `${item._id}_${item.serialNumber}`
                          : `${item._id}_${index}`
                      }
                      className="bg-slate-50/80 rounded-xl p-2 xl:p-2.5 border border-slate-200/70 hover:border-blue-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-start gap-2">
                        {/* Thumbnail Image */}
                        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-lg bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={item.name || "Product"}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const fallbackBase = "https://api.hotlinecellular.lk";
                                if (target.src && !target.src.includes("hotlinecellular.lk") && target.dataset.triedProduction !== "true") {
                                  target.dataset.triedProduction = "true";
                                  const path = target.src.replace(/^https?:\/\/[^\/]+/, "");
                                  target.src = `${fallbackBase}${path}`;
                                  return;
                                }
                                if (target.dataset.triedCategory !== "true") {
                                  target.dataset.triedCategory = "true";
                                  target.src = "https://api.hotlinecellular.lk/uploads/categories/accessories.jpg";
                                  return;
                                }
                                target.style.display = "none";
                                const next = target.nextElementSibling as HTMLElement;
                                if (next) next.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: itemImg ? "none" : "flex" }}
                            className="w-full h-full items-center justify-center text-xs font-bold text-blue-600 bg-blue-50/50 rounded-lg"
                          >
                            {(item.name?.[0] || "P").toUpperCase()}
                          </div>
                        </div>

                        {/* Title, Badges & Remove Button */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-slate-800 font-bold text-[11px] xl:text-xs leading-snug truncate" title={item.name}>
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="p-0.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0 -mt-0.5 -mr-0.5"
                              title="Remove item"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {/* Variant & Serial Badges */}
                          {(item.variantDisplay || item.serialNumber || hasItemOffer || item.isSimReload) && (
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {item.variantDisplay && (
                                <span className="text-[9px] font-semibold text-blue-700 bg-blue-100/70 px-1 py-0.2 rounded">
                                  {item.variantDisplay}
                                </span>
                              )}
                              {item.serialNumber && (
                                <span className="text-[9px] font-mono font-bold text-sky-800 bg-sky-100/70 px-1 py-0.2 rounded">
                                  {isImeiProduct(item) ? `IMEI: ${item.serialNumber}` : `SN: ${item.serialNumber}`}
                                </span>
                              )}
                              {item.isSimReload && (
                                <span className="text-[9px] font-semibold text-purple-700 bg-purple-100 px-1 py-0.2 rounded">
                                  {item.simReloadType === "RELOAD" ? "Reload" : "SIM"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Total Row */}
                      <div className="flex items-center justify-between gap-1.5 mt-1.5 pt-1.5 border-t border-slate-200/60">
                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-white rounded-md border border-slate-200/80 p-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity - 1,
                                item.serialNumber,
                                item.variantId
                              )
                            }
                            className="w-4.5 h-4.5 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer text-xs"
                            disabled={isImeiProduct(item) || item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-[11px] font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity + 1,
                                item.serialNumber,
                                item.variantId
                              )
                            }
                            className="w-4.5 h-4.5 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer text-xs"
                            disabled={isImeiProduct(item)}
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total with optional strikethrough original price if discounted */}
                        <div className="flex items-center gap-1.5 text-right">
                          {Number(item.discountAmount ?? 0) > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">
                              Rs. {(Number(item.originalPrice ?? item.sellingPrice ?? 0) * item.quantity).toLocaleString()}
                            </span>
                          )}
                          <span className="text-[11.5px] xl:text-xs font-extrabold text-blue-600">
                            Rs. {getLineTotal(item).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Inline Price / Discount Edit on Next Line */}
                      {canApplyDiscount && (
                        <div className="mt-1 pt-1 border-t border-dashed border-slate-200/60">
                          <div
                            className={`flex items-center justify-between gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded border transition-all ${
                              Number(item.discountAmount ?? 0) > 0
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                            title="Enter discounted selling price (e.g. 7600) to auto-calculate discount"
                          >
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span className="shrink-0 font-bold text-[9px] uppercase tracking-wide text-slate-500">
                                Price:
                              </span>
                              <input
                                type="number"
                                className="w-20 sm:w-24 bg-transparent text-left font-bold focus:outline-none text-[10px] tabular-nums"
                                style={{ color: Number(item.discountAmount ?? 0) > 0 ? '#b91c1c' : '#0f172a' }}
                                value={
                                  item.customPrice !== undefined
                                    ? item.customPrice
                                    : Number(item.discountAmount ?? 0) > 0
                                    ? Number(item.effectivePrice ?? (Number(item.originalPrice ?? item.sellingPrice ?? 0) - Number(item.discountAmount)))
                                    : ""
                                }
                                placeholder={String(Number(item.originalPrice ?? item.sellingPrice ?? 0))}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const newCart = [...cart];
                                  const rawVal = e.target.value;
                                  const base = Number(newCart[index].originalPrice ?? newCart[index].sellingPrice ?? 0);

                                  if (rawVal === "") {
                                    newCart[index].customPrice = "";
                                    newCart[index].discountAmount = 0;
                                    newCart[index].effectivePrice = base;
                                    setCart(newCart);
                                    return;
                                  }

                                  const val = parseFloat(rawVal);
                                  if (!isNaN(val) && val >= 0) {
                                    newCart[index].customPrice = rawVal;
                                    newCart[index].effectivePrice = val;
                                    const disc = Math.max(0, base - val);
                                    newCart[index].discountAmount = Math.round(disc * 100) / 100;
                                    setCart(newCart);
                                  }
                                }}
                                onBlur={() => {
                                  if (item.customPrice === "") {
                                    const newCart = [...cart];
                                    const base = Number(newCart[index].originalPrice ?? newCart[index].sellingPrice ?? 0);
                                    delete newCart[index].customPrice;
                                    newCart[index].discountAmount = 0;
                                    newCart[index].effectivePrice = base;
                                    setCart(newCart);
                                  }
                                }}
                              />
                            </div>
                            {Number(item.discountAmount ?? 0) > 0 && (
                              <span
                                className="text-[9px] text-red-600 font-extrabold shrink-0 bg-red-100/90 px-1.5 py-0.2 rounded"
                                title={`Auto Discount: Rs. ${Number(item.discountAmount).toLocaleString()}`}
                              >
                                -Rs. {Number(item.discountAmount).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show Warranty Toggle Option */}
                      <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-200/70 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Show Warranty</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newCart = [...cart];
                            newCart[index].showWarranty = !newCart[index].showWarranty;
                            setCart(newCart);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold transition-all cursor-pointer ${
                            item.showWarranty
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title={item.showWarranty ? "Warranty will be printed on receipt" : "Warranty hidden on receipt (Default)"}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.showWarranty ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {item.showWarranty ? "Enabled" : "Disabled"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer */}
            <div className="pt-2.5 xl:pt-3 border-t border-slate-100 space-y-1.5 shrink-0">
              {/* Google Review Discount */}
              <div className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/80 mb-1 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="google-review-toggle"
                    className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] xl:text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    <input
                      id="google-review-toggle"
                      type="checkbox"
                      checked={isGoogleReviewEnabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsGoogleReviewEnabled(checked);
                        if (!checked) {
                          setGoogleReviewDiscount("");
                        }
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google Review</span>
                    </span>
                  </label>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      disabled={!isGoogleReviewEnabled}
                      value={googleReviewDiscount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || !isNaN(Number(val))) {
                          setGoogleReviewDiscount(val);
                        }
                      }}
                      placeholder="0"
                      className={`w-20 sm:w-24 px-2 py-0.5 text-right text-xs font-bold rounded border transition-all tabular-nums ${
                        isGoogleReviewEnabled
                          ? "bg-white border-blue-400 text-slate-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] xl:text-xs">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-800 font-bold">Rs. {rawSubtotal.toLocaleString()}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between items-center text-[11px] xl:text-xs text-red-500 font-medium">
                  <span>Discount</span>
                  <span className="font-bold">- Rs. {totalDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[11px] xl:text-xs">
                <span className="text-slate-500 font-medium">Tax</span>
                <span className="text-slate-800 font-bold">Rs. {tax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                <span className="text-xs xl:text-sm font-extrabold text-slate-900">Total</span>
                <span className="text-lg xl:text-xl font-black text-blue-600">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {/* Primary Pay Button */}
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className={`w-full py-2 xl:py-2.5 rounded-lg font-bold text-xs xl:text-sm transition-all flex items-center justify-center gap-2 mt-1.5 cursor-pointer shadow-2xs ${
                  cart.length === 0
                    ? "bg-blue-600 text-white opacity-90 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{cart.length === 0 ? "Add Items to Pay" : "Proceed to Payment"}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          total={total}
          subtotal={subtotal}
          tax={tax}
          cart={cart}
          canApplyDiscount={canApplyDiscount}
          exchangePayload={exchangePayload}
          orderDiscount={parsedGoogleReviewDiscount}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            const soldItems = [...(cartRef.current || cart)];
            clearCart();
            setShowPaymentModal(false);
            productVariantsCache.clear();
            fetchCurrentSession(true);

            // Instantly deduct sold items from local inventory in memory (0ms latency!)
            if (soldItems.length > 0) {
              const updated = (productsRef.current || products).map((p: any) => {
                const soldForThisProd = soldItems.filter((item: any) => String(item.product._id) === String(p._id));
                if (soldForThisProd.length === 0) return p;

                const newStock = Math.max(0, (p.stock || 0) - soldForThisProd.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0));
                let newStockItems = Array.isArray(p.stockItems) ? [...p.stockItems] : [];
                let newImeis = Array.isArray(p.imeis) ? [...p.imeis] : [];
                let newSerialNumbers = Array.isArray(p.serialNumbers) ? [...p.serialNumbers] : [];

                soldForThisProd.forEach((sold: any) => {
                  if (sold.serialNumber) {
                    const lowerSn = String(sold.serialNumber).toLowerCase();
                    newStockItems = newStockItems.filter(
                      (si: any) =>
                        String(si.imei1 || "").toLowerCase() !== lowerSn &&
                        String(si.imei2 || "").toLowerCase() !== lowerSn &&
                        String(si.serialNumber || "").toLowerCase() !== lowerSn &&
                        String(si._id || "") !== String(sold.stockItemId || "")
                    );
                    newImeis = newImeis.filter((im: string) => String(im).toLowerCase() !== lowerSn);
                    newSerialNumbers = newSerialNumbers.filter((sn: string) => String(sn).toLowerCase() !== lowerSn);
                  }
                });

                return {
                  ...p,
                  stock: newStock,
                  stockItems: newStockItems,
                  imeis: newImeis,
                  serialNumbers: newSerialNumbers,
                };
              });
              productsRef.current = updated;
              setProducts(updated);
            }

            // Silent background refresh
            fetchData(true);
          }}
        />
      )}

      {/* Sales Panel */}
      {showSalesPanel && (
        <SalesPanel
          salesData={salesData}
          dailySummary={dailySummary}
          loading={salesLoading}
          canVoidSale={canVoidSale}
          onClose={() => setShowSalesPanel(false)}
          onRefresh={fetchSalesData}
        />
      )}

      {/* Repairs Panel */}
      {showRepairsPanel && (
        <RepairsPanel
          repairs={repairs}
          loading={repairsLoading}
          onClose={() => setShowRepairsPanel(false)}
          onRefresh={fetchRepairs}
          onCollectPayment={(repair) => {
            setSelectedRepairForPayment(repair);
            setShowRepairsPanel(false);
          }}
        />
      )}

      {showExpensesPanel && (
        <ExpensesPanel onClose={() => setShowExpensesPanel(false)} />
      )}

      {showSimReloadPanel && (
        <SimReloadPanel
          onClose={() => setShowSimReloadPanel(false)}
          onAddToCart={(item) => {
            setCart((prev) => [...prev, item]);
          }}
        />
      )}

      {/* Repair Payment Modal */}
      {selectedRepairForPayment && (
        <RepairPaymentModal
          repair={selectedRepairForPayment}
          canCollectPayment={canCollectRepairPayment}
          onClose={() => setSelectedRepairForPayment(null)}
          onSuccess={() => {
            setSelectedRepairForPayment(null);
            fetchRepairs();
          }}
        />
      )}

      {/* Warranty Panel */}
      {showWarrantyPanel && (
        <WarrantyPanel
          onClose={() => setShowWarrantyPanel(false)}
          canCreateClaim={canCreateWarrantyClaim}
          onCreateClaim={(warranty: Warranty) => {
            setSelectedWarrantyForClaim(warranty);
          }}
        />
      )}

      {/* Warranty Claim Modal */}
      {selectedWarrantyForClaim && (
        <WarrantyClaimModal
          warranty={selectedWarrantyForClaim}
          onClose={() => setSelectedWarrantyForClaim(null)}
          onSuccess={() => {
            setSelectedWarrantyForClaim(null);
          }}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProductForDetails && (
        <ProductDetailModal
          product={selectedProductForDetails}
          onClose={() => setSelectedProductForDetails(null)}
          onAddToCart={(product) => {
            setSelectedProductForDetails(null);
            handleProductClick(product);
          }}
        />
      )}

      {/* Variant Selection Modal */}
      {showVariantModal && pendingProduct && (
        <VariantSelectionModal
          product={pendingProduct}
          initialVariantId={pendingVariantId}
          initialSerialNumber={pendingSerialNumber}
          cart={cart}
          isLoading={isVariantModalLoading}
          onClose={() => {
            setShowVariantModal(false);
            setPendingProduct(null);
            setPendingVariantId(undefined);
            setPendingSerialNumber(undefined);
            setIsVariantModalLoading(false);
          }}
          onSelectVariant={(variant, serialNumber, stockItemId, stockItemPrice) => {
            setShowVariantModal(false);
            addToCart(pendingProduct, serialNumber, variant, stockItemId, stockItemPrice);
            setPendingProduct(null);
            setPendingVariantId(undefined);
            setPendingSerialNumber(undefined);
            setIsVariantModalLoading(false);
          }}
        />
      )}



      {/* Returns Panel */}
      {showReturnsPanel && (
        <ReturnsPanel 
          onClose={() => setShowReturnsPanel(false)} 
          products={products} 
          onInitiateExchange={(payload, amount) => {
            setExchangePayload(payload);
            setCart(prev => [
              ...prev,
              {
                _id: "return-credit",
                name: `Return Credit (Sale #${payload.originalSaleId})`,
                quantity: 1,
                sellingPrice: -amount,
                effectivePrice: -amount,
                costPrice: 0,
                isReturnCredit: true
              } as CartItem
            ]);
            setShowReturnsPanel(false);
          }}
        />
      )}

      {/* Customer Product Request Modal */}
      {showCustomerRequestModal && (
        <CustomerRequestModal
          onClose={() => setShowCustomerRequestModal(false)}
        />
      )}

      {/* Reports & Business Analytics Modal */}
      {showReportsModal && (
        <ReportsModal
          isOpen={showReportsModal}
          onClose={() => setShowReportsModal(false)}
          categories={categoryTree}
          products={products}
          currentUser={user}
        />
      )}

      {/* Cash Drawer Session Modal */}
      {showCashDrawerModal && (
        <CashDrawerModal
          mode={cashDrawerModalMode}
          activeSession={activeCashSession}
          expectedOpeningAmount={expectedOpeningAmount}
          currentCashierName={user?.username || "Cashier"}
          onClose={() => setShowCashDrawerModal(false)}
          onSessionStarted={(session) => {
            setActiveCashSession(session);
            setShowCashDrawerModal(false);
            showSuccess("Cash drawer session opened successfully!");
          }}
          onSessionClosed={async (session) => {
            setActiveCashSession(null);
            setExpectedOpeningAmount(session.closingAmount || 0);
            setShowCashDrawerModal(false);
            showSuccess("Cash drawer session closed and recorded successfully!");
            setTimeout(async () => {
              try {
                await logout();
              } catch {}
              navigate("/login");
            }, 500);
          }}
        />
      )}
    </div>
  );
}
