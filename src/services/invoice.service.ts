import InvoiceModel from "../models/invoice.model";
import MedicalStoreModel from "../models/medical_store.model";
import ClientModel from "../models/client.model";
import MedicalProductModel from "../models/medical_product.model";
import { Op } from "sequelize";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

let cachedBrowser: any = null;
let cachedLogoBase64: string | null = null;

function getLogoBase64(): string {
    if (cachedLogoBase64 !== null) {
        return cachedLogoBase64;
    }
    
    const possiblePaths = [
        path.join(process.cwd(), "src", "image (3).png"),
        path.join(process.cwd(), "dist", "image (3).png"),
        path.join(__dirname, "..", "image (3).png"),
        path.join(__dirname, "..", "..", "src", "image (3).png"),
    ];

    for (const p of possiblePaths) {
        try {
            if (fs.existsSync(p)) {
                cachedLogoBase64 = fs.readFileSync(p).toString("base64");
                return cachedLogoBase64;
            }
        } catch (_) {
            // Ignore
        }
    }
    
    cachedLogoBase64 = "";
    return cachedLogoBase64;
}

async function getSharedBrowser() {
    if (cachedBrowser) {
        try {
            const isConn = typeof cachedBrowser.isConnected === "function" 
                ? cachedBrowser.isConnected() 
                : Boolean(cachedBrowser.connected);
            if (isConn) {
                return cachedBrowser;
            }
        } catch (_) {
            cachedBrowser = null;
        }
    }
    try {
        cachedBrowser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu"
            ]
        });
        return cachedBrowser;
    } catch (e) {
        cachedBrowser = null;
        throw e;
    }
}

class InvoiceService {
    // CREATE INVOICE
    async createInvoice(data: any) {
        // Store the company-wise sequence once; the global id is independent.
        const maxCompanyInvoiceNumber: any = await InvoiceModel.max("company_invoice_number", {
            where: { medical_store_id: data.medical_store_id }
        });
        const companyInvoiceNumber = data.company_invoice_number || (Number(maxCompanyInvoiceNumber) || 0) + 1;
        const maxGlobalBillId: any = await InvoiceModel.max("global_bill_id");
        const globalBillId = data.global_bill_id || (Number(maxGlobalBillId) || 0) + 1;
        const invoiceNumber = data.invoice_number || `#${companyInvoiceNumber}`;

        // Calculate totals
        const items = Array.isArray(data.items) ? data.items : [];
        let subtotal = 0;
        let qtyTotal = 0;

        items.forEach((item: any) => {
            const qty = Number(item.quantity || 0);
            qtyTotal += qty;
            if (item.is_free) {
                item.selling_price = 0;
                item.amount = 0;
            } else {
                const price = Number(item.selling_price || item.price_per_unit || 0);
                const amt = qty * price;
                item.selling_price = price;
                item.amount = Number(amt.toFixed(2));
                subtotal += amt;
            }
        });

        const discount = Number(data.discount || 0);
        const gstRate = Number(data.gst_rate || 5.0); // Default 5%
        
        // taxable amount is subtotal - discount
        const taxableAmount = Math.max(0, subtotal - discount);
        const gstAmount = (taxableAmount * gstRate) / 100;
        const totalBeforeRound = taxableAmount + gstAmount;
        
        const grandTotal = Math.round(totalBeforeRound);
        const roundOff = Number((grandTotal - totalBeforeRound).toFixed(2));

        const receivedAmount = Number(data.received_amount || 0);
        const balanceDue = Math.max(0, grandTotal - receivedAmount);

        // Determine status automatically if not provided
        let status = data.status || "Pending";
        if (data.status === undefined) {
            if (balanceDue === 0) {
                status = "Paid";
            } else if (receivedAmount > 0) {
                status = "Partially Paid";
            } else {
                status = "Pending";
            }
        }

        const invoice = await InvoiceModel.create({
            client_id: data.client_id,
            medical_store_id: data.medical_store_id,
            invoice_number: invoiceNumber,
            company_invoice_number: companyInvoiceNumber,
            global_bill_id: globalBillId,
            date: data.date || new Date(),
            items,
            subtotal: Number(subtotal.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            gst_rate: gstRate,
            gst_amount: Number(gstAmount.toFixed(2)),
            taxable_amount: Number(taxableAmount.toFixed(2)),
            round_off: roundOff,
            grand_total: grandTotal,
            received_amount: receivedAmount,
            balance_due: balanceDue,
            payment_type: data.payment_type || "UPI",
            status,
            notes: data.notes || null
        });

        // Reduce product stock in database
        for (const item of items) {
            const qty = Number(item.quantity || 0);
            if (qty > 0 && item.product_title) {
                const product = await MedicalProductModel.findOne({
                    where: {
                        client_id: data.client_id,
                        product_title: item.product_title
                    }
                });
                if (product) {
                    const newQty = Math.max(0, product.quantity - qty);
                    await product.update({ quantity: newQty });
                }
            }
        }

        return await this.getInvoiceById(invoice.id, data.client_id);
    }

    // GET ALL INVOICES
    async getAllInvoices(query: any) {
        const whereCondition: any = {};

        if (query.client_id) {
            whereCondition.client_id = query.client_id;
        }

        if (query.medical_store_id) {
            whereCondition.medical_store_id = query.medical_store_id;
        }

        if (query.invoice_number) {
            whereCondition.invoice_number = {
                [Op.iLike]: `%${query.invoice_number}%`
            };
        }

        if (query.status) {
            whereCondition.status = query.status;
        }

        return await InvoiceModel.findAll({
            where: whereCondition,
            include: [
                {
                    model: MedicalStoreModel,
                    as: "medical_store"
                }
            ],
            order: [["date", "DESC"]]
        });
    }

    // GET INVOICE BY ID
    async getInvoiceById(id: string, clientId?: string) {
        const whereCondition: any = { id };
        if (clientId) {
            whereCondition.client_id = clientId;
        }

        return await InvoiceModel.findOne({
            where: whereCondition,
            include: [
                {
                    model: MedicalStoreModel,
                    as: "medical_store"
                },
                {
                    model: ClientModel,
                    as: "client"
                }
            ]
        });
    }

    // UPDATE INVOICE
    async updateInvoice(id: string, data: any) {
        const invoice = await this.getInvoiceById(id, data.client_id);
        if (!invoice) {
            throw new Error("Invoice not found");
        }

        const items = Array.isArray(data.items) ? data.items : invoice.items;
        let subtotal = 0;
        let qtyTotal = 0;

        items.forEach((item: any) => {
            const qty = Number(item.quantity || 0);
            qtyTotal += qty;
            if (item.is_free) {
                item.selling_price = 0;
                item.amount = 0;
            } else {
                const price = Number(item.selling_price || item.price_per_unit || 0);
                const amt = qty * price;
                item.selling_price = price;
                item.amount = Number(amt.toFixed(2));
                subtotal += amt;
            }
        });

        const discount = data.discount !== undefined ? Number(data.discount) : invoice.discount;
        const gstRate = data.gst_rate !== undefined ? Number(data.gst_rate) : invoice.gst_rate;
        
        const taxableAmount = Math.max(0, subtotal - discount);
        const gstAmount = (taxableAmount * gstRate) / 100;
        const totalBeforeRound = taxableAmount + gstAmount;
        
        const grandTotal = Math.round(totalBeforeRound);
        const roundOff = Number((grandTotal - totalBeforeRound).toFixed(2));

        const receivedAmount = data.received_amount !== undefined ? Number(data.received_amount) : invoice.received_amount;
        const balanceDue = Math.max(0, grandTotal - receivedAmount);

        let status = data.status || invoice.status;
        if (data.status === undefined && data.received_amount !== undefined) {
            if (balanceDue === 0) {
                status = "Paid";
            } else if (receivedAmount > 0) {
                status = "Partially Paid";
            } else {
                status = "Pending";
            }
        }

        await InvoiceModel.update(
            {
                invoice_number: data.invoice_number || invoice.invoice_number,
                date: data.date || invoice.date,
                items,
                subtotal: Number(subtotal.toFixed(2)),
                discount: Number(discount.toFixed(2)),
                gst_rate: gstRate,
                gst_amount: Number(gstAmount.toFixed(2)),
                taxable_amount: Number(taxableAmount.toFixed(2)),
                round_off: roundOff,
                grand_total: grandTotal,
                received_amount: receivedAmount,
                balance_due: balanceDue,
                payment_type: data.payment_type || invoice.payment_type,
                status,
                notes: data.notes !== undefined ? data.notes : invoice.notes
            },
            {
                where: { id }
            }
        );

        return await this.getInvoiceById(id, data.client_id);
    }

    // DELETE INVOICE
    async deleteInvoice(id: string, clientId?: string) {
        const whereCondition: any = { id };
        if (clientId) {
            whereCondition.client_id = clientId;
        }

        await InvoiceModel.destroy({
            where: whereCondition
        });

        return true;
    }

    // NUMBER TO WORDS
    numberToWords(num: number): string {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (num === 0) return "Zero";

        const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';

        let str = '';
        str += Number(n[1]) != 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
        str += Number(n[2]) != 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
        str += Number(n[3]) != 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
        str += Number(n[4]) != 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
        str += Number(n[5]) != 0 ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Rupees ' : 'Rupees ';
        
        return str.trim() + " only";
    }

    // HTML TEMPLATE RENDERER
    renderInvoiceHtml(invoice: any): string {
        const store = invoice.medical_store || {};
        const client = invoice.client || {};
        const logoBase64 = getLogoBase64();

        // Company Details
        const companyName = client.name || "ANIMEX ANIMAL HEALTH CARE PVT LTD";
        const companyAddress = client.address 
            ? `${client.address}, ${client.city || ""}` 
            : "0208/RVN Bahadurpur, Kopargaon Dist - A.Nagar 423605 Maharashtra";
        const companyPhone = client.phone || "8987999811";
        const companyEmail = client.email || "animexanimalhealthcare@gmail.com";
        const firstLetter = companyName.charAt(0);

        // Date format: DD-MM-YYYY
        const d = new Date(invoice.date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        // Items Loop
        let itemsHtml = "";
        let qtyTotal = 0;
        const items = Array.isArray(invoice.items) ? invoice.items : [];

        items.forEach((item: any, idx: number) => {
            qtyTotal += Number(item.quantity || 0);
            const isFree = item.is_free || false;
            
            itemsHtml += `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.product_title || item.product_description || ""} ${isFree ? '<span class="free-tag">FREE SCHEME</span>' : ''}</td>
              <td class="num">${item.quantity || 0}</td>
              <td>${item.unit || "-"}</td>
              <td class="num">₹ ${Number(item.mrp || 0).toFixed(2)}</td>
              <td class="num">₹ ${Number(item.selling_price || 0).toFixed(2)}</td>
              <td class="num">₹ ${Number(item.amount || 0).toFixed(2)}</td>
            </tr>
            `;
        });

        const invoiceAmountInWords = this.numberToWords(invoice.grand_total);
        const uppercaseStatus = (invoice.status || "Pending").toUpperCase();
        const displayInvoiceNumber = invoice.company_invoice_number
          ? `#${invoice.company_invoice_number}`
          : (invoice.invoice_number || "");
        
        // Status styling matching status colors
        let statusColor = "#a3660b";
        let statusBg = "#fbeecb";
        let statusBorder = "#edcf90";

        if (invoice.status === "Paid") {
            statusColor = "#155724";
            statusBg = "#d4edda";
            statusBorder = "#c3e6cb";
        } else if (invoice.status === "Cancelled") {
            statusColor = "#721c24";
            statusBg = "#f8d7da";
            statusBorder = "#f5c6cb";
        }

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Bill of Supply - ${companyName}</title>
<style>
  :root{
    --navy: #16345c;
    --navy-dark: #0d2340;
    --teal: #0f7a72;
    --orange: #e08a2b;
    --border: #cfd8e3;
    --bg: #eef1f5;
    --paper: #ffffff;
    --muted: #5b6b7c;
    --green-total: #0f7a72;
  }

  *{ box-sizing: border-box; }

  body{
    margin:0;
    background: var(--bg);
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    color: var(--navy-dark);
    padding: 24px;
  }

  .invoice-wrap{
    max-width: 780px;
    margin: 0 auto;
    background: var(--paper);
    border: 2px solid var(--navy);
    border-radius: 6px;
    padding: 24px 28px 28px;
  }

  .top-row{
    display:flex;
    justify-content: space-between;
    align-items:flex-start;
    margin-bottom: 6px;
  }

  .spec-badge{
    border: 1px solid var(--orange);
    color: var(--orange);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .5px;
    padding: 3px 10px;
    border-radius: 4px;
    display:inline-block;
  }

  .iso-badge{
    border: 1px solid var(--teal);
    color: var(--teal);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .3px;
    padding: 3px 10px;
    border-radius: 4px;
    white-space: nowrap;
  }

  h1.title{
    font-size: 22px;
    letter-spacing: 1px;
    color: var(--navy-dark);
    margin: 6px 0 16px;
    font-weight: 800;
  }

  hr.divider{
    border: none;
    border-top: 1px solid var(--border);
    margin: 0 0 16px;
  }

  .company-block{
    display:flex;
    gap: 14px;
    align-items:center;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }

  .logo{
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #2aa9c9, #123a63);
    display:flex;
    align-items:center;
    justify-content:center;
    color:#fff;
    font-weight:800;
    font-size: 22px;
    flex-shrink:0;
  }

  .logo-img{
    width: 54px;
    height: 54px;
    object-fit: contain;
    flex-shrink:0;
  }

  .company-info .cname{
    font-size: 17px;
    font-weight: 800;
    color: var(--navy-dark);
    margin-bottom: 2px;
  }

  .company-info .caddr,
  .company-info .cmeta{
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
  }

  .details-row{
    display:flex;
    gap: 16px;
    margin-bottom: 18px;
  }

  .details-box{
    flex:1;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 16px;
  }

  .details-box .box-title{
    font-size: 12px;
    font-weight: 700;
    color: var(--navy-dark);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: .3px;
  }

  .details-box .line{
    font-size: 13px;
    color: var(--navy-dark);
    margin-bottom: 4px;
  }

  .details-box .line.name{
    font-weight: 700;
  }

  .details-box .muted{
    color: var(--muted);
    font-size: 12.5px;
  }

  .status-pill{
    display:inline-block;
    margin-top: 6px;
    background: ${statusBg};
    color: ${statusColor};
    border: 1px solid ${statusBorder};
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 4px;
    letter-spacing: .3px;
  }

  table.items{
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4px;
    font-size: 12.5px;
  }

  table.items thead th{
    background: var(--navy);
    color: #fff;
    font-weight: 700;
    text-align: left;
    padding: 8px 8px;
    border: 1px solid var(--navy);
  }

  table.items thead th.num,
  table.items tbody td.num{
    text-align: right;
  }

  table.items tbody td{
    padding: 7px 8px;
    border: 1px solid var(--border);
    color: var(--navy-dark);
  }

  table.items tbody tr:nth-child(even){
    background: #f6f9fb;
  }

  .free-tag{
    background: #ffe1e1;
    color: #c23b3b;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 3px;
    margin-left: 6px;
  }

  .qty-total-row{
    display:flex;
    justify-content: space-between;
    align-items:center;
    border-top: 1px solid var(--border);
    padding-top: 8px;
    margin-bottom: 18px;
    font-size: 13px;
  }

  .qty-total-row .label{
    font-weight: 700;
  }

  .qty-total-row .subtotal{
    font-weight: 800;
    color: var(--navy-dark);
  }

  .bottom-grid{
    display:flex;
    gap: 18px;
    margin-bottom: 14px;
  }

  .quality-box{
    flex: 1.1;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 16px;
  }

  .quality-box .qtitle{
    font-size: 12.5px;
    font-weight: 700;
    color: var(--teal);
    margin-bottom: 6px;
  }

  .quality-box p{
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
    margin: 0 0 10px;
  }

  .totals-box{
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 13px;
  }

  .totals-box .row{
    display:flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .totals-box .row.grand{
    font-weight: 800;
    font-size: 15px;
    color: var(--green-total);
    border-top: 1px dashed var(--border);
    padding-top: 8px;
    margin-top: 6px;
  }

  .amount-words{
    background: #f6f9fb;
    border: 1px dashed var(--border);
    border-radius: 4px;
    padding: 8px 10px;
    font-size: 11.5px;
    font-style: italic;
    color: var(--navy-dark);
    margin: 8px 0;
  }

  .amount-words .lbl{
    font-style: normal;
    font-weight: 700;
    display:block;
    margin-bottom: 3px;
    color: var(--muted);
  }

  .balance-due{
    font-weight: 800;
    color: #c23b3b;
  }

  .thanks{
    font-size: 12px;
    color: var(--navy-dark);
    margin: 10px 0 16px;
    font-weight: 600;
  }

  .terms-row{
    display:flex;
    justify-content: space-between;
    align-items:flex-end;
    border-top: 1px solid var(--border);
    padding-top: 14px;
  }

  .terms-row .terms{
    font-size: 12px;
    color: var(--muted);
  }

  .terms-row .terms .ttitle{
    font-weight: 700;
    color: var(--navy-dark);
    margin-bottom: 4px;
  }

  .signature{
    text-align:center;
    font-size: 12px;
    color: var(--navy-dark);
  }

  .signature .for-line{
    font-weight: 700;
    margin-bottom: 36px;
  }

  .signature .sig-line{
    border-top: 1px solid var(--navy-dark);
    padding-top: 4px;
    font-size: 11px;
    color: var(--muted);
  }

  @media (max-width: 640px){
    .details-row, .bottom-grid{ flex-direction: column; }
    table.items{ font-size: 11px; }
  }
</style>
</head>
<body>

<div class="invoice-wrap">

  <div class="top-row">
    <span class="spec-badge">OFFICIAL SPECIFICATION SHEET</span>
    <span class="iso-badge">ISO 9001:2015 &amp; GMP CERTIFIED</span>
  </div>

  <h1 class="title">BILL OF SUPPLY</h1>
  <hr class="divider">

  <div class="company-block">
    ${logoBase64 
      ? `<img src="data:image/png;base64,${logoBase64}" class="logo-img" alt="Logo" />` 
      : `<div class="logo">${firstLetter}</div>`
    }
    <div class="company-info">
      <div class="cname">${companyName}</div>
      <div class="caddr">${companyAddress}</div>
      <div class="cmeta">Phone: ${companyPhone} &nbsp;&nbsp;|&nbsp;&nbsp; Email: ${companyEmail}</div>
    </div>
  </div>

  <div class="details-row">
    <div class="details-box">
      <div class="box-title">Bill To (Customer Details)</div>
      <div class="line name">${store.firm_name || "Unknown Store"}</div>
      <div class="line muted">Prop: ${store.contact_person_name || ""}</div>
      <div class="line muted">${store.address || ""}, ${store.district || ""}</div>
      <div class="line muted">📞 +91 ${store.phone_number || ""}</div>
    </div>
    <div class="details-box">
      <div class="box-title">Invoice Specifications</div>
      <div class="line">Invoice No: <strong>${displayInvoiceNumber}</strong></div>
      <div class="line">Date: ${dateStr}</div>
      <span class="status-pill">STATUS: ${uppercaseStatus} / ${invoice.payment_type}</span>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>#</th>
        <th>Product Description</th>
        <th class="num">Quantity</th>
        <th>Unit</th>
        <th class="num">MRP (₹)</th>
        <th class="num">Price / Unit (₹)</th>
        <th class="num">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="qty-total-row">
    <span class="label">TOTAL ITEMS QUANTITY: ${qtyTotal}</span>
    <span class="subtotal">SUBTOTAL: ₹ ${Number(invoice.subtotal).toFixed(2)}</span>
  </div>

  <div class="bottom-grid">
    <div class="quality-box">
      <div class="qtitle">✓ QUALITY GUARANTEE &amp; STANDARDS</div>
      <p>All formulations are manufactured under sterile GMP &amp; ISO certified micro-blender plants ensuring high bio-availability and zero cross-contamination.</p>
      <div class="thanks">Thank you for doing business with ${companyName}.</div>
    </div>

    <div class="totals-box">
      <div class="row"><span>Sub Total</span><span>: ₹ ${Number(invoice.subtotal).toFixed(2)}</span></div>
      ${invoice.discount > 0 ? `<div class="row"><span>Discount</span><span>: - ₹ ${Number(invoice.discount).toFixed(2)}</span></div>` : ''}
      <div class="row"><span>GST (${invoice.gst_rate}%)</span><span>: ₹ ${Number(invoice.gst_amount).toFixed(2)}</span></div>
      <div class="row grand"><span>Total Amount</span><span>: ₹ ${Number(invoice.grand_total).toFixed(2)}</span></div>

      <div class="amount-words">
        <span class="lbl">INVOICE AMOUNT IN WORDS:</span>
        "${invoiceAmountInWords}"
      </div>

      <div class="row"><span>Received Amount</span><span>: ₹ ${Number(invoice.received_amount).toFixed(2)}</span></div>
      <div class="row"><span>Balance Due</span><span class="balance-due">: ₹ ${Number(invoice.balance_due).toFixed(2)}</span></div>
    </div>
  </div>

  <div class="terms-row">
    <div class="terms">
      <div class="ttitle">TERMS AND CONDITIONS:</div>
      Thank you for doing business with us.
    </div>
    <div class="signature">
      <div class="for-line">For ${companyName}:</div>
      <div class="sig-line">Authorised Signatory</div>
    </div>
  </div>

</div>

</body>
</html>`;
    }

    // GENERATE PDF FROM INVOICE DATA
    async generateInvoicePdf(invoice: any): Promise<Buffer> {
        const htmlContent = this.renderInvoiceHtml(invoice);
        const browser = await getSharedBrowser();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "load" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "15px", bottom: "15px", left: "15px", right: "15px" }
        });
        await page.close();
        return pdfBuffer;
    }
}

export default new InvoiceService();
