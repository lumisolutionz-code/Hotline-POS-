import { useState, useEffect, useRef } from "react";
import { Product, ProductVariant } from "../../../types/pos";
import { apiGet } from "../../../lib/api";

export function VariantSelectionModal({
  product,
  initialVariantId,
  initialSerialNumber,
  cart = [],
  onClose,
  onSelectVariant,
}: {
  product: Product;
  initialVariantId?: string;
  initialSerialNumber?: string;
  cart?: any[];
  onClose: () => void;
  onSelectVariant: (variant: ProductVariant, serialNumber?: string, stockItemId?: string, stockItemPrice?: number) => void;
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (initialVariantId && product.variants && product.variants.length > 0) {
      const found = product.variants.find((v) => String(v._id) === String(initialVariantId));
      if (found) return found;
    }
    return product.variants && product.variants.length > 0 ? product.variants[0] : null;
  });

  // Code Input: accepts Device IMEI for IMEI products, or Barcode/SKU/Serial for Quantity products
  const [codeInput, setCodeInput] = useState<string>(initialSerialNumber || "");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [verifiedStockItem, setVerifiedStockItem] = useState<any | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Determine if this product or its variants require IMEI tracking
  const isImeiProduct = (() => {
    const rawProdTracking = String(product.trackingType || "").toUpperCase();
    if (rawProdTracking === "IMEI") return true;
    if (product.variants && product.variants.some((v: any) => String(v.trackingType || "").toUpperCase() === "IMEI")) {
      return true;
    }
    const catName = typeof product.category === "object" ? product.category?.name || "" : "";
    if (/phone|mobile|cellular|smartphone|tablet/i.test(catName)) return true;
    if (/iphone|galaxy|pixel|redmi|xiaomi|oneplus|oppo|vivo|huawei/i.test(product.name || "")) return true;
    return false;
  })();

  const showError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 5000);
  };

  // Auto-focus code input on mount reliably
  useEffect(() => {
    const focusInput = () => {
      if (codeInputRef.current) {
        codeInputRef.current.focus();
        codeInputRef.current.select();
      }
    };
    focusInput();
    const t1 = setTimeout(focusInput, 50);
    const t2 = setTimeout(focusInput, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // If initial serial number was passed, attempt verification
  useEffect(() => {
    if (initialSerialNumber) {
      setCodeInput(initialSerialNumber);
      verifyCode(initialSerialNumber, false);
    }
  }, [initialSerialNumber]);

  const resolveImageUrl = (img?: string): string | null => {
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img;
    const cleanPath = img.startsWith("/") ? img : `/${img}`;
    const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000');
    return `${apiBase}${cleanPath}`;
  };

  const getVariantBadges = (variant: any): string[] => {
    if (!variant) return ["Standard"];
    if (Array.isArray(variant.attributes)) {
      const badges: string[] = [];
      variant.attributes.forEach((attr: any) => {
        if (!attr) return;
        if (typeof attr === "string" && attr.trim()) {
          badges.push(attr.trim());
          return;
        }
        if (typeof attr === "object") {
          const typeName = attr.typeId?.name || attr.typeId?.title || attr.name || "";
          const val = attr.value || attr.val || "";
          if (typeName && val) {
            badges.push(`${typeName}: ${val}`);
          } else if (val) {
            badges.push(String(val));
          } else if (typeName) {
            badges.push(String(typeName));
          }
        }
      });
      if (badges.length > 0) return badges;
    } else if (variant.attributes && typeof variant.attributes === "object") {
      const entries = Object.entries(variant.attributes).map(([k, v]) => {
        if (typeof v === "object" && v !== null) {
          const val = (v as any).value || (v as any).name || "";
          return val ? `${k}: ${val}` : k;
        }
        return `${k}: ${v}`;
      });
      if (entries.length > 0) return entries;
    }
    return [variant.itemCode || variant.sku || "Standard Variant"];
  };

  const getVariantPrice = (variant: any): number => {
    if (variant?.effectivePrice !== undefined && Number(variant.effectivePrice) > 0) {
      return Number(variant.effectivePrice);
    }
    if (variant?.sellingPrice !== undefined && variant?.sellingPrice !== null && Number(variant.sellingPrice) > 0) {
      return Number(variant.sellingPrice);
    }
    if (product?.effectivePrice !== undefined && Number(product.effectivePrice) > 0) {
      return Number(product.effectivePrice);
    }
    return Number(product.sellingPrice || 0);
  };

  const getFinalPrice = (variant: any, stockItem?: any): number => {
    if (variant?.effectivePrice !== undefined && Number(variant.effectivePrice) > 0) {
      return Number(variant.effectivePrice);
    }
    if (product?.effectivePrice !== undefined && Number(product.effectivePrice) > 0) {
      return Number(product.effectivePrice);
    }
    if (stockItem?.sellingPrice !== undefined && Number(stockItem.sellingPrice) > 0) {
      return Number(stockItem.sellingPrice);
    }
    return getVariantPrice(variant);
  };

  // Verify Code: STRICTLY IMEI ONLY for IMEI products; Barcode/SKU/Serial for Quantity products
  const verifyCode = async (codeToVerify: string, autoConfirmOnSuccess: boolean = false): Promise<boolean> => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) {
      showError(isImeiProduct ? "Please scan or enter a 15-digit device IMEI." : "Please scan or enter barcode or SKU.");
      return false;
    }

    // 1. Check if already in active cart
    const alreadyInCart = cart.some(
      (item) =>
        (item.serialNumber && String(item.serialNumber).toLowerCase() === trimmed.toLowerCase()) ||
        (verifiedStockItem && item.stockItemId && String(item.stockItemId) === String(verifiedStockItem._id))
    );

    if (alreadyInCart) {
      showError(`Device / Item with code "${trimmed}" is already in your cart!`);
      setVerifiedStockItem(null);
      setVerifiedCode(null);
      return false;
    }

    // 2. FOR IMEI PRODUCTS: Strictly accept ONLY device IMEI!
    if (isImeiProduct) {
      // Check if user scanned variant barcode/SKU instead of IMEI
      const codeLower = trimmed.toLowerCase();
      const localMatchedVariant = product.variants?.find((v: any) => {
        const matchBarcode = v.barcode && String(v.barcode).trim().toLowerCase() === codeLower;
        const matchSku = v.sku && String(v.sku).trim().toLowerCase() === codeLower;
        const matchItemCode = v.itemCode && String(v.itemCode).trim().toLowerCase() === codeLower;
        const matchId = String(v._id) === trimmed;
        return matchBarcode || matchSku || matchItemCode || matchId;
      });

      if (localMatchedVariant) {
        setSelectedVariant(localMatchedVariant);
        showError(`Variant "${getVariantBadges(localMatchedVariant).join(" • ")}" selected. Please scan the 15-digit device IMEI from the box to add to cart.`);
        return false;
      }

      setIsVerifying(true);
      try {
        // Look up by IMEI strictly
        const imeiRes = await apiGet<{ status?: string; data?: { stockItem?: any } }>(
          `/inventory/lookup/imei/${encodeURIComponent(trimmed)}`
        ).catch(() => null);

        if (imeiRes && imeiRes.status === "success" && imeiRes.data?.stockItem) {
          const stockItem = imeiRes.data.stockItem;

          // Check availability
          if (stockItem.status && stockItem.status !== "available") {
            showError(`Device with IMEI "${trimmed}" is not available in stock (Status: ${stockItem.status}).`);
            setVerifiedStockItem(null);
            setVerifiedCode(null);
            setIsVerifying(false);
            return false;
          }

          // Check product match
          const itemProductId = stockItem.product?._id || stockItem.product;
          if (itemProductId && String(itemProductId) !== String(product._id)) {
            const actualProductName = stockItem.product?.name || "another product";
            showError(`This IMEI belongs to "${actualProductName}", not "${product.name}".`);
            setVerifiedStockItem(null);
            setVerifiedCode(null);
            setIsVerifying(false);
            return false;
          }

          // Match variant of this stock item
          const itemVariantId = stockItem.variant?._id || stockItem.variant;
          let matchedVariant: ProductVariant | null = null;
          if (itemVariantId && product.variants && product.variants.length > 0) {
            matchedVariant = product.variants.find((v) => String(v._id) === String(itemVariantId)) || null;
          }

          const targetVariant = matchedVariant || selectedVariant;
          if (!targetVariant) {
            showError("No matching variant found for this IMEI.");
            setIsVerifying(false);
            return false;
          }

          // Auto-select the variant belonging to this verified IMEI
          setSelectedVariant(targetVariant);
          setVerifiedStockItem(stockItem);
          const resolvedImei = stockItem.imei1 || stockItem.imei2 || trimmed;
          setVerifiedCode(resolvedImei);
          setToastError(null);
          setIsVerifying(false);

          if (autoConfirmOnSuccess) {
            const finalPrice = getFinalPrice(targetVariant, stockItem);
            onSelectVariant(targetVariant, resolvedImei, stockItem._id, finalPrice);
            return true;
          }
          return true;
        }

        // IMEI not found! Check if the user entered a serial number
        const serialCheck = await apiGet<{ status?: string; data?: { stockItem?: any } }>(
          `/inventory/lookup/serial/${encodeURIComponent(trimmed)}`
        ).catch(() => null);

        setIsVerifying(false);
        setVerifiedStockItem(null);
        setVerifiedCode(null);

        if (serialCheck && serialCheck.status === "success" && serialCheck.data?.stockItem) {
          showError(`"${trimmed}" is a serial number, not an IMEI number. For this device, please scan or enter the 15-digit IMEI.`);
          return false;
        }

        showError(`Device IMEI "${trimmed}" was not found in available stock. Please scan or enter a valid 15-digit device IMEI.`);
        return false;
      } catch (err: any) {
        setIsVerifying(false);
        setVerifiedStockItem(null);
        setVerifiedCode(null);
        showError("Error verifying IMEI in inventory database. Please try again.");
        return false;
      }
    }

    // 3. FOR QUANTITY PRODUCTS (Non-IMEI products)
    const codeLower = trimmed.toLowerCase();
    const localMatchedVariant = product.variants?.find((v: any) => {
      const matchBarcode = v.barcode && String(v.barcode).trim().toLowerCase() === codeLower;
      const matchSku = v.sku && String(v.sku).trim().toLowerCase() === codeLower;
      const matchItemCode = v.itemCode && String(v.itemCode).trim().toLowerCase() === codeLower;
      const matchId = String(v._id) === trimmed;
      return matchBarcode || matchSku || matchItemCode || matchId;
    });

    if (localMatchedVariant) {
      setSelectedVariant(localMatchedVariant);
      setVerifiedStockItem(null);
      setVerifiedCode(trimmed);
      setToastError(null);
      if (autoConfirmOnSuccess) {
        onSelectVariant(localMatchedVariant, undefined, undefined, getVariantPrice(localMatchedVariant));
        return true;
      }
      return true;
    }

    // Try Serial / barcode lookup in inventory for quantity items
    setIsVerifying(true);
    try {
      const serialRes = await apiGet<{ status?: string; data?: { stockItem?: any } }>(
        `/inventory/lookup/serial/${encodeURIComponent(trimmed)}`
      ).catch(() => null);

      if (serialRes && serialRes.status === "success" && serialRes.data?.stockItem) {
        const stockItem = serialRes.data.stockItem;
        const itemVariantId = stockItem.variant?._id || stockItem.variant;
        let matchedVariant: ProductVariant | null = null;
        if (itemVariantId && product.variants && product.variants.length > 0) {
          matchedVariant = product.variants.find((v) => String(v._id) === String(itemVariantId)) || null;
        }

        const activeVariant = matchedVariant || selectedVariant || (product.variants?.[0] as ProductVariant);
        if (matchedVariant) {
          setSelectedVariant(matchedVariant);
        }

        setVerifiedStockItem(stockItem);
        setVerifiedCode(trimmed);
        setToastError(null);
        setIsVerifying(false);

        if (autoConfirmOnSuccess && activeVariant) {
          const finalPrice = getFinalPrice(activeVariant, stockItem);
          onSelectVariant(activeVariant, trimmed, stockItem._id, finalPrice);
          return true;
        }
        return true;
      }

      setIsVerifying(false);
      showError(`Barcode/Serial "${trimmed}" not found for this product.`);
      setVerifiedStockItem(null);
      setVerifiedCode(null);
      return false;
    } catch (err) {
      setIsVerifying(false);
      setVerifiedStockItem(null);
      setVerifiedCode(null);
      showError("Error checking code in inventory.");
      return false;
    }
  };

  const handleConfirm = async () => {
    if (!selectedVariant) return;

    if (isImeiProduct) {
      if (!verifiedStockItem || !verifiedCode) {
        // Attempt verification on confirm
        const success = await verifyCode(codeInput, false);
        if (!success) return;
      }

      // Resolve final target variant
      const itemVariantId = verifiedStockItem?.variant?._id || verifiedStockItem?.variant;
      const matchedVariant = (itemVariantId && product.variants?.find((v) => String(v._id) === String(itemVariantId))) || null;
      const finalVariant = matchedVariant || selectedVariant;

      const finalStockItem = verifiedStockItem;
      const finalSerial = verifiedCode || codeInput.trim();
      const finalPrice = getFinalPrice(finalVariant, finalStockItem);

      onSelectVariant(
        finalVariant,
        finalSerial,
        finalStockItem?._id,
        finalPrice
      );
    } else {
      // Non-IMEI / Quantity Product
      const finalSerial = verifiedCode || initialSerialNumber || (codeInput.trim() || undefined);
      const finalStockItemId = verifiedStockItem?._id || undefined;
      const finalPrice = getFinalPrice(selectedVariant, verifiedStockItem);
      onSelectVariant(selectedVariant, finalSerial, finalStockItemId, finalPrice);
    }
  };

  const productImage = resolveImageUrl(product.images?.[0]);
  
  // Verification check: for IMEI products, strictly check that verifiedCode matches IMEI
  const isVerifiedForCurrentInput = Boolean(
    verifiedCode &&
      (verifiedCode.toLowerCase() === codeInput.trim().toLowerCase() ||
        (verifiedStockItem &&
          (verifiedStockItem.imei1 === codeInput.trim() ||
            verifiedStockItem.imei2 === codeInput.trim() ||
            (!isImeiProduct && verifiedStockItem.serialNumber === codeInput.trim()))))
  );

  const canConfirm = isImeiProduct
    ? Boolean(isVerifiedForCurrentInput && verifiedStockItem && selectedVariant)
    : Boolean(selectedVariant);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Toast Error Notification */}
      {toastError && (
        <div className="fixed top-8 right-8 max-w-md bg-red-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-[120] font-semibold text-xs flex items-center gap-3 animate-bounce border border-red-400">
          <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-snug">{toastError}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
            {productImage ? (
              <img
                src={productImage}
                alt={product.name}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center text-lg font-extrabold shrink-0 shadow-md shadow-sky-500/20">
                {(product?.name?.[0] || "P").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug truncate">
                {product?.name || "Product Variants"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                {product?.itemCode || product?.sku || "SKU: N/A"} • {product.variants?.length || 0} variant(s) available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body: Left and Right Two-Column Layout */}
        <div className="p-6 overflow-y-auto max-h-[68vh] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Universal Barcode/Serial/IMEI Scanner & Product Selection Summary */}
            <div className="md:col-span-5 flex flex-col gap-4">
              
              {/* Universal Scanner Card */}
              <div className={`p-5 rounded-3xl border transition-all space-y-4 ${
                isVerifiedForCurrentInput
                  ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/70 ring-2 ring-emerald-500/20"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isVerifiedForCurrentInput ? "bg-emerald-500" : "bg-sky-500 animate-pulse"
                    }`}></span>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      {isImeiProduct ? "Scan Device IMEI" : "Scan Barcode / SKU"}
                    </label>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg uppercase tracking-tight border ${
                    isVerifiedForCurrentInput
                      ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                      : isImeiProduct
                      ? "bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                  }`}>
                    {isVerifiedForCurrentInput ? "Verified ✓" : isImeiProduct ? "IMEI Required" : "Optional Scan"}
                  </span>
                </div>

                {/* Input Box */}
                <div className="space-y-2">
                  <div className="relative flex items-center">
                    <input
                      ref={codeInputRef}
                      type="text"
                      value={codeInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCodeInput(val);
                        if (verifiedCode && val.trim() !== verifiedCode) {
                          setVerifiedCode(null);
                          setVerifiedStockItem(null);
                        }
                      }}
                      placeholder={
                        isImeiProduct
                          ? "Scan or enter 15-digit device IMEI..."
                          : "Scan variant barcode, SKU, or serial..."
                      }
                      disabled={isVerifying}
                      className={`w-full pl-3.5 pr-10 py-3 text-sm font-mono font-bold tracking-wider bg-white dark:bg-slate-900 border-2 rounded-2xl outline-none transition-all dark:text-white shadow-xs focus:ring-4 ${
                        isVerifiedForCurrentInput
                          ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "border-sky-400 dark:border-sky-600 focus:border-sky-500 focus:ring-sky-500/20"
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (isVerifiedForCurrentInput) {
                            handleConfirm();
                          } else {
                            verifyCode(codeInput, false);
                          }
                        }
                      }}
                    />
                    <div className="absolute right-3.5">
                      {isVerifying ? (
                        <svg className="w-5 h-5 text-sky-500 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      ) : isVerifiedForCurrentInput ? (
                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isVerifiedForCurrentInput) {
                        handleConfirm();
                      } else {
                        verifyCode(codeInput, false);
                      }
                    }}
                    disabled={isVerifying || !codeInput.trim()}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isVerifiedForCurrentInput
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
                        : "bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                    }`}
                  >
                    {isVerifying ? (
                      <span>Verifying IMEI...</span>
                    ) : isVerifiedForCurrentInput ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Add Verified Device to Cart</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>{isImeiProduct ? "Verify IMEI & Add to Cart" : "Verify & Add to Cart"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Dynamic Status / Instructions Box */}
                {isVerifying ? (
                  <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                    <span>Verifying {isImeiProduct ? "device IMEI" : "code"} in stock...</span>
                  </div>
                ) : isVerifiedForCurrentInput && verifiedStockItem ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Device IMEI Verified & Ready</span>
                    </div>
                    <div className="text-[11px] font-mono bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-emerald-500/30">
                      <div><span className="text-slate-500">Device IMEI:</span> <strong className="text-emerald-600 dark:text-emerald-400">{verifiedCode}</strong></div>
                      {selectedVariant && (
                        <div className="mt-1 truncate"><span className="text-slate-500">Matched Variant:</span> <strong>{getVariantBadges(selectedVariant).join(" • ")}</strong></div>
                      )}
                      <div className="mt-1"><span className="text-slate-500">Price:</span> <strong className="text-emerald-600 dark:text-emerald-400">Rs. {(verifiedStockItem.sellingPrice || getVariantPrice(selectedVariant)).toLocaleString()}</strong></div>
                    </div>
                  </div>
                ) : isVerifiedForCurrentInput && selectedVariant ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Variant Matched by Code</span>
                    </div>
                    <div className="text-[11px] font-mono bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-emerald-500/30">
                      <div><span className="text-slate-500">Barcode/SKU:</span> <strong className="text-emerald-600 dark:text-emerald-400">{verifiedCode}</strong></div>
                      <div className="mt-1 truncate"><span className="text-slate-500">Variant:</span> <strong>{getVariantBadges(selectedVariant).join(" • ")}</strong></div>
                      <div className="mt-1"><span className="text-slate-500">Price:</span> <strong className="text-emerald-600 dark:text-emerald-400">Rs. {getVariantPrice(selectedVariant).toLocaleString()}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs space-y-1.5">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <span>📱</span> {isImeiProduct ? "Device IMEI Required" : "Barcode / SKU Scanning"}
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {isImeiProduct
                        ? "Scan or enter the device's 15-digit IMEI number from the box. Serial numbers and barcodes cannot be used for this product."
                        : "Scan the variant barcode/SKU to auto-select, or click any variant from the list on the right."}
                    </p>
                  </div>
                )}
              </div>

              {/* Active Selection Summary Card */}
              {selectedVariant && (
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Currently Selected Variant
                  </p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {getVariantBadges(selectedVariant).join(" • ")}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {selectedVariant.itemCode || selectedVariant.sku || "SKU: N/A"}
                    </span>
                    <span className="font-black text-sky-600 dark:text-sky-400 text-sm">
                      Rs. {(verifiedStockItem?.sellingPrice || getVariantPrice(selectedVariant)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Available Variants List */}
            <div className="md:col-span-7 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Choose Variant & Specification
                </label>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                  {isImeiProduct ? "Click variant to select • Scan IMEI to add" : "Click to select • Double-click to add"}
                </span>
              </div>

              {/* Scrollable Variants Container */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((v) => {
                    const isSelected = selectedVariant?._id === v._id;
                    const badges = getVariantBadges(v);
                    const price = getVariantPrice(v);
                    const hasOffer = Boolean(v.hasActiveOffer || (v.originalPrice && Number(v.originalPrice) > price));
                    const originalPrice = Number(v.originalPrice || v.sellingPrice || price);
                    const discountAmount = Number(v.discountAmount || (originalPrice > price ? originalPrice - price : 0));
                    const variantImg = resolveImageUrl(v.images?.[0]) || productImage;
                    const isMatchedWithCode = isVerifiedForCurrentInput && isSelected;

                    return (
                      <div
                        key={v._id}
                        onClick={() => {
                          setSelectedVariant(v);
                          if (isImeiProduct && verifiedCode) {
                            // If user had an IMEI verified for a different variant, clear it
                            const itemVariantId = verifiedStockItem?.variant?._id || verifiedStockItem?.variant;
                            if (itemVariantId && String(itemVariantId) !== String(v._id)) {
                              setVerifiedCode(null);
                              setVerifiedStockItem(null);
                              setCodeInput("");
                            }
                          }
                        }}
                        onDoubleClick={() => {
                          if (!isImeiProduct) {
                            onSelectVariant(v, undefined, undefined, getVariantPrice(v));
                          } else if (verifiedStockItem && verifiedCode) {
                            const itemVariantId = verifiedStockItem?.variant?._id || verifiedStockItem?.variant;
                            if (itemVariantId && String(itemVariantId) === String(v._id)) {
                              onSelectVariant(
                                v,
                                verifiedCode,
                                verifiedStockItem._id,
                                getFinalPrice(v, verifiedStockItem)
                              );
                            }
                          } else {
                            setSelectedVariant(v);
                            codeInputRef.current?.focus();
                          }
                        }}
                        className={`w-full p-3.5 text-left rounded-2xl transition-all flex items-center gap-3.5 border cursor-pointer select-none ${
                          isMatchedWithCode
                            ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10"
                            : isSelected
                            ? "border-sky-500 bg-sky-500/10 dark:bg-sky-950/60 ring-2 ring-sky-500 shadow-md shadow-sky-500/10"
                            : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-sky-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
                        }`}
                      >
                        {/* Variant Thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600 flex items-center justify-center shrink-0 overflow-hidden">
                          {variantImg ? (
                            <img
                              src={variantImg}
                              alt="Variant"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                              {(badges[0]?.[0] || "V").toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Variant Attributes & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {badges.map((badge, bIdx) => (
                              <span
                                key={bIdx}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold tracking-tight border ${
                                  isMatchedWithCode
                                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                                    : isSelected
                                    ? "bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700"
                                    : "bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                                }`}
                              >
                                {badge}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              isMatchedWithCode
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-500 dark:text-slate-400"
                            }`}>
                              {isImeiProduct ? (
                                isMatchedWithCode ? "✓ IMEI Matched & Ready" : "📱 IMEI Tracked"
                              ) : (
                                "📦 Quantity Item"
                              )}
                            </span>
                            {v.itemCode && (
                              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                • {v.itemCode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Selection Indicator */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          <div className="flex flex-col items-end">
                            <p className={`font-extrabold text-base ${
                              isMatchedWithCode ? "text-emerald-600 dark:text-emerald-400" : "text-sky-600 dark:text-sky-400"
                            }`}>
                              Rs. {price.toLocaleString()}
                            </p>
                            {hasOffer && originalPrice > price && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="line-through text-xs text-slate-400 dark:text-slate-500 font-medium">
                                  Rs. {originalPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                                  Save Rs. {discountAmount.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Quick Add Button for Non-IMEI items */}
                            {!isImeiProduct && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectVariant(v, undefined, undefined, getVariantPrice(v));
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-500 hover:bg-sky-600 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="Add this variant directly to cart"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add</span>
                              </button>
                            )}

                            {/* Radio Check Indicator */}
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                isMatchedWithCode
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : isSelected
                                  ? "bg-sky-500 border-sky-500 text-white"
                                  : "border-slate-300 dark:border-slate-600 bg-transparent"
                              }`}
                            >
                              {(isSelected || isMatchedWithCode) && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      No individual variants found for this product.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || isVerifying}
            className={`px-7 py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
              canConfirm && !isVerifying
                ? isVerifiedForCurrentInput
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25 cursor-pointer ring-2 ring-emerald-400/50"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/25 cursor-pointer"
                : "bg-slate-400 dark:bg-slate-700 text-slate-200 opacity-60 cursor-not-allowed shadow-none"
            }`}
          >
            {canConfirm ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  Confirm • Rs. {selectedVariant ? getFinalPrice(selectedVariant, verifiedStockItem).toLocaleString() : "0"}
                </span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>
                  {isImeiProduct ? "Scan IMEI to Add to Cart" : "Select a Variant"}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
