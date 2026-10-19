import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Smartphone, Package, Check } from "lucide-react";
import { Product, ProductVariant } from "../../../types/pos";
import { apiGet } from "../../../lib/api";

export function VariantSelectionModal({
  product,
  initialVariantId,
  initialSerialNumber,
  cart = [],
  isLoading = false,
  onClose,
  onSelectVariant,
}: {
  product: Product;
  initialVariantId?: string;
  initialSerialNumber?: string;
  cart?: any[];
  isLoading?: boolean;
  onClose: () => void;
  onSelectVariant: (variant?: ProductVariant | null, serialNumber?: string, stockItemId?: string, stockItemPrice?: number) => void;
}) {
  // Local variants list that can be updated from parent or from background API
  const [variantsList, setVariantsList] = useState<ProductVariant[]>(() => {
    return Array.isArray(product.variants) ? product.variants : [];
  });

  // Physical stock items (individual devices with IMEIs)
  const [stockItems, setStockItems] = useState<any[]>(() => {
    return Array.isArray(product.stockItems) ? product.stockItems : [];
  });
  const [isLoadingStock, setIsLoadingStock] = useState<boolean>(false);
  const isDataLoading = Boolean(isLoading || isLoadingStock);
  const [selectedStockItem, setSelectedStockItem] = useState<any | null>(null);

  // Determine if this product or its variants require IMEI tracking
  const isImeiProduct = (() => {
    const rawProdTracking = String(product.trackingType || "").toUpperCase();
    if (rawProdTracking === "IMEI") return true;
    if (product.variants && product.variants.some((v: any) => String(v.trackingType || "").toUpperCase() === "IMEI")) {
      return true;
    }
    if (stockItems && stockItems.some((s: any) => Boolean(s.imei1))) {
      return true;
    }
    if (rawProdTracking === "QUANTITY") return false;

    // Check if it's an accessory
    const isAccessory = /(cover|case|glass|protector|pouch|cable|charger|handsfree|headphone|earphone|adapter|battery|holder|strap|film|lens|power bank|speaker|back cover|tempered)/i.test(product.name || "");
    if (isAccessory) return false;

    const catName = typeof product.category === "object" ? product.category?.name || "" : "";
    if (/phone|cellular|smartphone|tablet/i.test(catName) && !/accessory|accessories/i.test(catName)) return true;
    if (/\b(phone|smartphone|iphone|galaxy|pixel|redmi|xiaomi|oneplus|oppo|vivo|huawei)\b/i.test(product.name || "")) return true;
    return false;
  })();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (isImeiProduct && !initialVariantId) {
      return null;
    }
    const list = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [];
    if (initialVariantId && list.length > 0) {
      const found = list.find((v) => String(v._id) === String(initialVariantId));
      if (found) return found;
    }
    return !isImeiProduct && list.length > 0 ? list[0] : null;
  });

  // Variant filter state for in-stock devices: "ALL" | "NO_VARIANT" | <variantId>
  const [variantFilter, setVariantFilter] = useState<string>("ALL");

  // Code / Search Input: accepts Device IMEI for IMEI products, or Barcode/SKU/Serial for Quantity products
  const [codeInput, setCodeInput] = useState<string>(initialSerialNumber || "");

  const [verifiedStockItem, setVerifiedStockItem] = useState<any | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  const showError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 5000);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Sync incoming stockItems if updated from parent
  useEffect(() => {
    if (Array.isArray(product.stockItems) && product.stockItems.length > 0) {
      setStockItems(product.stockItems);
    }
  }, [product.stockItems]);

  // Sync incoming variants if updated from parent
  useEffect(() => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      setVariantsList(product.variants);
    }
  }, [product.variants]);

  // Sync selected variant when variants list arrives/updates
  useEffect(() => {
    const activeList = variantsList.length > 0 ? variantsList : (product.variants || []);
    if (!selectedVariant && activeList.length > 0) {
      if (initialVariantId) {
        const found = activeList.find((v) => String(v._id) === String(initialVariantId));
        if (found) setSelectedVariant(found);
      } else if (!isImeiProduct) {
        setSelectedVariant(activeList[0]);
      }
    } else if (selectedVariant && activeList.length > 0) {
      const updated = activeList.find((v) => String(v._id) === String(selectedVariant._id));
      if (updated && (updated.sellingPrice !== selectedVariant.sellingPrice || (updated as any).stock !== (selectedVariant as any).stock || updated.stockQty !== selectedVariant.stockQty)) {
        setSelectedVariant(updated);
      }
    }
  }, [variantsList, product.variants, initialVariantId, selectedVariant, isImeiProduct]);

  // Helper to reliably resolve variant for any physical device without inventing a false variant
  const resolveDeviceVariant = (item: any): ProductVariant | null => {
    if (!item) return null;
    const itemVariantId = item?.variant?._id || (typeof item?.variant === "string" ? item.variant : undefined);
    const activeVariants = variantsList.length > 0 ? variantsList : (product.variants || []);

    if (itemVariantId) {
      const foundVar = activeVariants.find((v) => String(v._id) === String(itemVariantId));
      if (foundVar) return foundVar;
    }

    if (item?.variant && typeof item.variant === "object" && (item.variant._id || (Array.isArray(item.variant.attributes) && item.variant.attributes.length > 0))) {
      return item.variant as ProductVariant;
    }

    return null;
  };

  // Fetch stock items & variants if not already passed in
  useEffect(() => {
    let isMounted = true;
    if (isImeiProduct && (!product.stockItems || product.stockItems.length === 0) && !isLoading) {
      setIsLoadingStock(true);
      apiGet<any>(`/products/${product._id}/with-variants`)
        .then((res) => {
          if (isMounted && res?.status === "success") {
            if (Array.isArray(res.data?.stockItems)) {
              setStockItems(res.data.stockItems);
            }
            if (Array.isArray(res.data?.variants) && res.data.variants.length > 0) {
              setVariantsList(res.data.variants);
              if (!selectedVariant) {
                const initFound = initialVariantId
                  ? res.data.variants.find((v: any) => String(v._id) === String(initialVariantId))
                  : null;
                setSelectedVariant(initFound || res.data.variants[0]);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch stock items for product:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingStock(false);
        });
    } else if (Array.isArray(product.stockItems) && product.stockItems.length > 0) {
      setStockItems(product.stockItems);
    }
    return () => {
      isMounted = false;
    };
  }, [product._id, product.stockItems, isImeiProduct, isLoading, initialVariantId, selectedVariant]);

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

  const resolveImageUrl = (img?: string): string | null => {
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img;
    const cleanPath = img.startsWith("/") ? img : `/${img}`;
    const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api\/v1\/?$/, '') : 'https://api.hotlinecellular.lk');
    return `${apiBase}${cleanPath}`;
  };

  const getVariantBadges = (variant: any): string[] => {
    if (!variant) return [];
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
    if (variant.name && variant.name !== product.name) {
      return [variant.name];
    }
    if (variant.itemCode || variant.sku) {
      return [variant.itemCode || variant.sku];
    }
    return [];
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
    if (stockItem?.sellingPrice !== undefined && Number(stockItem.sellingPrice) > 0) {
      return Number(stockItem.sellingPrice);
    }
    if (variant?.effectivePrice !== undefined && Number(variant.effectivePrice) > 0) {
      return Number(variant.effectivePrice);
    }
    if (product?.effectivePrice !== undefined && Number(product.effectivePrice) > 0) {
      return Number(product.effectivePrice);
    }
    return getVariantPrice(variant);
  };

  // Extract ONLY variants that actually exist in the current stock items for this product
  const stockVariantsSummary = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>();
    let noVariantCount = 0;

    stockItems.forEach((item: any) => {
      const v = resolveDeviceVariant(item);
      if (v && v._id) {
        const id = String(v._id);
        const badges = getVariantBadges(v);
        const label = badges.length > 0 ? badges.join(" • ") : (v.name || "Variant");
        if (!map.has(id)) {
          map.set(id, { id, label, count: 0 });
        }
        map.get(id)!.count += 1;
      } else {
        noVariantCount += 1;
      }
    });

    return {
      variants: Array.from(map.values()),
      hasNoVariant: noVariantCount > 0,
      noVariantCount,
    };
  }, [stockItems, variantsList, product.variants]);

  // Substring highlight helper for visual clarity when searching
  const highlightMatch = (text: string | undefined, query: string) => {
    if (!text) return "";
    const trimmed = query.trim();
    if (!trimmed) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = trimmed.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + trimmed.length);
    const after = text.slice(index + trimmed.length);

    return (
      <>
        {before}
        <mark className="bg-amber-300 dark:bg-amber-500/60 text-slate-900 dark:text-white px-0.5 rounded font-extrabold font-mono">
          {match}
        </mark>
        {after}
      </>
    );
  };

  // Check if an item is already in cart
  const isItemAlreadyInCart = (item: any): boolean => {
    return cart.some(
      (c) =>
        (c.stockItemId && String(c.stockItemId) === String(item._id)) ||
        (c.serialNumber && item.imei1 && String(c.serialNumber).toLowerCase() === String(item.imei1).toLowerCase()) ||
        (c.serialNumber && item.imei2 && String(c.serialNumber).toLowerCase() === String(item.imei2).toLowerCase())
    );
  };

  // Filter stock items in real-time based on search input & selected variant filter
  const filteredStockItems = useMemo(() => {
    const trimmed = codeInput.trim().toLowerCase();
    return stockItems.filter((item: any) => {
      // 1. Variant Filter (only in-stock variants or unassigned items)
      if (variantFilter !== "ALL") {
        const matchingVar = resolveDeviceVariant(item);
        if (variantFilter === "NO_VARIANT") {
          if (matchingVar !== null) return false;
        } else {
          if (!matchingVar || String(matchingVar._id) !== variantFilter) return false;
        }
      }

      // 2. Search query filter (checks imei1, imei2, serialNumber, and variant attributes)
      if (!trimmed) return true;

      const im1 = String(item.imei1 || "").toLowerCase();
      const im2 = String(item.imei2 || "").toLowerCase();
      const sn = String(item.serialNumber || "").toLowerCase();

      const matchingVar = resolveDeviceVariant(item);
      const varBadges = matchingVar ? getVariantBadges(matchingVar).join(" ").toLowerCase() : "";

      return im1.includes(trimmed) || im2.includes(trimmed) || sn.includes(trimmed) || varBadges.includes(trimmed);
    });
  }, [stockItems, variantFilter, codeInput, variantsList, product.variants]);

  // Filter variants (for non-IMEI items or when displaying variant list)
  const filteredVariants = useMemo(() => {
    const trimmed = codeInput.trim().toLowerCase();
    const activeVariants = variantsList.length > 0 ? variantsList : (product.variants || []);
    if (!trimmed) return activeVariants;
    return activeVariants.filter((v: any) => {
      const badges = getVariantBadges(v).join(" ").toLowerCase();
      const barcode = String(v.barcode || "").toLowerCase();
      const sku = String(v.sku || "").toLowerCase();
      const itemCode = String(v.itemCode || "").toLowerCase();
      return badges.includes(trimmed) || barcode.includes(trimmed) || sku.includes(trimmed) || itemCode.includes(trimmed);
    });
  }, [variantsList, product.variants, codeInput]);

  // Handle clicking / selecting a device from the list
  const handleSelectDevice = (item: any) => {
    if (isItemAlreadyInCart(item)) {
      showError(`Device with IMEI "${item.imei1}" is already in your cart!`);
      return;
    }

    const matchingVar = resolveDeviceVariant(item);
    setSelectedVariant(matchingVar);
    setSelectedStockItem(item);
    const chosenCode = item.imei1 || item.imei2 || item.serialNumber || "";
    setCodeInput(chosenCode);
    setVerifiedCode(chosenCode);
    setVerifiedStockItem(item);
    setToastError(null);
  };

  // Quick add a device to cart directly
  const handleQuickAddDevice = (item: any) => {
    if (isItemAlreadyInCart(item)) {
      showError(`Device with IMEI "${item.imei1}" is already in your cart!`);
      return;
    }

    const matchingVar = resolveDeviceVariant(item);
    const finalSerial = item.imei1 || item.imei2 || item.serialNumber || "";
    const finalPrice = item.sellingPrice || (matchingVar ? getFinalPrice(matchingVar, item) : (product.effectivePrice || product.sellingPrice || 0));

    onSelectVariant(matchingVar, finalSerial, item._id, finalPrice);
  };

  // If initial serial number was passed, attempt verification / selection
  useEffect(() => {
    if (initialSerialNumber) {
      setCodeInput(initialSerialNumber);
      const exactMatch = stockItems.find(
        (si) =>
          String(si.imei1 || "").trim().toLowerCase() === initialSerialNumber.trim().toLowerCase() ||
          String(si.imei2 || "").trim().toLowerCase() === initialSerialNumber.trim().toLowerCase()
      );
      if (exactMatch) {
        handleSelectDevice(exactMatch);
      } else {
        const isStockBatchSerial = stockItems.some(
          (si) => String(si.serialNumber || "").trim().toLowerCase() === initialSerialNumber.trim().toLowerCase()
        );
        // Only trigger backend code verification if it's not a known stock batch serial in memory
        if (!isStockBatchSerial) {
          verifyCode(initialSerialNumber, false);
        }
      }
    }
  }, [initialSerialNumber, stockItems]);

  // Verify Code: strictly IMEI for IMEI products; Barcode/SKU/Serial for Quantity products
  const verifyCode = async (codeToVerify: string, autoConfirmOnSuccess: boolean = false): Promise<boolean> => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) {
      showError(isImeiProduct ? "Please scan or enter device IMEI." : "Please scan or enter barcode or SKU.");
      return false;
    }

    // 1. Check if already in active cart
    const alreadyInCart = cart.some(
      (item) =>
        (item.serialNumber && String(item.serialNumber).toLowerCase() === trimmed.toLowerCase()) ||
        (verifiedStockItem && item.stockItemId && String(item.stockItemId) === String(verifiedStockItem._id)) ||
        (selectedStockItem && item.stockItemId && String(item.stockItemId) === String(selectedStockItem._id))
    );

    if (alreadyInCart) {
      showError(`Device / Item with code "${trimmed}" is already in your cart!`);
      setVerifiedStockItem(null);
      setSelectedStockItem(null);
      setVerifiedCode(null);
      return false;
    }

    // 2. Check local stock items first
    if (stockItems.length > 0) {
      const localItem = stockItems.find(
        (si) =>
          String(si.imei1 || "").trim().toLowerCase() === trimmed.toLowerCase() ||
          String(si.imei2 || "").trim().toLowerCase() === trimmed.toLowerCase()
      );

      if (localItem) {
        handleSelectDevice(localItem);
        if (autoConfirmOnSuccess) {
          handleQuickAddDevice(localItem);
        }
        return true;
      }
    }

    // 3. FOR IMEI PRODUCTS: Strictly accept ONLY device IMEI lookup from inventory database
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
        showError(`Variant "${getVariantBadges(localMatchedVariant).join(" • ")}" selected. Please scan the device IMEI barcode from the box to add to cart.`);
        return false;
      }

      setIsVerifying(true);
      try {
        const imeiRes = await apiGet<{ status?: string; data?: { stockItem?: any } }>(
          `/inventory/lookup/imei/${encodeURIComponent(trimmed)}`
        ).catch(() => null);

        if (imeiRes && imeiRes.status === "success" && imeiRes.data?.stockItem) {
          const stockItem = imeiRes.data.stockItem;

          if (stockItem.status && stockItem.status !== "available") {
            showError(`Device with IMEI "${trimmed}" is not available in stock (Status: ${stockItem.status}).`);
            setVerifiedStockItem(null);
            setSelectedStockItem(null);
            setVerifiedCode(null);
            setIsVerifying(false);
            return false;
          }

          const itemProductId = stockItem.product?._id || stockItem.product;
          if (itemProductId && String(itemProductId) !== String(product._id)) {
            const actualProductName = stockItem.product?.name || "another product";
            showError(`This IMEI belongs to "${actualProductName}", not "${product.name}".`);
            setVerifiedStockItem(null);
            setSelectedStockItem(null);
            setVerifiedCode(null);
            setIsVerifying(false);
            return false;
          }

          const targetVariant = resolveDeviceVariant(stockItem);

          setSelectedVariant(targetVariant);
          setVerifiedStockItem(stockItem);
          setSelectedStockItem(stockItem);
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

        const serialCheck = await apiGet<{ status?: string; data?: { stockItem?: any } }>(
          `/inventory/lookup/serial/${encodeURIComponent(trimmed)}`
        ).catch(() => null);

        setIsVerifying(false);
        setVerifiedStockItem(null);
        setSelectedStockItem(null);
        setVerifiedCode(null);

        if (serialCheck && serialCheck.status === "success" && serialCheck.data?.stockItem) {
          showError(`"${trimmed}" is a serial number, not an IMEI number. For this device, please scan or enter the IMEI barcode.`);
          return false;
        }

        showError(`Device IMEI "${trimmed}" was not found in available stock.`);
        return false;
      } catch (err: any) {
        setIsVerifying(false);
        setVerifiedStockItem(null);
        setSelectedStockItem(null);
        setVerifiedCode(null);
        showError("Error verifying IMEI in inventory database. Please try again.");
        return false;
      }
    }

    // 4. FOR QUANTITY PRODUCTS (Non-IMEI products)
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
      setSelectedStockItem(null);
      setVerifiedCode(trimmed);
      setToastError(null);
      if (autoConfirmOnSuccess) {
        onSelectVariant(localMatchedVariant, undefined, undefined, getVariantPrice(localMatchedVariant));
        return true;
      }
      return true;
    }

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
        setSelectedStockItem(stockItem);
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
      setSelectedStockItem(null);
      setVerifiedCode(null);
      return false;
    } catch (err) {
      setIsVerifying(false);
      setVerifiedStockItem(null);
      setSelectedStockItem(null);
      setVerifiedCode(null);
      showError("Error checking code in inventory.");
      return false;
    }
  };

  const handleConfirm = async () => {
    if (isImeiProduct) {
      let targetStockItem = selectedStockItem || verifiedStockItem;

      if (!targetStockItem) {
        if (codeInput.trim()) {
          const matchInList = stockItems.find(
            (si) =>
              String(si.imei1 || "").trim().toLowerCase() === codeInput.trim().toLowerCase() ||
              String(si.imei2 || "").trim().toLowerCase() === codeInput.trim().toLowerCase()
          );
          if (matchInList) {
            targetStockItem = matchInList;
            setSelectedStockItem(matchInList);
          } else {
            const success = await verifyCode(codeInput, false);
            if (!success) return;
            targetStockItem = verifiedStockItem;
          }
        } else if (filteredStockItems.length === 1) {
          targetStockItem = filteredStockItems[0];
          setSelectedStockItem(targetStockItem);
        } else {
          showError("Please select a device from the list or scan an IMEI.");
          return;
        }
      }

      if (!targetStockItem) return;

      const finalVariant = resolveDeviceVariant(targetStockItem);
      const finalSerial = targetStockItem.imei1 || targetStockItem.imei2 || targetStockItem.serialNumber || codeInput.trim();
      const finalPrice = targetStockItem.sellingPrice || getFinalPrice(finalVariant, targetStockItem);

      onSelectVariant(
        finalVariant,
        finalSerial,
        targetStockItem._id,
        finalPrice
      );
    } else {
      if (!selectedVariant) return;
      const finalSerial = verifiedCode || initialSerialNumber || (codeInput.trim() || undefined);
      const finalStockItemId = verifiedStockItem?._id || undefined;
      const finalPrice = getFinalPrice(selectedVariant, verifiedStockItem);
      onSelectVariant(selectedVariant, finalSerial, finalStockItemId, finalPrice);
    }
  };

  const getProductFallbackImg = (): string => {
    if (product.images && product.images.length > 0 && product.images[0]) return product.images[0];
    if ((product as any).image) return (product as any).image;
    if ((product as any).thumbnail) return (product as any).thumbnail;
    if (typeof product.category === 'object' && (product.category as any)?.image) {
      return (product.category as any).image;
    }
    const catName = String((typeof product.category === 'object' ? product.category?.name : '') || '').toLowerCase();
    const prodName = (product.name || '').toLowerCase();
    if (catName.includes('audio') || prodName.includes('airpod') || prodName.includes('earbud')) return '/uploads/categories/audio.jpg';
    if (catName.includes('phone') || prodName.includes('phone') || prodName.includes('galaxy') || prodName.includes('iphone')) return '/uploads/categories/mobile_phones.jpg';
    if (catName.includes('charger') || catName.includes('power') || catName.includes('cable')) return '/uploads/categories/chargers_power.jpg';
    if (catName.includes('repair') || catName.includes('battery')) return '/uploads/categories/repair_parts.jpg';
    return '/uploads/categories/accessories.jpg';
  };
  const productImage = resolveImageUrl(getProductFallbackImg());

  // Verification status check
  const isVerifiedForCurrentInput = Boolean(
    selectedStockItem ||
    (verifiedCode &&
      (verifiedCode.toLowerCase() === codeInput.trim().toLowerCase() ||
        (verifiedStockItem &&
          (verifiedStockItem.imei1 === codeInput.trim() ||
            verifiedStockItem.imei2 === codeInput.trim() ||
            (!isImeiProduct && verifiedStockItem.serialNumber === codeInput.trim())))))
  );

  const canConfirm = isImeiProduct
    ? Boolean(selectedStockItem || (isVerifiedForCurrentInput && verifiedStockItem) || filteredStockItems.length === 1)
    : Boolean(selectedVariant || variantsList.length > 0 || (product.variants && product.variants.length > 0));

  const displayFinalPrice = selectedStockItem?.sellingPrice || verifiedStockItem?.sellingPrice || (selectedVariant ? getFinalPrice(selectedVariant, verifiedStockItem || selectedStockItem) : 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Toast Error Notification */}
      {toastError && (
        <div className="fixed top-8 right-8 max-w-md bg-red-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-[120] font-semibold text-xs flex items-center gap-3 animate-bounce border border-red-400">
          <svg className="w-5 h-5 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-snug">{toastError}</span>
        </div>
      )}

      <div className="bg-white border border-slate-800/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 animate-in zoom-in-95 duration-100">
        
        {/* Modal Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
            {productImage ? (
              <img
                src={productImage}
                alt={product.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallbackBase = "https://api.hotlinecellular.lk";
                  if (target.src && !target.src.includes("hotlinecellular.lk") && target.dataset.triedFallback !== "true") {
                    target.dataset.triedFallback = "true";
                    const path = target.src.replace(/^https?:\/\/[^\/]+/, "");
                    target.src = `${fallbackBase}${path}`;
                    return;
                  }
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shrink-0 shadow-md">
                {(product?.name?.[0] || "P").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug truncate">
                  {product?.name || "Product Selection"}
                </h3>
                <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60 shrink-0">
                  {isImeiProduct ? "IMEI VERIFICATION REQUIRED" : "VARIANT SELECTION"}
                </span>
                {isDataLoading && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse shrink-0">
                    <svg className="w-2.5 h-2.5 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Fetching live stock...</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                {product?.itemCode || product?.sku || "SKU: N/A"} • {isDataLoading && stockItems.length === 0 ? "Loading real-time inventory..." : (stockItems.length > 0 ? `${stockItems.length} device(s) available in stock` : `${product.variants?.length || 1} variant(s) available`)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body: Left and Right Two-Column Layout */}
        <div className="p-6 bg-white overflow-y-auto max-h-[72vh] scrollbar-thin scrollbar-thumb-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Universal Barcode/Serial/IMEI Scanner & Product Selection Summary */}
            <div className="md:col-span-5 flex flex-col gap-4">
              
              {/* Universal Scanner / Search Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {isImeiProduct ? "SCAN / SEARCH DEVICE IMEI" : "SCAN BARCODE / SKU"}
                    </label>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-tight ${
                    isVerifiedForCurrentInput
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : isImeiProduct
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {isVerifiedForCurrentInput ? (
                      <span className="inline-flex items-center gap-1">Verified <Check className="w-2.5 h-2.5 stroke-[3]" /></span>
                    ) : isImeiProduct ? "IMEI Required" : "Optional Scan"}
                  </span>
                </div>

                {/* Search / Scan Input Box with blue-500 border */}
                <div className="space-y-2">
                  <div className="relative flex items-center">
                    <svg className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    <input
                      ref={codeInputRef}
                      type="text"
                      value={codeInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCodeInput(val);
                        const valTrimmed = val.trim().toLowerCase();

                        // Real-time instant auto-matching when typing
                        if (isImeiProduct && stockItems.length > 0) {
                          // 1. Exact match on IMEI (checks direct match or if barcode scanner appended IMEI)
                          const exact = stockItems.find((si) => {
                            const im1 = String(si.imei1 || "").trim().toLowerCase();
                            const im2 = String(si.imei2 || "").trim().toLowerCase();
                            return (
                              (im1 && (valTrimmed === im1 || (im1.length >= 6 && valTrimmed.endsWith(im1)))) ||
                              (im2 && (valTrimmed === im2 || (im2.length >= 6 && valTrimmed.endsWith(im2))))
                            );
                          });

                          if (exact) {
                            handleSelectDevice(exact);
                            return;
                          }

                          // 2. Single item filtered match when user has typed at least 3 digits
                          const matches = stockItems.filter((si) => {
                            const im1 = String(si.imei1 || "").toLowerCase();
                            const im2 = String(si.imei2 || "").toLowerCase();
                            const sn = String(si.serialNumber || "").toLowerCase();
                            return im1.includes(valTrimmed) || im2.includes(valTrimmed) || sn.includes(valTrimmed);
                          });

                          if (matches.length === 1 && valTrimmed.length >= 3) {
                            const matchedItem = matches[0];
                            setSelectedStockItem(matchedItem);
                            const matchingVar = resolveDeviceVariant(matchedItem);
                            if (matchingVar) setSelectedVariant(matchingVar);
                            setVerifiedStockItem(matchedItem);
                            setVerifiedCode(matchedItem.imei1 || matchedItem.imei2 || val.trim());
                            return;
                          }
                        }

                        if (verifiedCode && val.trim() !== verifiedCode) {
                          setVerifiedCode(null);
                          setVerifiedStockItem(null);
                          setSelectedStockItem(null);
                        }
                      }}
                      placeholder={
                        isImeiProduct
                          ? "Scan or type IMEI barcode..."
                          : "Scan variant barcode, SKU, or serial..."
                      }
                      disabled={isVerifying}
                      className="w-full pl-10 pr-10 py-2.5 text-sm font-mono text-slate-900 bg-white border-2 border-blue-500 rounded-xl outline-none placeholder:text-slate-400 placeholder:font-mono focus:ring-2 focus:ring-blue-500/20"
                      style={{ color: '#0f172a' }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (isVerifiedForCurrentInput) {
                            handleConfirm();
                          } else if (filteredStockItems.length === 1) {
                            handleQuickAddDevice(filteredStockItems[0]);
                          } else {
                            verifyCode(codeInput, true);
                          }
                        }
                      }}
                    />

                    {/* Clear Button / Spinner */}
                    <div className="absolute right-3 flex items-center gap-1.5">
                      {codeInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setCodeInput("");
                            setVerifiedCode(null);
                            setVerifiedStockItem(null);
                            setSelectedStockItem(null);
                            codeInputRef.current?.focus();
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Clear search"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      {isVerifying && (
                        <svg className="w-4 h-4 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Verify Action Button: Solid Royal Blue */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isVerifiedForCurrentInput) {
                        handleConfirm();
                      } else if (filteredStockItems.length === 1) {
                        handleQuickAddDevice(filteredStockItems[0]);
                      } else {
                        verifyCode(codeInput, false);
                      }
                    }}
                    disabled={isVerifying || (!codeInput.trim() && !selectedStockItem)}
                    className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifying ? (
                      <span>Verifying IMEI...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {isVerifiedForCurrentInput
                            ? "Add Verified Device to Cart"
                            : isImeiProduct
                            ? "Verify IMEI & Add to Cart"
                            : "Verify & Add to Cart"}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Helper Info Card */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-700 mb-1">
                    <span className="text-blue-600 font-mono tracking-tighter">|||||</span>
                    <span>{isImeiProduct ? "Instant IMEI Search & Filter" : "Barcode / SKU Search"}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isImeiProduct ? (
                      <>Type IMEI digits or scan the box barcode to auto-filter the devices list on the right. Press <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-mono font-bold text-slate-700">Enter</kbd> to add immediately.</>
                    ) : (
                      <>Scan the variant barcode/SKU to auto-select, or click any variant from the list on the right.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Active Selection Summary Card */}
              {(selectedStockItem || selectedVariant) ? (
                <div className="p-3.5 bg-white border-2 border-slate-900 rounded-xl shadow-2xs space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    CURRENTLY SELECTED {selectedStockItem ? "DEVICE" : "VARIANT"}
                  </p>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {selectedStockItem ? (
                      (() => {
                        const devVar = resolveDeviceVariant(selectedStockItem);
                        const b = devVar ? getVariantBadges(devVar) : [];
                        return b.length > 0 ? b.join(" • ") : "Standard (No Variant)";
                      })()
                    ) : (
                      selectedVariant && getVariantBadges(selectedVariant).length > 0
                        ? getVariantBadges(selectedVariant).join(" • ")
                        : (selectedVariant?.name || product.name)
                    )}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {selectedStockItem ? `IMEI: ${selectedStockItem.imei1}` : (selectedVariant?.itemCode || selectedVariant?.sku || product?.itemCode || "Standard")}
                    </span>
                    <span className="text-base font-black text-blue-600">
                      Rs. {displayFinalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    PRODUCT SUMMARY
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-snug truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {product?.itemCode || product?.sku || "Select a device to proceed"}
                    </span>
                    <span className="text-base font-black text-slate-800">
                      Rs. {((product.effectivePrice || product.sellingPrice || 0) as number).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Available Devices & Specification List */}
            <div className="md:col-span-7 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isImeiProduct && stockItems.length > 0
                      ? `AVAILABLE DEVICES (${filteredStockItems.length})`
                      : `CHOOSE VARIANT & SPECIFICATION`}
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isImeiProduct && stockItems.length > 0
                      ? "Click a serialized device to select or press + Add directly"
                      : "Click to select • Double-click to add"}
                  </p>
                </div>

                {/* Filter Dropdown & Clear */}
                <div className="flex items-center gap-2">
                  {isImeiProduct && stockItems.length > 0 && (stockVariantsSummary.variants.length > 0 || stockVariantsSummary.hasNoVariant) && (
                    <div className="flex items-center gap-1.5">
                      <select
                        id="imei-variant-filter"
                        value={variantFilter}
                        onChange={(e) => setVariantFilter(e.target.value)}
                        className="text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer transition-colors shadow-2xs max-w-[200px] truncate"
                        title="Filter devices by in-stock variant"
                      >
                        <option value="ALL">All In-Stock ({stockItems.length})</option>
                        {stockVariantsSummary.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label} ({v.count})
                          </option>
                        ))}
                        {stockVariantsSummary.hasNoVariant && (
                          <option value="NO_VARIANT">
                            No Variant ({stockVariantsSummary.noVariantCount})
                          </option>
                        )}
                      </select>
                    </div>
                  )}

                  {(codeInput.trim() || variantFilter !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setCodeInput("");
                        setVariantFilter("ALL");
                        setVerifiedCode(null);
                        setVerifiedStockItem(null);
                        setSelectedStockItem(null);
                      }}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Reset ({stockItems.length})
                    </button>
                  )}
                </div>
              </div>


              {/* Scrollable Items Container */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {isDataLoading && stockItems.length > 0 && (
                  <div className="mb-2 py-1.5 px-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center justify-between text-xs text-blue-800 animate-pulse shrink-0">
                    <span className="flex items-center gap-1.5 font-medium">
                      <svg className="w-3 h-3 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Refreshing live inventory...
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 font-bold">Syncing</span>
                  </div>
                )}

                {isDataLoading && (isImeiProduct ? stockItems.length === 0 : (product.variants?.length || 0) === 0) ? (
                  /* Loading Shimmer Skeleton Animation inside modal box */
                  <div className="space-y-3 py-1">
                    <div className="p-3 bg-blue-50/80 border border-blue-200/70 rounded-2xl flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-blue-900">
                          {isImeiProduct ? "Loading available devices in stock..." : "Loading variants & live pricing..."}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-blue-100">
                        Live Sync
                      </span>
                    </div>

                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-full p-4 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between gap-4 animate-pulse relative overflow-hidden"
                      >
                        <div className="flex-1 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-20 bg-slate-200/80 rounded-lg"></div>
                            <div className="h-5 w-16 bg-slate-200/80 rounded-lg"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-10 bg-blue-100 rounded"></div>
                            <div className="h-4 w-36 bg-slate-200/80 rounded"></div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="h-5 w-24 bg-blue-100/90 rounded-md"></div>
                          <div className="h-8 w-16 bg-slate-200/80 rounded-xl"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isImeiProduct && stockItems.length > 0 ? (
                  filteredStockItems.length > 0 ? (
                    filteredStockItems.map((item) => {
                      const isAlreadyInCart = isItemAlreadyInCart(item);
                      const isDeviceSelected = selectedStockItem?._id === item._id || (verifiedCode && (verifiedCode === item.imei1 || verifiedCode === item.imei2));
                      
                      const matchingVar = resolveDeviceVariant(item);
                      
                      const badges = matchingVar ? getVariantBadges(matchingVar) : [];
                      const price = item.sellingPrice || (matchingVar ? getVariantPrice(matchingVar) : (product.effectivePrice || product.sellingPrice || 0));

                      return (
                        <div
                          key={item._id}
                          onClick={() => handleSelectDevice(item)}
                          onDoubleClick={() => handleQuickAddDevice(item)}
                          className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between gap-4 border select-none ${
                            isAlreadyInCart
                              ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed"
                              : isDeviceSelected
                              ? "border-2 border-blue-500 bg-blue-50/20 shadow-xs cursor-pointer"
                              : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs cursor-pointer"
                          }`}
                        >
                          {/* Device Specs & IMEI */}
                          <div className="flex-1 min-w-0">
                            {/* Variant Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              {badges.length > 0 ? (
                                badges.map((badge, bIdx) => (
                                  <span
                                    key={bIdx}
                                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200/60"
                                  >
                                    {badge}
                                  </span>
                                ))
                              ) : (
                                <span className="bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-md italic">
                                  No Variant
                                </span>
                              )}
                            </div>

                            {/* SN Badge */}
                            {item.serialNumber && (
                              <div className="mb-1.5">
                                <span className="bg-slate-100 text-slate-500 text-[11px] font-mono px-2 py-0.5 rounded">
                                  SN: {item.serialNumber}
                                </span>
                              </div>
                            )}

                            {/* IMEI Display with Highlight */}
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase font-mono">
                                IMEI
                              </span>
                              <span className="font-bold text-slate-800 text-sm tracking-wider">
                                {highlightMatch(item.imei1, codeInput)}
                              </span>
                              {item.imei2 && (
                                <span className="text-slate-400 text-xs">
                                  (2: {highlightMatch(item.imei2, codeInput)})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price & Add Button */}
                          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                            <p className="text-base font-black text-blue-600">
                              Rs. {price.toLocaleString()}
                            </p>

                            <div className="flex items-center gap-2">
                              {isAlreadyInCart ? (
                                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                  In Cart <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAddDevice(item);
                                  }}
                                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                                  title="Add this device directly to cart"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {codeInput.trim()
                          ? `No devices found matching "${codeInput}"`
                          : "No devices found for the selected variant"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Check your search or filter to view all {stockItems.length} devices in stock.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCodeInput("");
                          setVariantFilter("ALL");
                          setVerifiedCode(null);
                          setVerifiedStockItem(null);
                          setSelectedStockItem(null);
                        }}
                        className="mt-3 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                      >
                        Reset Filter & Search
                      </button>
                    </div>
                  )
                ) : filteredVariants.length > 0 ? (
                  filteredVariants.map((v) => {
                    const isSelected = selectedVariant?._id === v._id;
                    const badges = getVariantBadges(v);
                    const price = getVariantPrice(v);
                    const isMatchedWithCode = isVerifiedForCurrentInput && isSelected;

                    return (
                      <div
                        key={v._id}
                        onClick={() => {
                          setSelectedVariant(v);
                          if (isImeiProduct && verifiedCode) {
                            const itemVariantId = verifiedStockItem?.variant?._id || verifiedStockItem?.variant;
                            if (itemVariantId && String(itemVariantId) !== String(v._id)) {
                              setVerifiedCode(null);
                              setVerifiedStockItem(null);
                              setSelectedStockItem(null);
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
                        className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between gap-4 border cursor-pointer select-none ${
                          isMatchedWithCode || isSelected
                            ? "border-2 border-blue-500 bg-blue-50/20 shadow-xs"
                            : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Variant Attributes & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {badges.map((badge, bIdx) => (
                              <span
                                key={bIdx}
                                className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                              {isImeiProduct ? (
                                <>
                                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                                  <span>IMEI Tracked</span>
                                </>
                              ) : (
                                <>
                                  <Package className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Quantity Item</span>
                                </>
                              )}
                            </span>
                            {v.itemCode && (
                              <span className="text-[11px] font-mono text-slate-400">
                                • {v.itemCode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Add Button */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          <p className="text-base font-black text-blue-600">
                            Rs. {price.toLocaleString()}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {!isImeiProduct && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectVariant(v, undefined, undefined, getVariantPrice(v));
                                }}
                                className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                                title="Add this variant directly to cart"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add</span>
                              </button>
                            )}

                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm text-slate-500 font-medium">
                      No matching variants or devices found for this product.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer: Cancel on left, Solid #0f172a Confirm button on right */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-5 py-2.5 font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || isVerifying}
            className="bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 px-6 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isImeiProduct ? (
              <span>Confirm Selected Device</span>
            ) : (
              <span>Confirm & Add • Rs. {displayFinalPrice.toLocaleString()}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
