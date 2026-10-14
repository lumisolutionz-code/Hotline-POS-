import type { ProductDetailModalProps, Product } from "../../../types/pos";

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps): JSX.Element {
  const resolveProductImage = (p: Product): string | null => {
    let img = (p.images && p.images.length > 0 && p.images[0]) ? p.images[0] : (p as any).image || (p as any).thumbnail;
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
    if (!img) {
      if (typeof p.category === "object" && (p.category as any)?.image) {
        img = (p.category as any).image;
      } else {
        const catName = String((typeof p.category === "object" ? p.category?.name : "") || "").toLowerCase();
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
  const isLowStock = (product?.stock ?? 0) > 0 && (product?.stock ?? 0) <= 10;
  const productImg = resolveProductImage(product);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
            {productImg ? (
              <img
                src={productImg}
                alt={product.name || "Product"}
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
                  const next = target.nextElementSibling as HTMLElement;
                  if (next) next.style.display = "flex";
                }}
              />
            ) : null}
            <div
              style={{ display: productImg ? "none" : "flex" }}
              className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shrink-0 shadow-md"
            >
              {(product?.name?.[0] || "P").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug truncate">
                  {product?.name || "Product Details"}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60 shrink-0">
                  PRODUCT DETAILS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                {product?.sku || "SKU: N/A"} • {product?.category?.name || "Uncategorized"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                Category
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {product?.category?.name || "Uncategorized"}
              </p>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                Stock Status
              </p>
              <div
                className={`flex items-center gap-1.5 font-bold text-sm ${
                  isOutOfStock
                    ? "text-red-500 dark:text-red-400"
                    : isLowStock
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock
                      ? "bg-red-500"
                      : isLowStock
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                ></span>
                <span>
                  {product?.stock ?? 0} {product?.unit || "units"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                Barcode
              </p>
              <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 truncate">
                {product?.barcode || "—"}
              </p>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
                Tax Rate
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {product?.taxRate ?? 0}%
              </p>
            </div>
          </div>

          {/* Warranty Section */}
          {product?.warrantyDuration && product.warrantyDuration > 0 && (
            <div className="bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {product.warrantyDuration}{" "}
                    {product.warrantyDuration === 1 ? "Month" : "Months"}{" "}
                    Warranty
                  </p>
                  {product.warrantyDescription && (
                    <p className="text-xs text-sky-700 dark:text-sky-300 font-medium mt-0.5 truncate">
                      {product.warrantyDescription}
                    </p>
                  )}
                </div>
              </div>
              {product.warrantyType && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60 uppercase shrink-0">
                  {product.warrantyType}
                </span>
              )}
            </div>
          )}

          {/* Description Section */}
          {product?.description && (
            <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Price Section */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-200/80 dark:border-blue-900/50">
            {hasOffer && (
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold rounded-lg shadow-sm">
                  {product?.offer?.type === "PERCENTAGE"
                    ? `${product?.offer?.value}% OFF`
                    : `Rs. ${product?.discountAmount} OFF`}
                </span>
                {product?.offer?.description && (
                  <span className="text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
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
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline gap-3">
              {hasOffer && originalPrice > displayPrice && (
                <span className="text-slate-400 dark:text-slate-500 text-lg font-medium line-through">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                Rs. {displayPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-5 py-2.5 font-semibold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`py-2.5 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] text-white"
            }`}
          >
            {isOutOfStock ? (
              <>
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Out of Stock
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
