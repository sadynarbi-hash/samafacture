'use client';

import type { Invoice } from '@/types';

export async function generateInvoicePDF(invoice: Invoice, businessName: string): Promise<Blob> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;
  let y = 20;

  const currency = invoice.currency || 'FCFA';

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' ' + currency;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Header background
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, W, 45, 'F');

  // Business name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName, margin, 22);

  // FACTURE label
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('FACTURE', W - margin, 18, { align: 'right' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${invoice.invoice_number}`, W - margin, 26, { align: 'right' });

  // Dates
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Émise le ${fmtDate(invoice.issue_date)}`, W - margin, 33, { align: 'right' });
  if (invoice.due_date) {
    doc.text(`Échéance ${fmtDate(invoice.due_date)}`, W - margin, 39, { align: 'right' });
  }

  y = 58;

  // ── Client section
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', margin, y);

  y += 6;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.client?.name ?? 'Client', margin, y);

  if (invoice.client?.email) {
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(invoice.client.email, margin, y);
  }
  if (invoice.client?.phone) {
    y += 5;
    doc.text(invoice.client.phone, margin, y);
  }
  if (invoice.client?.address) {
    y += 5;
    doc.text(invoice.client.address, margin, y);
  }

  y += 14;

  // ── Items table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, W - margin * 2, 10, 'F');

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', margin + 2, y + 1);
  doc.text('QTÉ', 120, y + 1, { align: 'right' });
  doc.text('PRIX UNIT.', 150, y + 1, { align: 'right' });
  doc.text('TOTAL', W - margin - 2, y + 1, { align: 'right' });

  y += 10;

  // ── Items
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  for (const item of invoice.items ?? []) {
    const subtotal = item.unit_price * item.quantity * (1 - item.discount / 100);
    const lineHeight = item.details ? 12 : 8;

    // Alternating row
    if ((invoice.items.indexOf(item) % 2) === 1) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y - 5, W - margin * 2, lineHeight, 'F');
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(item.name, margin + 2, y);

    if (item.details) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(item.details, margin + 2, y + 4);
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity), 120, y, { align: 'right' });
    doc.text(fmt(item.unit_price), 150, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(subtotal), W - margin - 2, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    if (item.discount > 0) {
      doc.setFontSize(7);
      doc.setTextColor(200, 100, 0);
      doc.text(`Remise ${item.discount}%`, 150, y + 4, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }

    y += lineHeight;
    // Separator line
    doc.setDrawColor(235, 235, 235);
    doc.line(margin, y - 2, W - margin, y - 2);
  }

  y += 6;

  // ── Totals box
  const totalBoxX = 120;
  const totalBoxW = W - margin - totalBoxX;

  // Total
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(totalBoxX, y, totalBoxW, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', totalBoxX + 5, y + 9);
  doc.setFontSize(13);
  doc.text(fmt(invoice.total_amount), totalBoxX + totalBoxW - 5, y + 9, { align: 'right' });

  // Paid / remaining
  if (invoice.paid_amount > 0) {
    y += 18;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Payé:', totalBoxX + 5, y);
    doc.setTextColor(34, 197, 94);
    doc.text(fmt(invoice.paid_amount), totalBoxX + totalBoxW - 5, y, { align: 'right' });

    if (invoice.paid_amount < invoice.total_amount) {
      y += 6;
      doc.setTextColor(80, 80, 80);
      doc.text('Reste à payer:', totalBoxX + 5, y);
      doc.setTextColor(239, 68, 68);
      doc.text(fmt(invoice.total_amount - invoice.paid_amount), totalBoxX + totalBoxW - 5, y, { align: 'right' });
    }
  }

  // ── Notes
  if (invoice.notes) {
    y += 16;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(invoice.notes, W - margin * 2);
    doc.text(lines, margin, y);
  }

  // ── Footer
  const footerY = 285;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, footerY, W - margin, footerY);
  doc.setTextColor(160, 160, 160);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Généré avec SamaFacture • samafacture-lovat.vercel.app', W / 2, footerY + 5, { align: 'center' });

  return doc.output('blob');
}
