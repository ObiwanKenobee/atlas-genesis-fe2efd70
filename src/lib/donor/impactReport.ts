import jsPDF from 'jspdf';

export interface ReportDonation {
  date: string;
  project: string;
  category: string;
  amount: number;
  impact: string;
  status: string;
  txHash?: string;
  taxDeductible?: boolean;
}

export interface ImpactReportInput {
  donorName: string;
  donorEmail?: string;
  from: Date;
  to: Date;
  donations: ReportDonation[];
  totals: { donated: number; offsetTons: number; projects: number };
}

const brand = { primary: [16, 143, 90] as const, dark: [17, 24, 39] as const, muted: [107, 114, 128] as const };

export function generateImpactReport(input: ImpactReportInput): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  // Header band
  doc.setFillColor(...brand.primary);
  doc.rect(0, 0, pageW, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Atlas Genesis · Impact Report', M, 44);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${input.from.toLocaleDateString()} – ${input.to.toLocaleDateString()}`, M, 66);
  y = 120;

  doc.setTextColor(...brand.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Prepared for', M, y); y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(input.donorName, M, y); y += 14;
  if (input.donorEmail) { doc.text(input.donorEmail, M, y); y += 14; }
  y += 12;

  // Summary cards
  const cards = [
    { label: 'Total Donated', value: `$${input.totals.donated.toLocaleString()}` },
    { label: 'CO₂ Offset', value: `${input.totals.offsetTons.toLocaleString()} tons` },
    { label: 'Projects Supported', value: `${input.totals.projects}` },
  ];
  const cw = (pageW - M * 2 - 24) / 3;
  cards.forEach((c, i) => {
    const x = M + i * (cw + 12);
    doc.setDrawColor(230); doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cw, 70, 6, 6, 'FD');
    doc.setTextColor(...brand.muted); doc.setFontSize(10);
    doc.text(c.label, x + 12, y + 22);
    doc.setTextColor(...brand.dark); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(c.value, x + 12, y + 48);
    doc.setFont('helvetica', 'normal');
  });
  y += 96;

  // Donations table
  doc.setTextColor(...brand.dark); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('Donations', M, y); y += 16;

  const cols = [
    { key: 'date', label: 'Date', w: 70 },
    { key: 'project', label: 'Project', w: 180 },
    { key: 'category', label: 'Category', w: 70 },
    { key: 'amount', label: 'Amount', w: 70 },
    { key: 'impact', label: 'Impact', w: 90 },
    { key: 'status', label: 'Status', w: 60 },
  ];

  doc.setFillColor(...brand.primary); doc.setTextColor(255, 255, 255);
  doc.rect(M, y, pageW - M * 2, 22, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  let x = M + 8;
  cols.forEach((c) => { doc.text(c.label, x, y + 15); x += c.w; });
  y += 22;

  doc.setFont('helvetica', 'normal'); doc.setTextColor(...brand.dark); doc.setFontSize(10);
  input.donations.forEach((d, i) => {
    if (y > pageH - 80) { doc.addPage(); y = M; }
    if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(M, y, pageW - M * 2, 20, 'F'); }
    let cx = M + 8;
    const row = [
      new Date(d.date).toLocaleDateString(),
      d.project.length > 32 ? d.project.slice(0, 30) + '…' : d.project,
      d.category,
      `$${d.amount.toLocaleString()}`,
      d.impact,
      d.status,
    ];
    row.forEach((v, idx) => { doc.text(String(v), cx, y + 14); cx += cols[idx].w; });
    y += 20;
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(230); doc.line(M, pageH - 40, pageW - M, pageH - 40);
    doc.setTextColor(...brand.muted); doc.setFontSize(9);
    doc.text(`Generated ${new Date().toLocaleString()}`, M, pageH - 24);
    doc.text(`Page ${p} of ${pageCount}`, pageW - M, pageH - 24, { align: 'right' });
    doc.text('Atlas Genesis — Regenerative Impact Ledger', pageW / 2, pageH - 24, { align: 'center' });
  }

  return doc;
}