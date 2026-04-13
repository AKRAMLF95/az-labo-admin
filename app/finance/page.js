'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/* ─── Mock Data ──────────────────────────────────────────────────── */
const TRANSACTIONS_DATA = [
  {
    id: 'TXN-2604-001', patient: 'Karim Amrani',   telephone: '+213 555 123 456',
    date: 'Auj. 07:30', analyses: ['NFS', 'Glycémie'],
    sousTotal: 550,  remise: 110, fraisDeplacement: 0,   total: 440,
    modePaiement: 'cash',  statut: 'paye',       codePromo: 'AZLAUNCH',
  },
  {
    id: 'TXN-2604-002', patient: 'Sara Bensalem',  telephone: '+213 661 789 012',
    date: 'Auj. 08:00', analyses: ['CRP', 'VS'],
    sousTotal: 500,  remise: 0,   fraisDeplacement: 500, total: 1000,
    modePaiement: 'carte', statut: 'paye',       codePromo: '',
  },
  {
    id: 'TXN-2604-003', patient: 'Mohamed Ouali',  telephone: '+213 770 345 678',
    date: 'Auj. 08:30', analyses: ['ECBU', 'CRP'],
    sousTotal: 650,  remise: 65,  fraisDeplacement: 0,   total: 585,
    modePaiement: 'cash',  statut: 'en_attente', codePromo: 'FAMILLE10',
  },
  {
    id: 'TXN-2604-004', patient: 'Fatima Djilali', telephone: '+213 550 901 234',
    date: 'Auj. 09:00', analyses: ['TSH', 'T3', 'T4'],
    sousTotal: 1250, remise: 375, fraisDeplacement: 500, total: 1375,
    modePaiement: 'cash',  statut: 'en_attente', codePromo: 'SONATRACH2026',
  },
  {
    id: 'TXN-2604-005', patient: 'Youcef Hamdi',   telephone: '+213 661 456 789',
    date: 'Auj. 09:45', analyses: ['NFS', 'CRP', 'VS'],
    sousTotal: 800,  remise: 0,   fraisDeplacement: 500, total: 1300,
    modePaiement: 'carte', statut: 'paye',       codePromo: '',
  },
  {
    id: 'TXN-2604-006', patient: 'Lynda Saadi',    telephone: '+213 555 321 654',
    date: 'Auj. 10:00', analyses: ['Glycémie'],
    sousTotal: 200,  remise: 0,   fraisDeplacement: 0,   total: 200,
    modePaiement: 'cash',  statut: 'annule',     codePromo: '',
  },
];

const FACTURES_ENTREPRISES = [
  { id: 1, entreprise: 'Sonatrach',           utilisationsMois: 45, montantTotal: 85500, statut: 'non_envoyee', mois: 'Avril 2026' },
  { id: 2, entreprise: 'Air Algérie Mutuelle', utilisationsMois: 23, montantTotal: 34500, statut: 'envoyee',     mois: 'Avril 2026' },
];

/* ─── Daily CA data (30 days) ────────────────────────────────────── */
const CA_DATA = (() => {
  const seed = [38,42,55,31,67,48,72,44,59,38,82,63,47,71,58,49,66,75,43,54,69,48,73,57,41,65,78,52,60,43];
  return seed.map((v, i) => ({ day: i + 1, value: v * 1000 }));
})();

const TOP_ANALYSES = [
  { label: 'NFS',           count: 312, montant: 109200 },
  { label: 'Glycémie',      count: 287, montant:  57400 },
  { label: 'TSH',           count: 198, montant:  89100 },
  { label: 'CRP',           count: 176, montant:  52800 },
  { label: 'Cholestérol',   count: 165, montant:  41250 },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtDA(n) {
  return n.toLocaleString('fr-DZ') + ' DA';
}

function StatutBadge({ statut }) {
  const cfg = {
    paye:        { label: '✓ Payé',       cls: 'bg-green-100 text-green-700' },
    en_attente:  { label: '⏳ En attente', cls: 'bg-orange-100 text-orange-700' },
    annule:      { label: '✗ Annulé',     cls: 'bg-red-100 text-red-500' },
  }[statut] || { label: statut, cls: 'bg-gray-100 text-gray-500' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>;
}

function PaymentBadge({ mode }) {
  const cfg = {
    cash:  { label: '💵 Cash',  cls: 'bg-emerald-100 text-emerald-700' },
    carte: { label: '💳 Carte', cls: 'bg-blue-100 text-blue-700' },
  }[mode] || { label: mode, cls: 'bg-gray-100 text-gray-500' };
  return <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>;
}

function FactureStatutBadge({ statut }) {
  const cfg = {
    non_envoyee: { label: '● Non envoyée', cls: 'bg-gray-100 text-gray-500' },
    envoyee:     { label: '📤 Envoyée',    cls: 'bg-blue-100 text-blue-700' },
    payee:       { label: '✓ Payée',       cls: 'bg-green-100 text-green-700' },
  }[statut] || { label: statut, cls: 'bg-gray-100 text-gray-500' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>;
}

/* ─── Receipt Modal ──────────────────────────────────────────────── */
function ReceiptModal({ txn, onClose }) {
  const remisePct = txn.sousTotal > 0 ? Math.round((txn.remise / txn.sousTotal) * 100) : 0;
  const ANALYSE_PRICES = { NFS: 350, Glycémie: 200, CRP: 300, VS: 200, ECBU: 350, TSH: 450, T3: 400, T4: 400, 'Cholestérol': 250 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">

        {/* Action bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">Reçu / Facture</h2>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors">
              🖨️ Imprimer
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-xs font-semibold text-green-700 transition-colors">
              📤 WhatsApp
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">✕</button>
          </div>
        </div>

        {/* Receipt body */}
        <div className="px-6 py-5 font-mono text-sm" id="receipt-print">

          {/* Header */}
          <div className="text-center mb-4">
            <p className="font-black text-xl tracking-widest text-[#1565C0]">AZ LABORATOIRES</p>
            <p className="text-gray-500 text-xs mt-0.5">Birkhadem, Alger</p>
            <p className="text-gray-500 text-xs">Tél : 023 XX XX XX</p>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Meta */}
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Reçu N°</span>
              <span className="font-bold text-gray-800">{txn.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-bold text-gray-800">{txn.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Patient</span>
              <span className="font-bold text-gray-800">{txn.patient}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Lines */}
          <div className="space-y-1 text-xs">
            {txn.analyses.map(a => {
              const price = ANALYSE_PRICES[a] || Math.round(txn.sousTotal / txn.analyses.length);
              return (
                <div key={a} className="flex justify-between">
                  <span className="text-gray-700">{a}</span>
                  <span className="text-gray-700">{fmtDA(price)}</span>
                </div>
              );
            })}
            {txn.fraisDeplacement > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Frais déplacement</span>
                <span className="text-gray-700">{fmtDA(txn.fraisDeplacement)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          {/* Sub-total */}
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Sous-total</span>
              <span className="text-gray-700">{fmtDA(txn.sousTotal + txn.fraisDeplacement)}</span>
            </div>
            {txn.remise > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Remise {remisePct > 0 ? `-${remisePct}%` : ''} {txn.codePromo ? `(${txn.codePromo})` : ''}</span>
                <span>-{fmtDA(txn.remise)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-300 my-3" />

          {/* Total */}
          <div className="flex justify-between items-center mb-2">
            <span className="font-black text-gray-900">TOTAL</span>
            <span className="font-black text-lg text-[#1565C0]">{fmtDA(txn.total)}</span>
          </div>
          <div className="text-xs space-y-0.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Mode</span>
              <span className="font-semibold text-gray-800">{txn.modePaiement === 'cash' ? '💵 Cash' : '💳 Carte'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Statut</span>
              <span className={`font-semibold ${txn.statut === 'paye' ? 'text-green-600' : 'text-orange-600'}`}>
                {txn.statut === 'paye' ? '✓ Payé' : '⏳ En attente'}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="text-center text-xs text-gray-400 space-y-0.5">
            <p>Merci pour votre confiance</p>
            <p className="font-semibold text-[#1565C0]">azlaboratoires.dz</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CSS Bar Chart (30 days) ────────────────────────────────────── */
function CABarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  const today = data.length; // last bar = today

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">CA par jour — Avril 2026</h3>
          <p className="text-xs text-gray-400 mt-0.5">Chiffre d'affaires quotidien (30 derniers jours)</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#1565C0] inline-block" /> Jours passés</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#E65100] inline-block" /> Aujourd'hui</span>
        </div>
      </div>
      <div className="flex items-end gap-0.5 h-32 overflow-x-auto pb-1">
        {data.map((d, i) => {
          const pct = Math.round((d.value / max) * 100);
          const isToday = i === today - 1;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1 min-w-[6px] group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {Math.round(d.value / 1000)}K DA
              </div>
              <div
                className={`w-full rounded-t-sm transition-all ${isToday ? 'bg-[#E65100]' : 'bg-[#1565C0] hover:bg-[#0D47A1]'}`}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              {(i === 0 || i === 9 || i === 19 || i === today - 1) && (
                <span className="text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">{isToday ? 'Auj.' : `J${d.day}`}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Donut chart (CSS conic-gradient) ──────────────────────────── */
function PaymentDonut() {
  const cash = 65;
  const carte = 35;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 text-sm mb-4">Répartition des paiements</h3>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0 w-28 h-28">
          <div
            className="w-28 h-28 rounded-full"
            style={{
              background: `conic-gradient(
                #1565C0 0% ${cash}%,
                #4CAF50 ${cash}% 100%
              )`,
            }}
          />
          {/* Hole */}
          <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
            <p className="text-sm font-black text-gray-800">38</p>
            <p className="text-[9px] text-gray-400">paiements</p>
          </div>
        </div>
        {/* Legend */}
        <div className="flex-1 space-y-3">
          {[
            { label: 'Cash / Livraison', value: cash, color: 'bg-[#1565C0]', amount: 27690 },
            { label: 'Carte bancaire',   value: carte, color: 'bg-[#4CAF50]', amount: 14910 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${item.color} shrink-0`} />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
                <span className="text-xs font-black text-gray-800">{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{fmtDA(item.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Top Analyses chart ─────────────────────────────────────────── */
function TopAnalysesChart({ data }) {
  const maxMontant = Math.max(...data.map(d => d.montant));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 text-sm mb-4">Top analyses — CA généré</h3>
      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = Math.round((item.montant / maxMontant) * 100);
          const BAR_COLORS = ['bg-[#1565C0]','bg-[#1976D2]','bg-[#1E88E5]','bg-[#2196F3]','bg-[#42A5F5]'];
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                  <span className="text-xs text-gray-400">× {item.count}</span>
                </div>
                <span className="text-xs font-black text-[#1565C0]">{fmtDA(item.montant)}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${BAR_COLORS[i]}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Transactions Table ─────────────────────────────────────────── */
function TransactionsTable({ transactions, onReceipt, onMarkPaid }) {
  const [dateFilter,    setDateFilter]    = useState('aujourd_hui');
  const [payFilter,     setPayFilter]     = useState('');
  const [statutFilter,  setStatutFilter]  = useState('');
  const [search,        setSearch]        = useState('');

  const filtered = transactions.filter(txn => {
    const q = search.toLowerCase();
    const matchSearch = !q || txn.patient.toLowerCase().includes(q) || txn.id.toLowerCase().includes(q);
    const matchPay    = !payFilter    || txn.modePaiement === payFilter;
    const matchStatut = !statutFilter || txn.statut === statutFilter;
    return matchSearch && matchPay && matchStatut;
  });

  const totals = filtered.reduce((acc, t) => ({
    sousTotal: acc.sousTotal + t.sousTotal,
    remise: acc.remise + t.remise,
    frais: acc.frais + t.fraisDeplacement,
    total: acc.total + t.total,
  }), { sousTotal: 0, remise: 0, frais: 0, total: 0 });

  const DATE_FILTERS = [
    { key: 'aujourd_hui',  label: "Aujourd'hui"  },
    { key: 'cette_semaine',label: 'Cette semaine' },
    { key: 'ce_mois',      label: 'Ce mois'       },
    { key: 'personnalise', label: 'Personnalisé'  },
  ];

  const selectCls = "px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 outline-none focus:border-[#1565C0] transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Transactions
          <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </h2>
      </div>

      {/* Filters */}
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-2 items-center bg-gray-50/50">
        {/* Date filter pills */}
        <div className="flex gap-1 bg-gray-200/60 rounded-xl p-0.5">
          {DATE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setDateFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${dateFilter === f.key ? 'bg-white text-[#1565C0] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Mode */}
        <select className={selectCls} value={payFilter} onChange={e => setPayFilter(e.target.value)}>
          <option value="">Tous modes</option>
          <option value="cash">💵 Cash</option>
          <option value="carte">💳 Carte</option>
        </select>

        {/* Statut */}
        <select className={selectCls} value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
          <option value="">Tous statuts</option>
          <option value="paye">✓ Payé</option>
          <option value="en_attente">⏳ En attente</option>
          <option value="annule">✗ Annulé</option>
        </select>

        {/* Search */}
        <div className="relative ml-auto">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher patient ou N°…"
            className="pl-7 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-colors w-52" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['N° Transact.','Patient','Date','Analyses','Sous-total','Remise','Déplacement','Total','Paiement','Statut','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={11} className="px-5 py-10 text-center text-gray-400 text-sm">Aucune transaction trouvée.</td></tr>
            ) : filtered.map(txn => (
              <tr key={txn.id} className={`hover:bg-gray-50/60 transition-colors ${txn.statut === 'annule' ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-600">{txn.id}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800 text-xs whitespace-nowrap">{txn.patient}</p>
                  <p className="text-[10px] text-gray-400">{txn.telephone}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{txn.date}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[120px]">
                    {txn.analyses.slice(0, 2).map(a => (
                      <span key={a} className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">{a}</span>
                    ))}
                    {txn.analyses.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold">+{txn.analyses.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtDA(txn.sousTotal)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {txn.remise > 0
                    ? <div>
                        <span className="text-xs font-semibold text-red-500">-{fmtDA(txn.remise)}</span>
                        {txn.codePromo && <p className="text-[9px] text-gray-400 font-mono">{txn.codePromo}</p>}
                      </div>
                    : <span className="text-xs text-gray-300">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {txn.fraisDeplacement > 0 ? <span className="text-teal-600 font-semibold">+{fmtDA(txn.fraisDeplacement)}</span> : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-black text-[#1565C0]">{fmtDA(txn.total)}</span>
                </td>
                <td className="px-4 py-3"><PaymentBadge mode={txn.modePaiement} /></td>
                <td className="px-4 py-3"><StatutBadge statut={txn.statut} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => onReceipt(txn)} title="Voir reçu"
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center text-sm transition-colors">
                      🧾
                    </button>
                    {txn.statut === 'en_attente' && (
                      <button onClick={() => onMarkPaid(txn.id)} title="Marquer payé"
                        className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center text-sm transition-colors">
                        💵
                      </button>
                    )}
                    <button onClick={() => window.print()} title="Imprimer"
                      className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-sm transition-colors">
                      🖨️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals footer */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-gray-400 text-xs">Sous-total</span>
            <p className="font-semibold text-gray-700">{fmtDA(totals.sousTotal)}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Total remises</span>
            <p className="font-semibold text-red-500">-{fmtDA(totals.remise)}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Frais déplacement</span>
            <p className="font-semibold text-teal-600">+{fmtDA(totals.frais)}</p>
          </div>
          <div className="ml-auto">
            <span className="text-gray-400 text-xs">TOTAL NET</span>
            <p className="text-2xl font-black text-[#1565C0]">{fmtDA(totals.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Enterprise Invoices Tab ────────────────────────────────────── */
function EnterprisesTab({ factures, onUpdate }) {
  function setStatut(id, statut) {
    onUpdate(factures.map(f => f.id === id ? { ...f, statut } : f));
  }

  const totalPending = factures.filter(f => f.statut !== 'payee').reduce((s, f) => s + f.montantTotal, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Entreprises actives', value: factures.length,                                  icon: '🏢', color: 'text-[#1565C0]',  bg: 'bg-blue-50'   },
          { label: 'À facturer ce mois',  value: factures.filter(f => f.statut !== 'payee').length, icon: '📄', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Montant en attente',  value: fmtDA(totalPending),                               icon: '💸', color: 'text-red-600',    bg: 'bg-red-50'    },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {factures.map(f => (
        <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl shrink-0">🏢</div>
              <div>
                <p className="font-bold text-gray-900">{f.entreprise}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.mois} · {f.utilisationsMois} utilisations</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Montant à facturer</p>
                <p className="text-xl font-black text-[#1565C0]">{fmtDA(f.montantTotal)}</p>
              </div>
              <FactureStatutBadge statut={f.statut} />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors">
                📄 Générer PDF
              </button>
              {f.statut === 'non_envoyee' && (
                <button onClick={() => setStatut(f.id, 'envoyee')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-xs font-semibold text-blue-700 transition-colors">
                  📤 Envoyer email
                </button>
              )}
              {f.statut !== 'payee' && (
                <button onClick={() => setStatut(f.id, 'payee')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-100 hover:bg-green-200 text-xs font-semibold text-green-700 transition-colors">
                  ✓ Marquer payée
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Détail : {f.utilisationsMois} RDV × {fmtDA(Math.round(f.montantTotal / f.utilisationsMois))} moy.</span>
              <FactureStatutBadge statut={f.statut} />
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                f.statut === 'payee' ? 'bg-green-500 w-full' :
                f.statut === 'envoyee' ? 'bg-blue-500 w-2/3' :
                'bg-gray-400 w-1/3'
              }`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Export section ─────────────────────────────────────────────── */
function ExportSection() {
  const EXPORTS = [
    { label: 'Transactions CSV',      icon: '📥', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',    desc: 'Toutes les transactions du mois'    },
    { label: 'Rapport mensuel PDF',   icon: '📊', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', desc: 'Bilan complet Avril 2026'           },
    { label: 'Rapport annuel PDF',    icon: '📈', color: 'bg-green-50 text-green-700 hover:bg-green-100',  desc: 'Résumé annuel 2026'                 },
    { label: 'Factures entreprises',  icon: '🏢', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',desc: 'Archive ZIP de toutes les factures' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 mb-4">Export & rapports</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {EXPORTS.map(e => (
          <button key={e.label}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 text-center transition-colors ${e.color}`}>
            <span className="text-2xl">{e.icon}</span>
            <span className="text-xs font-bold">{e.label}</span>
            <span className="text-[10px] opacity-70">{e.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [factures,     setFactures]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [receiptTxn, setReceiptTxn] = useState(null);

  // ── Supabase ──
  useEffect(() => { chargerFinance(); }, []);

  const chargerFinance = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data: txData } = await supabase
      .from('paiements')
      .select(`*, rdv(*, patients(nom, telephone))`)
      .gte('created_at', today)
      .order('created_at', { ascending: false });
    if (txData) setTransactions(txData);

    const { data: factData } = await supabase
      .from('promos')
      .select('*')
      .eq('type', 'entreprise');
    if (factData) setFactures(factData);

    setLoading(false);
  };

  async function handleMarkPaid(id) {
    await supabase.from('paiements').update({ statut: 'paye', date_paiement: new Date().toISOString() }).eq('id', id);
    chargerFinance();
  }

  const TABS = [
    { key: 'transactions', label: '📋 Transactions' },
    { key: 'graphiques',   label: '📊 Graphiques'   },
    { key: 'entreprises',  label: '🏢 Factures entreprises' },
  ];

  /* KPIs */
  const payeesToday   = transactions.filter(t => t.statut === 'paye');
  const totalToday    = payeesToday.reduce((s, t) => s + t.total, 0);
  const enAttente     = transactions.filter(t => t.statut === 'en_attente').length;
  const remisesToday  = transactions.reduce((s, t) => s + t.remise, 0);

  const STAT_ROWS = [
    [
      { label: "CA aujourd'hui",       value: fmtDA(totalToday),       sub: '↑ +18% vs hier',     icon: '💰', color: 'text-[#1565C0]',  bg: 'bg-blue-50',   border: 'border-blue-100'   },
      { label: 'Paiements reçus',       value: payeesToday.length,      sub: 'transactions',        icon: '✅', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100'  },
      { label: 'En attente paiement',   value: enAttente,               sub: 'à encaisser',         icon: '⏳', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
      { label: "Remises aujourd'hui",   value: fmtDA(remisesToday),     sub: 'codes promo appliqués',icon: '🎟️', color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100'    },
    ],
    [
      { label: 'CA ce mois',            value: '1 245 000 DA',          sub: '↑ +22% vs mois der.', icon: '📈', color: 'text-[#1565C0]',  bg: 'bg-blue-50',   border: 'border-blue-100'   },
      { label: 'RDV facturés ce mois',  value: '312',                   sub: 'consultations',       icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
      { label: 'Moyenne par RDV',       value: '3 990 DA',              sub: 'ticket moyen',        icon: '📊', color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100'   },
      { label: 'Remises totales',       value: '124 500 DA',            sub: 'ce mois',             icon: '💸', color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100'    },
    ],
  ];

  const ROW_LABELS = ["Aujourd'hui", "Ce mois"];

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <div className="p-6 space-y-6">

      {/* ── Stats ── */}
      {STAT_ROWS.map((row, rowIdx) => (
        <div key={rowIdx}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{ROW_LABELS[rowIdx]}</p>
          <div className="grid grid-cols-4 gap-4">
            {row.map(({ label, value, sub, icon, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{icon}</span>
                </div>
                <p className={`text-2xl font-black ${color} leading-tight`}>{value}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === t.key ? 'bg-white text-[#1565C0] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TRANSACTIONS TAB ══ */}
      {activeTab === 'transactions' && (
        <TransactionsTable
          transactions={transactions}
          onReceipt={setReceiptTxn}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {/* ══ GRAPHIQUES TAB ══ */}
      {activeTab === 'graphiques' && (
        <div className="space-y-6">
          <CABarChart data={CA_DATA} />
          <div className="grid grid-cols-2 gap-6">
            <PaymentDonut />
            <TopAnalysesChart data={TOP_ANALYSES} />
          </div>
        </div>
      )}

      {/* ══ ENTREPRISES TAB ══ */}
      {activeTab === 'entreprises' && (
        <EnterprisesTab factures={factures} onUpdate={setFactures} />
      )}

      {/* Export — always visible */}
      <ExportSection />

      {/* Receipt Modal */}
      {receiptTxn && <ReceiptModal txn={receiptTxn} onClose={() => setReceiptTxn(null)} />}
    </div>
  );
}
