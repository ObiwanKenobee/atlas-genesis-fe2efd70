/**
 * Invoice Service
 * 
 * Enterprise invoice service with Stripe integration for invoice management,
 * PDF generation, and billing operations.
 */

import Stripe from 'stripe';
import { query } from '../db';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export interface Invoice {
  id: string;
  userId: string;
  organizationId: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  invoiceNumber: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: Date;
}

export interface InvoiceSettings {
  id: string;
  organizationId: string;
  invoicePrefix: string;
  invoiceNumber: number;
  defaultPaymentTerms: number;
  taxRate: number;
  taxId?: string;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  logoUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceService {
  /**
   * Create invoice from Stripe webhook
   */
  async createInvoiceFromStripe(
    stripeInvoice: Stripe.Invoice,
    userId: string,
    organizationId: string
  ): Promise<Invoice> {
    // Get invoice settings
    const settingsResult = await query(
      `SELECT * FROM invoice_settings WHERE organization_id = $1`,
      [organizationId]
    );

    const settings = settingsResult.length > 0 ? settingsResult[0] : null;

    // Generate invoice number
    const invoiceNumber = settings
      ? `${settings.invoicePrefix}${settings.invoiceNumber}`
      : `INV-${stripeInvoice.number}`;

    // Create invoice in database
    const result = await query(
      `INSERT INTO invoices (
        user_id, organization_id, subscription_id, stripe_invoice_id,
        invoice_number, status, amount, currency, due_date,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        userId,
        organizationId,
        stripeInvoice.subscription as string,
        stripeInvoice.id,
        invoiceNumber,
        stripeInvoice.status,
        stripeInvoice.total / 100,
        stripeInvoice.currency,
        new Date(stripeInvoice.due_date * 1000),
      ]
    );

    // Create invoice items
    for (const lineItem of stripeInvoice.lines.data) {
      await query(
        `INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, amount, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          result[0].id,
          lineItem.description || 'Subscription',
          lineItem.quantity || 1,
          (lineItem.price?.unit_amount || 0) / 100,
          (lineItem.amount || 0) / 100,
        ]
      );
    }

    // Update invoice number
    if (settings) {
      await query(
        `UPDATE invoice_settings SET invoice_number = invoice_number + 1 WHERE id = $1`,
        [settings.id]
      );
    }

    return result[0];
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const result = await query(
      `SELECT * FROM invoices WHERE id = $1`,
      [invoiceId]
    );

    return result[0] || null;
  }

  /**
   * Get invoices for organization
   */
  async getOrganizationInvoices(
    organizationId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Invoice[]> {
    const result = await query(
      `SELECT * FROM invoices 
       WHERE organization_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [organizationId, limit, offset]
    );

    return result;
  }

  /**
   * Get invoice items
   */
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const result = await query(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at`,
      [invoiceId]
    );

    return result;
  }

  /**
   * Get invoice with items
   */
  async getInvoiceWithItems(invoiceId: string): Promise<{
    invoice: Invoice;
    items: InvoiceItem[];
  }> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const items = await this.getInvoiceItems(invoiceId);

    return { invoice, items };
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Get PDF from Stripe
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId, {
      expand: ['invoice_pdf'],
    });

    const pdfUrl = stripeInvoice.invoice_pdf;
    if (!pdfUrl) {
      throw new Error('PDF not available');
    }

    // Download PDF
    const response = await fetch(pdfUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    return buffer;
  }

  /**
   * Get invoice settings
   */
  async getInvoiceSettings(organizationId: string): Promise<InvoiceSettings> {
    const result = await query(
      `SELECT * FROM invoice_settings WHERE organization_id = $1`,
      [organizationId]
    );

    if (result.length === 0) {
      // Create default settings
      const defaultResult = await query(
        `INSERT INTO invoice_settings (
          organization_id, invoice_prefix, invoice_number, 
          default_payment_terms, tax_rate, created_at, updated_at
        ) VALUES ($1, 'INV-', 1, 30, 0, NOW(), NOW())
        RETURNING *`,
        [organizationId]
      );
      return defaultResult[0];
    }

    return result[0];
  }

  /**
   * Update invoice settings
   */
  async updateInvoiceSettings(
    organizationId: string,
    updates: Partial<{
      invoicePrefix: string;
      defaultPaymentTerms: number;
      taxRate: number;
      taxId: string;
      companyName: string;
      companyAddress: string;
      companyEmail: string;
      companyPhone: string;
      logoUrl: string;
      notes: string;
    }>
  ): Promise<InvoiceSettings> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.invoicePrefix !== undefined) {
      fields.push(`invoice_prefix = $${paramIndex++}`);
      values.push(updates.invoicePrefix);
    }
    if (updates.defaultPaymentTerms !== undefined) {
      fields.push(`default_payment_terms = $${paramIndex++}`);
      values.push(updates.defaultPaymentTerms);
    }
    if (updates.taxRate !== undefined) {
      fields.push(`tax_rate = $${paramIndex++}`);
      values.push(updates.taxRate);
    }
    if (updates.taxId !== undefined) {
      fields.push(`tax_id = $${paramIndex++}`);
      values.push(updates.taxId);
    }
    if (updates.companyName !== undefined) {
      fields.push(`company_name = $${paramIndex++}`);
      values.push(updates.companyName);
    }
    if (updates.companyAddress !== undefined) {
      fields.push(`company_address = $${paramIndex++}`);
      values.push(updates.companyAddress);
    }
    if (updates.companyEmail !== undefined) {
      fields.push(`company_email = $${paramIndex++}`);
      values.push(updates.companyEmail);
    }
    if (updates.companyPhone !== undefined) {
      fields.push(`company_phone = $${paramIndex++}`);
      values.push(updates.companyPhone);
    }
    if (updates.logoUrl !== undefined) {
      fields.push(`logo_url = $${paramIndex++}`);
      values.push(updates.logoUrl);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(updates.notes);
    }

    fields.push(`updated_at = NOW()`);
    values.push(organizationId);

    const result = await query(
      `UPDATE invoice_settings SET ${fields.join(', ')} WHERE organization_id = $${paramIndex++} RETURNING *`,
      values
    );

    return result[0];
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStatistics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    averageInvoiceAmount: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_invoices,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status = 'open' THEN amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status = 'open' AND due_date < NOW() THEN amount ELSE 0 END) as overdue_amount,
        AVG(amount) as average_invoice_amount
       FROM invoices
       WHERE organization_id = $1
         AND created_at >= $2
         AND created_at <= $3`,
      [organizationId, startDate, endDate]
    );

    const stats = result[0];

    return {
      totalInvoices: parseInt(stats.total_invoices) || 0,
      totalAmount: parseFloat(stats.total_amount) || 0,
      paidAmount: parseFloat(stats.paid_amount) || 0,
      pendingAmount: parseFloat(stats.pending_amount) || 0,
      overdueAmount: parseFloat(stats.overdue_amount) || 0,
      averageInvoiceAmount: parseFloat(stats.average_invoice_amount) || 0,
    };
  }

  /**
   * Void invoice
   */
  async voidInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Void in Stripe
    await stripe.invoices.voidInvoice(invoice.stripeInvoiceId);

    // Update in database
    const result = await query(
      `UPDATE invoices 
       SET status = 'void', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [invoiceId]
    );

    return result[0];
  }

  /**
   * Retry invoice payment
   */
  async retryInvoicePayment(invoiceId: string): Promise<Stripe.Invoice> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Retry payment in Stripe
    const stripeInvoice = await stripe.invoices.pay(invoice.stripeInvoiceId);

    // Update status in database
    await query(
      `UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2`,
      [stripeInvoice.status, invoiceId]
    );

    return stripeInvoice;
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Send invoice via Stripe
    await stripe.invoices.sendInvoice(invoice.stripeInvoiceId);
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
