import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Invoice } from '@/hooks/useSubscription';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface InvoiceGeneratorProps {
  invoice: Invoice;
}

export function InvoiceGenerator({ invoice }: InvoiceGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const items = (invoice.items || []) as { description: string; quantity: number; unitPrice: number; total: number }[];

      // Header
      doc.setFontSize(24);
      doc.setTextColor(16, 185, 129);
      doc.text('INVOICE', 20, 30);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Regenerative Platform', 20, 40);
      doc.text('Carbon Credits & Sustainability', 20, 46);

      // Invoice details
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Invoice #: ${invoice.invoice_number}`, 140, 30);
      doc.text(`Date: ${format(new Date(invoice.issued_at), 'MMM dd, yyyy')}`, 140, 36);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 42);

      // Bill To
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text('Bill To:', 20, 65);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(invoice.billing_name || 'N/A', 20, 72);
      doc.text(invoice.billing_email || 'N/A', 20, 78);
      if (invoice.billing_address) {
        doc.text(invoice.billing_address, 20, 84);
      }

      // Table header
      const tableTop = 100;
      doc.setFillColor(245, 245, 245);
      doc.rect(20, tableTop - 6, 170, 10, 'F');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('Description', 22, tableTop);
      doc.text('Qty', 110, tableTop);
      doc.text('Unit Price', 130, tableTop);
      doc.text('Total', 165, tableTop);

      // Table rows
      let y = tableTop + 10;
      doc.setTextColor(40, 40, 40);
      items.forEach((item) => {
        doc.text(item.description || 'Item', 22, y);
        doc.text(String(item.quantity || 1), 110, y);
        doc.text(`$${(item.unitPrice || 0).toFixed(2)}`, 130, y);
        doc.text(`$${(item.total || 0).toFixed(2)}`, 165, y);
        y += 8;
      });

      // Total
      y += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, y, 190, y);
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.text(`Total: $${invoice.amount.toFixed(2)} ${invoice.currency}`, 140, y);

      // Payment info
      y += 15;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Payment Method: ${invoice.payment_method || 'N/A'}`, 20, y);
      doc.text(`Reference: ${invoice.payment_reference || 'N/A'}`, 20, y + 6);
      if (invoice.paid_at) {
        doc.text(`Paid: ${format(new Date(invoice.paid_at), 'MMM dd, yyyy HH:mm')}`, 20, y + 12);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for investing in Earth\'s regeneration.', 20, 280);

      doc.save(`${invoice.invoice_number}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  const items = (invoice.items || []) as { description: string; quantity: number; unitPrice: number; total: number }[];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{invoice.invoice_number}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {format(new Date(invoice.issued_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
              className={invoice.status === 'paid' ? 'bg-primary/20 text-primary' : ''}
            >
              {invoice.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
              {invoice.status}
            </Badge>
            <Button size="sm" variant="outline" onClick={generatePDF} disabled={generating}>
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 text-sm">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-muted-foreground">
              <span>{item.description}</span>
              <span>${item.total?.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-semibold text-sm">
          <span>Total</span>
          <span className="text-primary">${invoice.amount.toFixed(2)} {invoice.currency}</span>
        </div>
      </CardContent>
    </Card>
  );
}
