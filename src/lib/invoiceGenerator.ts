import { ShopSettings, getShopSettings } from "./settings";
import { HOTLINE_LOGO_DATA_URL } from "./logo";

export interface InvoiceItem {
  description: string;
  quantity: number | string;
  unitPrice: number;
  total: number;
}

export interface InvoiceDetails {
  logoUrl?: string;
  invoiceTitle?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  paymentMethod?: string;
  billFrom: {
    name: string;
    companyName: string;
    streetAddress: string;
    cityZip: string;
    phone: string;
    email: string;
  };
  billTo: {
    name: string;
    companyName?: string;
    streetAddress?: string;
    cityZip?: string;
    phone?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxOrDiscount?: number;
  taxOrDiscountLabel?: string;
  otherCharges?: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  terms?: string;
}

/**
 * Generate standard A4 printable Invoice HTML matching the user's structured template
 */
export function generateInvoiceHtmlFromDetails(inv: InvoiceDetails): string {
  const minRows = 10;
  const currentRowsCount = inv.items.length;
  const emptyRowsCount = Math.max(0, minRows - currentRowsCount);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${inv.invoiceTitle || "INVOICE"} - ${inv.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.4;
      padding: 24px 30px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
    }
    /* Top Header Bar */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #0f172a;
    }
    .brand-logo-wrap {
      display: flex;
      align-items: center;
    }
    .brand-logo-img {
      height: 70px;
      max-width: 220px;
      object-fit: contain;
      display: block;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-title-text {
      font-size: 22px;
      font-weight: 900;
      text-align: right;
      color: #0f172a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .doc-sub-text {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-align: right;
    }

    /* 3-Column Info Area */
    .meta-grid {
      display: grid;
      grid-template-columns: 1.2fr 1.2fr 1.1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .meta-col h3 {
      font-size: 12px;
      font-weight: 800;
      text-transform: capitalize;
      color: #0f172a;
      margin-bottom: 6px;
      padding-bottom: 3px;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta-field {
      display: flex;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .meta-label {
      width: 85px;
      color: #475569;
      font-weight: 600;
      flex-shrink: 0;
    }
    .meta-val {
      color: #0f172a;
      font-weight: 500;
      flex-grow: 1;
      word-break: break-word;
    }
    .meta-val.strong {
      font-weight: 700;
    }

    /* Standard Grid Table */
    .table-wrap {
      margin-bottom: 18px;
    }
    table.invoice-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #334155;
    }
    table.invoice-table th {
      background-color: #4a6785;
      color: #ffffff;
      font-weight: 700;
      font-size: 11px;
      padding: 7px 10px;
      border: 1px solid #334155;
      text-transform: capitalize;
    }
    table.invoice-table td {
      border: 1px solid #334155;
      padding: 6px 10px;
      font-size: 11px;
      color: #1e293b;
      height: 26px;
      vertical-align: middle;
    }
    .col-desc {
      width: 52%;
      text-align: left;
    }
    .col-qty {
      width: 16%;
      text-align: center;
    }
    .col-price {
      width: 16%;
      text-align: right;
    }
    .col-total {
      width: 16%;
      text-align: right;
    }
    .empty-row td {
      color: transparent;
      user-select: none;
    }

    /* Summary Block */
    .summary-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    table.summary-table {
      width: 250px;
      border-collapse: collapse;
      border: 1px solid #334155;
    }
    table.summary-table td {
      border: 1px solid #334155;
      padding: 5px 10px;
      font-size: 11px;
    }
    .sum-label {
      font-weight: 600;
      color: #334155;
      width: 55%;
    }
    .sum-val {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
      width: 45%;
    }
    .sum-val.grand-total {
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      background: #f1f5f9;
    }
    .sum-label.grand-total {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      background: #f1f5f9;
    }

    /* Terms and Conditions */
    .terms-section {
      margin-top: 30px;
      text-align: center;
      padding: 12px 10px;
      border-top: 1px dashed #cbd5e1;
    }
    .terms-title {
      font-weight: 800;
      text-decoration: underline;
      margin-bottom: 6px;
      font-size: 12px;
      color: #0f172a;
    }
    .terms-text {
      font-size: 10px;
      color: #475569;
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.5;
    }

    /* Bottom Page & Watermark */
    .footer-bar {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
      padding-top: 8px;
    }
    .footer-seal {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: #0f172a;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      table.invoice-table th {
        background-color: #4a6785 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .sum-val.grand-total, .sum-label.grand-total {
        background-color: #f1f5f9 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header Row -->
    <div class="header-row">
      <div class="brand-logo-wrap">
        <img class="brand-logo-img" src="${inv.logoUrl || HOTLINE_LOGO_DATA_URL}" alt="New Challenge (Pvt) Ltd" />
      </div>
      <div>
        <div class="doc-title-text">${inv.invoiceTitle || "INVOICE"}</div>
        <div class="doc-sub-text">Original Customer Copy</div>
      </div>
    </div>

    <!-- Metadata 3-Column Info -->
    <div class="meta-grid">
      <!-- Bill From -->
      <div class="meta-col">
        <h3>Bill From</h3>
        <div class="meta-field">
          <span class="meta-label">Name:</span>
          <span class="meta-val strong">${inv.billFrom.name || "New Challenge (Pvt) Ltd"}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Company:</span>
          <span class="meta-val">${inv.billFrom.companyName}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Street Address:</span>
          <span class="meta-val">${inv.billFrom.streetAddress}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">City, ZIP:</span>
          <span class="meta-val">${inv.billFrom.cityZip}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Phone:</span>
          <span class="meta-val">${inv.billFrom.phone}</span>
        </div>
      </div>

      <!-- Bill To -->
      <div class="meta-col">
        <h3>Bill To</h3>
        <div class="meta-field">
          <span class="meta-label">Name:</span>
          <span class="meta-val strong">${inv.billTo.name || "Valued Customer"}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Company:</span>
          <span class="meta-val">${inv.billTo.companyName || "Retail Client"}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Street Address:</span>
          <span class="meta-val">${inv.billTo.streetAddress || "Storefront / Counter"}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">City, ZIP:</span>
          <span class="meta-val">${inv.billTo.cityZip || "Western Province, Sri Lanka"}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Phone:</span>
          <span class="meta-val">${inv.billTo.phone || "—"}</span>
        </div>
      </div>

      <!-- Invoice Details (Right) -->
      <div class="meta-col">
        <h3>Invoice Details</h3>
        <div class="meta-field">
          <span class="meta-label">Invoice No:</span>
          <span class="meta-val strong">${inv.invoiceNumber}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Invoice Date:</span>
          <span class="meta-val">${inv.invoiceDate}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Due Date:</span>
          <span class="meta-val">${inv.dueDate || "Paid on Purchase"}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Payment:</span>
          <span class="meta-val">${inv.paymentMethod || "CASH"}</span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="invoice-table">
        <thead>
          <tr>
            <th class="col-desc">Description</th>
            <th class="col-qty">Quantity / Hours</th>
            <th class="col-price">Price (Rs.)</th>
            <th class="col-total">Total (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items
            .map(
              (item) => `<tr>
                <td class="col-desc"><strong>${item.description}</strong></td>
                <td class="col-qty">${item.quantity}</td>
                <td class="col-price">${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="col-total">${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>`,
            )
            .join("")}
          ${Array.from({ length: emptyRowsCount })
            .map(
              () => `<tr class="empty-row">
                <td class="col-desc">&nbsp;</td>
                <td class="col-qty">&nbsp;</td>
                <td class="col-price">&nbsp;</td>
                <td class="col-total">&nbsp;</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Summary Box -->
    <div class="summary-wrap">
      <table class="summary-table">
        <tbody>
          <tr>
            <td class="sum-label">Subtotal</td>
            <td class="sum-val">Rs. ${inv.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          ${
            inv.taxOrDiscount
              ? `<tr>
            <td class="sum-label">${inv.taxOrDiscountLabel || "Sales Tax"}</td>
            <td class="sum-val">${inv.taxOrDiscount < 0 ? "-Rs. " + Math.abs(inv.taxOrDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Rs. " + inv.taxOrDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`
              : `<tr>
            <td class="sum-label">Sales Tax</td>
            <td class="sum-val">Rs. 0.00</td>
          </tr>`
          }
          <tr>
            <td class="sum-label">Other</td>
            <td class="sum-val">Rs. ${(inv.otherCharges || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td class="sum-label grand-total">Total</td>
            <td class="sum-val grand-total">Rs. ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          ${
            inv.amountPaid !== undefined
              ? `<tr>
            <td class="sum-label">Amount Paid</td>
            <td class="sum-val">Rs. ${inv.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`
              : ""
          }
          ${
            inv.balanceDue !== undefined
              ? `<tr>
            <td class="sum-label">Balance / Change</td>
            <td class="sum-val">Rs. ${inv.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`
              : ""
          }
        </tbody>
      </table>
    </div>

    <!-- Terms & Conditions -->
    <div class="terms-section">
      <div class="terms-title">Terms and Conditions</div>
      <div class="terms-text">
        ${
          inv.terms ||
          "Thank you for your business. Please inspect your device and items upon receipt. All eligible phones, accessories, and repairs carry official warranty from New Challenge (Pvt) Ltd as per stated coverage terms. Please retain this original invoice for warranty and claim validation."
        }
      </div>
    </div>

    <!-- Footer Bar -->
    <div class="footer-bar">
      <div class="footer-seal">
        <span>🔒</span>
        <span>New Challenge (Pvt) Ltd • Official Computer Generated Invoice</span>
      </div>
      <div>Page 1 of 1</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate Sales Invoice from POS Sale record
 */
export function generateSaleInvoiceHtml(
  sale: any,
  shopSettings?: ShopSettings,
  customerName?: string,
  customerPhone?: string,
): string {
  const settings = shopSettings || getShopSettings();
  const saleNumber = sale.saleNumber || `SAL-${Date.now().toString().slice(-6)}`;
  const dateStr = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  const items: InvoiceItem[] = (sale.items || []).map((it: any) => ({
    description: it.productName || it.name || "Item",
    quantity: it.quantity || 1,
    unitPrice: Number(it.unitPrice || 0),
    total: Number(it.total || (Number(it.unitPrice || 0) * (it.quantity || 1))),
  }));

  const subtotal = Number(sale.subtotal || sale.grandTotal || 0);
  const discount = Number(sale.discountTotal || 0);
  const grandTotal = Number(sale.grandTotal || subtotal - discount);
  const amountPaid = Number(sale.amountPaid || grandTotal);
  const changeGiven = Number(sale.changeGiven || 0);

  const invDetails: InvoiceDetails = {
    invoiceTitle: "SALES INVOICE",
    invoiceNumber: saleNumber,
    invoiceDate: dateStr,
    dueDate: "Paid in Full",
    paymentMethod: sale.paymentMethod || "CASH",
    billFrom: {
      name: settings.shopName || "New Challenge (Pvt) Ltd",
      companyName: settings.shopName?.includes("(Pvt) Ltd")
        ? settings.shopName
        : `${settings.shopName || "New Challenge"} (Pvt) Ltd`,
      streetAddress: settings.address || "No 27, Katuwana Road, Homagama",
      cityZip: "Homagama, Western Province, Sri Lanka",
      phone: settings.phone || "0777309726 / 0777476279",
      email: settings.email || "hotlinephoneshop@gmail.com",
    },
    billTo: {
      name: customerName || sale.customer?.name || "Walk-in Retail Customer",
      companyName: customerPhone ? `Phone: ${customerPhone}` : "Counter Customer",
      streetAddress: "Colombo, Sri Lanka",
      cityZip: "Sri Lanka",
      phone: customerPhone || sale.customer?.phone || "—",
    },
    items,
    subtotal,
    taxOrDiscount: discount > 0 ? -discount : 0,
    taxOrDiscountLabel: discount > 0 ? "Discount" : "Sales Tax",
    otherCharges: 0,
    total: grandTotal,
    amountPaid,
    balanceDue: changeGiven,
    terms:
      "Thank you for purchasing from Hotline Cellular. All genuine brand smartphones and accessories include manufacturer warranty where specified. Please retain this invoice for any service or warranty claims.",
  };

  return generateInvoiceHtmlFromDetails(invDetails);
}

/**
 * Generate Repair Invoice from Repair Job record
 */
export function generateRepairInvoiceHtml(
  repair: any,
  shopSettings?: ShopSettings,
  totalCost?: number,
  advancePaid?: number,
  balanceDue?: number,
  amountReceived?: string | number,
  change?: number,
): string {
  const settings = shopSettings || getShopSettings();
  const dateStr = new Date().toLocaleDateString();
  const jobNumber = repair.jobNumber || `REP-${Date.now().toString().slice(-6)}`;

  const items: InvoiceItem[] = [];

  // Service labor
  if (repair.serviceCost && Number(repair.serviceCost) > 0) {
    items.push({
      description: `Service & Labor: ${repair.device?.brand || ""} ${repair.device?.model || "Device"} - ${repair.problemDescription || "Diagnostic & Repair"}`,
      quantity: 1,
      unitPrice: Number(repair.serviceCost),
      total: Number(repair.serviceCost),
    });
  } else {
    items.push({
      description: `Device Repair Service: ${repair.device?.brand || ""} ${repair.device?.model || "Device"} (${repair.problemDescription || "Standard Repair"})`,
      quantity: 1,
      unitPrice: totalCost || Number(repair.totalCost || 0),
      total: totalCost || Number(repair.totalCost || 0),
    });
  }

  // Parts used
  if (repair.partsUsed && Array.isArray(repair.partsUsed)) {
    for (const p of repair.partsUsed) {
      const partName = p.partName || p.productName || "Replacement Part";
      const q = Number(p.quantity || 1);
      const u = Number(p.unitPrice || 0);
      const t = Number(p.total || u * q);
      items.push({
        description: `Part: ${partName}`,
        quantity: q,
        unitPrice: u,
        total: t,
      });
    }
  }

  const grandTotal = totalCost !== undefined ? totalCost : Number(repair.totalCost || 0);
  const adv = advancePaid !== undefined ? advancePaid : Number(repair.advancePaid || 0);
  const bal = balanceDue !== undefined ? balanceDue : Math.max(0, grandTotal - adv);
  const paid = amountReceived ? Number(amountReceived) : grandTotal;

  const invDetails: InvoiceDetails = {
    invoiceTitle: "DEVICE REPAIR INVOICE",
    invoiceNumber: jobNumber,
    invoiceDate: dateStr,
    dueDate: "Paid Upon Collection",
    paymentMethod: repair.paymentMethod || "CASH",
    billFrom: {
      name: settings.shopName || "New Challenge (Pvt) Ltd",
      companyName: `${settings.shopName || "New Challenge (Pvt) Ltd"} Service Centre`,
      streetAddress: settings.address || "No 27, Katuwana Road, Homagama",
      cityZip: "Homagama, Western Province, Sri Lanka",
      phone: settings.phone || "0777309726 / 0777476279",
      email: settings.email || "hotlinephoneshop@gmail.com",
    },
    billTo: {
      name: repair.customer?.name || "Customer",
      companyName: `Device: ${repair.device?.brand || ""} ${repair.device?.model || ""}`,
      streetAddress: repair.device?.imei ? `IMEI: ${repair.device.imei}` : "Colombo, Sri Lanka",
      cityZip: "Western Province, Sri Lanka",
      phone: repair.customer?.phone || "—",
    },
    items,
    subtotal: grandTotal,
    taxOrDiscount: adv > 0 ? -adv : 0,
    taxOrDiscountLabel: adv > 0 ? "Advance Paid" : "Sales Tax",
    otherCharges: 0,
    total: adv > 0 ? bal : grandTotal,
    amountPaid: paid,
    balanceDue: change !== undefined ? change : 0,
    terms:
      "Thank you for trusting Hotline Cellular with your hardware service. Installed spare parts carry official repair warranty for 30 days from collection. Warranty does not cover accidental liquid damage, drop breakage, or unauthorized third-party tampering.",
  };

  return generateInvoiceHtmlFromDetails(invDetails);
}

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Standard 80mm / 58mm Thermal Bill Generator
 * Styled with center alignment, bold text, and prominent header branding
 */
export function generateSaleBillHtml(
  sale: any,
  shopSettings?: ShopSettings,
  customerName?: string,
  customerPhone?: string,
): string {
  const settings = shopSettings || getShopSettings();
  const shopName = settings.shopName || "New Challenge (Pvt) Ltd";
  const address = settings.address || "No 27, Katuwana Road, Homagama";
  const phone = settings.phone || "0777309726 / 0777476279";
  const email = settings.email || "hotlinephoneshop@gmail.com";
  const footerMsg = settings.footerMessage || "Thank you for choosing Hotline Cellular!";

  const saleNumber = sale.saleNumber || "N/A";
  const saleDate = sale.createdAt ? new Date(sale.createdAt).toLocaleString() : new Date().toLocaleString();
  const custName = customerName || sale.customer?.name;
  const custPhone = customerPhone || sale.customer?.phone;

  const itemsHtml = sale.items && sale.items.length > 0
    ? sale.items
        .map((item: any) => {
          const name = escapeHtml(item.productName || item.name || "Item");
          const variant = item.variantName || item.variantDisplay ? escapeHtml(item.variantName || item.variantDisplay) : "";
          const serial = item.serialNumber || item.serial ? escapeHtml(item.serialNumber || item.serial) : "";
          const qty = Number(item.quantity || item.qty || 1);
          const price = Number(item.unitPrice || 0);
          const total = Number(item.total !== undefined ? item.total : qty * price);

          return `
            <div class="item-block">
              <div class="item-name">${name}${variant ? ` - ${variant}` : ""}</div>
              ${serial ? `<div class="item-serial">S/N: ${serial}</div>` : ""}
              <div class="item-calc">${qty} x Rs. ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = Rs. ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          `;
        })
        .join("")
    : `<div class="item-block"><div class="item-name">No items</div></div>`;

  const subtotal = Number(sale.subtotal || 0);
  const discountTotal = Number(sale.discountTotal || 0);
  const taxTotal = Number(sale.taxTotal || 0);
  const grandTotal = Number(sale.grandTotal || 0);
  const amountPaid = Number(sale.amountPaid || 0);
  const changeGiven = Number(sale.changeGiven || 0);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bill - ${escapeHtml(saleNumber)}</title>
    <style>
      @page {
        margin: 0;
        size: 7cm auto;
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 7cm;
        max-width: 7cm;
      }
      body {
        font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.25;
        color: #000000;
        background: #ffffff;
        margin: 0 auto;
        padding: 5px 2px;
        width: 7cm;
        max-width: 7cm;
        text-align: center;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .bill-container {
        width: 100%;
        max-width: 7cm;
        margin: 0 auto;
        text-align: center;
      }
      /* Top section: extra bold & prominent */
      .top-section {
        margin-bottom: 2px;
        text-align: center;
      }
      .shop-name {
        font-size: 16.5px;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 0 0 1px 0;
        line-height: 1.15;
      }
      .shop-info {
        font-size: 11px;
        font-weight: 800;
        margin: 1px 0;
        line-height: 1.2;
      }
      .divider-double {
        border-top: 1.5px dashed #000000;
        margin: 3px 0;
      }
      .divider-solid {
        border-top: 1px solid #000000;
        margin: 2px 0;
      }
      .bill-title {
        font-size: 13.5px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 1px 0;
        text-align: center;
      }
      .meta-section {
        font-size: 11px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.25;
        text-align: center;
      }
      .meta-line {
        margin: 1px 0;
      }
      .section-heading {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 1px 0;
        text-align: center;
      }
      .items-container {
        margin: 2px 0;
        text-align: center;
      }
      .item-block {
        margin-bottom: 3px;
        text-align: center;
      }
      .item-name {
        font-size: 12px;
        font-weight: 800;
        word-break: break-word;
      }
      .item-serial {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.4px;
        margin: 0.5px 0;
      }
      .item-calc {
        font-size: 11.5px;
        font-weight: 700;
      }
      .totals-container {
        font-size: 11.5px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.25;
        text-align: center;
      }
      .total-line {
        margin: 1px 0;
      }
      .grand-total {
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.5px;
        padding: 2px 0;
        margin: 1px 0;
        text-align: center;
      }
      .footer-section {
        margin-top: 3px;
        font-size: 11px;
        font-weight: 800;
        line-height: 1.25;
        text-align: center;
      }
      @media print {
        html, body {
          width: 7cm !important;
          max-width: 7cm !important;
          margin: 0 auto !important;
          padding: 2px 0 !important;
        }
        .bill-container {
          width: 7cm !important;
          max-width: 7cm !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="bill-container">
      <div class="top-section">
        <div class="shop-name">${escapeHtml(shopName)}</div>
        <div class="shop-info">${escapeHtml(address)}</div>
        <div class="shop-info">Phone: ${escapeHtml(phone)}</div>
        ${email ? `<div class="shop-info">Email: ${escapeHtml(email)}</div>` : ""}
      </div>

      <div class="divider-double"></div>
      <div class="bill-title">SALES RECEIPT / BILL</div>
      <div class="divider-double"></div>

      <div class="meta-section">
        <div class="meta-line">Receipt No: ${escapeHtml(saleNumber)}</div>
        <div class="meta-line">Date: ${escapeHtml(saleDate)}</div>
        ${custName ? `<div class="meta-line">Customer: ${escapeHtml(custName)}</div>` : ""}
        ${custPhone ? `<div class="meta-line">Phone: ${escapeHtml(custPhone)}</div>` : ""}
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">ITEMS</div>
      <div class="divider-solid"></div>

      <div class="items-container">
        ${itemsHtml}
      </div>

      <div class="divider-solid"></div>
      <div class="totals-container">
        <div class="total-line">Subtotal: Rs. ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        ${discountTotal > 0 ? `<div class="total-line">Discount: -Rs. ${discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>` : ""}
        <div class="total-line">Tax: Rs. ${taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      <div class="divider-solid"></div>
      <div class="grand-total">
        TOTAL: Rs. ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div class="divider-solid"></div>

      <div class="totals-container">
        <div class="total-line">Amount Paid: Rs. ${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="total-line">Change: Rs. ${changeGiven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      <div class="divider-double"></div>
      <div class="footer-section">
        ${escapeHtml(footerMsg)}
      </div>
      <div class="divider-double"></div>
    </div>
  </body>
</html>`;
}

/**
 * Standard 80mm / 58mm Repair Thermal Bill Generator
 * Styled with center alignment, bold text, and prominent header branding
 */
export function generateRepairBillHtml(
  repair: any,
  shopSettings?: ShopSettings,
  totalCost?: number,
  advancePaid?: number,
  balanceDue?: number,
  amountReceived?: string | number,
  change?: number,
): string {
  const settings = shopSettings || getShopSettings();
  const shopName = settings.shopName || "New Challenge (Pvt) Ltd";
  const address = settings.address || "No 27, Katuwana Road, Homagama";
  const phone = settings.phone || "0777309726 / 0777476279";
  const email = settings.email || "hotlinephoneshop@gmail.com";
  const footerMsg = settings.footerMessage || "Thank you for choosing Hotline Cellular!";

  const finalTotal = totalCost !== undefined ? totalCost : Number(repair.totalCost || 0);
  const finalAdvance = advancePaid !== undefined ? advancePaid : Number(repair.advancePaid || 0);
  const finalBalance = balanceDue !== undefined ? balanceDue : Math.max(0, finalTotal - finalAdvance);
  const receivedNum = amountReceived ? Number(amountReceived) : 0;
  const changeNum = change !== undefined ? change : 0;

  const jobNumber = repair.jobNumber || "N/A";
  const repairDate = new Date().toLocaleString();
  const customerName = repair.customer?.name || "Customer";
  const customerPhone = repair.customer?.phone || "—";
  const deviceStr = `${repair.device?.brand || ""} ${repair.device?.model || ""}`.trim() || "Device";
  const problem = repair.problemDescription || "Repair";
  const notes = repair.repairNotes;
  const laborCost = Number(repair.serviceCost || 0);
  const partsTotal = Number(repair.partsTotal || 0);

  const partsHtml = repair.partsUsed && Array.isArray(repair.partsUsed) && repair.partsUsed.length > 0
    ? repair.partsUsed.map((p: any) => {
        const name = escapeHtml(p.partName || p.productName || "Part");
        const qty = Number(p.quantity || 1);
        const price = Number(p.unitPrice || 0);
        const total = Number(p.total !== undefined ? p.total : qty * price);
        return `
          <div class="item-block">
            <div class="item-name">${name}</div>
            <div class="item-calc">${qty} x Rs. ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = Rs. ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        `;
      }).join("")
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Repair Bill - ${escapeHtml(jobNumber)}</title>
    <style>
      @page {
        margin: 0;
        size: 7cm auto;
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 7cm;
        max-width: 7cm;
      }
      body {
        font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.25;
        color: #000000;
        background: #ffffff;
        margin: 0 auto;
        padding: 5px 2px;
        width: 7cm;
        max-width: 7cm;
        text-align: center;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .bill-container {
        width: 100%;
        max-width: 7cm;
        margin: 0 auto;
        text-align: center;
      }
      /* Top section: extra bold & prominent */
      .top-section {
        margin-bottom: 2px;
        text-align: center;
      }
      .shop-name {
        font-size: 16.5px;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 0 0 1px 0;
        line-height: 1.15;
      }
      .shop-info {
        font-size: 11px;
        font-weight: 800;
        margin: 1px 0;
        line-height: 1.2;
      }
      .divider-double {
        border-top: 1.5px dashed #000000;
        margin: 3px 0;
      }
      .divider-solid {
        border-top: 1px solid #000000;
        margin: 2px 0;
      }
      .bill-title {
        font-size: 13.5px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 1px 0;
        text-align: center;
      }
      .meta-section {
        font-size: 11px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.25;
        text-align: center;
      }
      .meta-line {
        margin: 1px 0;
      }
      .section-heading {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 1px 0;
        text-align: center;
      }
      .items-container {
        margin: 2px 0;
        text-align: center;
      }
      .item-block {
        margin-bottom: 3px;
        text-align: center;
      }
      .item-name {
        font-size: 12px;
        font-weight: 800;
        word-break: break-word;
      }
      .item-calc {
        font-size: 11.5px;
        font-weight: 700;
      }
      .totals-container {
        font-size: 11.5px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.25;
        text-align: center;
      }
      .total-line {
        margin: 1px 0;
      }
      .grand-total {
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.5px;
        padding: 2px 0;
        margin: 1px 0;
        text-align: center;
      }
      .footer-section {
        margin-top: 3px;
        font-size: 11px;
        font-weight: 800;
        line-height: 1.25;
        text-align: center;
      }
      @media print {
        html, body {
          width: 7cm !important;
          max-width: 7cm !important;
          margin: 0 auto !important;
          padding: 2px 0 !important;
        }
        .bill-container {
          width: 7cm !important;
          max-width: 7cm !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="bill-container">
      <div class="top-section">
        <div class="shop-name">${escapeHtml(shopName)}</div>
        <div class="shop-info">${escapeHtml(address)}</div>
        <div class="shop-info">Phone: ${escapeHtml(phone)}</div>
        ${email ? `<div class="shop-info">Email: ${escapeHtml(email)}</div>` : ""}
      </div>

      <div class="divider-double"></div>
      <div class="bill-title">REPAIR COMPLETE RECEIPT</div>
      <div class="divider-double"></div>

      <div class="meta-section">
        <div class="meta-line">Job Number: ${escapeHtml(jobNumber)}</div>
        <div class="meta-line">Date: ${escapeHtml(repairDate)}</div>
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">CUSTOMER DETAILS</div>
      <div class="divider-solid"></div>
      <div class="meta-section">
        <div class="meta-line">Name: ${escapeHtml(customerName)}</div>
        <div class="meta-line">Phone: ${escapeHtml(customerPhone)}</div>
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">DEVICE DETAILS</div>
      <div class="divider-solid"></div>
      <div class="meta-section">
        <div class="meta-line">Device: ${escapeHtml(deviceStr)}</div>
        <div class="meta-line">Problem: ${escapeHtml(problem)}</div>
        ${notes ? `<div class="meta-line">Solution: ${escapeHtml(notes)}</div>` : ""}
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">COST BREAKDOWN</div>
      <div class="divider-solid"></div>
      <div class="totals-container">
        <div class="total-line">Labor Cost: Rs. ${laborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
      ${partsHtml ? `
        <div class="items-container">
          ${partsHtml}
        </div>
        <div class="totals-container">
          <div class="total-line">Parts Total: Rs. ${partsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      ` : ""}

      <div class="divider-solid"></div>
      <div class="grand-total">
        TOTAL COST: Rs. ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div class="divider-solid"></div>

      <div class="section-heading">PAYMENT</div>
      <div class="divider-solid"></div>
      <div class="totals-container">
        <div class="total-line">Advance Paid: Rs. ${finalAdvance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="total-line">Balance Due: Rs. ${finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="total-line">Amount Received: Rs. ${receivedNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        ${changeNum > 0 ? `<div class="total-line">Change: Rs. ${changeNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>` : ""}
      </div>

      <div class="divider-double"></div>
      <div class="footer-section">
        ${escapeHtml(footerMsg)}
      </div>
      <div class="divider-double"></div>
    </div>
  </body>
</html>`;
}

/**
 * Open print window and trigger print
 */
export function printDocument(html: string, title?: string, type: "bill" | "invoice" = "bill"): Window | null {
  const isInvoice = type === "invoice";
  const width = isInvoice ? 850 : 360;
  const height = isInvoice ? 1050 : 700;

  const printWindow = window.open("", "_blank", `width=${width},height=${height},scrollbars=yes`);
  if (printWindow) {
    printWindow.document.write(html);
    if (title) {
      printWindow.document.title = title;
    }
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  }
  return printWindow;
}
