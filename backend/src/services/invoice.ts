/**
 * Invoice Service
 * Handles invoice generation and management
 */

import { query } from '../db';

// In-memory storage for invoices (extends mock database)
const invoices: Map<string, any> = new Map();
const invoiceItems: Map<string, any[]> = new Map();

// Initialize with some sample invoices
const initInvoices = () => {
  const sampleInvoices = [
    {
      id: 'inv_001',
      user_id: 'user_demo',
      organization_id: 'org_demo',
      subscription_id: 'sub_demo',
      invoice_number: 'INV-2024-001',
      status: 'paid',
      amount: 990,
      currency: 'USD',
      subtotal: 990,
      tax_amount: 0,
      discount_amount: 0,
      due_date: new Date('2024-01-15').toISOString(),
      paid_at: new Date('2024-01-15').toISOString(),
      created_at: new Date('2024-01-01').toISOString(),
      billing_details: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Example Corp',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'US',
        taxId: '',
      },
    },
  ];

  sampleInvoices.forEach((inv) => {
    invoices.set(inv.id, inv);
    invoiceItems.set(inv.id, [
      {
        id: `item_${inv.id}_1`,
        invoice_id: inv.id,
        description: `${inv.id.includes('year') ? 'Annual' : 'Monthly'} Subscription - Professional Plan`,
        quantity: 1,
        unit_price: inv.amount,
        amount: inv.amount,
      },
    ]);
  });
};

initInvoices();

export interface InvoiceInput {
  userId: string;
  organizationId?: string;
  subscriptionId?: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  dueDate: Date;
  billingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    taxId?: string;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
}

export interface Invoice extends InvoiceInput {
  id: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

class InvoiceService {
  /**
   * Generate a new invoice
   */
  async generateInvoice(input: InvoiceInput): Promise<Invoice> {
    const id = `inv_${Date.now()}`;
    const now = new Date().toISOString();

    const invoice: Invoice = {
      ...input,
      id,
      currency: input.currency || 'USD',
      taxAmount: input.taxAmount || 0,
      discountAmount: input.discountAmount || 0,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };

    invoices.set(id, invoice);

    // Store invoice items
    const items = input.items.map((item, index) => ({
      id: `item_${id}_${index + 1}`,
      invoice_id: id,
      ...item,
    }));
    invoiceItems.set(id, items);

    return invoice;
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(id: string): Promise<Invoice | null> {
    return invoices.get(id) || null;
  }

  /**
   * Get invoice with items
   */
  async getInvoiceWithItems(id: string) {
    const invoice = invoices.get(id);
    if (!invoice) return null;

    const items = invoiceItems.get(id) || [];
    return { ...invoice, items };
  }

  /**
   * Get invoices for user
   */
  async getUserInvoices(userId: string): Promise<Invoice[]> {
    const userInvoices: Invoice[] = [];
    for (const invoice of invoices.values()) {
      if (invoice.user_id === userId) {
        userInvoices.push(invoice);
      }
    }
    return userInvoices.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string): Promise<Invoice | null> {
    const invoice = invoices.get(id);
    if (!invoice) return null;

    invoice.status = 'paid';
    invoice.paid_at = new Date().toISOString();
    invoice.updated_at = new Date().toISOString();

    invoices.set(id, invoice);
    return invoice;
  }

  /**
   * Generate invoice PDF content (returns HTML for PDF generation)
   */
  async generateInvoicePDF(invoiceId: string): Promise<string | null> {
    const invoice = await this.getInvoiceWithItems(invoiceId);
    if (!invoice) return null;

    const taxAmount = invoice.taxAmount || 0;
    const discountAmount = invoice.discountAmount || 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #10b981; }
          .invoice-title { font-size: 32px; margin: 20px 0; }
          .section { margin: 30px 0; }
          .label { font-weight: bold; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background-color: #f9fafb; }
          .totals { margin-top: 30px; text-align: right; }
          .total-row { margin: 10px 0; }
          .grand-total { font-size: 20px; font-weight: bold; color: #10b981; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🌿 Atlas Sanctum</div>
          <div class="invoice-title">INVOICE</div>
          <div>Invoice #: ${invoice.invoice_number}</div>
          <div>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
        </div>

        <div class="section">
          <h3>Bill To:</h3>
          <p>
            ${invoice.billingDetails.firstName} ${invoice.billingDetails.lastName}<br>
            ${invoice.billingDetails.company ? invoice.billingDetails.company + '<br>' : ''}
            ${invoice.billingDetails.address}<br>
            ${invoice.billingDetails.city}, ${invoice.billingDetails.state || ''} ${invoice.billingDetails.postalCode}<br>
            ${invoice.billingDetails.country}<br>
            ${invoice.billingDetails.email}
          </p>
        </div>

        <div class="section">
          <h3>Subscription Details</h3>
          <p><span class="label">Plan:</span> Professional Plan</p>
          <p><span class="label">Billing Period:</span> ${invoice.amount >= 500 ? 'Annual' : 'Monthly'}</p>
          <p><span class="label">Status:</span> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.unit_price.toFixed(2)}</td>
                <td>$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">Subtotal: $${invoice.subtotal.toFixed(2)}</div>
          ${discountAmount > 0 ? `<div class="total-row" style="color: #10b981;">Discount: -$${discountAmount.toFixed(2)}</div>` : ''}
          ${taxAmount > 0 ? `<div class="total-row">Tax: $${taxAmount.toFixed(2)}</div>` : ''}
          <div class="total-row grand-total">Total: $${invoice.amount.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Thank you for your subscription to Atlas Sanctum!</p>
          <p>For questions, contact: hello@atlassanctum.com</p>
          <p>Atlas Sanctum - Regenerating Earth's Future</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get next invoice number
   */
  async getNextInvoiceNumber(): Promise<string> {
    let maxNumber = 0;
    for (const invoice of invoices.values()) {
      const match = invoice.invoice_number.match(/INV-(\d+)-(\d+)/);
      if (match) {
        const num = parseInt(match[2], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }
    const year = new Date().getFullYear();
    return `INV-${year}-${String(maxNumber + 1).padStart(3, '0')}`;
  }

  // ─── Methods referenced by billing route ────────────────────────────────────

  async getOrganizationInvoices(organizationId: string, filters?: any) {
    // Return all invoices for org; extend with real DB query when schema is set
    return Array.from(invoices.values()).filter((inv: any) => inv.organization_id === organizationId);
  }

  async getInvoiceItems(invoiceId: string) {
    const inv = await this.getInvoiceWithItems(invoiceId);
    return inv?.items ?? [];
  }

  async downloadInvoicePDF(invoiceId: string): Promise<string | null> {
    return this.generateInvoicePDF(invoiceId);
  }

  async sendInvoiceEmail(invoiceId: string): Promise<{ success: boolean }> {
    const inv = await this.getInvoice(invoiceId);
    if (!inv) return { success: false };
    const { emailService } = await import('./email');
    return emailService.sendInvoiceEmail(inv.billing_email, inv.invoice_number, '', `${inv.invoice_number}.pdf`);
  }

  async getInvoiceStatistics(organizationId: string, startDate?: string, endDate?: string) {
    const all = Array.from(invoices.values()) as any[];
    const filtered = all.filter(i =>
      i.organization_id === organizationId &&
      (!startDate || i.created_at >= startDate) &&
      (!endDate || i.created_at <= endDate)
    );
    const paid = filtered.filter(i => i.status === 'paid');
    return {
      total: filtered.length,
      totalAmount: filtered.reduce((s: number, i: any) => s + (i.total || 0), 0),
      paid: paid.length,
      paidAmount: paid.reduce((s: number, i: any) => s + (i.total || 0), 0),
      outstanding: filtered.filter(i => i.status !== 'paid').length,
    };
  }

  async getInvoiceSettings(organizationId: string) {
    return {
      organizationId,
      currency: 'USD',
      taxRate: 0,
      paymentTerms: 30,
      notes: '',
    };
  }

  async updateInvoiceSettings(organizationId: string, settings: any) {
    // Persist in DB when schema is ready
    return { ...settings, organizationId, updatedAt: new Date().toISOString() };
  }
}

export const invoiceService = new InvoiceService();
