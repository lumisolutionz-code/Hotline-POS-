import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Save, Barcode, Plus, Trash2, Search, Database, Check } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../lib/api";

interface PartSuggestionItem {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock?: number;
  source: 'supply' | 'product';
  repairSupply?: string;
}

interface CustomerSuggestion {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  hasAccount: boolean;
  source?: string;
}

interface CreateRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdRepair?: any) => Promise<void> | void;
}

export function CreateRepairModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRepairModalProps): JSX.Element | null {
  const { branchId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    customer: { name: "", phone: "", email: "", address: "" },
    device: { brand: "", model: "", imei1: "", serialNumber: "", color: "", type: "MOBILE_PHONE", condition: "" },
    problemDescription: "",
    priority: "NORMAL",
    assignedTo: "",
    serviceCost: 0,
    advancePayment: 0,
    expectedCompletionDate: ""
  });

  const [parts, setParts] = useState<any[]>([]);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [clientAccount, setClientAccount] = useState<{ exists: boolean; name?: string } | null>(null);

  // Live email suggestion state
  const [emailSuggestions, setEmailSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Live parts suggestion state
  const [activePartSuggestion, setActivePartSuggestion] = useState<{
    index: number;
    field: 'barcode' | 'partName';
  } | null>(null);
  const [partSuggestions, setPartSuggestions] = useState<PartSuggestionItem[]>([]);
  const [loadingPartSuggestions, setLoadingPartSuggestions] = useState(false);
  const partSearchDebounceRef = useRef<any>(null);


  // Calculate totals
  const partsTotal = parts.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.unitPrice)), 0);
  const totalCost = Number(formData.serviceCost) + partsTotal;
  const balanceDue = totalCost - Number(formData.advancePayment);

  // Real-time email suggestions from database
  useEffect(() => {
    const email = formData.customer.email?.trim();
    if (!email || email.length < 1) {
      setEmailSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api<{ status: string; data?: { suggestions: CustomerSuggestion[] } }>(
          `/clients/search-emails?q=${encodeURIComponent(email)}`
        );
        if (res && res.data && Array.isArray(res.data.suggestions)) {
          setEmailSuggestions(res.data.suggestions);
          setShowSuggestions(res.data.suggestions.length > 0);
        } else {
          setEmailSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setEmailSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [formData.customer.email]);

  const handleSelectSuggestion = (sug: CustomerSuggestion) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        email: sug.email,
        name: prev.customer.name?.trim() ? prev.customer.name : (sug.name || ""),
        phone: prev.customer.phone?.trim() ? prev.customer.phone : (sug.phone || ""),
      }
    }));
    setShowSuggestions(false);
    if (sug.hasAccount) {
      setClientAccount({
        exists: true,
        name: sug.name || "Registered Member"
      });
      setCheckingAccount(false);
    }
  };

  // Check website account when email changes
  useEffect(() => {
    const email = formData.customer.email?.trim();
    if (!email || !email.includes("@")) {
      setClientAccount(null);
      setCheckingAccount(false);
      return;
    }

    setCheckingAccount(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api<{ status: string; exists: boolean; client?: { full_name?: string; name?: string } }>(
          `/clients/check-account?email=${encodeURIComponent(email)}`
        );
        if (res && res.exists && res.client) {
          setClientAccount({
            exists: true,
            name: res.client.full_name || res.client.name || "Registered Member"
          });
        } else {
          setClientAccount({ exists: false });
        }
      } catch {
        setClientAccount(null);
      } finally {
        setCheckingAccount(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.customer.email]);

  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
    }
  }, [isOpen]);

  const fetchTechnicians = async () => {
    try {
      if (!branchId) return;
      const res = await api<{ status: string; data?: { users: any[] } }>("/users");
      if (res.status === "success" && res.data?.users) {
        const techs = res.data.users.filter((u: any) => 
          u.roles?.some((r: any) => r.name === "TECHNICIAN") &&
          (!u.branch || u.branch === branchId || u.branch?._id === branchId)
        );
        setTechnicians(techs);
      }
    } catch (error) {
      console.error("Failed to fetch technicians", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        branch: branchId,
        partsUsed: parts.map(p => ({
          repairSupply: p.repairSupply || null,
          barcode: p.barcode || null,
          partName: p.partName,
          quantity: Number(p.quantity),
          unitPrice: Number(p.unitPrice)
        }))
      };

      const res = await api<{ status: string; data?: { repairJob?: any; repair?: any }; message?: string }>("/repairs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.status === "success") {
        const createdRepair = res.data?.repairJob || res.data?.repair;
        
        // If there's an assigned technician, also trigger assignment API
        if (formData.assignedTo && createdRepair?._id) {
          try {
            await api(`/repairs/${createdRepair._id}/assign`, {
              method: "PUT",
              body: JSON.stringify({ technicianId: formData.assignedTo }),
            });
          } catch (err) {
            console.warn("Technician assign notification warning:", err);
          }
        }

        // Reset form for next usage
        setFormData({
          customer: { name: "", phone: "", email: "", address: "" },
          device: { brand: "", model: "", imei1: "", serialNumber: "", color: "", type: "MOBILE_PHONE", condition: "" },
          problemDescription: "",
          priority: "NORMAL",
          assignedTo: "",
          serviceCost: 0,
          advancePayment: 0,
          expectedCompletionDate: ""
        });
        setParts([]);

        if (onSuccess) {
          await onSuccess(createdRepair);
        }
        onClose();
      } else {
        alert(res?.message || "Failed to create repair job");
      }
    } catch (error: any) {
      console.error("Failed to submit", error);
      alert(error?.message || "Network error while creating repair job");
    } finally {
      setLoading(false);
    }
  };

  const searchPartSuggestions = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setPartSuggestions([]);
      setLoadingPartSuggestions(false);
      return;
    }

    setLoadingPartSuggestions(true);
    try {
      const results: PartSuggestionItem[] = [];
      const seen = new Set<string>();

      // Concurrently query repair supplies and product catalog
      const [suppliesRes, productsRes] = await Promise.allSettled([
        api<{ status: string; data: { supplies: any[] } }>(`/inventory/repair-supplies?search=${encodeURIComponent(q)}`),
        api<{ status: string; data: { products: any[] } }>(`/products/search?q=${encodeURIComponent(q)}`),
      ]);

      if (suppliesRes.status === "fulfilled" && suppliesRes.value?.status === "success") {
        const supplies = suppliesRes.value.data?.supplies || [];
        for (const s of supplies) {
          const id = s._id || s.id;
          const barcode = s.serialNumber || s.barcode || "";
          if (id && !seen.has(id)) {
            seen.add(id);
            results.push({
              id,
              name: s.name || "Repair Supply",
              barcode,
              price: Number(s.cost || 0),
              stock: s.qty,
              source: "supply",
              repairSupply: id,
            });
          }
        }
      }

      if (productsRes.status === "fulfilled" && productsRes.value?.status === "success") {
        const products = productsRes.value.data?.products || [];
        for (const p of products) {
          const id = p._id || p.id;
          const barcode = p.barcode || p.itemCode || p.sku || "";
          if (id && !seen.has(id)) {
            seen.add(id);
            results.push({
              id,
              name: p.name || "Product",
              barcode,
              price: Number(p.costPrice || p.sellingPrice || 0),
              stock: p.stockQuantity ?? p.totalStock ?? p.qty,
              source: "product",
            });
          }
        }
      }

      setPartSuggestions(results);
    } catch (err) {
      console.error("Part suggestions error:", err);
      setPartSuggestions([]);
    } finally {
      setLoadingPartSuggestions(false);
    }
  };

  const handlePartInputChange = (index: number, field: 'barcode' | 'partName', value: string) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);

    setActivePartSuggestion({ index, field });

    if (partSearchDebounceRef.current) {
      clearTimeout(partSearchDebounceRef.current);
    }

    if (!value.trim()) {
      setPartSuggestions([]);
      return;
    }

    partSearchDebounceRef.current = setTimeout(() => {
      searchPartSuggestions(value);
    }, 200);
  };

  const selectPartSuggestion = (index: number, item: PartSuggestionItem) => {
    const newParts = [...parts];
    const currentQty = Number(newParts[index]?.quantity);
    newParts[index] = {
      ...newParts[index],
      barcode: item.barcode || "",
      partName: item.name,
      unitPrice: item.price,
      quantity: currentQty > 0 ? currentQty : 1,
      repairSupply: item.repairSupply || undefined,
    };
    setParts(newParts);
    setActivePartSuggestion(null);
    setPartSuggestions([]);
  };

  const handlePartKeyDown = (e: React.KeyboardEvent, index: number, field: 'barcode' | 'partName') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (partSuggestions.length > 0) {
        selectPartSuggestion(index, partSuggestions[0]);
      } else if (field === 'barcode' && parts[index]?.barcode) {
        scanBarcode(index);
      }
    } else if (e.key === 'Escape') {
      setActivePartSuggestion(null);
    }
  };

  const scanBarcode = async (index: number) => {
    const part = parts[index];
    if (!part.barcode) return;
    
    try {
      const [suppliesRes, productsRes] = await Promise.allSettled([
        api<{ status: string; data: { supplies: any[] } }>(`/inventory/repair-supplies?search=${encodeURIComponent(part.barcode)}`),
        api<{ status: string; data: { products: any[] } }>(`/products/search?q=${encodeURIComponent(part.barcode)}`),
      ]);

      let match: any = null;
      let isSupply = false;

      if (suppliesRes.status === "fulfilled" && suppliesRes.value?.status === "success") {
        const supplies = suppliesRes.value.data?.supplies || [];
        match = supplies.find((s: any) => 
          (s.serialNumber && s.serialNumber.toLowerCase() === part.barcode.toLowerCase()) ||
          (s.barcode && s.barcode.toLowerCase() === part.barcode.toLowerCase())
        ) || supplies[0];
        if (match) isSupply = true;
      }

      if (!match && productsRes.status === "fulfilled" && productsRes.value?.status === "success") {
        const products = productsRes.value.data?.products || [];
        match = products.find((p: any) =>
          (p.barcode && p.barcode.toLowerCase() === part.barcode.toLowerCase()) ||
          (p.itemCode && p.itemCode.toLowerCase() === part.barcode.toLowerCase())
        ) || products[0];
      }

      if (match) {
        const newParts = [...parts];
        newParts[index] = {
          ...newParts[index],
          barcode: isSupply ? (match.serialNumber || match.barcode || part.barcode) : (match.barcode || part.barcode),
          partName: match.name,
          unitPrice: isSupply ? Number(match.cost || 0) : Number(match.costPrice || match.sellingPrice || 0),
          quantity: Number(newParts[index].quantity) > 0 ? newParts[index].quantity : 1,
          repairSupply: isSupply ? match._id : undefined,
        };
        setParts(newParts);
      } else {
        alert("Barcode not found in database. You can enter details manually.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to lookup barcode.");
    }
  };

  const addPartRow = () => {
    setParts([...parts, { barcode: "", partName: "", quantity: 1, unitPrice: 0 }]);
  };

  const removePartRow = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
    if (activePartSuggestion?.index === index) {
      setActivePartSuggestion(null);
      setPartSuggestions([]);
    }
  };

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (searchModalOpen) {
          setSearchModalOpen(false);
        } else if (activePartSuggestion) {
          setActivePartSuggestion(null);
        } else if (showSuggestions) {
          setShowSuggestions(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, searchModalOpen, activePartSuggestion, showSuggestions]);

  const searchParts = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results: any[] = [];
      const seen = new Set<string>();

      const [suppliesRes, productsRes] = await Promise.allSettled([
        api<{ status: string; data: { supplies: any[] } }>(`/inventory/repair-supplies?search=${encodeURIComponent(query)}`),
        api<{ status: string; data: { products: any[] } }>(`/products/search?q=${encodeURIComponent(query)}`),
      ]);

      if (suppliesRes.status === "fulfilled" && suppliesRes.value?.status === "success") {
        for (const s of (suppliesRes.value.data?.supplies || [])) {
          const id = s._id || s.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            results.push(s);
          }
        }
      }

      if (productsRes.status === "fulfilled" && productsRes.value?.status === "success") {
        for (const p of (productsRes.value.data?.products || [])) {
          const id = p._id || p.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            results.push({
              ...p,
              serialNumber: p.barcode || p.itemCode || "",
              cost: p.costPrice || p.sellingPrice || 0,
              qty: p.stockQuantity ?? p.totalStock ?? 0,
            });
          }
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchPart = (item: any) => {
    const emptyIndex = parts.findIndex(p => !p.barcode?.trim() && !p.partName?.trim());
    const partData = {
      barcode: item.serialNumber || item.barcode || "",
      partName: item.name,
      quantity: 1,
      unitPrice: Number(item.cost || item.sellingPrice || 0),
      repairSupply: item._id || item.id
    };

    if (emptyIndex >= 0) {
      const newParts = [...parts];
      newParts[emptyIndex] = partData;
      setParts(newParts);
    } else {
      setParts([...parts, partData]);
    }

    setSearchModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create Repair Job</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-repair-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Customer Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name *</label>
                    <input type="text" required
                      value={formData.customer.name}
                      onChange={e => setFormData({...formData, customer: {...formData.customer, name: e.target.value}})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Phone *</label>
                    <input type="text" required
                      value={formData.customer.phone}
                      onChange={e => setFormData({...formData, customer: {...formData.customer, phone: e.target.value}})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                        Email <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Ask: Has website account?</span>
                    </div>
                    <div className="relative">
                      <input type="email"
                        value={formData.customer.email}
                        onChange={e => {
                          setFormData({...formData, customer: {...formData.customer, email: e.target.value}});
                          setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          if (emailSuggestions.length > 0) setShowSuggestions(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 250);
                        }}
                        placeholder="customer@email.com (Optional)"
                        autoComplete="off"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                      <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                        {loadingSuggestions && (
                          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        )}
                        {checkingAccount && !loadingSuggestions && (
                          <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                        )}
                      </div>

                      {/* Real-time Email Suggestions Dropdown */}
                      {showSuggestions && emailSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl divide-y divide-slate-100 dark:divide-slate-700/60">
                          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Database className="w-3 h-3 text-blue-500" />
                              <span>Database Matching Customers</span>
                            </span>
                            <span>{emailSuggestions.length} found</span>
                          </div>
                          <ul className="max-h-48 overflow-y-auto py-1">
                            {emailSuggestions.map(sug => (
                              <li
                                key={sug.email}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectSuggestion(sug);
                                }}
                                className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-2.5 group"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className={`h-6 w-6 rounded-md grid place-items-center shrink-0 text-[10px] font-black ${
                                    sug.hasAccount ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                  }`}>
                                    {(sug.name ? sug.name.charAt(0) : sug.email.charAt(0)).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                      {sug.email}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                                      <span className="font-medium text-slate-700 dark:text-slate-300">{sug.name || 'Customer'}</span>
                                      {sug.phone && <span>• <span className="font-mono">{sug.phone}</span></span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {sug.hasAccount ? (
                                    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                                      <span>Website Member</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                      <span>Previous Customer</span>
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {/* Live account detection indicator */}
                    {clientAccount?.exists && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                        <span className="font-bold">✓</span>
                        <span><strong>Account Linked:</strong> {clientAccount.name} (Auto-syncs to online portal)</span>
                      </div>
                    )}
                    {clientAccount && !clientAccount.exists && formData.customer.email.length > 4 && !checkingAccount && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        <span>ℹ</span>
                        <span>Not registered on website yet (Optional)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Device Details */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Device Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Device Type *</label>
                      <select required
                        value={formData.device.type}
                        onChange={e => setFormData({...formData, device: {...formData.device, type: e.target.value}})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                        <option value="MOBILE_PHONE">Mobile Phone</option>
                        <option value="TABLET">Tablet</option>
                        <option value="LAPTOP">Laptop</option>
                        <option value="SMARTWATCH">Smartwatch</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Brand (Optional)</label>
                      <input type="text"
                        value={formData.device.brand}
                        onChange={e => setFormData({...formData, device: {...formData.device, brand: e.target.value}})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Model (Optional)</label>
                      <input type="text"
                        value={formData.device.model}
                        onChange={e => setFormData({...formData, device: {...formData.device, model: e.target.value}})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">IMEI</label>
                      <input type="text"
                        value={formData.device.imei1}
                        onChange={e => setFormData({...formData, device: {...formData.device, imei1: e.target.value}})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Color</label>
                      <input type="text"
                        value={formData.device.color}
                        onChange={e => setFormData({...formData, device: {...formData.device, color: e.target.value}})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Condition</label>
                    <input type="text"
                      value={formData.device.condition}
                      onChange={e => setFormData({...formData, device: {...formData.device, condition: e.target.value}})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Problem & Assignment */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-white mb-2">Problem Description *</label>
                  <textarea required rows={4}
                    value={formData.problemDescription}
                    onChange={e => setFormData({...formData, problemDescription: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"></textarea>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-white mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="LOW" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Low</option>
                      <option value="NORMAL" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Normal</option>
                      <option value="HIGH" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">High</option>
                      <option value="URGENT" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-white mb-2">Assign Technician *</label>
                    <select required
                      value={formData.assignedTo}
                      onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">-- Select Technician --</option>
                      {technicians.map(tech => (
                        <option key={tech._id} value={tech._id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">{tech.username}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Parts Used */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Parts Used</h3>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={addPartRow} className="text-xs flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                  <button type="button" onClick={() => setSearchModalOpen(true)} className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors border border-blue-100 dark:border-blue-500/20">
                    <Search className="w-3.5 h-3.5" /> Search DB
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {parts.map((part, index) => {
                  const isBarcodeActive = activePartSuggestion?.index === index && activePartSuggestion?.field === 'barcode';
                  const isNameActive = activePartSuggestion?.index === index && activePartSuggestion?.field === 'partName';
                  const isRowActive = activePartSuggestion?.index === index;

                  return (
                    <div key={index} className={`flex flex-wrap sm:flex-nowrap gap-3 items-end border border-slate-200 dark:border-slate-700 p-3 rounded-lg bg-white dark:bg-slate-800 transition-all ${isRowActive ? 'relative z-30 ring-1 ring-blue-500/20' : 'relative z-10'}`}>
                      {/* 1. Barcode Field with Live Autocomplete */}
                      <div className="flex-1 min-w-[140px] relative">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Barcode</label>
                        <div className="relative flex">
                          <input type="text"
                            value={part.barcode || ""}
                            onChange={e => handlePartInputChange(index, 'barcode', e.target.value)}
                            onFocus={() => {
                              setActivePartSuggestion({ index, field: 'barcode' });
                              if (part.barcode?.trim()) searchPartSuggestions(part.barcode);
                            }}
                            onBlur={() => setTimeout(() => {
                              setActivePartSuggestion(prev => prev?.index === index && prev?.field === 'barcode' ? null : prev);
                            }, 250)}
                            onKeyDown={e => handlePartKeyDown(e, index, 'barcode')}
                            placeholder="Type or scan..."
                            autoComplete="off"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-l-lg px-2.5 py-1.5 text-sm font-mono focus:border-blue-500 outline-none" />
                          <button type="button" onClick={() => scanBarcode(index)} title="Lookup barcode in DB" className="px-2 bg-slate-100 border-y border-r border-slate-200 dark:border-slate-700 dark:bg-slate-700 rounded-r-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                            <Barcode className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Barcode Autocomplete Dropdown */}
                        {isBarcodeActive && (partSuggestions.length > 0 || loadingPartSuggestions) && (
                          <div className="absolute left-0 top-full mt-1 w-[320px] max-w-[calc(100vw-2rem)] z-50 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl divide-y divide-slate-100 dark:divide-slate-700/60">
                            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Database className="w-3 h-3 text-blue-500" />
                                <span>Supplies & Inventory</span>
                              </span>
                              <span>{loadingPartSuggestions ? "Searching..." : `${partSuggestions.length} found`}</span>
                            </div>
                            {loadingPartSuggestions ? (
                              <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Searching database...
                              </div>
                            ) : (
                              <ul className="max-h-48 overflow-y-auto py-1">
                                {partSuggestions.map(item => (
                                  <li
                                    key={item.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      selectPartSuggestion(index, item);
                                    }}
                                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-2.5 text-left"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                        <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{item.barcode || 'No barcode'}</span>
                                        {item.source === 'supply' ? (
                                          <span className="text-[9px] px-1 py-0.2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded">Part</span>
                                        ) : (
                                          <span className="text-[9px] px-1 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">Product</span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xs font-bold text-slate-800 dark:text-emerald-400">Rs. {item.price.toFixed(2)}</p>
                                      {item.stock !== undefined && (
                                        <p className="text-[10px] text-slate-400">{item.stock} in stock</p>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Part Name Field with Live Autocomplete */}
                      <div className="flex-1 min-w-[160px] relative">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Part Name *</label>
                        <div className="relative">
                          <input type="text" required
                            value={part.partName || ""}
                            onChange={e => handlePartInputChange(index, 'partName', e.target.value)}
                            onFocus={() => {
                              setActivePartSuggestion({ index, field: 'partName' });
                              if (part.partName?.trim()) searchPartSuggestions(part.partName);
                            }}
                            onBlur={() => setTimeout(() => {
                              setActivePartSuggestion(prev => prev?.index === index && prev?.field === 'partName' ? null : prev);
                            }, 250)}
                            onKeyDown={e => handlePartKeyDown(e, index, 'partName')}
                            placeholder="Search part name from DB..."
                            autoComplete="off"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2.5 py-1.5 text-sm focus:border-blue-500 outline-none" />
                          {isNameActive && loadingPartSuggestions && (
                            <span className="absolute right-2.5 top-2.5 text-slate-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                            </span>
                          )}
                        </div>

                        {/* Part Name Autocomplete Dropdown */}
                        {isNameActive && (partSuggestions.length > 0 || loadingPartSuggestions) && (
                          <div className="absolute left-0 top-full mt-1 w-[320px] max-w-[calc(100vw-2rem)] z-50 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl divide-y divide-slate-100 dark:divide-slate-700/60">
                            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Database className="w-3 h-3 text-blue-500" />
                                <span>Supplies & Inventory</span>
                              </span>
                              <span>{loadingPartSuggestions ? "Searching..." : `${partSuggestions.length} found`}</span>
                            </div>
                            {loadingPartSuggestions ? (
                              <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Searching database...
                              </div>
                            ) : (
                              <ul className="max-h-48 overflow-y-auto py-1">
                                {partSuggestions.map(item => (
                                  <li
                                    key={item.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      selectPartSuggestion(index, item);
                                    }}
                                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-2.5 text-left"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                        <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{item.barcode || 'No barcode'}</span>
                                        {item.source === 'supply' ? (
                                          <span className="text-[9px] px-1 py-0.2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded">Part</span>
                                        ) : (
                                          <span className="text-[9px] px-1 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">Product</span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xs font-bold text-slate-800 dark:text-emerald-400">Rs. {item.price.toFixed(2)}</p>
                                      {item.stock !== undefined && (
                                        <p className="text-[10px] text-slate-400">{item.stock} in stock</p>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. Quantity Field */}
                      <div className="w-20">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Qty</label>
                        <input type="number" required min="1"
                          value={part.quantity}
                          onChange={e => {
                            const newParts = [...parts];
                            newParts[index].quantity = e.target.value;
                            setParts(newParts);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
                      </div>

                      {/* 4. Price Field (auto-filled on selection) */}
                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Price</label>
                        <input type="number" required min="0" step="0.01"
                          value={part.unitPrice}
                          onChange={e => {
                            const newParts = [...parts];
                            newParts[index].unitPrice = e.target.value;
                            setParts(newParts);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
                      </div>

                      {/* 5. Delete Action */}
                      <div>
                        <button type="button" onClick={() => removePartRow(index)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {parts.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-500 dark:text-slate-400">No parts added. Click "+ Add Row" or "Search DB" to begin.</div>
                )}
              </div>
            </div>

            {/* Estimates & Totals */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Cost Summary & Deadlines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Labor Cost (Rs.)</label>
                  <input type="number" min="0" required
                    value={formData.serviceCost}
                    onChange={e => setFormData({...formData, serviceCost: Number(e.target.value)})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Advance Payment (Rs.)</label>
                  <input type="number" min="0" required
                    value={formData.advancePayment}
                    onChange={e => setFormData({...formData, advancePayment: Number(e.target.value)})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-bold text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Expected Completion *</label>
                  <input type="datetime-local" required
                    value={formData.expectedCompletionDate}
                    onChange={e => setFormData({...formData, expectedCompletionDate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex flex-col justify-center">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Parts Total:</span>
                    <span>Rs. {partsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
                    <span>Balance Due:</span>
                    <span className={balanceDue > 0 ? "text-orange-500" : "text-emerald-500"}>Rs. {balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-repair-form"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Repair Job
          </button>
        </div>
      </div>
      
      {/* Search DB Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Search Repair Supplies</h3>
              </div>
              <button type="button" onClick={() => setSearchModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input type="text" value={searchQuery} onChange={(e) => searchParts(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder-slate-400"
                  placeholder="Search by name or barcode..." autoFocus />
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-[200px] border border-slate-100 dark:border-slate-800 rounded-xl">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    {searchQuery ? "No parts found." : "Type to search repair supplies."}
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {searchResults.map(item => (
                      <li key={item._id || item.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => selectSearchPart(item)}>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.serialNumber || 'No Barcode'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-slate-800 dark:text-white text-sm">Rs. {(item.cost || 0).toFixed(2)}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.qty || 0} in stock</p>
                          </div>
                          <button type="button" className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-center transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
