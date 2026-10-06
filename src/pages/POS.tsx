import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PERMISSIONS } from "../constants/permission";
import { api } from "../lib/api";
import { getKeyboardShortcuts, getShopSettings } from "../lib/settings";
import logo from "../assets/logo.png";

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
  SalesPanel,
  RepairsPanel,
  ExpensesPanel,
  ReturnsPanel,
  WarrantyPanel,
} from "../components/pos";

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

  // State
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<
    string | null
  >(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null,
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productPage, setProductPage] = useState<number>(1);
  const PRODUCTS_PER_PAGE = 40;
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
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

  // Serial Number Modal State (for warranty products)
  const [showSerialModal, setShowSerialModal] = useState<boolean>(false);
  const [showVariantModal, setShowVariantModal] = useState<boolean>(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingVariantId, setPendingVariantId] = useState<string | undefined>(undefined);
  const [pendingSerialNumber, setPendingSerialNumber] = useState<string | undefined>(undefined);
  const [serialNumberInput, setSerialNumberInput] = useState<string>("");
  const [serialInputType, setSerialInputType] = useState<"IMEI" | "Serial">("IMEI");
  const [toastNotification, setToastNotification] = useState<{ message: string; type: "error" | "success" } | null>(null);

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

  // Process scanned barcode, SKU, or IMEI/Serial
  const processScannedBarcode = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // 1. Direct IMEI Lookup -> Auto-add to cart without pop-up
    try {
      const imeiRes = await api<{ status?: string; data?: any }>(
        `/inventory/lookup/imei/${encodeURIComponent(code)}`
      ).catch(() => null);

      if (imeiRes && imeiRes.status === "success" && imeiRes.data?.stockItem) {
        const stockItem = imeiRes.data.stockItem;

        // Verify if this IMEI is already in cart
        const alreadyInCart = cart.some(
          (item) =>
            (item.serialNumber && String(item.serialNumber).toLowerCase() === code.toLowerCase()) ||
            (item.stockItemId && String(item.stockItemId) === String(stockItem._id))
        );

        if (alreadyInCart) {
          showError(`Item with IMEI "${code}" is already in the cart!`);
          return;
        }

        const itemProductId = stockItem.product?._id || stockItem.product || stockItem.stock?.product;
        let baseProduct = products.find((p) => String(p._id) === String(itemProductId));

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
            true // skipSerial modal
          );
          return;
        }
      }
    } catch (err) {
      console.error("Error during IMEI lookup:", err);
    }

    // 2. Serial Number Lookup -> When scanned a serial number, pop up comes showing all the variants that are in that serial number!
    try {
      const serialRes = await api<{ status?: string; data?: any }>(
        `/inventory/lookup/serial/${encodeURIComponent(code)}`
      ).catch(() => null);

      if (serialRes && serialRes.status === "success" && serialRes.data?.stockItem) {
        const data = serialRes.data;
        const stockItem = data.stockItem;
        const isSerial = data.isSerialNumber !== false && (
          data.isSerialNumber === true ||
          code.toUpperCase().startsWith("STK-") ||
          Boolean(stockItem.serialNumber && String(stockItem.serialNumber).toLowerCase() === code.toLowerCase())
        );

        if (isSerial) {
          const itemProductId = stockItem.product?._id || stockItem.product || stockItem.stock?.product;
          let targetProduct = products.find((p) => String(p._id) === String(itemProductId));

          if (!targetProduct && stockItem.product) {
            targetProduct = {
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

          if (targetProduct) {
            // Get all variants that belong to this serial number
            const serialVariants: any[] = Array.isArray(data.variants) && data.variants.length > 0
              ? data.variants
              : (stockItem.variant ? [stockItem.variant] : []);

            if (serialVariants.length > 0) {
              // Scanned a serial number: pop up comes showing all the variants that are in that serial number
              setPendingProduct({ ...targetProduct, variants: serialVariants });
              setPendingVariantId(serialVariants[0]?._id);
              setPendingSerialNumber(code);
              setShowVariantModal(true);
              return;
            } else {
              // Non-variant product scanned with serial number: auto-add to cart!
              addToCart(
                targetProduct,
                code,
                undefined,
                stockItem._id,
                stockItem.sellingPrice,
                true
              );
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error during serial lookup:", err);
    }

    // 3. Barcode / SKU / ItemCode Scan -> Scanned items automatically add into cart!
    let targetProduct: any = null;
    let targetVariant: any = null;

    // A. Check if the scanned code matches a specific variant's itemCode, barcode, or sku in loaded products
    for (const p of products) {
      if (p.variants && Array.isArray(p.variants)) {
        const matchingVariant = p.variants.find(
          (v: any) =>
            (v.itemCode && String(v.itemCode).trim().toLowerCase() === code.toLowerCase()) ||
            (v.barcode && String(v.barcode).trim().toLowerCase() === code.toLowerCase()) ||
            (v.sku && String(v.sku).trim().toLowerCase() === code.toLowerCase())
        );
        if (matchingVariant) {
          targetProduct = p;
          targetVariant = matchingVariant;
          break;
        }
      }
    }

    // B. Check if code matches a product's barcode, sku, or itemCode in loaded products
    if (!targetProduct) {
      targetProduct = products.find(
        (p: any) =>
          (p.barcode && String(p.barcode).trim().toLowerCase() === code.toLowerCase()) ||
          (p.sku && String(p.sku).trim().toLowerCase() === code.toLowerCase()) ||
          (p.itemCode && String(p.itemCode).trim().toLowerCase() === code.toLowerCase())
      );
    }

    // C. Query backend by barcode endpoint if still not found
    if (!targetProduct) {
      try {
        const barcodeRes = await api<{ status?: string; data?: { product?: any } }>(
          `/products/barcode/${encodeURIComponent(code)}`
        ).catch(() => null);

        if (barcodeRes && barcodeRes.status === "success" && barcodeRes.data?.product) {
          targetProduct = barcodeRes.data.product;
        }
      } catch (err) {
        console.error("Error fetching product by barcode:", err);
      }
    }

    // D. Query backend search if still not found
    if (!targetProduct) {
      try {
        const prodRes = await api<{ status?: string; data?: { products?: any[] } }>(
          `/products?search=${encodeURIComponent(code)}`
        ).catch(() => null);

        if (prodRes && prodRes.status === "success" && prodRes.data?.products && prodRes.data.products.length > 0) {
          targetProduct = prodRes.data.products[0];
        }
      } catch (err) {
        console.error("Error searching products by query:", err);
      }
    }

    // If product found:
    if (targetProduct) {
      // 1. If scanned a specific variant barcode/SKU -> AUTO-ADD DIRECTLY TO CART!
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

      const prodVariants = Array.isArray(targetProduct.variants) ? targetProduct.variants : [];

      // 2. If product has NO variants -> AUTO-ADD DIRECTLY TO CART!
      if (prodVariants.length === 0) {
        addToCart(targetProduct, undefined, undefined, undefined, undefined, true);
        return;
      }

      // 3. If product has only 1 variant -> AUTO-ADD DIRECTLY TO CART!
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

      // 4. If product has multiple variants and generic parent barcode was scanned:
      // Show VariantSelectionModal so cashier can choose which variant they have
      try {
        const res = await api<any>(`/products/${targetProduct._id}/with-variants`);
        if (res.status === "success" && res.data) {
          const fullProduct = res.data.product || targetProduct;
          const variants = res.data.variants || prodVariants;

          setPendingProduct({ ...fullProduct, variants });
          setPendingVariantId(undefined);
          setPendingSerialNumber(undefined);
          setShowVariantModal(true);
          return;
        }
      } catch (err) {
        console.error("Error fetching product variants:", err);
      }

      setPendingProduct(targetProduct);
      setPendingVariantId(undefined);
      setPendingSerialNumber(undefined);
      setShowVariantModal(true);
      return;
    }

    // If not found in the database at all, display error message
    showError(`Invalid barcode, Serial, or IMEI not found: "${code}"`);
  };

  // Fetch data on mount & keep POS continuously synced in background
  useEffect(() => {
    // Initial fetch with initial loading state
    fetchData(false);

    // Silent background sync every 5 seconds (no UI flicker or spinner)
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    // Immediate background sync when POS window/tab regains focus or visibility
    const handleFocus = () => {
      fetchData(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
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

  // Global Barcode Scanner Listener
  useEffect(() => {
    let barcodeBuffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is pressing modifiers
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      const currentTime = Date.now();
      
      // If time between keystrokes is more than 50ms, it's a human typing, reset buffer
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = "";
      }
      
      // Only capture single characters for the buffer
      if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
      
      // If Enter is pressed and we have a rapidly typed buffer (at least 3 chars)
      if (e.key === "Enter" && barcodeBuffer.length >= 3) {
        e.preventDefault(); 
        
        // If they were focused on an input, blur it to prevent stray keystrokes later
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
          (document.activeElement as HTMLElement).blur();
        }
        
        const scannedCode = barcodeBuffer;
        barcodeBuffer = "";
        
        // Set it in the search input visually
        setSearchQuery(scannedCode);
        
        // Process the scan
        processScannedBarcode(scannedCode);
      }
      
      lastKeyTime = currentTime;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [products, cart]);

  const notifiedRepairsRef = useRef<Set<string>>(new Set());
  const isInitialRepairsFetchRef = useRef<boolean>(true);

  // Polling for repairs
  useEffect(() => {
    if (!canViewRepairs) return;

    // Initial fetch
    fetchRepairs(true);

    const interval = setInterval(() => {
      fetchRepairs(true);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [canViewRepairs]);

  // Search input ref
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productsGridRef = useRef<HTMLDivElement>(null);

  // Global Barcode Scanner handler
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleGlobalScan = (e: KeyboardEvent) => {
      const settings = getShopSettings();
      if (!settings.barcodeEnabled) return;

      // Ignore if typing in an input other than general focus
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // Ignore if any modal/panel is open
      if (
        showPaymentModal ||
        showSalesPanel ||
        showRepairsPanel ||
        showExpensesPanel ||
        showReturnsPanel ||
        showWarrantyPanel ||
        showSerialModal ||
        showVariantModal
      ) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Hardware scanners type very fast (< 120ms per character)
      if (timeDiff > 120) {
        barcodeBufferRef.current = ""; // Reset if typing too slow
      }

      if (e.key === "Enter") {
        if (barcodeBufferRef.current.length >= 3) {
          e.preventDefault();
          const scannedCode = barcodeBufferRef.current.trim();
          barcodeBufferRef.current = "";
          processScannedBarcode(scannedCode);
        }
        barcodeBufferRef.current = "";
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalScan);
    return () => window.removeEventListener("keydown", handleGlobalScan);
  }, [
    products,
    cart,
    showPaymentModal,
    showSalesPanel,
    showRepairsPanel,
    showExpensesPanel,
    showReturnsPanel,
    showWarrantyPanel,
    showSerialModal,
    showVariantModal
  ]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      const shortcuts = getKeyboardShortcuts();
      const key = e.key.toUpperCase();

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
      } else if (key === shortcuts.focusSearch.toUpperCase()) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (key === shortcuts.logout.toUpperCase()) {
        e.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, canViewRepairs, canViewReports]);

  const fetchData = async (silent: boolean = false): Promise<void> => {
    if (!silent) setLoading(true);
    try {
      const [catData, prodData] = await Promise.all([
        api<CategoriesResponse>("/categories?tree=true"),
        api<ProductsResponse>("/products?limit=1000"),
      ]);
      if (catData.status === "success" && catData.data?.categories) {
        setCategoryTree(catData.data.categories);
      }
      if (prodData.status === "success" && prodData.data?.products) {
        setProducts(prodData.data.products);
      }
    } catch (err) {
      if (!silent) console.error("Failed to fetch data:", err);
    } finally {
      if (!silent) setLoading(false);
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
  const currentSubcategories: Category[] = selectedParentCategory
    ? categoryTree.find((c) => c._id === selectedParentCategory)
        ?.subcategories || []
    : [];

  const getSelectedCategoryIds = (): string[] => {
    if (selectedSubCategory) return [selectedSubCategory];
    if (selectedParentCategory) {
      const parent = categoryTree.find((c) => c._id === selectedParentCategory);
      const subIds = parent?.subcategories?.map((s) => s._id) || [];
      return [selectedParentCategory, ...subIds];
    }
    return [];
  };

  // Filter products (searches by Name, SKU, ItemCode, Barcode, Serial Number, IMEI, and Variant attributes)
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();

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
    const selectedIds = getSelectedCategoryIds();
    if (selectedIds.length === 0) {
      return true; // No category filter
    }

    // Check if product's category or subcategory matches selected categories
    const productCategoryId = p.category?._id || "";
    const productSubcategoryId = p.subcategory?._id || "";

    return (
      selectedIds.includes(productCategoryId) ||
      selectedIds.includes(productSubcategoryId)
    );
  });

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safeProductPage = Math.min(Math.max(1, productPage), totalProductPages);
  const paginatedProducts = filteredProducts.slice(
    (safeProductPage - 1) * PRODUCTS_PER_PAGE,
    safeProductPage * PRODUCTS_PER_PAGE
  );

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
      <div className="flex items-center justify-between gap-3 py-0.5">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
          Showing <span className="font-bold text-slate-700 dark:text-slate-200">{startItem}-{endItem}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filteredProducts.length}</span>
        </div>

        {totalProductPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setProductPage((p) => Math.max(1, p - 1))}
              disabled={safeProductPage === 1}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                safeProductPage === 1
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 shadow-xs active:scale-95"
              }`}
              title="Previous Page"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-slate-400 dark:text-slate-600 select-none">
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
                    className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 active:scale-95"
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
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                safeProductPage === totalProductPages
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 shadow-xs active:scale-95"
              }`}
              title="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  const resolveProductImage = (p: Product): string | null => {
    let img = p.images?.[0];
    if (!img && p.variants && Array.isArray(p.variants)) {
      for (const v of p.variants) {
        if (v.images && v.images.length > 0 && v.images[0]) {
          img = v.images[0];
          break;
        }
      }
    }
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img;
    const cleanPath = img.startsWith("/") ? img : `/${img}`;
    const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api\/v1\/?$/, '') : 'http://127.0.0.1:5000');
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

  const handleProductClick = async (product: Product) => {
    const existingVariants = Array.isArray(product.variants) ? product.variants : [];

    try {
      const res = await api<any>(`/products/${product._id}/with-variants`);
      if (res.status === "success" && res.data) {
        const fullProduct = res.data.product || product;
        const fetchedVariants = Array.isArray(res.data.variants) ? res.data.variants : [];
        const variants = fetchedVariants.length > 0 ? fetchedVariants : existingVariants;

        if (variants.length > 0) {
          setPendingProduct({ ...fullProduct, variants });
          setPendingVariantId(undefined);
          setPendingSerialNumber(undefined);
          setShowVariantModal(true);
          return;
        } else {
          addToCart(fullProduct);
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching product variants:", err);
    }

    if (existingVariants.length > 0) {
      setPendingProduct({ ...product, variants: existingVariants });
      setPendingVariantId(undefined);
      setPendingSerialNumber(undefined);
      setShowVariantModal(true);
      return;
    }

    addToCart(product);
  };

  // Cart functions
  const addToCart = (product: Product, serialNumber?: string, variant?: any, stockItemId?: string, stockItemPrice?: number, skipSerial: boolean = false): void => {
    if (!variant && (product?.stock ?? 0) === 0) {
      showError("Product is out of stock!");
      return;
    }

    // If product has variants and no specific variant was passed, open VariantSelectionModal
    const hasVariants = Boolean(product.variants && product.variants.length > 0);
    if (hasVariants && !variant) {
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
    
    // Check if product has warranty and needs serial number
    const isImei = (product.trackingType?.toUpperCase() === "IMEI") || (variant?.trackingType?.toUpperCase() === "IMEI");
    const hasWarranty = (product.warrantyDuration ?? 0) > 0 || isImei || (product.trackingType?.toUpperCase() === "SERIAL");

    // If product has warranty and no serial number provided, show modal
    if (hasWarranty && !serialNumber && !variant && !skipSerial) {
      setPendingProduct(product);
      setSerialNumberInput("");
      setShowSerialModal(true);
      return;
    }

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

    if (serialNumber || isImei) {
      // For warranty / IMEI products, each unit needs a unique serial number / IMEI
      if (serialNumber) {
        const serialExists = cart.some(
          (item) =>
            (item.serialNumber && item.serialNumber.toLowerCase() === serialNumber.toLowerCase()) ||
            (stockItemId && item.stockItemId === stockItemId)
        );
        if (serialExists) {
          showError("This serial number / IMEI is already in the cart!");
          return;
        }
      }

      setCart([
        ...cart,
        {
          ...product,
          sellingPrice: itemPrice,
          originalPrice: originalPrice,
          effectivePrice: effectivePrice,
          discountAmount: discountAmount,
          quantity: 1,
          serialNumber,
          variantId: variant?._id,
          trackingType: variant?.trackingType || product.trackingType || (isImei ? "IMEI" : "QUANTITY"),
          variantDisplay: formatVariantDisplay(variant),
          stockItemId: stockItemId,
        },
      ]);
    } else {
      // Non-warranty / Quantity product - match by product id and variantId
      const existing = cart.find(
        (item) => item._id === product._id && item.variantId === variant?._id && !item.serialNumber
      );

      if (existing) {
        const availableStock = variant?.stock ?? (product?.stock ?? 0);
        if (availableStock > 0 && existing.quantity >= availableStock) {
          showError(`Only ${availableStock} available!`);
          return;
        }
        setCart(
          cart.map((item) =>
            item === existing
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCart([
          ...cart,
          {
            ...product,
            sellingPrice: itemPrice,
            originalPrice: originalPrice,
            effectivePrice: effectivePrice,
            discountAmount: discountAmount,
            quantity: 1,
            variantId: variant?._id,
            trackingType: variant?.trackingType || product.trackingType || "QUANTITY",
            variantDisplay: formatVariantDisplay(variant),
            stockItemId: stockItemId,
          },
        ]);
      }
    }
    showSuccess(`Added "${product.name || "item"}" to order`);
  };

  // Handle serial number confirmation
  const handleSerialNumberConfirm = async (): Promise<void> => {
    if (!pendingProduct) return;

    const trimmedSerial = serialNumberInput.trim();
    if (!trimmedSerial) {
      showError("Please enter a serial number or IMEI");
      return;
    }

    // Check if serial number already in cart
    const serialExists = cart.some(
      (item) => item.serialNumber === trimmedSerial,
    );
    if (serialExists) {
      showError("This serial number is already in the cart!");
      return;
    }

    try {
      // Validate serial number exactly via lookup route
      let stockItem = null;
      try {
        let res = null;
        if (serialInputType === "IMEI") {
          res = await api<{ status?: string; data?: any }>(`/inventory/lookup/imei/${trimmedSerial}`);
        } else {
          res = await api<{ status?: string; data?: any }>(`/inventory/lookup/serial/${trimmedSerial}`);
        }
        
        if (res.status === "success" && res.data?.stockItem) {
          stockItem = res.data.stockItem;
        }
      } catch (e: any) {
        // Fallback in case of unexpected exceptions, though api usually catches them
        console.error("Error in lookup API:", e);
      }

      if (!stockItem) {
        setSerialNumberInput("");
        showError("The entered serial number/IMEI is not valid or not available in stock.");
        return;
      }

      const itemProductId = stockItem.product?._id || stockItem.product || stockItem.stock?.product;
      if (String(itemProductId) !== String(pendingProduct._id)) {
        setSerialNumberInput("");
        const expectedName = pendingProduct.name || String(pendingProduct._id);
        const actualName = stockItem.product?.name || String(itemProductId);
        showError(`IMEI belongs to "${actualName}", not "${expectedName}".`);
        return;
      }

      // Add product with serial number
      addToCart(pendingProduct, trimmedSerial, stockItem.variant, stockItem._id, stockItem.sellingPrice);

      // Reset modal state
      setShowSerialModal(false);
      setPendingProduct(null);
      setSerialNumberInput("");
    } catch (error) {
      console.error("Error validating serial number:", error);
      setSerialNumberInput("");
      showError("Failed to validate serial number. Please try again.");
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
    } else {
      // For items with serial number, don't allow quantity > 1
      if (serialNumber && quantity > 1) {
        showError("Each item with serial number must have quantity of 1");
        return;
      }
      const product = products.find((p) => p._id === productId);
      if (quantity > (product?.stock ?? 0)) {
        showError(`Only ${product?.stock} available!`);
        return;
      }
      setCart(
        cart.map((item) =>
          getCartItemKey(item) === itemKey ? { ...item, quantity } : item,
        ),
      );
    }
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
        return next;
      });
      return;
    }

    if (typeof itemOrIndexOrId === "object" && itemOrIndexOrId !== null) {
      const targetKey = getCartItemKey(itemOrIndexOrId);
      setCart((prev) => prev.filter((item) => getCartItemKey(item) !== targetKey));
      if (itemOrIndexOrId._id === "return-credit") {
        setExchangePayload(null);
      }
      return;
    }

    const productId = String(itemOrIndexOrId);
    let itemKey = productId;
    if (variantId) itemKey += `_${variantId}`;
    if (serialNumber) itemKey += `_${serialNumber}`;
    setCart((prev) => prev.filter((item) => getCartItemKey(item) !== itemKey));

    if (productId === "return-credit") {
      setExchangePayload(null);
    }
  };

  const clearCart = (): void => {
    setCart([]);
    setExchangePayload(null);
  };

  // Calculate totals (use effectivePrice for items with offers)
  const getLineTotal = (item: CartItem) => {
    const unitPrice = item.effectivePrice !== undefined && item.effectivePrice !== null
      ? item.effectivePrice
      : (item.sellingPrice ?? 0);
    return unitPrice * item.quantity;
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + getLineTotal(item),
    0,
  );
  const tax = cart.reduce((sum, item) => {
    const itemTotal = getLineTotal(item);
    return sum + itemTotal * ((item.taxRate ?? 0) / 100);
  }, 0);
  const total = subtotal + tax;

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
    <div className="h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col overflow-hidden relative">
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
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <span className="text-sm font-semibold tracking-wide">{toastNotification.message}</span>
          <button 
            onClick={() => setToastNotification(null)} 
            className="ml-2 text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Modern Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-sky-200/50 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-lg shadow-sky-100/20 dark:shadow-none">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={logo} alt="Hotline POS" className="w-11 h-11 object-contain bg-sky-100 rounded-xl p-1" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sky-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight dark:text-white">
              Hotline POS
            </h1>
            <p className="text-[10px] text-sky-600 -mt-0.5 font-medium tracking-wide">
              POINT OF SALE
            </p>
          </div>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="relative w-[420px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-500 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
                processScannedBarcode(code);
              }
            }}
            placeholder="Search products, SKU, Serial, IMEI, or scan barcode..."
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-sky-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-all text-sm shadow-sm dark:bg-slate-800 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Action Buttons & User Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="flex items-center justify-center w-9 h-9 bg-white/60 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white transition-all shadow-sm group"
            title="Refresh Data"
            disabled={loading}
          >
            <svg
              className={`w-4 h-4 group-hover:text-sky-500 transition-colors ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              setShowSalesPanel(true);
              fetchSalesData();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white transition-all group shadow-sm"
            title="Sales Reports"
          >
            <svg
              className="w-4 h-4 group-hover:text-sky-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs font-medium hidden xl:block">Sales</span>
          </button>
            {canViewRepairs && (
              <button
                onClick={() => {
                  setShowRepairsPanel(true);
                  fetchRepairs();
                }}
                className="relative flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white transition-all group shadow-sm"
                title="Repairs"
              >
                <div className="relative">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {repairs.filter((r) => (r.status || "").toUpperCase().trim() === "COMPLETED").length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" title="Completed repairs ready"></span>
                  )}
                </div>
                <span className="text-xs font-medium hidden xl:block">
                  Repairs
                </span>
                {repairs.filter((r) => {
                  const s = (r.status || "").toUpperCase().trim();
                  return s !== "CANCELLED" && s !== "COMPLETED";
                }).length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-blue-500/30 animate-pulse">
                    {repairs.filter((r) => {
                      const s = (r.status || "").toUpperCase().trim();
                      return s !== "CANCELLED" && s !== "COMPLETED";
                    }).length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setShowExpensesPanel(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/80 hover:bg-orange-50 dark:hover:bg-slate-700 border border-orange-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-orange-700 dark:hover:text-white transition-all group shadow-sm"
              title="Expenses"
            >
              <div className="relative">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h3m-9 5h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium hidden xl:block">
                Expenses
              </span>
            </button>
          {canProcessReturn && (
            <button
              onClick={() => setShowReturnsPanel(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white transition-all group shadow-sm"
              title="Returns"
            >
              <svg
                className="w-4 h-4 group-hover:text-sky-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span className="text-xs font-medium hidden xl:block">
                Returns
              </span>
            </button>
          )}
          {canViewWarranties && (
            <button
              onClick={() => setShowWarrantyPanel(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white transition-all group shadow-sm"
              title="Warranty Lookup"
            >
              <svg
                className="w-4 h-4 group-hover:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-xs font-medium hidden xl:block">
                Warranty
              </span>
            </button>
          )}
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-all group shadow-sm"
            title="Settings"
          >
            <svg
              className="w-4 h-4 group-hover:text-slate-700 dark:group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Connectivity Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800'} shadow-sm`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
            <span className="text-xs font-bold">{isOnline ? 'Online' : 'Offline Mode'}</span>
            {!isOnline && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.163a1.5 1.5 0 013.111-1.258" />
              </svg>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-sky-200 dark:bg-slate-700 mx-1"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 border border-sky-200 dark:border-slate-600 flex items-center justify-center shadow-inner">
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                {(user?.username?.[0] || "U").toUpperCase()}
              </span>
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-slate-800 text-sm font-medium leading-tight dark:text-white">
                {user?.username || "User"}
              </p>
              <p className="text-[10px] text-sky-600/80 dark:text-sky-400/80 font-medium">
                {user?.roles?.[0]?.name || "Cashier"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white/60 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-slate-700 hover:border-red-300 text-red-600 dark:text-red-400 hover:text-red-700 rounded-xl transition-all shadow-sm"
              title="Logout"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar - Optimized */}
        <aside className="w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-sky-200/50 dark:border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-sky-200/50 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2 dark:text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Categories
            </h3>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-sky-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <button
              onClick={() => handleParentCategoryClick(null)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${ !selectedParentCategory ? "bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 dark:border-sky-500/40 shadow-lg shadow-sky-500/5" : "text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-white border-transparent" }`}
            >
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${ !selectedParentCategory ? "bg-sky-500/20 text-sky-600 dark:text-sky-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </span>
              <span className="font-medium text-sm">All Products</span>
            </button>

            {categoryTree.map((cat) => (
              <div key={cat._id}>
                <button
                  onClick={() => handleParentCategoryClick(cat._id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${ selectedParentCategory === cat._id ? "bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 dark:border-sky-500/40 shadow-lg shadow-sky-500/5" : "text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-white border-transparent" }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${ selectedParentCategory === cat._id ? "bg-sky-500/20 text-sky-600 dark:text-sky-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" }`}
                  >
                    {cat.name.charAt(0)}
                  </span>
                  <span className="font-medium flex-1 truncate text-sm">
                    {cat.name}
                  </span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${selectedParentCategory === cat._id ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Subcategories */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${selectedParentCategory === cat._id ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                >
                  {cat.subcategories?.map((sub) => (
                    <button
                      key={sub._id}
                      onClick={() => handleSubCategoryClick(sub._id)}
                      className={`w-full ml-3 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 ${ selectedSubCategory === sub._id ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500" : "text-slate-500 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200 border-transparent" }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium ${ selectedSubCategory === sub._id ? "bg-blue-500/20 text-blue-600 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" }`}
                      >
                        {sub.name.charAt(0)}
                      </span>
                      <span className="truncate">{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Products Grid - Enhanced */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb & Top Pagination Bar */}
          <div className="px-5 py-2.5 bg-white/80 dark:bg-slate-900/80 border-b border-sky-200/50 dark:border-slate-800 flex items-center justify-between flex-shrink-0 gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-slate-600 dark:text-slate-400">Showing</span>
                <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950/60 rounded-lg text-sky-700 dark:text-sky-300 font-medium border border-sky-200 dark:border-sky-800/60">
                  {!selectedParentCategory
                    ? "All Products"
                    : categoryTree.find((c) => c._id === selectedParentCategory)
                        ?.name}
                </span>
                {selectedSubCategory && (
                  <>
                    <svg
                      className="w-4 h-4 text-slate-500 dark:text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 rounded-lg text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800/60">
                      {
                        currentSubcategories.find(
                          (s) => s._id === selectedSubCategory,
                        )?.name
                      }
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Top Pagination Controls */}
            <div>
              {renderPaginationControls() || (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">0 products</span>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div ref={productsGridRef} className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <div className="grid grid-cols-4 gap-4">
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

                return (
                  <div
                    key={product._id}
                    className={`group relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm border border-sky-200/50 dark:border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/50 hover:-translate-y-1 ${ isOutOfStock ? "opacity-60 grayscale-[30%]" : "" }`}
                  >
                    {/* Offer Badge */}
                    {hasOffer && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-orange-500/30 uppercase tracking-wide">
                          {product?.offer?.type === "PERCENTAGE"
                            ? `${product?.offer?.value}% OFF`
                            : `Rs. ${(product?.discountAmount || (originalPrice - displayPrice)).toLocaleString()} OFF`}
                        </div>
                      </div>
                    )}

                    {/* Product Image / Letter Banner */}
                    <div className="relative h-28 bg-gradient-to-br from-sky-100/50 to-blue-100/50 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center overflow-hidden">
                      {productImg ? (
                        <img
                          src={productImg}
                          alt={product.name || "Product"}
                          className="w-full h-full object-contain p-2 transition-all duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                            const next = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (next) next.style.display = "flex";
                          }}
                        />
                      ) : null}

                      <div
                        style={{ display: productImg ? "none" : "flex" }}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${ isOutOfStock ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400" : "bg-gradient-to-br from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-300 group-hover:scale-110" }`}
                      >
                        {(product?.name?.[0] || "P").toUpperCase()}
                      </div>
                      
                      {/* Quick Add Overlay on Hover */}
                      {!isOutOfStock && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                          className="absolute inset-0 bg-sky-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                          title={product.variants && product.variants.length > 0 ? "Select Variant" : "Quick Add to Cart"}
                        >
                          <span className="flex items-center gap-1.5 text-white font-semibold text-sm drop-shadow-md">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            {product.variants && product.variants.length > 0 ? "Select Variant" : "Quick Add"}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      {/* Stock and Condition Badges */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${ isOutOfStock ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60" : isLowStock ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60" : "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60" }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${ isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-500" : "bg-sky-500" }`}
                            ></span>
                            {isOutOfStock
                              ? "Out of stock"
                              : `${product?.stock} in stock`}
                          </div>
                          
                          {(!product.condition || product.condition.toUpperCase() === 'NEW') && (
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded uppercase tracking-wide border border-blue-200 dark:border-blue-800/50">
                              New
                            </span>
                          )}
                          {product.condition && product.condition.toUpperCase() === 'USED' && (
                            <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wide border border-slate-300 dark:border-slate-600">
                              Used
                            </span>
                          )}
                          {product.hasActiveOffer && (
                            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded uppercase tracking-wide border border-purple-200 dark:border-purple-800/50 flex items-center gap-1">
                              Offer
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductForDetails(product);
                          }}
                          className="p-0.5 text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                          title="View Details"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-slate-800 font-semibold text-sm leading-tight line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors dark:text-white">
                        {product?.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono dark:text-slate-400">
                        {product?.sku}
                      </p>

                      {/* Price Display */}
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                          Rs. {displayPrice.toLocaleString()}
                        </span>
                        {hasOffer && originalPrice > displayPrice && (
                          <span className="text-xs text-slate-500 line-through dark:text-slate-400">
                            Rs. {originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Offer Description */}
                      {hasOffer && product?.offer?.description && (
                        <p className="text-xs text-orange-600/80 dark:text-orange-400 truncate flex items-center gap-1 mt-0.5">
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {product.offer.description}
                        </p>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleProductClick(product)}
                        disabled={isOutOfStock}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 mt-3 cursor-pointer ${ isOutOfStock ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg hover:shadow-sky-500/25" }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        {product.variants && product.variants.length > 0
                          ? "Select Variant"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-slate-800 flex items-center justify-center mb-6 border border-sky-200 dark:border-slate-700">
                  <svg
                    className="w-12 h-12 text-sky-500 dark:text-sky-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 dark:text-white">
                  No products found
                </h3>
                <p className="text-slate-500 text-sm text-center max-w-sm dark:text-slate-400">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Section - Premium Design */}
        <div className="w-80 bg-gradient-to-b from-white via-sky-50/50 to-blue-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 border-l border-sky-200/50 dark:border-slate-800 flex flex-col flex-shrink-0 shadow-2xl shadow-sky-100/20 dark:shadow-none">
          {/* Cart Header */}
          <div className="p-4 border-b border-sky-200/50 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center border border-sky-500/30 dark:border-sky-500/40">
                <svg
                  className="w-5 h-5 text-sky-600 dark:text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Current Order
                </h2>
                {cart.length > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                )}
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg border border-red-200 dark:border-red-900/60 transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-sky-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-sky-200 dark:border-slate-700">
                  <svg
                    className="w-10 h-10 text-sky-500 dark:text-sky-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-800 font-medium mb-1 dark:text-white">
                  No items yet
                </h3>
                <p className="text-slate-500 text-sm text-center max-w-[200px] dark:text-slate-400">
                  Add products from the catalog to start an order
                </p>
              </div>
            ) : (
              cart.map((item, index) => {
                const itemPrice = item.effectivePrice ?? item.sellingPrice ?? 0;
                const hasItemOffer =
                  item.hasActiveOffer ||
                  (item.offer?.isActive && (item.discountAmount ?? 0) > 0);
                return (
                  <div
                    key={
                      item.serialNumber
                        ? `${item._id}_${item.serialNumber}`
                        : `${item._id}_${index}`
                    }
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3.5 border border-sky-200/60 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-slate-600 transition-all group shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {/* Item Number */}
                      <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/70 flex items-center justify-center text-xs font-bold text-sky-700 dark:text-sky-300 flex-shrink-0 mt-0.5 shadow-2xs">
                        {index + 1}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        {/* Title & Remove Button */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-slate-800 dark:text-white font-semibold text-sm leading-snug break-words flex-1 min-w-0">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="p-1 -mr-1 -mt-0.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer flex-shrink-0"
                            title="Remove item"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Variant & Serial Badges Row */}
                        {(item.variantDisplay || item.serialNumber || hasItemOffer) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {item.variantDisplay && (
                              <span className="inline-flex items-center text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/80 dark:border-sky-800/60">
                                {item.variantDisplay}
                              </span>
                            )}
                            {item.serialNumber && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800/60"
                                title={`Serial / IMEI: ${item.serialNumber}`}
                              >
                                <span>📱</span>
                                <span>{item.serialNumber}</span>
                              </span>
                            )}
                            {hasItemOffer && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-orange-100 to-rose-100 dark:from-orange-950/60 dark:to-rose-950/60 text-orange-700 dark:text-orange-300 text-[10px] font-bold rounded-md border border-orange-200 dark:border-orange-800/60">
                                OFFER
                              </span>
                            )}
                          </div>
                        )}

                        {/* Unit Price & Discount Controls */}
                        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Price:</span>
                            <span className="text-sky-600 dark:text-sky-400 font-semibold whitespace-nowrap">
                              Rs. {itemPrice.toLocaleString()}
                            </span>
                          </div>

                          {canApplyDiscount && (
                            <div className="flex items-center gap-1 bg-rose-50/90 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800/60 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400 transition-all">
                              <span className="text-rose-600 dark:text-rose-400 text-[11px] font-bold whitespace-nowrap select-none">
                                -Rs.
                              </span>
                              <input 
                                type="number"
                                className="w-14 bg-transparent text-rose-700 dark:text-rose-300 text-xs font-bold focus:outline-none hide-arrows placeholder:text-rose-300 dark:placeholder:text-rose-700 text-right"
                                value={item.discountAmount ?? ""}
                                placeholder="0"
                                onChange={(e) => {
                                  const newCart = [...cart];
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && val >= 0) {
                                    newCart[index].discountAmount = val;
                                    setCart(newCart);
                                  } else if (e.target.value === "") {
                                    // @ts-expect-error - Expected number but resetting with empty string
                                    newCart[index].discountAmount = "";
                                    setCart(newCart);
                                  }
                                }}
                                onBlur={() => {
                                  const newCart = [...cart];
                                  if (item.discountAmount === undefined || String(item.discountAmount) === "") {
                                    newCart[index].discountAmount = 0;
                                    setCart(newCart);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity - 1,
                                  item.serialNumber,
                                  item.variantId
                                )
                              }
                              className="w-6 h-6 rounded bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                              disabled={!!item.serialNumber || item.quantity <= 1}
                              title={item.serialNumber ? "Serialized items are quantity 1" : "Decrease quantity"}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item._id,
                                  parseInt(e.target.value) || 1,
                                  item.serialNumber,
                                  item.variantId
                                )
                              }
                              className="w-8 text-center bg-transparent text-slate-800 text-xs font-bold focus:outline-none dark:text-white hide-arrows"
                              min="1"
                              max={item.serialNumber ? "1" : undefined}
                              disabled={!!item.serialNumber}
                            />
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity + 1,
                                  item.serialNumber,
                                  item.variantId
                                )
                              }
                              className="w-6 h-6 rounded bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                              disabled={!!item.serialNumber}
                              title={item.serialNumber ? "Serialized items are quantity 1" : "Increase quantity"}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-slate-800 font-bold text-sm dark:text-white whitespace-nowrap">
                              Rs. {getLineTotal(item).toLocaleString()}
                            </span>
                            {Number(item.discountAmount) > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="line-through text-[10px] text-slate-400 font-medium">
                                  Rs. {((Number(item.originalPrice || item.sellingPrice) || 0) * item.quantity).toLocaleString()}
                                </span>
                                <span className="text-[10px] text-rose-500 font-semibold whitespace-nowrap">
                                  - Rs. {(Number(item.discountAmount) * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer - Totals & Pay Button */}
          <div className="p-4 border-t border-sky-200/50 dark:border-slate-800 bg-gradient-to-t from-white to-sky-50/50 dark:from-slate-900 dark:to-slate-900">
            {/* Order Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-700 font-medium dark:text-slate-300">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Tax</span>
                <span className="text-slate-700 font-medium dark:text-slate-300">
                  Rs. {tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-sky-200 dark:via-slate-700 to-transparent my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-800 dark:text-white">
                  Total
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-300 bg-clip-text text-transparent">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${ cart.length === 0 ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98]" }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cart.length === 0 ? "Add Items to Pay" : "Proceed to Payment"}
            </button>

            {/* Keyboard Shortcut Hint */}
            {cart.length > 0 && (
              <p className="text-center text-[10px] text-slate-500 mt-2 dark:text-slate-400">
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-sky-100 dark:bg-slate-800 rounded text-sky-700 dark:text-sky-300 font-mono border border-transparent dark:border-slate-700">
                  F2
                </kbd>{" "}
                for quick checkout
              </p>
            )}
          </div>
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
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            clearCart();
            setShowPaymentModal(false);
            fetchData();
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
          onClose={() => {
            setShowVariantModal(false);
            setPendingProduct(null);
            setPendingVariantId(undefined);
            setPendingSerialNumber(undefined);
          }}
          onSelectVariant={(variant, serialNumber, stockItemId, stockItemPrice) => {
            setShowVariantModal(false);
            addToCart(pendingProduct, serialNumber, variant, stockItemId, stockItemPrice);
            setPendingProduct(null);
            setPendingVariantId(undefined);
            setPendingSerialNumber(undefined);
          }}
        />
      )}

      {/* Serial Number Modal for Warranty Products */}
      {showSerialModal && pendingProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          // onClick={() => {
          //   setShowSerialModal(false);
          //   setPendingProduct(null);
          // }}
        >
          {/* Modal Container */}
          <div
            style={{
              background: "linear-gradient(145deg, #1e1e2f 0%, #2a2a4a 100%)",
              borderRadius: 16,
              padding: 24,
              width: 400,
              maxWidth: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
              <button
                onClick={() => {
                  setShowSerialModal(false);
                  setPendingProduct(null);
                }}
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                <svg className="w-6 h-6 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <span style={{ fontSize: 28 }}>📱</span>
              </div>
              <h3 style={{ color: "#fff", margin: 0, fontSize: 18 }}>
                Enter {serialInputType}
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  margin: "8px 0 0",
                  fontSize: 13,
                }}
              >
                This product has warranty. Enter the {serialInputType} for tracking.
              </p>
            </div>

            {/* Product Info */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>
                {pendingProduct.name}
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                SKU: {pendingProduct.sku || "N/A"} | Warranty:{" "}
                {pendingProduct.warrantyDuration} months
              </div>
            </div>

            {/* Input Type Selection */}
            <select
              value={serialInputType}
              onChange={(e) => setSerialInputType(e.target.value as "IMEI" | "Serial")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                marginBottom: 12,
              }}
              className="bg-slate-800 text-white"
            >
              <option value="IMEI" style={{ background: "#1e293b", color: "#ffffff" }}>IMEI</option>
              <option value="Serial" style={{ background: "#1e293b", color: "#ffffff" }}>Serial Number</option>
            </select>

            {/* Serial Number Input */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type="text"
                value={serialNumberInput}
                onChange={(e) => setSerialNumberInput(e.target.value)}
                placeholder={`Scan or enter ${serialInputType}`}
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 40px 14px 16px",
                  borderRadius: 8,
                  border: "2px solid rgba(16, 185, 129, 0.3)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: 16,
                  outline: "none",
                  boxSizing: "border-box",
                  letterSpacing: 1,
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSerialNumberConfirm();
                  }
                }}
              />
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  addToCart(pendingProduct, undefined, undefined, undefined, undefined, true);
                  setShowSerialModal(false);
                  setPendingProduct(null);
                  setSerialNumberInput("");
                }}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Skip (No {serialInputType})
              </button>
              <button
                onClick={handleSerialNumberConfirm}
                style={{
                  flex: 2,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: serialNumberInput.trim()
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "rgba(255,255,255,0.1)",
                  color: serialNumberInput.trim()
                    ? "#fff"
                    : "rgba(255,255,255,0.5)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: serialNumberInput.trim() ? "pointer" : "not-allowed",
                }}
                disabled={!serialNumberInput.trim()}
              >
                ✓ Add to Cart
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
}
