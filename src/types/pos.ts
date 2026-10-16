// POS Types & Interfaces

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parent?: string | null;
  subcategories?: Category[];
}

export interface ProductVariant {
  _id: string;
  product?: string;
  itemCode?: string;
  attributes: Record<string, string> | any[];
  costPrice?: number;
  sellingPrice?: number;
  originalPrice?: number;
  effectivePrice?: number;
  hasActiveOffer?: boolean;
  discountAmount?: number;
  wholesalePrice?: number;
  trackingType?: "QUANTITY" | "IMEI" | string;
  minStockLevel?: number;
  stockQty?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
  sku?: string;
  barcode?: string;
}

export interface Product {
  _id: string;
  name?: string;
  sku?: string;
  barcode?: string;
  itemCode?: string;
  serialNumber?: string;
  serialNumbers?: string[];
  imeis?: string[];
  images?: string[];
  minStockLevel?: number;
  sellingPrice?: number;
  originalPrice?: number;
  costPrice?: number;
  stock?: number;
  unit?: string;
  taxRate?: number;
  description?: string;
  warrantyDuration?: number;
  warrantyType?: string;
  warrantyDescription?: string;
  condition?: string;
  trackingType?: "QUANTITY" | "IMEI" | string;
  category?: {
    _id?: string;
    name?: string;
  } | null;
  subcategory?: {
    _id?: string;
    name?: string;
  } | null;
  effectivePrice?: number;
  hasActiveOffer?: boolean;
  discountAmount?: number;
  offer?: {
    isActive?: boolean;
    type?: string;
    value?: number;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
  variants?: ProductVariant[];
  stockItems?: any[];
}

export interface CartItem extends Product {
  quantity: number;
  serialNumber?: string;
  variantId?: string;
  variantDisplay?: string;
  trackingType?: "QUANTITY" | "IMEI" | string;
  stockItemId?: string;
  isReturnCredit?: boolean;
  discountAmount?: number;
  originalPrice?: number;
  unitPrice?: number;
  isSimReload?: boolean;
  simReloadType?: "SIM" | "RELOAD";
  simReloadId?: string;
  provider?: string;
  phoneNumber?: string;
  customPrice?: number | string;
}

export interface RepairJob {
  _id: string;
  jobNumber: string;
  status: string;
  priority: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  device: {
    type: string;
    brand: string;
    model: string;
    imei?: string;
    serialNumber?: string;
    color?: string;
    accessories?: string[];
  };
  problemDescription: string;
  repairNotes?: string;
  serviceCost: number;
  partsTotal: number;
  totalCost: number;
  estimatedCost: number;
  advancePayment: number;
  finalPayment?: number;
  balanceDue?: number;
  partsUsed?: {
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  assignedTo?: { username: string };
  receivedBy?: { username: string };
  receivedAt?: string;
  pickupDate?: string;
  createdAt: string;
}

export interface Warranty {
  _id: string;
  warrantyNumber: string;
  product: {
    _id: string;
    name: string;
    sku?: string;
  };
  productName?: string;
  serialNumber?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  warrantyType: "MANUFACTURER" | "SHOP" | "EXTENDED";
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CLAIMED" | "VOID";
  claims: {
    _id: string;
    issue: string;
    resolution: string;
    claimDate: string;
    status: string;
  }[];
  createdAt: string;
}

// API Response Types
export interface CategoriesResponse {
  status: string;
  data?: { categories: Category[] };
}

export interface ProductsResponse {
  status: string;
  data?: { products: Product[] };
}

export interface RepairsResponse {
  status: string;
  data?: { repairs: RepairJob[] };
}

export interface WarrantySearchResponse {
  status: string;
  results?: number;
  data?: { warranties: Warranty[] };
}

// Component Props Types
export interface PaymentModalProps {
  total: number;
  subtotal: number;
  tax: number;
  cart: CartItem[];
  canApplyDiscount: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exchangePayload?: any;
}

export interface SalesPanelProps {
  salesData: any[];
  dailySummary: any;
  loading: boolean;
  canVoidSale: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export interface RepairsPanelProps {
  repairs: RepairJob[];
  loading: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCollectPayment: (repair: RepairJob) => void;
}

export interface RepairPaymentModalProps {
  repair: RepairJob;
  canCollectPayment: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface WarrantyPanelProps {
  onClose: () => void;
  canCreateClaim: boolean;
  onCreateClaim: (warranty: Warranty) => void;
}

export interface WarrantyClaimModalProps {
  warranty: Warranty;
  onClose: () => void;
  onSuccess: () => void;
}

export interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export interface ReturnsPanelProps {
  onClose: () => void;
  products?: Product[];
  onInitiateExchange?: (exchangeDetails: any, refundAmount: number) => void;
}
