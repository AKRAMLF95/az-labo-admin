'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/* ─── Données ────────────────────────────────────────────────────── */
const RDV_DATA = [
  {
    id: 1, heure: '07:30',
    nom: 'Karim Amrani',   tel: '+213 555 123 456',
    analyses: ['NFS', 'Glycémie'],
    lieu: 'labo', statut: 'termine',
    paiement: {
      sousTotal: 550, remise: 110, codePromo: 'AZLAUNCH',
      fraisDeplacement: 0, total: 440,
      mode: 'cash', statut: 'paye_cash',
      datePaiement: 'Auj. 07:45', recu: 'TXN-2604-001', technicien: null,
    },
  },
  {
    id: 2, heure: '08:00',
    nom: 'Sara Bensalem',  tel: '+213 661 789 012',
    analyses: ['Bilan complet'],
    lieu: 'labo', statut: 'en_cours',
    paiement: {
      sousTotal: 500, remise: 0, codePromo: '',
      fraisDeplacement: 0, total: 500,
      mode: 'carte', statut: 'en_attente',
      datePaiement: null, recu: null, technicien: null,
    },
  },
  {
    id: 3, heure: '08:30',
    nom: 'Mohamed Ouali',  tel: '+213 770 345 678',
    analyses: ['ECBU', 'CRP'],
    lieu: 'labo', statut: 'en_attente',
    paiement: {
      sousTotal: 650, remise: 65, codePromo: 'FAMILLE10',
      fraisDeplacement: 0, total: 585,
      mode: 'cash', statut: 'en_attente',
      datePaiement: null, recu: null, technicien: null,
    },
  },
  {
    id: 4, heure: '09:00',
    nom: 'Fatima Djilali', tel: '+213 550 901 234',
    analyses: ['Hormones', 'TSH'],
    lieu: 'domicile', statut: 'confirme',
    paiement: {
      sousTotal: 900, remise: 270, codePromo: 'SONATRACH2026',
      fraisDeplacement: 500, total: 1130,
      mode: 'cash', statut: 'paye_technicien',
      datePaiement: 'Auj. 09:45', recu: 'TXN-2604-004',
      technicien: 'Amine Merzougui',
    },
  },
  {
    id: 5, heure: '09:30',
    nom: 'Youcef Hamdi',   tel: '+213 661 456 789',
    analyses: ['NFS', 'Cholestérol'],
    lieu: 'labo', statut: 'en_attente',
    paiement: {
      sousTotal: 600, remise: 0, codePromo: '',
      fraisDeplacement: 0, total: 600,
      mode: null, statut: 'non_facture',
      datePaiement: null, recu: null, technicien: null,
    },
  },
  {
    id: 6, heure: '10:00',
    nom: 'Amina Kaci',     tel: '+213 770 234 567',
    analyses: ['TSH', 'T3', 'T4'],
    lieu: 'domicile', statut: 'confirme',
    paiement: {
      sousTotal: 1250, remise: 0, codePromo: '',
      fraisDeplacement: 500, total: 1750,
      mode: null, statut: 'non_facture',
      datePaiement: null, recu: null, technicien: null,
    },
  },
];

const ANALYSE_PRICES = {
  NFS: 350, Glycémie: 200, 'Bilan complet': 500, ECBU: 350, CRP: 300,
  Hormones: 500, TSH: 450, T3: 400, T4: 400, Cholestérol: 250, VS: 200,
};

const PROMOS_DB = {
  AZLAUNCH:      { valeur: 20, type: 'pourcentage' },
  FAMILLE10:     { valeur: 10, type: 'pourcentage' },
  SONATRACH2026: { valeur: 30, type: 'pourcentage' },
  RAMADAN2026:   { valeur: 15, type: 'pourcentage' },
  BILANFREE:     { valeur: 0,  type: 'analyse_gratuite', analyses: ['NFS'] },
};

/* ─── Config ─────────────────────────────────────────────────────── */
const FILTERS = [
  { key: 'tous',        label: 'Tous',       count: 24 },
  { key: 'en_attente',  label: 'En attente', count: 8  },
  { key: 'ordonnance',  label: 'Ordonnances', count: 0, icon: '📋' },
  { key: 'en_cours',    label: 'En cours',   count: 3  },
  { key: 'termine',     label: 'Terminés',   count: 11 },
  { key: 'domicile',    label: 'Domicile',   count: 5  },
];

const STATUT_CONFIG = {
  termine:    { label: '✓ Terminé',   cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
  en_cours:   { label: 'En cours',    cls: 'bg-[#E3F2FD] text-[#1565C0]' },
  en_attente: { label: 'En attente',  cls: 'bg-[#FFF3E0] text-[#E65100]' },
  confirme:   { label: '✓ Confirmé',  cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
  annule:     { label: '✗ Annulé',    cls: 'bg-[#FFEBEE] text-[#C62828]' },
};

const PRELEVEMENT_CONFIG = {
  en_attente: { label: '⏳ En attente', cls: 'bg-gray-100 text-gray-500'     },
  recu:       { label: '✓ Reçu',       cls: 'bg-[#E3F2FD] text-[#1565C0]'  },
  en_analyse: { label: '🔬 En analyse',cls: 'bg-orange-100 text-orange-700' },
  termine:    { label: '✓ Terminé',     cls: 'bg-green-100 text-green-700'   },
};

const LIEU_CONFIG = {
  labo:     { label: '🏥 Labo',     cls: 'bg-[#E3F2FD] text-[#1565C0]' },
  domicile: { label: '🏠 Domicile', cls: 'bg-[#FFF9C4] text-[#F57F17]' },
};

const PAIEMENT_CONFIG = {
  non_facture:      { label: 'Non facturé',   cls: 'bg-gray-100 text-gray-500'         },
  en_attente:       { label: '⏳ En attente', cls: 'bg-orange-100 text-orange-700'     },
  paye_cash:        { label: '✓ Cash',        cls: 'bg-green-100 text-green-700'       },
  paye_carte:       { label: '✓ Carte',       cls: 'bg-green-100 text-green-700'       },
  paye_technicien:  { label: '✓ Tech',        cls: 'bg-blue-100 text-blue-700'         },
  rembourse:        { label: '↩ Remboursé',   cls: 'bg-red-100 text-red-500'           },
  gratuit:          { label: '🎁 Gratuit',    cls: 'bg-purple-100 text-purple-700'     },
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtDA(n) { return n.toLocaleString('fr-DZ') + ' DA'; }

function genTxnId() {
  const d = new Date();
  const ds = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}`;
  return `TXN-${ds}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

/* ─── Encaisser Modal ────────────────────────────────────────────── */
function EncaisserModal({ rdv, onClose, onConfirm }) {
  const basePrices = rdv.analyses.map(a => ({
    label: a,
    prix: ANALYSE_PRICES[a] || Math.round(rdv.paiement.sousTotal / rdv.analyses.length),
  }));
  const baseTotal = basePrices.reduce((s, a) => s + a.prix, 0);

  const [codePromo,    setCodePromo]    = useState(rdv.paiement.codePromo || '');
  const [promoApplied, setPromoApplied] = useState(rdv.paiement.codePromo ? PROMOS_DB[rdv.paiement.codePromo] || null : null);
  const [promoError,   setPromoError]   = useState('');
  const [mode,         setMode]         = useState(rdv.paiement.mode || 'cash');
  const [confirmed,    setConfirmed]    = useState(false);

  const frais       = rdv.lieu === 'domicile' ? 500 : 0;
  const remisePct   = promoApplied?.type === 'pourcentage' ? promoApplied.valeur : 0;
  const remise      = Math.round(baseTotal * remisePct / 100);
  const totalNet    = baseTotal - remise + frais;

  function applyPromo() {
    const p = PROMOS_DB[codePromo.trim().toUpperCase()];
    if (!p) { setPromoError('Code invalide ou expiré'); setPromoApplied(null); return; }
    setPromoError('');
    setPromoApplied(p);
    setCodePromo(codePromo.trim().toUpperCase());
  }

  function removePromo() { setPromoApplied(null); setCodePromo(''); setPromoError(''); }

  const MODE_OPTIONS = [
    { key: 'cash',        label: '💵 Cash labo',         desc: 'Espèces remises au labo'         },
    { key: 'carte',       label: '💳 Carte bancaire',    desc: 'Terminal de paiement'            },
    ...(rdv.lieu === 'domicile'
      ? [{ key: 'technicien', label: '🚗 Cash technicien', desc: 'Espèces remises au technicien' }]
      : []),
  ];

  function handleConfirm() {
    const statutPaiement =
      totalNet === 0 ? 'gratuit' :
      mode === 'cash' ? 'paye_cash' :
      mode === 'carte' ? 'paye_carte' : 'paye_technicien';

    onConfirm(rdv.id, {
      sousTotal: baseTotal,
      remise,
      codePromo: promoApplied ? codePromo : '',
      fraisDeplacement: frais,
      total: totalNet,
      mode,
      statut: statutPaiement,
      datePaiement: 'Auj.',
      recu: genTxnId(),
      technicien: mode === 'technicien' ? 'Technicien assigné' : null,
    });
    setConfirmed(true);
  }

  if (confirmed) {
    const statutPaiement = totalNet === 0 ? 'gratuit' : mode === 'cash' ? 'paye_cash' : mode === 'carte' ? 'paye_carte' : 'paye_technicien';
    const cfg = PAIEMENT_CONFIG[statutPaiement];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Paiement enregistré !</h3>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-semibold text-gray-800">{rdv.nom}</span> — <span className="font-black text-[#1565C0]">{fmtDA(totalNet)}</span>
          </p>
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-lg">💰 Encaisser le paiement</p>
            <p className="text-white/70 text-sm">{rdv.nom} · {rdv.heure}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center text-lg transition-colors">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Détail analyses */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Analyses demandées</p>
            <div className="bg-gray-50 rounded-xl overflow-hidden divide-y divide-gray-100">
              {basePrices.map(a => (
                <div key={a.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-700">{a.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{fmtDA(a.prix)}</span>
                </div>
              ))}
              {frais > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-teal-600">🚗 Frais déplacement</span>
                  <span className="text-sm font-semibold text-teal-600">+{fmtDA(frais)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Code promo */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Code promo</p>
            {promoApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-black">✓</span>
                  <div>
                    <p className="text-sm font-bold text-green-700 font-mono">{codePromo}</p>
                    <p className="text-xs text-green-600">
                      {promoApplied.type === 'pourcentage'
                        ? `-${promoApplied.valeur}% → -${fmtDA(remise)}`
                        : 'Analyse offerte'
                      }
                    </p>
                  </div>
                </div>
                <button onClick={removePromo} className="text-xs text-red-400 hover:text-red-600 font-semibold">Retirer</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={codePromo}
                  onChange={e => { setCodePromo(e.target.value.toUpperCase()); setPromoError(''); }}
                  placeholder="ex: AZLAUNCH"
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors focus:ring-2 ${
                    promoError
                      ? 'border-red-400 bg-red-50 focus:ring-red-200'
                      : 'border-gray-200 bg-gray-50 focus:border-[#1565C0] focus:ring-[#1565C0]/20'
                  }`}
                />
                <button onClick={applyPromo}
                  className="px-4 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors whitespace-nowrap">
                  Appliquer
                </button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
          </div>

          {/* Récapitulatif montants */}
          <div className="bg-[#E3F2FD] rounded-xl px-4 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-semibold text-gray-800">{fmtDA(baseTotal)}</span>
            </div>
            {remise > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Remise -{remisePct}% ({codePromo})</span>
                <span className="font-semibold">-{fmtDA(remise)}</span>
              </div>
            )}
            {frais > 0 && (
              <div className="flex justify-between text-sm text-teal-600">
                <span>Frais déplacement</span>
                <span className="font-semibold">+{fmtDA(frais)}</span>
              </div>
            )}
            <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total à encaisser</span>
              <span className="text-2xl font-black text-[#1565C0]">{fmtDA(totalNet)}</span>
            </div>
          </div>

          {/* Mode paiement */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mode de paiement</p>
            <div className="space-y-2">
              {MODE_OPTIONS.map(opt => (
                <button key={opt.key} type="button" onClick={() => setMode(opt.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    mode === opt.key
                      ? 'border-[#1565C0] bg-[#E3F2FD] shadow-sm'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    mode === opt.key ? 'border-[#1565C0] bg-[#1565C0]' : 'border-gray-300'
                  }`}>
                    {mode === opt.key && <span className="w-2 h-2 rounded-full bg-white inline-block" />}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${mode === opt.key ? 'text-[#1565C0]' : 'text-gray-700'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            Annuler
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">
            ✓ Confirmer — {fmtDA(totalNet)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Receipt Modal ──────────────────────────────────────────────── */
function ReceiptModal({ rdv, onClose }) {
  const p = rdv.paiement;
  const remisePct = p.sousTotal > 0 ? Math.round((p.remise / p.sousTotal) * 100) : 0;
  const ANALYSE_PRICES_MAP = { NFS: 350, Glycémie: 200, 'Bilan complet': 500, ECBU: 350, CRP: 300, Hormones: 500, TSH: 450, T3: 400, T4: 400, Cholestérol: 250, VS: 200 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Reçu de paiement</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600 transition-colors">
              🖨️ Imprimer
            </button>
            <button className="px-3 py-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-xs font-semibold text-green-700 transition-colors">
              📱 WhatsApp
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">✕</button>
          </div>
        </div>
        <div className="px-6 py-5 font-mono text-sm">
          <div className="text-center mb-4">
            <p className="font-black text-xl tracking-widest text-[#1565C0]">AZ LABORATOIRES</p>
            <p className="text-xs text-gray-400">Birkhadem, Alger · 023 XX XX XX</p>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="space-y-0.5 text-xs mb-3">
            <div className="flex justify-between"><span className="text-gray-400">Reçu N°</span><span className="font-bold">{p.recu}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-bold">{p.datePaiement}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Patient</span><span className="font-bold">{rdv.nom}</span></div>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="space-y-1 text-xs">
            {rdv.analyses.map(a => {
              const prix = ANALYSE_PRICES_MAP[a] || Math.round(p.sousTotal / rdv.analyses.length);
              return (
                <div key={a} className="flex justify-between">
                  <span className="text-gray-700">{a}</span>
                  <span className="text-gray-700">{fmtDA(prix)}</span>
                </div>
              );
            })}
            {p.fraisDeplacement > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Frais déplacement</span>
                <span className="text-gray-700">{fmtDA(p.fraisDeplacement)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Sous-total</span><span className="text-gray-600">{fmtDA(p.sousTotal + p.fraisDeplacement)}</span></div>
            {p.remise > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Remise {remisePct > 0 ? `-${remisePct}%` : ''} {p.codePromo ? `(${p.codePromo})` : ''}</span>
                <span>-{fmtDA(p.remise)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-gray-300 my-3" />
          <div className="flex justify-between items-center mb-2">
            <span className="font-black text-gray-900">TOTAL</span>
            <span className="font-black text-lg text-[#1565C0]">{fmtDA(p.total)}</span>
          </div>
          <div className="text-xs space-y-0.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Mode</span>
              <span className="font-semibold">{p.mode === 'cash' ? '💵 Cash' : p.mode === 'carte' ? '💳 Carte' : '🚗 Technicien'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Statut</span>
              <span className={`font-semibold ${PAIEMENT_CONFIG[p.statut]?.cls.replace('bg-','text-').replace(/ bg-\S+/,'') || ''}`}>
                {PAIEMENT_CONFIG[p.statut]?.label || p.statut}
              </span>
            </div>
            {p.technicien && (
              <div className="flex justify-between"><span className="text-gray-400">Technicien</span><span className="font-semibold">{p.technicien}</span></div>
            )}
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="text-center text-xs text-gray-400">
            <p>Merci pour votre confiance</p>
            <p className="font-semibold text-[#1565C0] mt-0.5">azlaboratoires.dz</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal détail ───────────────────────────────────────────────── */
function DetailModal({ rdv, onClose }) {
  if (!rdv) return null;
  const statut = STATUT_CONFIG[rdv.statut] ?? { label: rdv.statut, cls: '' };
  const lieu   = LIEU_CONFIG[rdv.lieu]     ?? { label: rdv.lieu,   cls: '' };
  const pCfg   = PAIEMENT_CONFIG[rdv.paiement?.statut] ?? { label: '—', cls: 'bg-gray-100 text-gray-400' };
  const p      = rdv.paiement;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-lg">{rdv.nom}</p>
            <p className="text-white/70 text-sm">{rdv.tel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center text-lg transition-colors">×</button>
        </div>
        <div className="px-6 py-5 space-y-3.5">
          <Row label="Heure"    value={rdv.heure} />
          <Row label="Lieu">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lieu.cls}`}>{lieu.label}</span>
          </Row>
          <Row label="Statut">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statut.cls}`}>{statut.label}</span>
          </Row>
          <Row label="Analyses">
            <div className="flex flex-wrap gap-1.5">
              {rdv.analyses.map(a => (
                <span key={a} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#1565C0]">{a}</span>
              ))}
            </div>
          </Row>
          {p && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Paiement</p>
              </div>
              <Row label="Statut pmt">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pCfg.cls}`}>{pCfg.label}</span>
              </Row>
              {p.total > 0 && <Row label="Total" value={fmtDA(p.total)} />}
              {p.remise > 0 && <Row label="Remise" value={`-${fmtDA(p.remise)} (${p.codePromo})`} />}
              {p.fraisDeplacement > 0 && <Row label="Déplacement" value={`+${fmtDA(p.fraisDeplacement)}`} />}
              {p.mode && <Row label="Mode" value={p.mode === 'cash' ? '💵 Cash' : p.mode === 'carte' ? '💳 Carte' : '🚗 Technicien'} />}
              {p.recu && <Row label="N° Reçu"><span className="font-mono text-xs text-gray-700">{p.recu}</span></Row>}
              {p.datePaiement && <Row label="Payé le" value={p.datePaiement} />}
              {p.technicien && <Row label="Technicien" value={p.technicien} />}
            </>
          )}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24 shrink-0 pt-0.5">{label}</span>
      {children ?? <span className="text-sm font-medium text-[#111]">{value}</span>}
    </div>
  );
}

/* ─── ActionCell ─────────────────────────────────────────────────── */
function ActionCell({ rdv, onDetails, onEncaisser, onReceipt, onOrdonnance }) {
  const pStatut = rdv.paiement?.statut;
  const isPaid  = ['paye_cash','paye_carte','paye_technicien','gratuit'].includes(pStatut);

  if (rdv.statut === 'en_attente') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {rdv.statut_ordonnance === 'en_attente_lecture' && (
          <button onClick={() => onOrdonnance(rdv)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors whitespace-nowrap animate-pulse">
            👁️ Voir & Saisir
          </button>
        )}
        {rdv.lieu === 'domicile' && (
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1565C0] text-white hover:bg-[#0D47A1] transition-colors">
            Assigner
          </button>
        )}
        <button title="Confirmer"
          className="w-8 h-8 rounded-lg bg-[#E8F5E9] text-[#2E7D32] font-bold text-sm hover:bg-[#C8E6C9] transition-colors flex items-center justify-center">
          ✓
        </button>
        <button title="Annuler"
          className="w-8 h-8 rounded-lg bg-[#FFEBEE] text-[#C62828] font-bold text-sm hover:bg-[#FFCDD2] transition-colors flex items-center justify-center">
          ✗
        </button>
        {pStatut === 'en_attente' && (
          <button onClick={() => onEncaisser(rdv)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors whitespace-nowrap">
            💵 Encaisser
          </button>
        )}
        {pStatut === 'non_facture' && (
          <button onClick={() => onEncaisser(rdv)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors whitespace-nowrap">
            💰 Facturer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onDetails(rdv)}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
        ••• Détails
      </button>
      {isPaid && rdv.paiement?.recu && (
        <button onClick={() => onReceipt(rdv)} title="Voir reçu"
          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center text-sm transition-colors">
          🧾
        </button>
      )}
      {(pStatut === 'en_attente' || pStatut === 'non_facture') && (
        <button onClick={() => onEncaisser(rdv)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors whitespace-nowrap">
          💵 Encaisser
        </button>
      )}
    </div>
  );
}

/* ─── Modal lecture ordonnance ───────────────────────────────────── */
function OrdonnanceModal({ rdv, analysesList, onClose, onValidate }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const patientNom = rdv.patients?.nom || rdv.nom || 'Patient';

  const toggle = (nom) => {
    setSelected(prev => prev.includes(nom) ? prev.filter(n => n !== nom) : [...prev, nom]);
  };

  const q = search.toLowerCase().trim();
  const filteredAnalyses = analysesList.filter(a => !q || a.nom.toLowerCase().includes(q) || a.categorie.toLowerCase().includes(q));
  const categories = [...new Set(filteredAnalyses.map(a => a.categorie))];

  const handleValidate = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    await onValidate(rdv.id, selected, rdv.patients?.telephone);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <span>📋</span> Lecture ordonnance
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">Patient : {patientNom}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 transition-colors flex items-center justify-center text-lg leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Image ordonnance — cliquable pour agrandir */}
          {rdv.image_ordonnance && (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative group">
              <img
                src={rdv.image_ordonnance}
                alt="Ordonnance"
                className="w-full max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(rdv.image_ordonnance, '_blank')}
              />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Cliquer pour agrandir
              </div>
            </div>
          )}
          {!rdv.image_ordonnance && (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm">Aucune image d'ordonnance</p>
            </div>
          )}

          {/* Analyses sélectionnées */}
          {selected.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Analyses saisies ({selected.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map(nom => (
                  <span key={nom} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-[#E3F2FD] text-[#1565C0] text-xs font-medium">
                    <span>✓ {nom}</span>
                    <button onClick={() => toggle(nom)} className="w-4 h-4 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors flex items-center justify-center text-[10px] font-black ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search + quick filters */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Saisir les analyses</p>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une analyse..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-[#1565C0] transition mb-2" />

            {/* Category quick-select */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[...new Set(analysesList.map(a => a.categorie))].map(cat => (
                <button key={cat} onClick={() => setSearch(search === cat ? '' : cat)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    search === cat ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#1565C0]'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Grouped list */}
            <div className="max-h-52 overflow-y-auto space-y-3 border border-gray-100 rounded-xl p-3">
              {categories.map(cat => (
                <div key={cat}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{cat}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredAnalyses.filter(a => a.categorie === cat).map(a => {
                      const isSel = selected.includes(a.nom);
                      return (
                        <button key={a.id} onClick={() => toggle(a.nom)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                            isSel ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#1565C0] hover:text-[#1565C0]'
                          }`}>
                          {isSel && '✓ '}{a.nom}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 flex gap-3 shrink-0 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">Annuler</button>
          <button onClick={handleValidate} disabled={selected.length === 0 || saving}
            className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? 'Enregistrement...' : `✓ Valider et notifier (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────────────── */
export default function RdvPage() {
  const [rdvList,      setRdvList]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [activeFilter, setActiveFilter] = useState('tous');
  const [modalRdv,       setModalRdv]       = useState(null);
  const [encaisserRdv,   setEncaisserRdv]   = useState(null);
  const [receiptRdv,     setReceiptRdv]     = useState(null);
  const [ordonnanceRdv,  setOrdonnanceRdv]  = useState(null);
  const [analysesList,   setAnalysesList]   = useState([]);

  // ── Supabase ──
  useEffect(() => { chargerRdv(); chargerAnalyses(); }, []);

  const chargerRdv = async () => {
    setLoading(true);
    try {
      // Fetch RDV with patient, analyses, and paiement joins
      const { data: rdvData, error: rdvErr } = await supabase
        .from('rdv')
        .select(`*, patients(nom, telephone, whatsapp, pref_notif), rdv_analyses(prix, analyses(nom)), paiements(*)`)
        .order('created_at', { ascending: false });

      if (rdvErr) throw rdvErr;

      // Normalize into the shape the UI expects
      const normalized = (rdvData || []).map(r => {
        const patient = r.patients || {};
        const analysesNames = (r.rdv_analyses || []).map(ra => ra.analyses?.nom).filter(Boolean);
        const paiement = Array.isArray(r.paiements) ? r.paiements[0] : r.paiements;
        return {
          ...r,
          nom: patient.nom || '—',
          tel: patient.telephone || '—',
          heure: r.heure || '—',
          analyses: analysesNames,
          paiement: paiement || { sousTotal: 0, remise: 0, codePromo: '', fraisDeplacement: 0, total: 0, mode: null, statut: 'non_facture', datePaiement: null, recu: null, technicien: null },
        };
      });

      setRdvList(normalized);
    } catch (err) {
      console.error('chargerRdv error:', err);
      setRdvList([]);
    }
    setLoading(false);
  };

  const chargerAnalyses = async () => {
    const { data } = await supabase.from('analyses').select('id, nom, categorie').eq('actif', true).order('categorie');
    if (data) setAnalysesList(data);
  };

  const confirmerRdv = async (id) => {
    await supabase.from('rdv').update({ statut: 'confirme' }).eq('id', id);
    chargerRdv();
  };

  const annulerRdv = async (id) => {
    await supabase.from('rdv').update({ statut: 'annule' }).eq('id', id);
    chargerRdv();
  };

  const encaisserPaiement = async (id, mode, total) => {
    await supabase.from('rdv').update({ statut: 'termine' }).eq('id', id);
    await supabase.from('paiements').insert({
      rdv_id: id, total, mode,
      statut: `paye_${mode}`,
      date_paiement: new Date().toISOString(),
      recu: `TXN-${Date.now()}`,
    });
    chargerRdv();
  };

  const validerOrdonnance = async (rdvId, analyses, patientTel) => {
    await supabase.from('rdv').update({
      statut_ordonnance: 'analyses_saisies',
      statut: 'confirme',
    }).eq('id', rdvId);

    // Link analyses to rdv
    for (const nom of analyses) {
      const found = analysesList.find(a => a.nom === nom);
      if (found) {
        await supabase.from('rdv_analyses').insert({ rdv_id: rdvId, analyse_id: found.id });
      }
    }

    // TODO: WhatsApp notification via API
    console.log('Notifier patient:', patientTel, 'Analyses:', analyses);
    alert('Analyses saisies et patient notifié !');
    chargerRdv();
  };

  // ── Prélèvement workflow ──
  const confirmerPrelevement = async (rdvId, patientNom) => {
    if (!confirm(`Confirmer la réception du prélèvement de ${patientNom} ?`)) return;
    await supabase.from('rdv').update({
      statut_prelevement: 'recu',
      date_prelevement: new Date().toISOString(),
    }).eq('id', rdvId);
    chargerRdv();
    alert('Prélèvement confirmé pour ' + patientNom);
  };

  const lancerAnalyse = async (rdvId) => {
    await supabase.from('rdv').update({ statut_prelevement: 'en_analyse' }).eq('id', rdvId);
    chargerRdv();
  };

  const terminerAnalyse = async (rdvId) => {
    await supabase.from('rdv').update({ statut_prelevement: 'termine' }).eq('id', rdvId);
    chargerRdv();
  };

  const ordonnanceCount = rdvList.filter(r => r.statut_ordonnance === 'en_attente_lecture').length;

  const filtered = rdvList.filter(rdv => {
    const q = search.toLowerCase().trim();
    const nom = rdv.patients?.nom || rdv.nom || '';
    const analyses = rdv.analyses || [];
    const matchSearch = !q
      || nom.toLowerCase().includes(q)
      || (Array.isArray(analyses) && analyses.some(a => a.toLowerCase().includes(q)));
    let matchFilter = true;
    if (activeFilter === 'ordonnance') matchFilter = rdv.statut_ordonnance === 'en_attente_lecture';
    else if (activeFilter === 'domicile')  matchFilter = rdv.lieu === 'domicile';
    else if (activeFilter !== 'tous') matchFilter = rdv.statut === activeFilter;
    return matchSearch && matchFilter;
  });

  function handleConfirmPaiement(rdvId, paiement) {
    setRdvList(prev => prev.map(r =>
      r.id === rdvId ? { ...r, paiement: { ...r.paiement, ...paiement } } : r
    ));
  }

  /* Finance summary bar */
  const totalCA     = rdvList.reduce((s, r) => ['paye_cash','paye_carte','paye_technicien'].includes(r.paiement?.statut) ? s + r.paiement.total : s, 0);
  const enAttente   = rdvList.filter(r => ['en_attente','non_facture'].includes(r.paiement?.statut)).length;
  const totalRemise = rdvList.reduce((s, r) => s + (r.paiement?.remise || 0), 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <>
      <div className="space-y-5">

        {/* ── Finance summary ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "CA encaissé auj.", value: fmtDA(totalCA),  icon: '💰', color: 'text-[#1565C0]',  bg: 'bg-blue-50',   border: 'border-blue-100'   },
            { label: 'En attente',        value: enAttente,       icon: '⏳', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: 'Remises accordées', value: fmtDA(totalRemise), icon: '🎟️', color: 'text-red-500', bg: 'bg-red-50',    border: 'border-red-100'    },
          ].map(({ label, value, icon, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl px-5 py-4 flex items-center gap-4`}>
              <span className="text-2xl">{icon}</span>
              <div>
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Barre recherche + filtres ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un RDV, patient..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition" />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => {
              const isActive = activeFilter === f.key;
              const count = f.key === 'ordonnance' ? ordonnanceCount
                : f.key === 'tous' ? rdvList.length
                : f.key === 'domicile' ? rdvList.filter(r => r.lieu === 'domicile').length
                : rdvList.filter(r => r.statut === f.key).length;
              const isOrd = f.key === 'ordonnance' && count > 0;
              return (
                <button key={f.key} onClick={() => setActiveFilter(f.key)}
                  className={`text-sm font-semibold px-4 py-1.5 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-[#1565C0] text-white border-[#1565C0]'
                      : isOrd
                        ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1565C0] hover:text-[#1565C0]'
                  }`}>
                  {f.icon ? `${f.icon} ` : ''}{f.label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white'
                      : isOrd ? 'bg-orange-200 text-orange-800'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tableau ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Heure','Patient','Analyses','Lieu','Statut','Prélèvement','Montant','Paiement','Actions'].map(col => (
                    <th key={col} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-400 text-sm">Aucun RDV trouvé</td></tr>
                ) : filtered.map(rdv => {
                  const statut = STATUT_CONFIG[rdv.statut] ?? { label: rdv.statut, cls: '' };
                  const lieu   = LIEU_CONFIG[rdv.lieu]     ?? { label: rdv.lieu,   cls: '' };
                  const p      = rdv.paiement;
                  const pCfg   = PAIEMENT_CONFIG[p?.statut] ?? { label: '—', cls: 'bg-gray-100 text-gray-400' };

                  return (
                    <tr key={rdv.id} className="hover:bg-gray-50/70 transition-colors">

                      {/* Heure */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-[#1565C0]">{rdv.heure}</span>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#111]">{rdv.nom}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{rdv.tel}</p>
                      </td>

                      {/* Analyses */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {rdv.analyses.map(a => (
                            <span key={a} className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{a}</span>
                          ))}
                        </div>
                      </td>

                      {/* Lieu */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lieu.cls}`}>{lieu.label}</span>
                      </td>

                      {/* Statut RDV */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statut.cls}`}>{statut.label}</span>
                        {rdv.statut_ordonnance === 'en_attente_lecture' && (
                          <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">📋 Ordonnance</span>
                        )}
                      </td>

                      {/* Prélèvement */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {(() => {
                          const sp = rdv.statut_prelevement || 'en_attente';
                          const pCfgPrel = PRELEVEMENT_CONFIG[sp] || PRELEVEMENT_CONFIG.en_attente;
                          return (
                            <div className="flex flex-col items-start gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pCfgPrel.cls}`}>{pCfgPrel.label}</span>
                              {sp === 'en_attente' && rdv.statut !== 'en_attente' && (
                                <button onClick={() => confirmerPrelevement(rdv.id, rdv.nom)}
                                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors whitespace-nowrap">
                                  ✓ Prélèvement reçu
                                </button>
                              )}
                              {sp === 'recu' && (
                                <button onClick={() => lancerAnalyse(rdv.id)}
                                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] transition-colors whitespace-nowrap">
                                  🔬 Lancer analyse
                                </button>
                              )}
                              {sp === 'en_analyse' && (
                                <button onClick={() => terminerAnalyse(rdv.id)}
                                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors whitespace-nowrap">
                                  ✓ Analyse terminée
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Montant */}
                      <td className="px-5 py-4 whitespace-nowrap min-w-[110px]">
                        {p && p.total > 0 ? (
                          <div>
                            {p.remise > 0 ? (
                              <>
                                <p className="text-xs text-gray-400 line-through">{fmtDA(p.sousTotal)}</p>
                                <p className="text-sm font-black text-green-600">{fmtDA(p.total)}</p>
                              </>
                            ) : (
                              <p className="text-sm font-black text-gray-800">{fmtDA(p.total)}</p>
                            )}
                            {p.codePromo && (
                              <span className="text-[10px] font-mono font-bold text-[#1565C0] bg-[#E3F2FD] px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                {p.codePromo}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Paiement statut */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pCfg.cls}`}>{pCfg.label}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <ActionCell
                          rdv={rdv}
                          onDetails={setModalRdv}
                          onEncaisser={setEncaisserRdv}
                          onReceipt={setReceiptRdv}
                          onOrdonnance={setOrdonnanceRdv}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Bouton nouveau RDV ── */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm">
            <span className="text-base font-bold">+</span>
            Nouveau RDV manuel
          </button>
        </div>
      </div>

      {/* Modals */}
      <DetailModal    rdv={modalRdv}     onClose={() => setModalRdv(null)} />
      {encaisserRdv && (
        <EncaisserModal
          rdv={encaisserRdv}
          onClose={() => setEncaisserRdv(null)}
          onConfirm={(id, paiement) => { handleConfirmPaiement(id, paiement); }}
        />
      )}
      {receiptRdv && <ReceiptModal rdv={receiptRdv} onClose={() => setReceiptRdv(null)} />}
      {ordonnanceRdv && (
        <OrdonnanceModal
          rdv={ordonnanceRdv}
          analysesList={analysesList}
          onClose={() => setOrdonnanceRdv(null)}
          onValidate={validerOrdonnance}
        />
      )}
    </>
  );
}
