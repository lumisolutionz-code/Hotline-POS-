import { ShopSettings, getShopSettings } from "./settings";
import { HOTLINE_LOGO_DATA_URL, HOTLINE_THERMAL_LOGO_DATA_URL } from "./logo";

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
    regNo?: string;
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
    email?: string;
    deviceInfo?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  taxOrDiscount?: number;
  taxOrDiscountLabel?: string;
  otherCharges?: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  terms?: string;
  warranty?: string;
  isPreprintedPaper?: boolean;
}

/**
 * Generate standard A4 printable Invoice HTML matching the user's structured template
 */
export function generateInvoiceHtmlFromDetails(inv: InvoiceDetails): string {
  const isPreprinted = inv.isPreprintedPaper !== undefined ? inv.isPreprintedPaper : true;
  const minRows = isPreprinted ? 4 : 5;
  const currentRowsCount = inv.items.length;
  const emptyRowsCount = Math.max(0, minRows - currentRowsCount);

  // Bill From shop info (placed in Header)
  const shopName = inv.billFrom?.companyName || inv.billFrom?.name || "Hotline Cellular";
  const shopRegNo = inv.billFrom?.regNo || "PV 00301591";
  const shopAddress = inv.billFrom?.streetAddress || "No 27, Katuwana Road, Homagama";
  const shopCity = inv.billFrom?.cityZip || "Western Province, Sri Lanka";
  const shopPhone = inv.billFrom?.phone || "0777309726 / 0777476279";
  const shopEmail = inv.billFrom?.email || "hotlinephoneshop@gmail.com";

  // Bill To customer info
  const custName = inv.billTo?.name || "Valued Customer";
  const custPhone = inv.billTo?.phone && inv.billTo.phone !== "—" && inv.billTo.phone !== "N/A" ? inv.billTo.phone : undefined;
  const custEmail = inv.billTo?.email && inv.billTo.email !== "-" ? inv.billTo.email : undefined;
  const custAddress = inv.billTo?.streetAddress && inv.billTo.streetAddress !== "-" ? inv.billTo.streetAddress : (inv.billTo?.cityZip && inv.billTo.cityZip !== "-" && inv.billTo.cityZip !== "Sri Lanka" ? inv.billTo.cityZip : undefined);
  const custDevice = inv.billTo?.deviceInfo;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${inv.invoiceTitle || "INVOICE"} - ${inv.invoiceNumber}</title>
  <style id="page-style">
    @page {
      size: A4 portrait;
      margin: ${isPreprinted ? "55mm 15mm 54mm 15mm" : "10mm 15mm 12mm 15mm"};
    }
  </style>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #ffffff;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      padding: 0;
      margin: 0;
    }
    .invoice-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
      padding: 10px 15px;
    }

    /* Screen Control Bar (Never Printed) */
    .screen-control-bar {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #2563eb;
      font-size: 12px;
      margin-bottom: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .mode-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 600;
      user-select: none;
    }
    .mode-checkbox {
      width: 16px;
      height: 16px;
      accent-color: #2563eb;
      cursor: pointer;
    }
    .print-btn {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .print-btn:hover {
      background: #1d4ed8;
    }

    /* Pre-printed stationery suppression */
    body.is-preprinted .stationery-element {
      display: none !important;
      visibility: hidden !important;
    }
    /* On-screen preview spacing matching physical A4 paper clearance */
    body.is-preprinted .invoice-container {
      padding-top: 55mm;
      padding-bottom: 54mm;
    }

    /* HEADER ROW (Relocated Bill From into Header) */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #0f172a;
    }
    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo-img {
      height: 48px;
      max-width: 160px;
      object-fit: contain;
      display: block;
    }
    .brand-bill-from {
      display: flex;
      flex-direction: column;
    }
    .brand-company-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .brand-address-line {
      font-size: 9.5px;
      color: #475569;
      font-weight: 600;
      margin-top: 1px;
    }
    .brand-contact-line {
      font-size: 9.5px;
      color: #1e40af;
      font-weight: 700;
      margin-top: 1px;
    }

    .header-doc-details {
      text-align: right;
    }
    .doc-title-text {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .doc-sub-text {
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
    }

    /* 2-COLUMN METADATA GRID (Bill To on left, Invoice Details on right) */
    .meta-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 18px;
      margin-bottom: 12px;
    }
    .meta-col {
      background: #ffffff;
    }
    .meta-col h3 {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 6px;
      padding-bottom: 3px;
      border-bottom: 1.5px solid #0f172a;
    }
    .meta-field {
      display: flex;
      font-size: 11px;
      margin-bottom: 3px;
      line-height: 1.35;
    }
    .meta-label {
      width: 90px;
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
      color: #0f172a;
    }

    /* Standard Grid Table */
    .table-wrap {
      margin-bottom: 10px;
    }
    table.invoice-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #334155;
      table-layout: fixed;
    }
    table.invoice-table th {
      background-color: #334155;
      color: #ffffff;
      font-weight: 700;
      font-size: 10px;
      padding: 5px 8px;
      border: 1px solid #334155;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    table.invoice-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      font-size: 10.5px;
      color: #1e293b;
      vertical-align: middle;
    }
    .col-desc { width: 52%; text-align: left; }
    .col-qty { width: 14%; text-align: center; }
    .col-price { width: 17%; text-align: right; }
    .col-total { width: 17%; text-align: right; }

    .empty-row td {
      color: transparent;
      user-select: none;
      height: 22px;
    }

    /* Summary Block */
    .summary-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }
    table.summary-table {
      width: 40%;
      min-width: 240px;
      border-collapse: collapse;
      border: 1px solid #334155;
    }
    table.summary-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 8px;
      font-size: 10.5px;
      height: 21px;
      vertical-align: middle;
    }
    .sum-label {
      font-weight: 600;
      color: #334155;
      width: 50%;
    }
    .sum-val {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
      width: 50%;
    }
    .sum-val.grand-total, .sum-label.grand-total {
      font-size: 12px;
      font-weight: 900;
      color: #0f172a;
      background: #f1f5f9;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
    }

    /* Bottom Section: Terms & Conditions and Footer Bar */
    .invoice-bottom-section {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-top: 10px;
    }
    .footer-divider-row {
      width: 100%;
      height: 2px;
      background: #0f172a;
      position: relative;
      margin-bottom: 8px;
    }
    .footer-divider-row::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 140px;
      height: 2px;
      background: #1e40af;
    }
    .terms-section {
      text-align: center;
      padding: 6px 10px;
      border-top: 1px dashed #cbd5e1;
      margin-bottom: 8px;
    }
    .terms-title {
      font-weight: 800;
      text-decoration: underline;
      margin-bottom: 3px;
      font-size: 10px;
      color: #0f172a;
    }
    .terms-text {
      font-size: 8.5px;
      color: #475569;
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.35;
    }

    /* Signatures Row */
    .signatures-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 8px;
      padding: 0 10px;
    }
    .sig-box {
      width: 44%;
      text-align: center;
    }
    .sig-space {
      height: 32px;
    }
    .sig-line {
      border-bottom: 1.5px dashed #94a3b8;
      height: 1px;
      margin-bottom: 5px;
    }
    .sig-label {
      font-size: 9px;
      font-weight: 700;
      color: #1e293b;
      text-transform: capitalize;
    }
    .sig-sub {
      font-size: 7.5px;
      color: #64748b;
    }

    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
    }
    .footer-seal {
      font-weight: 800;
      color: #0f172a;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      html, body {
        padding: 0 !important;
        margin: 0 !important;
        background: #ffffff !important;
        height: auto !important;
        min-height: auto !important;
      }
      .invoice-container {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      body.is-preprinted .stationery-element {
        display: none !important;
        visibility: hidden !important;
      }
      table.invoice-table th {
        background-color: #334155 !important;
        color: #ffffff !important;
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
  <script>
    function togglePreprinted(cb) {
      const pageStyle = document.getElementById('page-style');
      if (cb.checked) {
        document.body.classList.add('is-preprinted');
        if (pageStyle) {
          pageStyle.innerHTML = '@page { size: A4 portrait; margin: 55mm 15mm 54mm 15mm; }';
        }
      } else {
        document.body.classList.remove('is-preprinted');
        if (pageStyle) {
          pageStyle.innerHTML = '@page { size: A4 portrait; margin: 10mm 15mm 12mm 15mm; }';
        }
      }
    }
  </script>
</head>
<body class="${isPreprinted ? "is-preprinted" : ""}">
  <!-- Screen Control Bar -->
  <div class="no-print screen-control-bar">
    <label class="mode-label">
      <input
        type="checkbox"
        class="mode-checkbox"
        ${isPreprinted ? "checked" : ""}
        onchange="togglePreprinted(this)"
      />
      <span>Pre-printed Stationery Mode (Suppresses Header/Footer for Pre-printed Color Paper)</span>
    </label>
    <button class="print-btn" onclick="window.print()">Print Invoice</button>
  </div>

  <div class="invoice-container">
    <!-- Header Row (Stationery Element: Relocated Bill From Details) -->
    <div class="stationery-element header-row">
      <div class="brand-logo-wrap">
        <img class="brand-logo-img" src="${inv.logoUrl || HOTLINE_LOGO_DATA_URL}" alt="${escapeHtml(shopName)}" />
        <div class="brand-bill-from">
          <div class="brand-company-title">${escapeHtml(shopName)}</div>
          <div class="brand-address-line">${escapeHtml(shopAddress)}, ${escapeHtml(shopCity)}</div>
          <div class="brand-contact-line">Hotlines: ${escapeHtml(shopPhone)} | Reg No: ${escapeHtml(shopRegNo)}</div>
          <div class="brand-address-line" style="font-size: 8.5px; color: #475569;">${escapeHtml(shopEmail)}</div>
        </div>
      </div>
      <div class="header-doc-details">
        <div class="doc-title-text">${inv.invoiceTitle || "INVOICE"}</div>
        <div class="doc-sub-text">Original Customer Copy</div>
      </div>
    </div>

    <!-- 2-Column Metadata Info: Bill To (Left) & Invoice Details (Right) -->
    <div class="meta-grid">
      <!-- Bill To Column -->
      <div class="meta-col">
        <h3>Bill To</h3>
        <div class="meta-field">
          <span class="meta-label">Customer Name:</span>
          <span class="meta-val strong">${escapeHtml(custName)}</span>
        </div>
        ${custPhone ? `
        <div class="meta-field">
          <span class="meta-label">Contact No:</span>
          <span class="meta-val">${escapeHtml(custPhone)}</span>
        </div>` : ""}
        ${custEmail ? `
        <div class="meta-field">
          <span class="meta-label">Email:</span>
          <span class="meta-val">${escapeHtml(custEmail)}</span>
        </div>` : ""}
        ${custAddress ? `
        <div class="meta-field">
          <span class="meta-label">Address:</span>
          <span class="meta-val">${escapeHtml(custAddress)}</span>
        </div>` : ""}
        ${custDevice ? `
        <div class="meta-field">
          <span class="meta-label">Device Info:</span>
          <span class="meta-val strong" style="color: #0284c7;">${escapeHtml(custDevice)}</span>
        </div>` : ""}
      </div>

      <!-- Invoice Details Column -->
      <div class="meta-col">
        <h3>Invoice Details</h3>
        <div class="meta-field">
          <span class="meta-label">Invoice No:</span>
          <span class="meta-val strong">${escapeHtml(inv.invoiceNumber)}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Invoice Date:</span>
          <span class="meta-val">${escapeHtml(inv.invoiceDate)}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Status / Due:</span>
          <span class="meta-val">${escapeHtml(inv.dueDate || "Paid on Purchase")}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Payment:</span>
          <span class="meta-val">${escapeHtml(inv.paymentMethod || "CASH")}</span>
        </div>
        ${inv.warranty ? `
        <div class="meta-field">
          <span class="meta-label">Warranty:</span>
          <span class="meta-val strong" style="color: #0284c7;">${escapeHtml(inv.warranty)}</span>
        </div>` : ""}
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="invoice-table">
        <thead>
          <tr>
            <th class="col-desc">Description</th>
            <th class="col-qty">Quantity</th>
            <th class="col-price">Unit Price (Rs.)</th>
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
            inv.discount && inv.discount > 0
              ? `<tr>
            <td class="sum-label">Discount</td>
            <td class="sum-val" style="color: #e11d48; font-weight: 600;">Rs. - ${inv.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`
              : ""
          }
          ${
            inv.tax !== undefined
              ? `<tr>
            <td class="sum-label">Sales Tax</td>
            <td class="sum-val">Rs. ${inv.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`
              : inv.taxOrDiscount
              ? `<tr>
            <td class="sum-label">${escapeHtml(inv.taxOrDiscountLabel || "Sales Tax")}</td>
            <td class="sum-val">${inv.taxOrDiscount < 0 ? "Rs. - " + Math.abs(inv.taxOrDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Rs. " + inv.taxOrDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`
              : `<tr>
            <td class="sum-label">Sales Tax</td>
            <td class="sum-val">Rs. 0.00</td>
          </tr>`
          }
          ${
            inv.otherCharges && inv.otherCharges > 0
              ? `<tr>
            <td class="sum-label">Other</td>
            <td class="sum-val">Rs. ${inv.otherCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`
              : ""
          }
          <tr>
            <td class="sum-label grand-total">Grand Total</td>
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

    <!-- Bottom Section: Terms & Conditions and Footer Bar (Stationery Element) -->
    <div class="stationery-element invoice-bottom-section">
      <!-- Footer Divider Line Matching Header Divider Line -->
      <div class="footer-divider-row"></div>

      <!-- Terms & Conditions -->
      <div class="terms-section">
        <div class="terms-title">Terms & Conditions / Warranty Notice</div>
        <div class="terms-text">
          ${
            inv.terms ||
            `Thank you for your business. Please inspect your device and items upon receipt. All eligible phones, accessories, and repairs carry official warranty from ${escapeHtml(shopName)} as per stated coverage terms. Please retain this original invoice for warranty and claim validation.`
          }
        </div>
      </div>

      <!-- Signatures Row with Spacious Height -->
      <div class="signatures-row">
        <div class="sig-box">
          <div class="sig-space"></div>
          <div class="sig-line"></div>
          <div class="sig-label">Customer Signature & Acceptance</div>
          <div class="sig-sub">Received items in satisfactory order</div>
        </div>
        <div class="sig-box">
          <div class="sig-space"></div>
          <div class="sig-line"></div>
          <div class="sig-label">Authorized Signatory & Seal</div>
          <div class="sig-sub">Hotline Cellular • Homagama</div>
        </div>
      </div>

      <!-- Footer Bar -->
      <div class="footer-bar">
        <div class="footer-seal">
          &copy; Powered by Lumisolutionz
        </div>
        <div>Hotline Cellular • Original Invoice</div>
      </div>
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
  customerEmail?: string,
  isPreprintedPaper?: boolean,
): string {
  const settings = shopSettings || getShopSettings();
  const saleNumber = sale.saleNumber || `SAL-${Date.now().toString().slice(-6)}`;
  const dateStr = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  const hasMobile = hasMobilePhoneSale(sale);
  const warrantyText = hasMobile ? getSaleWarrantyText(sale) : "";

  const items: InvoiceItem[] = (sale.items || []).map((it: any) => {
    let desc = it.productName || it.name || "Item";
    const imei = it.imei1 || it.imei;
    const imei2 = it.imei2;
    const serial = it.serialNumber || it.serial;
    const isMobile = isMobilePhoneItem(it);

    if (imei) {
      desc += `<br/><span style="font-size: 10px; color: #475569; font-weight: 600;">IMEI: ${escapeHtml(imei)}${imei2 ? ` / ${escapeHtml(imei2)}` : ""}</span>`;
    } else if (serial) {
      desc += `<br/><span style="font-size: 10px; color: #475569; font-weight: 600;">S/N: ${escapeHtml(serial)}</span>`;
    }

    if (isMobile) {
      const itWarranty = getItemWarrantyText(it) || "1 Year Warranty";
      desc += `<br/><span style="font-size: 10px; color: #1e40af; font-weight: 700;">Warranty: ${escapeHtml(itWarranty)}</span>`;
    }

    return {
      description: desc,
      quantity: it.quantity || 1,
      unitPrice: Number(it.unitPrice || 0),
      total: Number(it.total || (Number(it.unitPrice || 0) * (it.quantity || 1))),
    };
  });

  const subtotal = Number(sale.subtotal || sale.grandTotal || 0);
  const discount = Number(sale.discountTotal || 0);
  const tax = Number(sale.tax || sale.taxTotal || 0);
  const grandTotal = Number(sale.grandTotal || (subtotal - discount + tax));
  const amountPaid = Number(sale.amountPaid || grandTotal);
  const changeGiven = Number(sale.changeGiven || 0);

  const custEmail = customerEmail || sale.customer?.email;

  const usePreprinted = isPreprintedPaper !== undefined
    ? isPreprintedPaper
    : (settings.usePreprintedPaper !== undefined ? settings.usePreprintedPaper : true);

  const invDetails: InvoiceDetails = {
    invoiceTitle: "SALES INVOICE",
    invoiceNumber: saleNumber,
    invoiceDate: dateStr,
    dueDate: "Paid in Full",
    paymentMethod: sale.paymentMethod || "CASH",
    warranty: hasMobile ? (warrantyText || "1 Year Warranty") : undefined,
    isPreprintedPaper: usePreprinted,
    billFrom: {
      name: settings.shopName || "Hotline Cellular",
      companyName: settings.shopName || "Hotline Cellular",
      regNo: settings.regNo || "PV 00301591",
      streetAddress: settings.address || "No 27, Katuwana Road, Homagama",
      cityZip: "Western Province, Sri Lanka",
      phone: settings.phone || "0777309726 / 0777476279",
      email: settings.email || "hotlinephoneshop@gmail.com",
    },
    billTo: {
      name: customerName?.trim() || (sale.customer?.name && sale.customer?.name !== "Walk-in Customer" ? sale.customer.name : "Walk-in Customer"),
      phone: customerPhone?.trim() || (sale.customer?.phone && sale.customer?.phone !== "N/A" ? sale.customer.phone : undefined),
      email: custEmail?.trim() && custEmail !== "-" ? custEmail.trim() : undefined,
      streetAddress: sale.customer?.address?.trim() && sale.customer?.address !== "-" ? sale.customer.address.trim() : undefined,
    },
    items,
    subtotal,
    discount,
    tax,
    otherCharges: 0,
    total: grandTotal,
    amountPaid,
    balanceDue: changeGiven,
    terms: hasMobile
      ? `Thank you for purchasing from Hotline Cellular. All genuine brand mobile phones include ${escapeHtml(warrantyText || "1 Year Warranty")}. Please retain this invoice for any service or warranty claims.`
      : "Thank you for purchasing from Hotline Cellular. Please inspect all items upon receipt. Retain this original invoice for your records.",
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
  isPreprintedPaper?: boolean,
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

  const usePreprinted = isPreprintedPaper !== undefined
    ? isPreprintedPaper
    : (settings.usePreprintedPaper !== undefined ? settings.usePreprintedPaper : true);

  const deviceBrand = repair.device?.brand || "";
  const deviceModel = repair.device?.model || "Device";
  const deviceImei = repair.device?.imei || repair.device?.serialNumber;
  const deviceInfoStr = `${deviceBrand} ${deviceModel}${deviceImei ? ` (IMEI: ${deviceImei})` : ""}`;

  const invDetails: InvoiceDetails = {
    invoiceTitle: "DEVICE REPAIR INVOICE",
    invoiceNumber: jobNumber,
    invoiceDate: dateStr,
    dueDate: "Paid Upon Collection",
    paymentMethod: repair.paymentMethod || "CASH",
    isPreprintedPaper: usePreprinted,
    billFrom: {
      name: settings.shopName || "Hotline Cellular",
      companyName: `${settings.shopName || "Hotline Cellular"} Service Centre`,
      regNo: settings.regNo || "PV 00301591",
      streetAddress: settings.address || "No 27, Katuwana Road, Homagama",
      cityZip: "Western Province, Sri Lanka",
      phone: settings.phone || "0777309726 / 0777476279",
      email: settings.email || "hotlinephoneshop@gmail.com",
    },
    billTo: {
      name: repair.customer?.name || "Valued Customer",
      phone: repair.customer?.phone && repair.customer?.phone !== "—" ? repair.customer.phone : undefined,
      email: repair.customer?.email || undefined,
      deviceInfo: deviceInfoStr,
      streetAddress: repair.customer?.address || undefined,
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
 * Truncate thermal bill product name if it is too long:
 * Shows the first 2 or 3 words followed by '...'
 */
export function truncateThermalItemName(rawName: string): string {
  if (!rawName) return "Item";
  const trimmed = rawName.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length > 5 || trimmed.length > 30) {
    if (words.length >= 4) {
      const fourWords = words.slice(0, 4).join(" ");
      if (fourWords.length <= 28) {
        return fourWords + "...";
      }
    }
    if (words.length >= 3) {
      const threeWords = words.slice(0, 3).join(" ");
      if (threeWords.length <= 26) {
        return threeWords + "...";
      }
    }
    return trimmed.slice(0, 24).trim() + "...";
  }

  return trimmed;
}

/**
 * Detect whether an item is a mobile phone or device
 */
export function isDeviceItem(item: any): boolean {
  if (!item) return false;
  if (item.imei1 || item.imei2 || item.imei) return true;
  if (item.trackingType && String(item.trackingType).toUpperCase() === "IMEI") return true;
  if (item.serialNumber && /^\d{14,16}$/.test(String(item.serialNumber).trim())) return true;
  const name = String(item.productName || item.name || "").toLowerCase();
  const cat = String(item.category?.name || item.categoryName || "").toLowerCase();
  if (cat.includes("phone") || cat.includes("device") || cat.includes("mobile") || cat.includes("tablet")) return true;
  if (/\b(iphone|samsung|galaxy|honor|xiaomi|redmi|pixel|oppo|vivo|realme|nokia|oneplus|tecno|infinix|huawei|poco|motorola|xperia)\b/i.test(name)) return true;
  return false;
}

/**
 * Detect whether a sale contains any phone / device items
 */
export function isPhoneSale(sale: any): boolean {
  if (!sale || !sale.items || !Array.isArray(sale.items) || sale.items.length === 0) return false;
  return sale.items.some((item: any) => isDeviceItem(item));
}

/**
 * Detect whether an item is specifically in the Mobile Phones category
 */
export function isMobilePhoneItem(item: any): boolean {
  if (!item) return false;
  const name = String(item.productName || item.name || "").toLowerCase();
  const rawCat = item.category?.name || item.categoryName || item.product?.category?.name || item.product?.category || item.category || item.mainCategory || "";
  const cat = (typeof rawCat === "string" ? rawCat : String(rawCat?.name || "")).toLowerCase();

  // 1. Definite accessory / non-phone keywords exclusion
  const accessoryPattern = /\b(cover|case|cable|charger|adapter|glass|tempered|pouch|holder|earphone|earbuds|headset|headphone|airpod|air\s*pods|speaker|battery|batteries|sim|reload|watch|smart\s*watch|mouse|power\s*bank|lens|aux|screen\s*protector|handsfree|dongle|back\s*cover)\b/i;
  if (accessoryPattern.test(name) || accessoryPattern.test(cat)) {
    return false;
  }

  // 2. Direct category check for Mobile Phones / Smart Phones
  if (
    cat.includes("mobile phone") ||
    cat.includes("mobile phones") ||
    cat.includes("smart phone") ||
    cat.includes("smartphone") ||
    cat === "mobile" ||
    cat === "phones"
  ) {
    return true;
  }

  // 3. Subcategories under mobile phones
  const phoneSubcats = ["apple iphone", "iphone", "samsung galaxy", "redmi", "poco", "oneplus", "honor", "vivo", "oppo", "pixel", "realme", "nokia", "huawei", "tecno", "infinix"];
  if (phoneSubcats.some(sc => cat.includes(sc))) {
    return true;
  }

  // 4. IMEI tracked items (in this system IMEI is strictly for mobile phones)
  if (item.trackingType && String(item.trackingType).toUpperCase() === "IMEI") {
    return true;
  }
  if (item.imei1 || item.imei || item.imei2) {
    return true;
  }

  // 5. Phone model / brand patterns in name
  const phoneBrandPattern = /\b(iphone|galaxy|redmi|poco|oneplus|pixel|vivo|oppo|realme|honor\s*[a-z0-9]|huawei|xiaomi|xperia|zenfone)\b/i;
  if (phoneBrandPattern.test(name)) {
    return true;
  }

  // 6. Generic phone name check (e.g. "Test Phone 001")
  if (/\bphone\b/i.test(name)) {
    return true;
  }

  return false;
}

/**
 * Detect whether a sale contains any items from the Mobile Phones category
 */
export function hasMobilePhoneSale(sale: any): boolean {
  if (!sale || !sale.items || !Array.isArray(sale.items) || sale.items.length === 0) return false;
  return sale.items.some((item: any) => isMobilePhoneItem(item));
}

// Backwards-compatible aliases
export const isSmartPhoneItem = isMobilePhoneItem;
export const hasSmartPhoneSale = hasMobilePhoneSale;

export interface DeviceVariants {
  ram?: string;
  storage?: string;
  color?: string;
}

/**
 * Extract specifically RAM, Storage, and Color variants for a device item
 */
export function extractDeviceVariants(item: any): DeviceVariants {
  const result: DeviceVariants = {};
  if (!item) return result;

  // Direct properties
  if (item.ram) result.ram = String(item.ram).trim();
  if (item.storage || item.rom) result.storage = String(item.storage || item.rom).trim();
  if (item.color) result.color = String(item.color).trim();

  const assignKeyVal = (rawKey: string, rawVal: string) => {
    if (!rawVal) return;
    const key = rawKey ? rawKey.trim().toLowerCase() : "";
    const val = rawVal.trim();
    if (!val) return;

    if (!result.ram && (key.includes("ram") || /\b\d+\s*gb\s*ram\b/i.test(val))) {
      result.ram = val.replace(/\s*ram\s*/i, "").trim();
      return;
    }
    if (!result.storage && (key.includes("storage") || key.includes("rom") || key.includes("capacity"))) {
      result.storage = val;
      return;
    }
    if (!result.color && (key.includes("color") || key.includes("colour"))) {
      result.color = val;
      return;
    }
  };

  const classifyVal = (val: string) => {
    if (!val) return;
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();

    // RAM check
    if (!result.ram && /\b\d+\s*gb\s*ram\b/i.test(trimmed)) {
      result.ram = trimmed;
      return;
    }

    // Size check: e.g. 8GB vs 128GB/256GB
    const sizeMatch = trimmed.match(/^(\d+)\s*(GB|TB)$/i);
    if (sizeMatch) {
      const num = parseInt(sizeMatch[1], 10);
      const unit = sizeMatch[2].toUpperCase();
      if (unit === "TB" || num >= 32) {
        if (!result.storage) {
          result.storage = trimmed;
          return;
        }
      } else if (num <= 24) {
        if (!result.ram) {
          result.ram = trimmed;
          return;
        }
      }
    }

    // Colors
    const knownColors = [
      "black", "white", "blue", "gold", "silver", "gray", "grey", "green", "purple",
      "pink", "red", "yellow", "titanium", "midnight", "starlight", "iceblue", "navy",
      "obsidian", "graphite", "bronze", "cyan", "cream", "lavender", "emerald", "orange"
    ];
    if (!result.color && knownColors.some(c => lower.includes(c))) {
      result.color = trimmed;
      return;
    }

    // Text that looks like a color name
    if (!result.color && !/\b(gb|tb|mb|ram|rom)\b/i.test(trimmed) && !/^\d+$/.test(trimmed)) {
      result.color = trimmed;
    }
  };

  // Inspect variantSnapshot attributes
  const attrs = item.variantSnapshot?.attributes || item.variant?.attributes || item.attributes;
  if (Array.isArray(attrs)) {
    for (const attr of attrs) {
      if (!attr) continue;
      if (typeof attr === "object") {
        const k = attr.key || attr.name || (typeof attr.typeId === "object" ? attr.typeId?.name : "") || "";
        const v = attr.value || attr.val || attr.name || "";
        if (k) {
          assignKeyVal(k, String(v));
        } else if (v) {
          classifyVal(String(v));
        }
      } else if (typeof attr === "string") {
        classifyVal(attr);
      }
    }
  } else if (attrs && typeof attrs === "object") {
    for (const [k, v] of Object.entries(attrs)) {
      if (typeof v === "string" || typeof v === "number") {
        assignKeyVal(k, String(v));
      }
    }
  }

  // Inspect display string if any missing
  const displayStr = item.variantSnapshot?.display || item.variantDisplay || item.variantName || "";
  if (displayStr && (!result.ram || !result.storage || !result.color)) {
    const parts = displayStr.split(/[\/\-|,\+]/).map((s: string) => s.trim()).filter(Boolean);
    for (const part of parts) {
      classifyVal(part);
    }
  }

  return result;
}

/**
 * Format warranty duration to human-friendly text (e.g., 1 Year Warranty)
 */
export function formatDurationMonths(months: number): string {
  if (months === 12) return "1 Year Warranty";
  if (months === 24) return "2 Years Warranty";
  if (months === 36) return "3 Years Warranty";
  if (months === 18) return "1.5 Years Warranty";
  if (months === 1) return "1 Month Warranty";
  if (months > 0 && months < 12) return `${months} Months Warranty`;
  if (months > 12 && months % 12 === 0) return `${months / 12} Years Warranty`;
  if (months > 0) return `${months} Months Warranty`;
  return "1 Year Warranty";
}

/**
 * Retrieve warranty text for an individual item, defaulting to "1 Year Warranty"
 */
export function getItemWarrantyText(item: any): string {
  if (!item) return "1 Year Warranty";
  if (item.warranty && typeof item.warranty === "object") {
    if (item.warranty.durationMonths) {
      return formatDurationMonths(Number(item.warranty.durationMonths));
    }
    if (item.warranty.description) return String(item.warranty.description);
  }
  const dur = item.warrantyDuration ?? item.durationMonths ?? item.product?.warrantyDuration;
  if (dur !== undefined && dur !== null && Number(dur) > 0) {
    return formatDurationMonths(Number(dur));
  }
  if (item.warrantyDescription) return String(item.warrantyDescription);
  return "1 Year Warranty";
}

/**
 * Retrieve sale warranty period text for mobile phone items, defaulting to "1 Year Warranty"
 */
export function getSaleWarrantyText(sale: any): string {
  if (sale && sale.items && Array.isArray(sale.items)) {
    // Check mobile phone items first
    for (const item of sale.items) {
      if (isMobilePhoneItem(item)) {
        return getItemWarrantyText(item);
      }
    }
    for (const item of sale.items) {
      const txt = getItemWarrantyText(item);
      if (txt) return txt;
    }
  }
  return "1 Year Warranty";
}

/**
 * Standard 80mm (7.8cm) Thermal Bill Generator
 * Styled with center alignment, bold text, and prominent header branding
 */
export function generateSaleBillHtml(
  sale: any,
  shopSettings?: ShopSettings,
  customerName?: string,
  customerPhone?: string,
  customerEmail?: string,
): string {
  const settings = shopSettings || getShopSettings();
  const shopName = settings.shopName || "New Challenge (Pvt) Ltd";
  const address = settings.address || "No 27, Katuwana Road, Homagama";
  const phone = settings.phone || "0777309726 / 0777476279";
  const email = settings.email || "hotlinephoneshop@gmail.com";

  const saleNumber = sale.saleNumber || "N/A";
  const saleDate = sale.createdAt ? new Date(sale.createdAt).toLocaleString() : new Date().toLocaleString();
  const rawCustName = (customerName !== undefined ? customerName : sale.customer?.name)?.trim() || "";
  const rawCustPhone = (customerPhone !== undefined ? customerPhone : sale.customer?.phone)?.trim() || "";
  const rawCustEmail = (customerEmail !== undefined ? customerEmail : sale.customer?.email)?.trim() || "";

  const custName = rawCustName && rawCustName !== "Walk-in Customer" ? rawCustName : "-";
  const custPhone = rawCustPhone && rawCustPhone !== "N/A" ? rawCustPhone : "-";
  const custEmail = rawCustEmail;

  const hasMobile = hasMobilePhoneSale(sale);
  const warrantyText = hasMobile ? getSaleWarrantyText(sale) : "";
  const isPhone = isPhoneSale(sale);

  const itemsHtml = sale.items && sale.items.length > 0
    ? sale.items
        .map((item: any) => {
          const rawName = item.productName || item.name || "Item";
          const isDevice = isDeviceItem(item);
          const variants = extractDeviceVariants(item);

          // Build variants line (only RAM, Storage, Color)
          const variantParts: string[] = [];
          if (variants.ram) variantParts.push(`RAM: ${variants.ram}`);
          if (variants.storage) variantParts.push(`Storage: ${variants.storage}`);
          if (variants.color) variantParts.push(`Color: ${variants.color}`);
          const variantLine = variantParts.join(" | ");

          // Clean display name
          const displayName = escapeHtml(rawName.trim());

          // Identifier: IMEI vs S/N
          const imei = item.imei1 || item.imei;
          const imei2 = item.imei2;
          const serial = item.serialNumber || item.serial;
          let identifierLine = "";
          if (imei) {
            identifierLine = `IMEI: ${escapeHtml(imei)}${imei2 ? ` / ${escapeHtml(imei2)}` : ""}`;
          } else if (serial) {
            if (isDevice || /^\d{14,16}$/.test(String(serial).trim())) {
              identifierLine = `IMEI: ${escapeHtml(serial)}`;
            } else {
              identifierLine = `S/N: ${escapeHtml(serial)}`;
            }
          }

          const qty = Number(item.quantity || item.qty || 1);
          const price = Number(item.unitPrice || 0);
          const itemDisc = Number(item.discount || 0);
          const total = Number(item.total !== undefined ? item.total : qty * price - itemDisc * qty);
          const calcDisc = itemDisc > 0 ? (itemDisc * qty) : Math.max(0, qty * price - total);

          return `
            <div class="item-block">
              <div class="item-row">
                <span class="item-name">${displayName}</span>
                <span class="item-amount">Rs. ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              ${variantLine ? `<div class="item-variant">${escapeHtml(variantLine)}</div>` : ""}
              ${identifierLine ? `<div class="item-identifier">${identifierLine}</div>` : ""}
              <div class="item-subrow">
                <span class="item-calc">${qty} x Rs. ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                ${calcDisc > 0 ? `<span class="item-disc">Disc: Rs. - ${calcDisc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>` : ""}
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="item-block"><div class="item-name">No items</div></div>`;

  const subtotal = Number(sale.subtotal || 0);
  const discountTotal = Number(sale.discountTotal !== undefined ? sale.discountTotal : (sale.discountAmount || 0));
  const taxTotal = Number(sale.tax || sale.taxTotal || 0);
  const grandTotal = Number(sale.grandTotal !== undefined ? sale.grandTotal : (sale.finalTotal !== undefined ? sale.finalTotal : (sale.total || 0)));
  let amountPaid = Number(sale.amountPaid || 0);
  if (!amountPaid && Array.isArray(sale.payments) && sale.payments.length > 0) {
    amountPaid = sale.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  }
  if (!amountPaid && grandTotal > 0) {
    amountPaid = grandTotal;
  }
  const changeGiven = Number(sale.changeGiven || 0);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bill - ${escapeHtml(saleNumber)}</title>
    <style>
      @page {
        margin: 0;
        size: 70mm auto;
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 70mm;
        max-width: 70mm;
      }
      body {
        font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.3;
        color: #000000;
        background: #ffffff;
        margin: 0 auto;
        padding: 5px 2px;
        width: 70mm;
        max-width: 70mm;
        text-align: center;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .bill-container {
        width: 100%;
        max-width: 70mm;
        margin: 0 auto;
        text-align: center;
      }
      .bill-container.phone-bill {
        min-height: 175mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 12mm 2mm 18mm 2mm;
      }
      .phone-bill .bill-spacer {
        flex: 1 1 auto;
        min-height: 12mm;
      }
      /* Top section: extra bold & prominent with Logo */
      .top-section {
        margin-bottom: 2px;
        text-align: center;
      }
      .thermal-logo-wrap {
        text-align: center;
        margin-bottom: 4px;
      }
      .thermal-logo {
        max-width: 52mm;
        max-height: 25mm;
        height: auto;
        display: block;
        margin: 0 auto;
        object-fit: contain;
        filter: grayscale(100%) contrast(150%);
        -webkit-filter: grayscale(100%) contrast(150%);
      }
      .shop-name {
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 0 0 1px 0;
        line-height: 1.15;
      }
      .shop-legal {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 1px 0;
      }
      .shop-reg {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        margin: 1px 0;
      }
      .shop-info {
        font-size: 12px;
        font-weight: 800;
        margin: 1px 0;
        line-height: 1.25;
      }
      .divider-double {
        border-top: 1.5px dashed #000000;
        margin: 3.5px 0;
      }
      .divider-solid {
        border-top: 1px solid #000000;
        margin: 2.5px 0;
      }
      .bill-title {
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 2px 0;
        text-align: center;
      }
      .meta-section {
        font-size: 12px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.35;
        width: 100%;
      }
      .meta-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 1.5px 0;
      }
      .meta-label {
        text-align: left;
      }
      .meta-val {
        text-align: right;
        white-space: nowrap;
      }
      .section-heading {
        font-size: 13.5px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 2px 0;
        text-align: center;
      }
      .items-container {
        margin: 3px 0;
        text-align: left;
        width: 100%;
      }
      .item-block {
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px dashed #000000;
        text-align: left;
        width: 100%;
      }
      .item-block:last-child {
        border-bottom: none;
        padding-bottom: 0;
        margin-bottom: 1px;
      }
      .item-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 6px;
        width: 100%;
      }
      .item-name {
        font-size: 13px;
        font-weight: 800;
        text-align: left;
        flex: 1;
        word-break: break-word;
        line-height: 1.25;
      }
      .item-amount {
        font-size: 13px;
        font-weight: 800;
        text-align: right;
        white-space: nowrap;
        margin-left: 6px;
      }
      .item-variant {
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.2px;
        text-align: left;
        margin-top: 1.5px;
        color: #111;
        word-break: break-word;
      }
      .item-identifier {
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.3px;
        text-align: left;
        margin-top: 1px;
        color: #000;
        word-break: break-all;
      }
      .item-subrow {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 700;
        color: #222;
        margin-top: 1.5px;
        width: 100%;
      }
      .item-calc {
        text-align: left;
      }
      .item-disc {
        text-align: right;
        font-weight: 800;
      }
      .totals-container {
        font-size: 13px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.35;
        width: 100%;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 1.5px 0;
      }
      .total-label {
        text-align: left;
      }
      .total-val {
        text-align: right;
        white-space: nowrap;
      }
      .grand-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 16.5px;
        font-weight: 900;
        letter-spacing: 0.5px;
        padding: 3px 0;
        margin: 1.5px 0;
      }
      .footer-section {
        margin-top: 4px;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.35;
        text-align: center;
      }
      .footer-line {
        margin: 1px 0;
      }
      .footer-brand {
        font-size: 13.5px;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 1.5px 0;
      }
      .footer-warranty {
        font-weight: 800;
        letter-spacing: 0.3px;
      }
      .powered-by {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.3px;
        text-align: center;
        padding: 2px 0;
        margin: 1px 0;
      }
      @media print {
        html, body {
          width: 70mm !important;
          max-width: 70mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        .bill-container {
          width: 70mm !important;
          max-width: 70mm !important;
        }
        .bill-container.phone-bill {
          min-height: 175mm !important;
          padding: 12mm 2mm 18mm 2mm !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="bill-container ${isPhone ? "phone-bill" : ""}">
      <div class="top-section">
        <div class="thermal-logo-wrap">
          <img class="thermal-logo" src="${HOTLINE_THERMAL_LOGO_DATA_URL}" alt="Hotline Cellular" />
        </div>
        <div class="shop-name">HOTLINE CELLULAR</div>
        <div class="shop-legal">${escapeHtml(shopName)}</div>
        <div class="shop-reg">Reg No: ${escapeHtml(settings.regNo || "PV 00301591")}</div>
        <div class="shop-info">${escapeHtml(address)}</div>
        <div class="shop-info">Hotlines: ${escapeHtml(phone)}</div>
        ${email ? `<div class="shop-info">Email: ${escapeHtml(email)}</div>` : ""}
      </div>

      <div class="divider-double"></div>
      <div class="bill-title">SALES RECEIPT / BILL</div>
      <div class="divider-double"></div>

      <div class="meta-section">
        <div class="meta-line"><span class="meta-label">Receipt No:</span><span class="meta-val">${escapeHtml(saleNumber)}</span></div>
        <div class="meta-line"><span class="meta-label">Date:</span><span class="meta-val">${escapeHtml(saleDate)}</span></div>
        <div class="meta-line"><span class="meta-label">Customer:</span><span class="meta-val">${escapeHtml(custName || "-")}</span></div>
        <div class="meta-line"><span class="meta-label">Phone:</span><span class="meta-val">${escapeHtml(custPhone || "-")}</span></div>
        ${custEmail ? `<div class="meta-line"><span class="meta-label">Email:</span><span class="meta-val">${escapeHtml(custEmail)}</span></div>` : ""}
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">ITEMS</div>
      <div class="divider-solid"></div>

      <div class="items-container">
        ${itemsHtml}
      </div>

      <div class="divider-solid"></div>
      <div class="totals-container">
        <div class="total-line">
          <span class="total-label">Subtotal:</span>
          <span class="total-val">Rs. ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ${discountTotal > 0 ? `
        <div class="total-line">
          <span class="total-label">Discount:</span>
          <span class="total-val">Rs. - ${discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>` : ""}
        ${taxTotal > 0 ? `
        <div class="total-line">
          <span class="total-label">Tax:</span>
          <span class="total-val">Rs. ${taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>` : ""}
      </div>

      <div class="divider-solid"></div>
      <div class="grand-total">
        <span>TOTAL:</span>
        <span>Rs. ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div class="divider-solid"></div>

      <div class="totals-container">
        <div class="total-line">
          <span class="total-label">Amount Paid:</span>
          <span class="total-val">Rs. ${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="total-line">
          <span class="total-label">Change:</span>
          <span class="total-val">Rs. ${changeGiven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      ${isPhone ? `<div class="bill-spacer"></div>` : ""}

      <div class="divider-double"></div>
      <div class="footer-section">
        <div class="footer-line">Thank you for shopping at</div>
        <div class="footer-line footer-brand">Hotline Cellular</div>
        ${hasMobile ? `
        <div class="footer-line footer-warranty">${escapeHtml(warrantyText || "1 Year Warranty")}</div>
        ` : ""}
      </div>
      <div class="divider-double"></div>
      <div class="powered-by">
        &copy; Powered by Lumisolutionz
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
  const shopName = settings.shopName || "Hotline Cellular";
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
        const rawName = p.partName || p.productName || "Part";
        const displayName = escapeHtml(truncateThermalItemName(rawName));
        const qty = Number(p.quantity || 1);
        const price = Number(p.unitPrice || 0);
        const total = Number(p.total !== undefined ? p.total : qty * price);
        return `
          <div class="item-block">
            <div class="item-row">
              <span class="item-name" title="${escapeHtml(rawName)}">${displayName}</span>
              <span class="item-amount">Rs. ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="item-subrow">
              <span class="item-calc">${qty} x Rs. ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
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
        size: 70mm auto;
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 70mm;
        max-width: 70mm;
      }
      body {
        font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.3;
        color: #000000;
        background: #ffffff;
        margin: 0 auto;
        padding: 5px 2px;
        width: 70mm;
        max-width: 70mm;
        text-align: center;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .bill-container {
        width: 100%;
        max-width: 70mm;
        margin: 0 auto;
        text-align: center;
      }
      /* Top section: extra bold & prominent with Logo */
      .top-section {
        margin-bottom: 2px;
        text-align: center;
      }
      .thermal-logo-wrap {
        text-align: center;
        margin-bottom: 4px;
      }
      .thermal-logo {
        max-width: 52mm;
        max-height: 25mm;
        height: auto;
        display: block;
        margin: 0 auto;
        object-fit: contain;
        filter: grayscale(100%) contrast(150%);
        -webkit-filter: grayscale(100%) contrast(150%);
      }
      .shop-name {
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 0 0 1px 0;
        line-height: 1.15;
      }
      .shop-legal {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 1px 0;
      }
      .shop-reg {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        margin: 1px 0;
      }
      .shop-info {
        font-size: 12px;
        font-weight: 800;
        margin: 1px 0;
        line-height: 1.25;
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
        line-height: 1.3;
        width: 100%;
      }
      .meta-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 1px 0;
      }
      .meta-label {
        text-align: left;
      }
      .meta-val {
        text-align: right;
        white-space: nowrap;
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
        text-align: left;
        width: 100%;
      }
      .item-block {
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px dashed #000000;
        text-align: left;
        width: 100%;
      }
      .item-block:last-child {
        border-bottom: none;
        padding-bottom: 0;
        margin-bottom: 1px;
      }
      .item-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 6px;
        width: 100%;
      }
      .item-name {
        font-size: 12px;
        font-weight: 800;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        max-width: 65%;
      }
      .item-amount {
        font-size: 12px;
        font-weight: 800;
        text-align: right;
        white-space: nowrap;
      }
      .item-subrow {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        color: #222;
        margin-top: 1px;
        width: 100%;
      }
      .item-calc {
        text-align: left;
      }
      .totals-container {
        font-size: 11.5px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.35;
        width: 100%;
      }
      .total-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 1px 0;
      }
      .total-label {
        text-align: left;
      }
      .total-val {
        text-align: right;
        white-space: nowrap;
      }
      .grand-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.5px;
        padding: 2px 0;
        margin: 1px 0;
      }
      .footer-section {
        margin-top: 3px;
        font-size: 11px;
        font-weight: 800;
        line-height: 1.25;
        text-align: center;
      }
      .powered-by {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.3px;
        text-align: center;
        padding: 2px 0;
        margin: 1px 0;
      }
      @media print {
        html, body {
          width: 70mm !important;
          max-width: 70mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        .bill-container {
          width: 70mm !important;
          max-width: 70mm !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="bill-container">
      <div class="top-section">
        <div class="thermal-logo-wrap">
          <img class="thermal-logo" src="${HOTLINE_THERMAL_LOGO_DATA_URL}" alt="Hotline Cellular" />
        </div>
        <div class="shop-name">HOTLINE CELLULAR</div>
        <div class="shop-legal">${escapeHtml(shopName)}</div>
        <div class="shop-reg">Reg No: ${escapeHtml(settings.regNo || "PV 00301591")}</div>
        <div class="shop-info">${escapeHtml(address)}</div>
        <div class="shop-info">Hotlines: ${escapeHtml(phone)}</div>
        ${email ? `<div class="shop-info">Email: ${escapeHtml(email)}</div>` : ""}
      </div>

      <div class="divider-double"></div>
      <div class="bill-title">REPAIR COMPLETE RECEIPT</div>
      <div class="divider-double"></div>

      <div class="meta-section">
        <div class="meta-line"><span class="meta-label">Job Number:</span><span class="meta-val">${escapeHtml(jobNumber)}</span></div>
        <div class="meta-line"><span class="meta-label">Date:</span><span class="meta-val">${escapeHtml(repairDate)}</span></div>
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">CUSTOMER DETAILS</div>
      <div class="divider-solid"></div>
      <div class="meta-section">
        <div class="meta-line"><span class="meta-label">Name:</span><span class="meta-val">${escapeHtml(customerName)}</span></div>
        <div class="meta-line"><span class="meta-label">Phone:</span><span class="meta-val">${escapeHtml(customerPhone)}</span></div>
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">DEVICE DETAILS</div>
      <div class="divider-solid"></div>
      <div class="meta-section">
        <div class="meta-line"><span class="meta-label">Device:</span><span class="meta-val">${escapeHtml(deviceStr)}</span></div>
        <div class="meta-line"><span class="meta-label">Problem:</span><span class="meta-val">${escapeHtml(problem)}</span></div>
        ${notes ? `<div class="meta-line"><span class="meta-label">Solution:</span><span class="meta-val">${escapeHtml(notes)}</span></div>` : ""}
      </div>

      <div class="divider-solid"></div>
      <div class="section-heading">COST BREAKDOWN</div>
      <div class="divider-solid"></div>
      <div class="totals-container">
        <div class="total-line">
          <span class="total-label">Labor Cost:</span>
          <span class="total-val">Rs. ${laborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      ${partsHtml ? `
        <div class="items-container">
          ${partsHtml}
        </div>
        <div class="totals-container">
          <div class="total-line">
            <span class="total-label">Parts Total:</span>
            <span class="total-val">Rs. ${partsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      ` : ""}

      <div class="divider-solid"></div>
      <div class="grand-total">
        <span>TOTAL COST:</span>
        <span>Rs. ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div class="divider-solid"></div>

      <div class="section-heading">PAYMENT</div>
      <div class="divider-solid"></div>
      <div class="totals-container">
        <div class="total-line">
          <span class="total-label">Advance Paid:</span>
          <span class="total-val">Rs. ${finalAdvance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="total-line">
          <span class="total-label">Balance Due:</span>
          <span class="total-val">Rs. ${finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="total-line">
          <span class="total-label">Amount Received:</span>
          <span class="total-val">Rs. ${receivedNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ${changeNum > 0 ? `
        <div class="total-line">
          <span class="total-label">Change:</span>
          <span class="total-val">Rs. ${changeNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>` : ""}
      </div>

      <div class="divider-double"></div>
      <div class="footer-section">
        ${escapeHtml(footerMsg)}
      </div>
      <div class="divider-double"></div>
      <div class="powered-by">
        &copy; Powered by Lumisolutionz
      </div>
      <div class="divider-double"></div>
    </div>
  </body>
</html>`;
}

/**
 * Daily Sales Register / Shift Report Generator (80mm / 58mm Thermal Receipt format)
 * Prints all sales occurred today from 12:00 AM to the current time.
 * Lists every sale individually (showing sale number, item name, count/qty, price, and line total).
 * Shows overall summary totals at the bottom (total sales count, total items sold, total revenue).
 */
export function generateDailySalesReportHtml(
  sales: any[],
  startDate: Date,
  endDate: Date,
  shopSettings?: ShopSettings,
  user?: any
): string {
  const settings = shopSettings || getShopSettings();
  const shopName = settings.shopName || "Hotline Cellular";
  const address = settings.address || "No 27, Katuwana Road, Homagama";
  const phone = settings.phone || "0777309726 / 0777476279";

  const dateStr = startDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const startTimeStr = "12:00 AM";
  const endTimeStr = endDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const printedAtStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const cashierName = user?.username || user?.name || "Cashier";

  let totalSalesCount = 0;
  let totalItemsCount = 0;
  let grandTotalAmount = 0;
  let totalChangeGiven = 0;
  let changeTransactionsCount = 0;
  const paymentBreakdown: { [key: string]: number } = {};

  const salesHtml = sales.map((sale: any, idx: number) => {
    totalSalesCount += 1;
    const saleNum = sale.saleNumber || ("#" + (sale._id ? String(sale._id).slice(-6) : idx + 1));
    const saleTime = sale.createdAt
      ? new Date(sale.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      : "";
    const custName = sale.customer?.name || sale.client?.name || "";
    const saleTotal = Number(sale.grandTotal !== undefined ? sale.grandTotal : (sale.total || 0));
    grandTotalAmount += saleTotal;

    // Track change given for this sale
    let saleChange = Number(
      sale.changeGiven !== undefined
        ? sale.changeGiven
        : (sale.change !== undefined ? sale.change : 0)
    );
    if (!saleChange || isNaN(saleChange) || saleChange <= 0) {
      const totalPaid = Array.isArray(sale.payments) && sale.payments.length > 0
        ? sale.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
        : Number(sale.amountPaid || 0);
      if (totalPaid > saleTotal) {
        saleChange = totalPaid - saleTotal;
      }
    }
    if (saleChange > 0) {
      totalChangeGiven += saleChange;
      changeTransactionsCount += 1;
    }

    // Track payment breakdown
    if (Array.isArray(sale.payments) && sale.payments.length > 0) {
      sale.payments.forEach((p: any) => {
        const method = (p.method || "OTHER").toUpperCase();
        paymentBreakdown[method] = (paymentBreakdown[method] || 0) + Number(p.amount || 0);
      });
    } else {
      paymentBreakdown["CASH"] = (paymentBreakdown["CASH"] || 0) + saleTotal;
    }

    const items = Array.isArray(sale.items) ? sale.items : [];
    const itemsHtml = items.map((item: any) => {
      const rawName = item.productName || item.name || "Item";
      const variant = item.variantName || item.variantDisplay || "";
      const fullName = variant ? `${rawName} (${variant})` : rawName;
      const displayName = escapeHtml(truncateThermalItemName(fullName));
      const qty = Number(item.quantity || item.qty || 1);
      totalItemsCount += qty;
      const unitPrice = Number(item.unitPrice || 0);
      const itemDisc = Number(item.discount || 0);
      const itemTotal = Number(item.total !== undefined ? item.total : qty * unitPrice - itemDisc * qty);
      const serialOrImei = item.imei1 || item.serialNumber || item.serial || "";
      const lineDisc = itemDisc > 0 ? (itemDisc * qty) : Math.max(0, (qty * unitPrice) - itemTotal);

      return `
        <div class="sale-item-row">
          <div class="sale-item-top">
            <span class="sale-item-name" title="${escapeHtml(fullName)}">${displayName}</span>
            <span class="sale-item-total">Rs. ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ${serialOrImei ? `<div class="sale-item-serial">S/N: ${escapeHtml(serialOrImei)}</div>` : ""}
          <div class="sale-item-sub">
            <span class="sale-item-calc">${qty} x Rs. ${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            ${lineDisc > 0 ? `<span class="sale-item-disc">Disc: Rs. - ${lineDisc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>` : ""}
          </div>
        </div>
      `;
    }).join("");

    const saleDiscount = Number(sale.discountTotal || sale.discountValue || 0);
    const totalItemsDisc = items.reduce((sum: number, itm: any) => {
      const q = Number(itm.quantity || itm.qty || 1);
      const u = Number(itm.unitPrice || 0);
      const d = Number(itm.discount || 0);
      const t = Number(itm.total !== undefined ? itm.total : q * u - d * q);
      return sum + (d > 0 ? d * q : Math.max(0, q * u - t));
    }, 0);
    const overallSaleDisc = Math.max(0, saleDiscount - totalItemsDisc);

    return `
      <div class="sale-block">
        <div class="sale-block-header">
          <span class="sale-badge">${idx + 1}. ${escapeHtml(saleNum)}</span>
          <span class="sale-time">${saleTime}</span>
        </div>
        ${custName ? `<div class="sale-cust">Customer: ${escapeHtml(custName)}</div>` : ""}
        <div class="sale-items-list">
          ${itemsHtml || '<div class="sale-item-row"><span class="sale-item-name">No items</span></div>'}
        </div>
        <div class="sale-subtotal-bar">
          <span class="subtotal-label">Sale Total:</span>
          <span class="subtotal-val">Rs. ${saleTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ${overallSaleDisc > 0 ? `
        <div class="sale-subtotal-bar" style="border-top: none; font-size: 10px; font-weight: 700; color: #444; margin-top: 1px;">
          <span class="subtotal-label">Discount:</span>
          <span class="subtotal-val">Rs. - ${overallSaleDisc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>` : ""}
        ${saleChange > 0 ? `
        <div class="sale-subtotal-bar" style="border-top: none; font-size: 10px; font-weight: 700; color: #444; margin-top: 1px;">
          <span class="subtotal-label">Change Given:</span>
          <span class="subtotal-val">Rs. ${saleChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>` : ""}
      </div>
      ${idx < sales.length - 1 ? '<div class="divider-dotted"></div>' : ""}
    `;
  }).join("");

  const paymentBreakdownHtml = Object.keys(paymentBreakdown).map((method) => {
    return `
      <div class="summary-line payment-line">
        <span class="summary-label">${method}:</span>
        <span class="summary-val">Rs. ${paymentBreakdown[method].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Daily Sales Report - ${escapeHtml(dateStr)}</title>
    <style>
      @page {
        margin: 0;
        size: 65mm auto;
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 70mm;
        max-width: 70mm;
      }
      body {
        font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
        font-size: 11.5px;
        font-weight: 700;
        line-height: 1.25;
        color: #000000;
        background: #ffffff;
        margin: 0 auto;
        padding: 5px 2px;
        width: 70mm;
        max-width: 70mm;
        text-align: center;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .bill-container {
        width: 100%;
        max-width: 70mm;
        margin: 0 auto;
        text-align: center;
      }
      .shop-name {
        font-size: 16px;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin: 0 0 1px 0;
        line-height: 1.15;
      }
      .shop-info {
        font-size: 10.5px;
        font-weight: 800;
        margin: 1px 0;
        line-height: 1.2;
      }
      .report-title {
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 2px 0;
        text-align: center;
      }
      .divider-double {
        border-top: 1.5px dashed #000000;
        margin: 4px 0;
      }
      .divider-solid {
        border-top: 1px solid #000000;
        margin: 3px 0;
      }
      .divider-dotted {
        border-top: 1px dotted #555555;
        margin: 4px 0;
      }
      .meta-section {
        font-size: 10.5px;
        font-weight: 700;
        margin: 2px 0;
        line-height: 1.3;
        width: 100%;
      }
      .meta-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 1px 0;
      }
      .meta-label {
        text-align: left;
      }
      .meta-val {
        text-align: right;
        white-space: nowrap;
      }
      .sales-container {
        margin: 4px 0;
        text-align: left;
        width: 100%;
      }
      .sale-block {
        margin-bottom: 3px;
        padding: 1px 0;
      }
      .sale-block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 900;
        margin-bottom: 2px;
      }
      .sale-badge {
        text-align: left;
        color: #000000;
      }
      .sale-time {
        text-align: right;
        font-size: 10px;
        font-weight: 800;
      }
      .sale-cust {
        font-size: 10px;
        font-weight: 700;
        color: #333333;
        margin-bottom: 2px;
      }
      .sale-items-list {
        padding-left: 6px;
      }
      .sale-item-row {
        margin-bottom: 2px;
      }
      .sale-item-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 4px;
      }
      .sale-item-name {
        font-size: 11px;
        font-weight: 800;
        text-align: left;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sale-item-total {
        font-size: 11px;
        font-weight: 800;
        text-align: right;
        white-space: nowrap;
      }
      .sale-item-serial {
        font-size: 9.5px;
        font-weight: 700;
        color: #222222;
        margin-top: 1px;
      }
      .sale-item-sub {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        font-weight: 700;
        color: #333333;
      }
      .sale-item-calc {
        text-align: left;
      }
      .sale-item-disc {
        text-align: right;
        font-size: 9.5px;
        font-weight: 800;
        color: #222222;
      }
      .sale-subtotal-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 900;
        margin-top: 2px;
        padding-top: 2px;
        border-top: 0.5px solid #666666;
      }
      .summary-section {
        margin: 4px 0;
        font-size: 11px;
        font-weight: 800;
        width: 100%;
      }
      .summary-title {
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        margin-bottom: 3px;
        text-align: center;
      }
      .summary-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1.5px 0;
      }
      .summary-label {
        text-align: left;
      }
      .summary-val {
        text-align: right;
        white-space: nowrap;
      }
      .grand-total-box {
        margin: 3px 0;
        padding: 2px 0;
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
      }
      .grand-total-box .summary-line {
        font-size: 12px;
        font-weight: 900;
      }
      .grand-total-box .change-line {
        font-size: 11px;
        font-weight: 800;
        margin-top: 2px;
        padding-top: 2px;
        border-top: 0.5px dashed #000000;
      }
      .payment-line {
        font-size: 10.5px;
        font-weight: 700;
        color: #222222;
      }
      .powered-by {
        font-size: 9.5px;
        font-weight: 800;
        text-align: center;
        color: #111111;
        letter-spacing: 0.4px;
        margin: 4px 0 2px 0;
      }
      @media print {
        @page {
          margin: 0;
          size: 70mm auto;
        }
        html, body {
          width: 70mm !important;
          max-width: 70mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        .bill-container {
          width: 70mm !important;
          max-width: 70mm !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="bill-container">
      <div class="top-section">
        <h1 class="shop-name">${escapeHtml(shopName)}</h1>
        <div class="shop-info">${escapeHtml(address)}</div>
        <div class="shop-info">Tel: ${escapeHtml(phone)}</div>
      </div>

      <div class="divider-double"></div>
      <div class="report-title">TODAY'S SALES REPORT</div>
      <div class="divider-solid"></div>

      <div class="meta-section">
        <div class="meta-line">
          <span class="meta-label">Date:</span>
          <span class="meta-val">${escapeHtml(dateStr)}</span>
        </div>
        <div class="meta-line">
          <span class="meta-label">Range:</span>
          <span class="meta-val">${startTimeStr} - ${endTimeStr}</span>
        </div>
        <div class="meta-line">
          <span class="meta-label">Printed At:</span>
          <span class="meta-val">${printedAtStr}</span>
        </div>
        <div class="meta-line">
          <span class="meta-label">Staff:</span>
          <span class="meta-val">${escapeHtml(cashierName)}</span>
        </div>
      </div>

      <div class="divider-double"></div>
      <div class="summary-title">SALES TRANSACTIONS (${totalSalesCount})</div>
      <div class="divider-solid"></div>

      <div class="sales-container">
        ${salesHtml}
      </div>

      <div class="divider-double"></div>
      <div class="summary-section">
        <div class="summary-title">FINAL SUMMARY</div>
        <div class="divider-solid"></div>
        <div class="summary-line">
          <span class="summary-label">Total Sales:</span>
          <span class="summary-val">${totalSalesCount}</span>
        </div>
        <div class="summary-line">
          <span class="summary-label">Total Items Sold:</span>
          <span class="summary-val">${totalItemsCount}</span>
        </div>
        <div class="grand-total-box">
          <div class="summary-line">
            <span class="summary-label">TOTAL REVENUE:</span>
            <span class="summary-val">Rs. ${grandTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-line change-line">
            <span class="summary-label">TOTAL CHANGE GIVEN${changeTransactionsCount > 0 ? ` (${changeTransactionsCount})` : ""}:</span>
            <span class="summary-val">Rs. ${totalChangeGiven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        ${paymentBreakdownHtml ? `
          <div style="margin-top: 3px; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase;">Payment Breakdown:</div>
          ${paymentBreakdownHtml}
          ${totalChangeGiven > 0 ? `
          <div class="summary-line payment-line" style="color: #444;">
            <span class="summary-label">CHANGE GIVEN:</span>
            <span class="summary-val">Rs. - ${totalChangeGiven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ${paymentBreakdown["CASH"] ? `
          <div class="summary-line payment-line" style="font-weight: 900; border-top: 0.5px dashed #666; margin-top: 2px; padding-top: 2px;">
            <span class="summary-label">NET CASH IN DRAWER:</span>
            <span class="summary-val">Rs. ${Math.max(0, paymentBreakdown["CASH"] - totalChangeGiven).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>` : ""}
          ` : ""}
        ` : ""}
      </div>

      <div class="divider-double"></div>
      <div class="powered-by">
        &copy; Powered by Lumisolutionz
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
