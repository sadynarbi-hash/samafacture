'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatAmount } from '@/lib/utils';
import { Download } from 'lucide-react';

interface InvoiceSummary {
  issue_date: string;
  total_amount: number;
  paid_amount: number;
  status: string;
}

interface Props {
  invoices: InvoiceSummary[];
  year: number;
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const QUARTER_MONTHS = [[0,1,2], [3,4,5], [6,7,8], [9,10,11]];

export default function RapportsClient({ invoices, year }: Props) {
  const monthlyData = MONTHS.map((month, i) => {
    const monthInvoices = invoices.filter(inv => new Date(inv.issue_date).getMonth() === i);
    return {
      month,
      total: monthInvoices.reduce((s, i) => s + i.total_amount, 0),
      paid: monthInvoices.reduce((s, i) => s + i.paid_amount, 0),
    };
  });

  const totalYear = invoices.reduce((s, i) => s + i.total_amount, 0);
  const paidYear = invoices.reduce((s, i) => s + i.paid_amount, 0);

  const quarterData = QUARTER_MONTHS.map((months, qi) => {
    const qInvoices = invoices.filter(inv => months.includes(new Date(inv.issue_date).getMonth()));
    return {
      quarter: `T${qi + 1}`,
      total: qInvoices.reduce((s, i) => s + i.total_amount, 0),
      paid: qInvoices.reduce((s, i) => s + i.paid_amount, 0),
    };
  });

  return (
    <>
      <div className="pt-2 mb-6">
        <h1 className="text-2xl font-bold text-black">Revenus</h1>
        <p className="text-gray-400 text-sm">{year}</p>
      </div>

      {/* Total */}
      <Card className="mb-4">
        <p className="text-sm text-gray-400 mb-1">Total facturé cette année</p>
        <p className="text-3xl font-bold text-black">{formatAmount(totalYear)}</p>
        <div className="flex gap-6 mt-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Encaissé</p>
            <p className="font-semibold text-green-600">{formatAmount(paidYear)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">En attente</p>
            <p className="font-semibold text-orange-500">{formatAmount(totalYear - paidYear)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Factures</p>
            <p className="font-semibold text-black">{invoices.length}</p>
          </div>
        </div>
      </Card>

      {/* Chart */}
      {invoices.length > 0 && (
        <Card className="mb-4">
          <p className="text-sm font-semibold text-black mb-4">Par mois</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip
                formatter={(value) => [formatAmount(Number(value)), '']}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Facturé" />
              <Bar dataKey="paid" fill="#000" radius={[4, 4, 0, 0]} name="Encaissé" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Quarters */}
      <Card className="mb-4">
        <p className="text-sm font-semibold text-black mb-3">Par trimestre</p>
        <div className="grid grid-cols-4 gap-2">
          {quarterData.map(q => (
            <div key={q.quarter} className="text-center py-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">{q.quarter}</p>
              <p className="font-bold text-sm text-black">
                {q.total >= 1000 ? `${Math.round(q.total / 1000)}k` : q.total}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly breakdown */}
      <Card className="mb-6">
        <p className="text-sm font-semibold text-black mb-3">Détail mensuel</p>
        <div className="space-y-2">
          {monthlyData
            .filter(m => m.total > 0)
            .map(m => (
              <div key={m.month} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 w-10">{m.month}</span>
                <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full"
                    style={{ width: `${totalYear ? (m.paid / totalYear) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-black">{formatAmount(m.total)}</span>
              </div>
            ))}
          {invoices.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">Aucune donnée pour {year}</p>
          )}
        </div>
      </Card>

      <Button fullWidth variant="secondary">
        <Download size={18} />
        Exporter les factures
      </Button>
    </>
  );
}
