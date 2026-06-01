import type { Invoice } from '@/types';

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

async function renderStampSignature(doc: any, W: number, margin: number, stampUrl?: string, signatureUrl?: string) {
  if (!stampUrl && !signatureUrl) return;

  const y = 255;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  if (signatureUrl) {
    const dataUrl = await loadImageAsDataUrl(signatureUrl);
    if (dataUrl) {
      doc.text('Signature', margin, y);
      doc.addImage(dataUrl, 'PNG', margin, y + 2, 40, 20, undefined, 'FAST');
    }
  }

  if (stampUrl) {
    const dataUrl = await loadImageAsDataUrl(stampUrl);
    if (dataUrl) {
      doc.text('Cachet', W - margin - 40, y);
      doc.addImage(dataUrl, 'PNG', W - margin - 40, y + 2, 40, 20, undefined, 'FAST');
    }
  }
}

export type TemplateId = 'classique' | 'moderne' | 'epure';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
}

export const TEMPLATES: Template[] = [
  { id: 'classique', name: 'Classique', description: 'En-tête noir avec logo' },
  { id: 'moderne', name: 'Moderne', description: 'Ligne colorée, épuré' },
  { id: 'epure', name: 'Épuré', description: 'Minimaliste, tout blanc' },
];

export async function generateInvoicePDF(
  invoice: Invoice,
  businessName: string,
  templateId: TemplateId = 'classique',
  logoUrl?: string,
  stampUrl?: string,
  signatureUrl?: string,
): Promise<Blob> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;

  const currency = invoice.currency || 'FCFA';
  const fmtNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const fmt = (n: number) => fmtNum(n) + ' ' + currency;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  if (templateId === 'classique') await renderClassique(doc, invoice, businessName, W, margin, fmt, fmtDate, currency);
  else if (templateId === 'moderne') await renderModerne(doc, invoice, businessName, W, margin, fmt, fmtDate, currency);
  else await renderEpure(doc, invoice, businessName, W, margin, fmt, fmtDate, currency);

  // Stamp & Signature at bottom
  await renderStampSignature(doc, W, margin, stampUrl, signatureUrl);

  return doc.output('blob');
}

async function renderClassique(doc: any, invoice: Invoice, businessName: string, W: number, margin: number, fmt: (n: number) => string, fmtDate: (d: string) => string, currency: string) {
  let y = 20;

  // Black header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, W, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text(businessName, margin, 22);
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text('FACTURE', W - margin, 18, { align: 'right' });
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text(`#${invoice.invoice_number}`, W - margin, 26, { align: 'right' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`Émise le ${fmtDate(invoice.issue_date)}`, W - margin, 33, { align: 'right' });
  if (invoice.due_date) doc.text(`Échéance ${fmtDate(invoice.due_date)}`, W - margin, 39, { align: 'right' });

  y = 58;
  renderClientAndItems(doc, invoice, W, margin, fmt, fmtDate, currency, y);
}

async function renderModerne(doc: any, invoice: Invoice, businessName: string, W: number, margin: number, fmt: (n: number) => string, fmtDate: (d: string) => string, currency: string) {
  let y = 15;

  // Accent line
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 4, 'F');

  // Business name
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.text(businessName, margin, y + 14);

  // Invoice label right
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('FACTURE', W - margin, y + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text(`#${invoice.invoice_number}`, W - margin, y + 18, { align: 'right' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
  doc.text(`${fmtDate(invoice.issue_date)}`, W - margin, y + 25, { align: 'right' });

  // Separator line
  y += 35;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 12;

  renderClientAndItems(doc, invoice, W, margin, fmt, fmtDate, currency, y, [37, 99, 235]);
}

async function renderEpure(doc: any, invoice: Invoice, businessName: string, W: number, margin: number, fmt: (n: number) => string, fmtDate: (d: string) => string, currency: string) {
  let y = 20;

  // Business name only
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text(businessName, margin, y);

  // Invoice info right
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  doc.text('Facture', W - margin, y - 5, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(`N° ${invoice.invoice_number}`, W - margin, y + 4, { align: 'right' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  doc.text(fmtDate(invoice.issue_date), W - margin, y + 10, { align: 'right' });

  y += 20;
  // Light separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, y, W - margin, y);
  y += 12;

  renderClientAndItems(doc, invoice, W, margin, fmt, fmtDate, currency, y);
}

function renderClientAndItems(
  doc: any, invoice: Invoice, W: number, margin: number,
  fmt: (n: number) => string, fmtDate: (d: string) => string,
  currency: string, startY: number,
  accentColor: [number, number, number] = [0, 0, 0]
) {
  let y = startY;

  // Client
  if (invoice.client) {
    doc.setTextColor(120, 120, 120); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text('FACTURÉ À', margin, y);
    y += 5;
    doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, margin, y);
    if (invoice.client.email) { y += 5; doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80); doc.text(invoice.client.email, margin, y); }
    if (invoice.client.phone) { y += 4.5; doc.text(invoice.client.phone, margin, y); }
    y += 10;
  }

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 4, W - margin * 2, 9, 'F');
  doc.setTextColor(...accentColor); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', margin + 2, y + 1);
  doc.text('QTÉ', 118, y + 1, { align: 'right' });
  doc.text('P.U.', 148, y + 1, { align: 'right' });
  doc.text('TOTAL', W - margin - 2, y + 1, { align: 'right' });
  y += 10;

  // Items
  for (const item of invoice.items ?? []) {
    const subtotal = item.unit_price * item.quantity * (1 - item.discount / 100);
    const tva = item.taxable ? subtotal * 0.18 : 0;
    const total = subtotal + tva;

    doc.setTextColor(0, 0, 0); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(item.name, margin + 2, y);
    if (item.details) {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
      doc.text(item.details, margin + 2, y + 4);
    }
    if (item.taxable) {
      doc.setFontSize(6.5); doc.setTextColor(200, 120, 0);
      doc.text('TVA 18%', margin + 2, y + (item.details ? 8 : 4));
    }
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
    doc.text(String(item.quantity), 118, y, { align: 'right' });
    doc.text(fmt(item.unit_price), 148, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(total), W - margin - 2, y, { align: 'right' });
    y += item.details || item.taxable ? 14 : 9;
    doc.setDrawColor(235, 235, 235); doc.setLineWidth(0.2);
    doc.line(margin, y - 2, W - margin, y - 2);
  }

  y += 4;

  // Total box
  const [r, g, b] = accentColor;
  doc.setFillColor(r, g, b);
  doc.roundedRect(120, y, W - margin - 120, 13, 2, 2, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(9.5); doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 124, y + 8.5);
  doc.setFontSize(12);
  doc.text(fmt(invoice.total_amount), W - margin - 2, y + 8.5, { align: 'right' });

  if (invoice.paid_amount > 0) {
    y += 17;
    doc.setTextColor(80, 80, 80); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    doc.text('Payé:', 122, y);
    doc.setTextColor(34, 197, 94); doc.setFont('helvetica', 'bold');
    doc.text(fmt(invoice.paid_amount), W - margin - 2, y, { align: 'right' });
    if (invoice.paid_amount < invoice.total_amount) {
      y += 6;
      doc.setTextColor(80, 80, 80); doc.setFont('helvetica', 'normal');
      doc.text('Reste:', 122, y);
      doc.setTextColor(239, 68, 68); doc.setFont('helvetica', 'bold');
      doc.text(fmt(invoice.total_amount - invoice.paid_amount), W - margin - 2, y, { align: 'right' });
    }
  }

  if (invoice.notes) {
    y += 16;
    doc.setTextColor(120, 120, 120); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text('NOTES', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(invoice.notes, W - margin * 2);
    doc.text(lines, margin, y);
  }

  // Footer
  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
  doc.line(margin, 284, W - margin, 284);
  doc.setTextColor(160, 160, 160); doc.setFontSize(7);
  doc.text('Généré avec SamaFacture • samafacture-lovat.vercel.app', W / 2, 289, { align: 'center' });
}
