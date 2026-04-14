'use client';

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
  { key: 'tous',        label: 'Tous',        count: 0 },
  { key: 'en_attente',  label: 'En attente',  count: 0 },
  { key: 'ordonnance',  label: 'Ordonnances', count: 0, icon: '📋' },
  { key: 'confirme',    label: 'Confirmés',   count: 0 },
  { key: 'domicile',    label: 'Domicile',    count: 0 },
  { key: 'historique',  label: 'Historique',   count: 0, icon: '📋' },
];

const STATUT_CONFIG = {
  termine:    { label: '✓ Terminé',   cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
  en_cours:   { label: 'En cours',    cls: 'bg-[#E3F2FD] text-[#1565C0]' },
  en_attente: { label: 'En attente',  cls: 'bg-[#FFF3E0] text-[#E65100]' },
  confirme:   { label: '✓ Confirmé',  cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
  annule:     { label: '✗ Annulé',    cls: 'bg-[#FFEBEE] text-[#C62828]' },
};

const PRELEVEMENT_CONFIG = {
  en_attente:     { label: '⏳ En attente',    cls: 'bg-gray-100 text-gray-500'     },
  assigne:        { label: '🚗 Assigné',       cls: 'bg-blue-100 text-blue-700'     },
  recu:           { label: '🧪 Reçu',         cls: 'bg-[#E3F2FD] text-[#1565C0]'  },
  en_analyse:     { label: '🔬 En analyse',    cls: 'bg-orange-100 text-orange-700' },
  termine:        { label: '✓ Terminé',        cls: 'bg-green-100 text-green-700'   },
  resultat_saisi: { label: '📊 Résultat saisi',cls: 'bg-purple-100 text-purple-700' },
};

const REFERENCES = {
  'NFS':                { unite: 'G/L',     ref: '4–10'    },
  'Hémogramme':         { unite: 'G/L',     ref: '4–10'    },
  'VS':                 { unite: 'mm/h',    ref: '<20'     },
  'Glycémie à jeun':    { unite: 'mmol/L',  ref: '3.9–5.5' },
  'HbA1c':              { unite: '%',       ref: '<5.7'    },
  'Cholestérol total':  { unite: 'mmol/L',  ref: '<5.2'    },
  'HDL':                { unite: 'mmol/L',  ref: '>1.0'    },
  'LDL':                { unite: 'mmol/L',  ref: '<3.4'    },
  'Triglycérides':      { unite: 'mmol/L',  ref: '<1.7'    },
  'Créatinine':         { unite: 'µmol/L',  ref: '62–106'  },
  'Urée':               { unite: 'mmol/L',  ref: '2.5–7.5' },
  'Acide urique':       { unite: 'µmol/L',  ref: '150–420' },
  'ASAT':               { unite: 'UI/L',    ref: '<40'     },
  'ALAT':               { unite: 'UI/L',    ref: '<45'     },
  'GGT':                { unite: 'UI/L',    ref: '<55'     },
  'Fer sérique':        { unite: 'µmol/L',  ref: '10–30'   },
  'Ferritine':          { unite: 'ng/mL',   ref: '20–300'  },
  'Calcium':            { unite: 'mmol/L',  ref: '2.15–2.55'},
  'Sodium':             { unite: 'mmol/L',  ref: '136–145' },
  'Potassium':          { unite: 'mmol/L',  ref: '3.5–5.0' },
  'CRP':                { unite: 'mg/L',    ref: '<5'      },
  'TSH':                { unite: 'mUI/L',   ref: '0.4–4.0' },
  'T3 libre':           { unite: 'pmol/L',  ref: '3.5–6.5' },
  'T4 libre':           { unite: 'pmol/L',  ref: '10–20'   },
  'FSH':                { unite: 'UI/L',    ref: '1.5–12'  },
  'LH':                 { unite: 'UI/L',    ref: '1.7–8.6' },
  'Prolactine':         { unite: 'ng/mL',   ref: '4–23'    },
  'Testostérone':       { unite: 'ng/dL',   ref: '270–1070' },
  'Beta HCG':           { unite: 'UI/L',    ref: '<5'      },
  'PSA total':          { unite: 'ng/mL',   ref: '<4'      },
  'HIV 1&2':            { unite: '',        ref: 'Négatif' },
  'Hépatite B (AgHBs)': { unite: '',        ref: 'Négatif' },
  'Hépatite C':         { unite: '',        ref: 'Négatif' },
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
function ActionCell({ rdv, onDetails, onEncaisser, onReceipt, onOrdonnance, onEdit, onAnnuler, onSupprimer, onConfirmer }) {
  const st = rdv.statut;

  if (st === 'annule') {
    return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => onSupprimer(rdv)} title="Supprimer"
          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm transition-colors">🗑️</button>
      </div>
    );
  }

  if (st === 'termine') {
    return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => onDetails(rdv)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">👁️ Détails</button>
      </div>
    );
  }

  // en_attente ou confirme
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {rdv.statut_ordonnance === 'en_attente_lecture' && (
        <button onClick={() => onOrdonnance(rdv)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors whitespace-nowrap animate-pulse">
          👁️ Lire ordonnance
        </button>
      )}
      {st === 'en_attente' && (
        <button onClick={() => onConfirmer(rdv.id)} title="Confirmer"
          className="w-8 h-8 rounded-lg bg-[#E8F5E9] text-[#2E7D32] font-bold text-sm hover:bg-[#C8E6C9] transition-colors flex items-center justify-center">✓</button>
      )}
      <button onClick={() => onEdit(rdv)} title="Modifier"
        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center text-sm transition-colors">✏️</button>
      <button onClick={() => onAnnuler(rdv)} title="Annuler"
        className="w-8 h-8 rounded-lg bg-[#FFEBEE] text-[#C62828] font-bold text-sm hover:bg-[#FFCDD2] transition-colors flex items-center justify-center">✗</button>
      <button onClick={() => onSupprimer(rdv)} title="Supprimer"
        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm transition-colors">🗑️</button>
      {rdv.paiement && ['en_attente','non_facture'].includes(rdv.paiement.statut) && (
        <button onClick={() => onEncaisser(rdv)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors whitespace-nowrap">
          💵 Encaisser
        </button>
      )}
    </div>
  );
}

/* ─── Modal lecture ordonnance ───────────────────────────────────── */
/* ─── Modal saisie résultats ─────────────────────────────────────── */
function ResultatsModal({ rdv, onClose, onValidate }) {
  const analyses = rdv.analyses || [];
  const patientNom = rdv.patients?.nom || rdv.nom || 'Patient';
  const [valeurs, setValeurs] = useState(
    analyses.map(nom => {
      const r = REFERENCES[nom] || { unite: '', ref: '' };
      return { nom, valeur: '', unite: r.unite, ref: r.ref, statut: 'normal' };
    })
  );
  const [saving, setSaving] = useState(false);

  const updateVal = (i, field, val) => {
    setValeurs(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  };

  const allFilled = valeurs.every(v => v.valeur.trim() !== '');

  const handleValidate = async () => {
    if (!allFilled) return;
    setSaving(true);
    await onValidate(rdv.id, rdv.patient_id, valeurs);
    setSaving(false);
    onClose();
  };

  const STATUT_OPTIONS = [
    { key: 'normal', label: 'Normal',  cls: 'bg-green-100 text-green-700 border-green-300' },
    { key: 'eleve',  label: 'Élevé',   cls: 'bg-red-100 text-red-600 border-red-300'      },
    { key: 'bas',    label: 'Bas',      cls: 'bg-blue-100 text-blue-600 border-blue-300'   },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-[#1565C0] px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span>📝</span> Saisir les résultats
              </h2>
              <p className="text-blue-200 text-sm mt-0.5">Patient : {patientNom}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 transition-colors flex items-center justify-center text-lg leading-none">×</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {analyses.map(a => (
              <span key={a} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">{a}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {valeurs.map((v, i) => {
            const ref = REFERENCES[v.nom] || { unite: '', ref: '' };
            return (
              <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-gray-800">{v.nom}</p>
                  {ref.ref && <span className="text-[10px] text-gray-400 font-medium">Réf : {ref.ref} {ref.unite}</span>}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={v.valeur}
                    onChange={e => updateVal(i, 'valeur', e.target.value)}
                    placeholder="Valeur"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
                  />
                  <input
                    type="text"
                    value={v.unite}
                    onChange={e => updateVal(i, 'unite', e.target.value)}
                    placeholder="Unité"
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 focus:outline-none focus:border-[#1565C0] transition"
                  />
                </div>

                <div className="flex gap-1.5">
                  {STATUT_OPTIONS.map(s => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => updateVal(i, 'statut', s.key)}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-all ${
                        v.statut === s.key
                          ? s.cls + ' border-current shadow-sm'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {v.statut === s.key && '● '}{s.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {analyses.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Aucune analyse liée à ce RDV</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 flex gap-3 shrink-0 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
            Annuler
          </button>
          <button onClick={handleValidate} disabled={!allFilled || saving}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? 'Enregistrement...' : `✓ Valider résultats (${valeurs.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [resultatsRdv,   setResultatsRdv]   = useState(null);
  const [editRdv,        setEditRdv]        = useState(null);
  const [editForm,       setEditForm]       = useState({});
  const [techniciens,    setTechniciens]    = useState([]);
  const [modalAssign,    setModalAssign]    = useState(null);
  const [techChoisi,     setTechChoisi]     = useState(null);
  const [loadingAssign,  setLoadingAssign]  = useState(false);
  const [modalNvRdv,     setModalNvRdv]     = useState(false);
  const [nvRdv,          setNvRdv]          = useState({ patient_search: '', patient_id: null, patient_nom: '', patient_tel: '', analyses: [], lieu: 'labo', adresse: '', date: '', heure: '', sous_total: 0, frais_deplacement: 0, total: 0, mode_paiement: 'cash' });
  const [patientSuggs,   setPatientSuggs]   = useState([]);
  const [analysesList,   setAnalysesList]   = useState([]);
  const [historique,     setHistorique]     = useState([]);

  // ── Supabase ──
  useEffect(() => {
    chargerRdv(); chargerAnalyses(); chargerHistorique(); chargerTechniciens();
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => { chargerRdv(); chargerHistorique(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const chargerRdv = async () => {
    setLoading(true);
    try {
      // Fetch RDV with patient, analyses, and paiement joins
      const { data: rdvData, error: rdvErr } = await supabase
        .from('rdv')
        .select(`*, patients(nom, telephone, whatsapp, pref_notif), rdv_analyses(prix, analyses(nom)), paiements(*)`)
        .neq('statut', 'termine')
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

  const annulerRdv = async (rdv) => {
    if (!window.confirm('Annuler le RDV de ' + (rdv.nom || 'ce patient') + ' ?')) return;
    await supabase.from('rdv').update({ statut: 'annule' }).eq('id', rdv.id);
    chargerRdv();
  };

  const supprimerRdv = async (rdv) => {
    if (!window.confirm('Supprimer le RDV de ' + (rdv.nom || 'ce patient') + ' ?')) return;
    await supabase.from('rdv_analyses').delete().eq('rdv_id', rdv.id);
    await supabase.from('paiements').delete().eq('rdv_id', rdv.id);
    await supabase.from('rdv').delete().eq('id', rdv.id);
    chargerRdv();
  };

  const openEditRdv = (rdv) => {
    setEditForm({
      date: rdv.date || '',
      heure: rdv.heure || '',
      lieu: rdv.lieu || 'labo',
      adresse: rdv.notes || '',
      statut: rdv.statut || 'en_attente',
      mode_paiement: rdv.paiement?.mode || '',
    });
    setEditRdv(rdv);
  };

  const sauvegarderEditRdv = async () => {
    if (!editRdv) return;
    await supabase.from('rdv').update({
      date: editForm.date || null,
      heure: editForm.heure || null,
      lieu: editForm.lieu,
      notes: editForm.adresse || null,
      statut: editForm.statut,
    }).eq('id', editRdv.id);
    setEditRdv(null);
    chargerRdv();
    window.alert('RDV modifie !');
  };

  // ── Créer nouveau RDV ──
  const creerNvRdv = async () => {
    if (!nvRdv.patient_id && !nvRdv.patient_tel) { window.alert('Patient obligatoire'); return; }
    if (nvRdv.analyses.length === 0) { window.alert('Ajoutez au moins une analyse'); return; }
    if (!nvRdv.date) { window.alert('Date obligatoire'); return; }
    try {
      let patientId = nvRdv.patient_id;
      if (!patientId && nvRdv.patient_tel) {
        const { data } = await supabase.from('patients').upsert({ nom: nvRdv.patient_nom || 'Patient', telephone: nvRdv.patient_tel, statut: 'actif', total_rdv: 0 }, { onConflict: 'telephone' }).select();
        patientId = data?.[0]?.id;
      }
      // Insert RDV (only valid columns)
      const { data: rdvData } = await supabase.from('rdv').insert({
        patient_id: patientId, date: nvRdv.date, heure: nvRdv.heure || '07:00-11:00', lieu: nvRdv.lieu, notes: nvRdv.adresse || null,
        statut: 'confirme', statut_ordonnance: 'sans_ordonnance', statut_prelevement: 'en_attente',
      }).select('id').single();
      // Link analyses
      if (rdvData?.id) {
        for (const nom of nvRdv.analyses) {
          const a = analysesList.find(x => x.nom === nom);
          if (a) await supabase.from('rdv_analyses').insert({ rdv_id: rdvData.id, analyse_id: a.id, prix: a.prix || 0 });
        }
        // Create paiement
        await supabase.from('paiements').insert({ rdv_id: rdvData.id, sous_total: nvRdv.sous_total, frais_deplacement: nvRdv.frais_deplacement, total: nvRdv.total, mode: nvRdv.mode_paiement, statut: 'en_attente' });
      }
      setModalNvRdv(false);
      setNvRdv({ patient_search: '', patient_id: null, patient_nom: '', patient_tel: '', analyses: [], lieu: 'labo', adresse: '', date: '', heure: '', sous_total: 0, frais_deplacement: 0, total: 0, mode_paiement: 'cash' });
      chargerRdv();
      window.alert('RDV cree !');
    } catch (err) { window.alert('Erreur: ' + (err.message || err)); }
  };

  // ── Assignation technicien ──
  const confirmerAssignation = async () => {
    if (!techChoisi || !modalAssign) { window.alert('Choisissez un technicien'); return; }
    setLoadingAssign(true);
    console.log('[Assign] tech:', techChoisi.id, techChoisi.nom, 'rdv:', modalAssign.id);
    const { data, error } = await supabase.from('rdv').update({
      technicien_id: techChoisi.id,
      technicien_nom: techChoisi.nom,
      statut_prelevement: 'assigne',
    }).eq('id', modalAssign.id).select();
    console.log('[Assign] result:', data, 'error:', error);
    if (error) { window.alert('Erreur: ' + error.message); setLoadingAssign(false); return; }
    setLoadingAssign(false);
    const nom = techChoisi.nom;
    const patient = modalAssign.nom || 'ce patient';
    setModalAssign(null);
    setTechChoisi(null);
    await chargerRdv();
    window.alert(nom + ' assigne au RDV de ' + patient + ' !');
  };

  const chargerTechniciens = async () => {
    const { data } = await supabase.from('techniciens').select('*').order('nom');
    setTechniciens(data || []);
  };

  const chargerAnalyses = async () => {
    const { data } = await supabase.from('analyses').select('id, nom, categorie, prix').eq('actif', true).order('categorie');
    if (data) setAnalysesList(data);
  };

  const chargerHistorique = async () => {
    try {
      const { data } = await supabase
        .from('rdv')
        .select('*, patients(nom, telephone), rdv_analyses(prix, analyses(nom)), paiements(*)')
        .eq('statut', 'termine')
        .order('created_at', { ascending: false })
        .limit(50);

      const normalized = (data || []).map(r => {
        const patient = r.patients || {};
        const analysesNames = (r.rdv_analyses || []).map(ra => ra.analyses?.nom).filter(Boolean);
        const paiement = Array.isArray(r.paiements) ? r.paiements[0] : r.paiements;
        return { ...r, nom: patient.nom || '—', tel: patient.telephone || '—', heure: r.heure || '—', analyses: analysesNames, paiement: paiement || { total: 0, statut: 'non_facture' } };
      });
      setHistorique(normalized);
    } catch (e) {
      console.error('chargerHistorique error:', e);
    }
  };

  const confirmerRdv = async (id) => {
    await supabase.from('rdv').update({ statut: 'confirme' }).eq('id', id);
    chargerRdv();
  };

  // annulerRdv moved above

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
    // 1. Met à jour le RDV
    await supabase.from('rdv').update({
      statut_ordonnance: 'analyses_saisies',
      statut: 'confirme',
    }).eq('id', rdvId);

    // 2. Lier les analyses au RDV
    for (const nom of analyses) {
      const found = analysesList.find(a => a.nom === nom);
      if (found) {
        await supabase.from('rdv_analyses').insert({
          rdv_id: rdvId,
          analyse_id: found.id,
          prix: found.prix || 0,
        });
      }
    }

    // 3. TODO: WhatsApp notification via API
    console.log('Notifier patient:', patientTel, 'Analyses:', analyses);

    chargerRdv();
    alert('Ordonnance validee ! Le patient sera notifie.');
  };

  // ── Prélèvement workflow (dropdown) ──
  const changerStatutPrelevement = async (rdvId, nouveauStatut, patientNom) => {
    const updateData = { statut_prelevement: nouveauStatut };
    if (nouveauStatut === 'recu') updateData.date_prelevement = new Date().toISOString();
    await supabase.from('rdv').update(updateData).eq('id', rdvId);
    chargerRdv();
    const messages = {
      recu:       `Prelevement recu \u2014 ${patientNom}`,
      en_analyse: `Analyse lancee \u2014 ${patientNom}`,
      termine:    `Analyse terminee \u2014 ${patientNom}`,
    };
    if (messages[nouveauStatut]) alert(messages[nouveauStatut]);
  };

  // ── Saisie résultats ──
  const validerResultats = async (rdvId, patientId, valeurs) => {
    const anomalies = valeurs.filter(v => v.statut !== 'normal').length;
    const lienToken = `AZ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { error } = await supabase.from('resultats').insert({
      rdv_id: rdvId,
      patient_id: patientId,
      valeurs,
      statut: 'valide',
      anomalies,
      lien_token: lienToken,
      valide_par: 'Dr. Meziane',
    });

    if (!error) {
      await supabase.from('rdv').update({ statut_prelevement: 'resultat_saisi' }).eq('id', rdvId);
      chargerRdv();
      alert('Resultats saisis !\nAllez dans Resultats pour envoyer au patient.');
    } else {
      alert('Erreur : ' + error.message);
    }
  };

  // ── Actions RDV ──
  /* Actions RDV - déclarées après chargerRdv */

  const ordonnanceCount = rdvList.filter(r => r.statut_ordonnance === 'en_attente_lecture').length;

  // Prélèvement stats
  const prelEnAttente = rdvList.filter(r => (r.statut_prelevement || 'en_attente') === 'en_attente' && r.statut !== 'en_attente' && r.statut !== 'annule').length;
  const prelRecu      = rdvList.filter(r => r.statut_prelevement === 'recu').length;
  const prelAnalyse   = rdvList.filter(r => r.statut_prelevement === 'en_analyse').length;
  const prelTermine   = rdvList.filter(r => r.statut_prelevement === 'termine').length;
  const prelResultat  = rdvList.filter(r => r.statut_prelevement === 'resultat_saisi').length;
  const showPrelCard  = prelEnAttente + prelRecu + prelAnalyse + prelTermine + prelResultat > 0;

  // Si historique sélectionné, on utilise la liste historique
  const sourceList = activeFilter === 'historique' ? historique : rdvList;

  const filtered = sourceList.filter(rdv => {
    const q = search.toLowerCase().trim();
    const nom = rdv.patients?.nom || rdv.nom || '';
    const analyses = rdv.analyses || [];
    const matchSearch = !q
      || nom.toLowerCase().includes(q)
      || (Array.isArray(analyses) && analyses.some(a => a.toLowerCase().includes(q)));
    let matchFilter = true;
    if (activeFilter === 'historique')      matchFilter = true; // déjà filtré par sourceList
    else if (activeFilter === 'ordonnance') matchFilter = rdv.statut_ordonnance === 'en_attente_lecture';
    else if (activeFilter === 'domicile')   matchFilter = rdv.lieu === 'domicile';
    else if (activeFilter !== 'tous')       matchFilter = rdv.statut === activeFilter;
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

        {/* ── RDV domicile non assignés ── */}
        {rdvList.filter(r => r.lieu === 'domicile' && (!r.technicien_nom) && r.statut !== 'annule').length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
            <div className="font-bold text-orange-700 mb-2">
              🚗 {rdvList.filter(r => r.lieu === 'domicile' && !r.technicien_nom && r.statut !== 'annule').length} RDV domicile à assigner
            </div>
            {rdvList.filter(r => r.lieu === 'domicile' && !r.technicien_nom && r.statut !== 'annule').slice(0, 5).map(rdv => (
              <div key={rdv.id} className="flex justify-between items-center mt-2 pt-2 border-t border-orange-200">
                <div>
                  <span className="text-sm font-bold">{rdv.nom || 'Patient'}</span>
                  <span className="text-xs text-gray-500 ml-2">{rdv.heure || '—'} — {rdv.notes || 'Domicile'}</span>
                </div>
                <button onClick={() => { setModalAssign(rdv); setTechChoisi(null); }}
                  className="bg-[#1565C0] text-white text-xs px-3 py-1 rounded-lg font-bold hover:bg-[#0D47A1]">Assigner</button>
              </div>
            ))}
          </div>
        )}

        {/* ── Prélèvements du jour ── */}
        {showPrelCard && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="text-base">🧪</span>
              <h2 className="font-bold text-[#111] text-sm">Prélèvements du jour</h2>
            </div>
            <div className="grid grid-cols-5 divide-x divide-gray-100">
              {[
                { label: 'En attente validation', value: prelEnAttente, icon: '⏳', color: 'text-gray-600'   },
                { label: 'Reçus au labo',          value: prelRecu,      icon: '🧪', color: 'text-[#1565C0]' },
                { label: 'En analyse',             value: prelAnalyse,   icon: '🔬', color: 'text-orange-600'},
                { label: 'Terminés',               value: prelTermine,   icon: '✓',  color: 'text-green-600'  },
                { label: 'Résultats saisis',       value: prelResultat,  icon: '📊', color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="px-4 py-3 text-center">
                  <span className="text-lg">{s.icon}</span>
                  <p className={`text-2xl font-black ${s.color} mt-0.5`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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

                      {/* Lieu + Technicien */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lieu.cls}`}>{lieu.label}</span>
                        {rdv.lieu === 'domicile' && (
                          <button
                            onClick={() => { setModalAssign(rdv); setTechChoisi(null); }}
                            className={`ml-2 text-xs font-bold px-3 py-1.5 rounded-lg ${
                              rdv.technicien_nom
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-[#1565C0] text-white hover:bg-[#0D47A1]'
                            } transition-colors`}
                          >
                            {rdv.technicien_nom ? `🚗 ${rdv.technicien_nom}` : '🚗 Assigner'}
                          </button>
                        )}
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
                        {rdv.statut === 'annule' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">—</span>
                        ) : (
                          <div className="flex flex-col items-start gap-1.5">
                            <select
                              value={rdv.statut_prelevement || 'en_attente'}
                              onChange={e => changerStatutPrelevement(rdv.id, e.target.value, rdv.nom)}
                              className={`text-xs font-semibold pl-2 pr-6 py-1.5 rounded-lg border-0 outline-none cursor-pointer transition-colors appearance-auto ${
                                { en_attente:     'bg-[#f5f5f5] text-gray-600',
                                  assigne:        'bg-blue-100 text-blue-700',
                                  recu:           'bg-[#E3F2FD] text-[#1565C0]',
                                  en_analyse:     'bg-[#FFF3E0] text-orange-700',
                                  termine:        'bg-[#E8F5E9] text-green-700',
                                  resultat_saisi: 'bg-purple-100 text-purple-700',
                                }[rdv.statut_prelevement || 'en_attente']
                              }`}
                            >
                              <option value="en_attente">⏳ En attente</option>
                              <option value="assigne">🚗 Assigné</option>
                              <option value="recu">🧪 Prélèvement reçu</option>
                              <option value="en_analyse">🔬 En analyse</option>
                              <option value="termine">✓ Analyse terminée</option>
                              <option value="resultat_saisi">📊 Résultat saisi</option>
                            </select>
                            {rdv.technicien_nom && <span className="text-[10px] text-blue-600 font-semibold">🚗 {rdv.technicien_nom}</span>}
                            {rdv.lieu === 'domicile' && (rdv.statut_prelevement === 'en_attente' || !rdv.technicien_nom) && (
                              <button onClick={() => { setModalAssign(rdv); setTechChoisi(null); }}
                                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm">
                                🚗 Assigner
                              </button>
                            )}
                            {rdv.statut_prelevement === 'termine' && (
                              <button onClick={() => setResultatsRdv(rdv)}
                                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm">
                                📝 Saisir résultats
                              </button>
                            )}
                          </div>
                        )}
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
                          onEdit={openEditRdv}
                          onAnnuler={annulerRdv}
                          onSupprimer={supprimerRdv}
                          onConfirmer={confirmerRdv}
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
          <button onClick={() => setModalNvRdv(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm">
            <span className="text-base font-bold">+</span>
            Nouveau RDV
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
      {resultatsRdv && (
        <ResultatsModal
          rdv={resultatsRdv}
          onClose={() => setResultatsRdv(null)}
          onValidate={validerResultats}
        />
      )}
      {modalAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalAssign(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1565C0] px-6 py-4">
              <h2 className="text-white font-bold flex items-center gap-2"><span>🚗</span> Assigner un technicien</h2>
              <div className="text-blue-200 text-sm mt-1">
                <p>{modalAssign.nom || 'Patient'}</p>
                <p>📍 {modalAssign.notes || 'Domicile'} — 📅 {modalAssign.date || '—'} {modalAssign.heure || ''}</p>
              </div>
            </div>
            <div className="p-5 space-y-2 max-h-64 overflow-y-auto">
              {techniciens.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">Aucun technicien enregistré. Ajoutez-en dans Techniciens.</p>
              ) : techniciens.map(tech => (
                <div key={tech.id} onClick={() => setTechChoisi(tech)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    techChoisi?.id === tech.id ? 'border-[#1565C0] bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                      {(tech.nom || '??').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{tech.nom}</p>
                      <p className="text-xs text-gray-500">{tech.telephone || '—'}{tech.zone ? ' — ' + tech.zone : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {techChoisi?.id === tech.id && <span className="text-[#1565C0] font-bold text-lg">✓</span>}
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      (tech.statut || 'disponible') === 'disponible' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {(tech.statut || 'disponible') === 'disponible' ? 'Dispo' : 'Mission'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {techChoisi && (
              <div className="mx-5 mb-3 bg-blue-50 rounded-xl p-3">
                <p className="text-sm text-[#1565C0] font-bold">✓ {techChoisi.nom}</p>
              </div>
            )}
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => { setModalAssign(null); setTechChoisi(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Annuler</button>
              <button onClick={confirmerAssignation} disabled={!techChoisi || loadingAssign}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${techChoisi && !loadingAssign ? 'bg-[#1565C0] text-white hover:bg-[#0D47A1]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {loadingAssign ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {editRdv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditRdv(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-white font-bold">✏️ Modifier RDV</h2>
                <p className="text-blue-200 text-sm">{editRdv.nom || 'Patient'}</p>
              </div>
              <button onClick={() => setEditRdv(null)} className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 flex items-center justify-center text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Lieu */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lieu</label>
                <div className="flex gap-2">
                  <button onClick={() => setEditForm({ ...editForm, lieu: 'labo', heure: '' })}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors ${editForm.lieu === 'labo' ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-gray-600 border-gray-200'}`}>
                    🏥 Labo
                  </button>
                  <button onClick={() => setEditForm({ ...editForm, lieu: 'domicile' })}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors ${editForm.lieu === 'domicile' ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-gray-600 border-gray-200'}`}>
                    🏠 Domicile
                  </button>
                </div>
              </div>
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input type="date" value={editForm.date || ''} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
              </div>
              {/* Heure (domicile) */}
              {editForm.lieu === 'domicile' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Heure</label>
                  <select value={editForm.heure || ''} onChange={e => setEditForm({ ...editForm, heure: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]">
                    <option value="">Choisir heure</option>
                    {['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Info labo */}
              {editForm.lieu === 'labo' && (
                <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                  🕐 Horaires labo : 07h00 – 11h00<br/><span className="text-xs">Le patient vient directement</span>
                </div>
              )}
              {/* Adresse (domicile) */}
              {editForm.lieu === 'domicile' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse</label>
                  <input type="text" value={editForm.adresse || ''} onChange={e => setEditForm({ ...editForm, adresse: e.target.value })} placeholder="Adresse complète..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              )}
              {/* Statut */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Statut</label>
                <select value={editForm.statut || 'en_attente'} onChange={e => setEditForm({ ...editForm, statut: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]">
                  <option value="en_attente">⏳ En attente</option>
                  <option value="confirme">✓ Confirmé</option>
                  <option value="annule">✗ Annulé</option>
                  <option value="termine">✓ Terminé</option>
                </select>
              </div>
              {/* Mode paiement */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mode paiement</label>
                <select value={editForm.mode_paiement || ''} onChange={e => setEditForm({ ...editForm, mode_paiement: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]">
                  <option value="">Non défini</option>
                  <option value="cash">💵 Cash</option>
                  <option value="carte">💳 Carte</option>
                  <option value="technicien">🚗 Collecte technicien</option>
                </select>
              </div>
            </div>
            <div className="px-6 pb-5 pt-3 flex gap-3 shrink-0 border-t border-gray-100">
              <button onClick={() => setEditRdv(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">Annuler</button>
              <button onClick={sauvegarderEditRdv} className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1]">✓ Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
      {modalNvRdv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalNvRdv(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-white font-bold">+ Nouveau RDV</h2>
              <button onClick={() => setModalNvRdv(false)} className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 flex items-center justify-center text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Patient */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient *</label>
                <input type="text" placeholder="Rechercher par nom..." value={nvRdv.patient_search}
                  onChange={async (e) => { setNvRdv({ ...nvRdv, patient_search: e.target.value, patient_id: null }); if (e.target.value.length > 2) { const { data } = await supabase.from('patients').select('id,nom,telephone').ilike('nom', '%' + e.target.value + '%').limit(5); setPatientSuggs(data || []); } else { setPatientSuggs([]); } }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                {patientSuggs.length > 0 && (
                  <div className="border border-gray-200 rounded-xl mt-1 overflow-hidden bg-white shadow-lg">
                    {patientSuggs.map(p => (
                      <div key={p.id} onClick={() => { setNvRdv({ ...nvRdv, patient_id: p.id, patient_nom: p.nom, patient_tel: p.telephone, patient_search: p.nom }); setPatientSuggs([]); }}
                        className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50">
                        <span className="font-bold">{p.nom}</span><span className="text-gray-400 ml-2">{p.telephone}</span>
                      </div>
                    ))}
                  </div>
                )}
                {nvRdv.patient_id && <p className="text-xs text-green-600 font-semibold mt-1">Patient selectionne : {nvRdv.patient_nom}</p>}
                {!nvRdv.patient_id && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Nom nouveau patient" value={nvRdv.patient_nom} onChange={e => setNvRdv({ ...nvRdv, patient_nom: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                    <input type="text" placeholder="Telephone *" value={nvRdv.patient_tel} onChange={e => setNvRdv({ ...nvRdv, patient_tel: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                )}
              </div>
              {/* Analyses */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Analyses *</label>
                <select onChange={e => { if (!e.target.value) return; if (!nvRdv.analyses.includes(e.target.value)) { const na = [...nvRdv.analyses, e.target.value]; const st = na.reduce((s, n) => { const a = analysesList.find(x => x.nom === n); return s + (a?.prix || 300); }, 0); setNvRdv({ ...nvRdv, analyses: na, sous_total: st, total: st + (nvRdv.frais_deplacement || 0) }); } e.target.value = ''; }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0] mb-2">
                  <option value="">+ Ajouter une analyse...</option>
                  {analysesList.map(a => <option key={a.id} value={a.nom}>{a.nom} - {a.prix} DA</option>)}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  {nvRdv.analyses.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-[#E3F2FD] text-[#1565C0] text-xs font-medium">
                      {a}
                      <button onClick={() => { const na = nvRdv.analyses.filter((_, idx) => idx !== i); const st = na.reduce((s, n) => { const an = analysesList.find(x => x.nom === n); return s + (an?.prix || 300); }, 0); setNvRdv({ ...nvRdv, analyses: na, sous_total: st, total: st + (nvRdv.frais_deplacement || 0) }); }}
                        className="w-4 h-4 rounded-full hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-[10px] font-black ml-0.5">x</button>
                    </span>
                  ))}
                </div>
              </div>
              {/* Lieu */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lieu</label>
                <div className="flex gap-2">
                  <button onClick={() => setNvRdv({ ...nvRdv, lieu: 'labo' })} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors ${nvRdv.lieu === 'labo' ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-gray-600 border-gray-200'}`}>🏥 Labo</button>
                  <button onClick={() => setNvRdv({ ...nvRdv, lieu: 'domicile' })} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors ${nvRdv.lieu === 'domicile' ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-gray-600 border-gray-200'}`}>🏠 Domicile</button>
                </div>
              </div>
              {/* Date + Heure */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date *</label>
                  <input type="date" value={nvRdv.date} onChange={e => setNvRdv({ ...nvRdv, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
                {nvRdv.lieu === 'domicile' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Heure</label>
                    <select value={nvRdv.heure} onChange={e => setNvRdv({ ...nvRdv, heure: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]">
                      <option value="">Choisir</option>
                      {['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','14:00','15:00','16:00'].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {nvRdv.lieu === 'labo' && <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">🕐 Horaires labo : 07h00 - 11h00</div>}
              {nvRdv.lieu === 'domicile' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse</label>
                    <input type="text" value={nvRdv.adresse} onChange={e => setNvRdv({ ...nvRdv, adresse: e.target.value })} placeholder="Adresse complete..."
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frais deplacement (DA)</label>
                    <input type="number" value={nvRdv.frais_deplacement} onChange={e => { const f = Number(e.target.value) || 0; setNvRdv({ ...nvRdv, frais_deplacement: f, total: nvRdv.sous_total + f }); }}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                </>
              )}
              {/* Paiement */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mode paiement</label>
                <select value={nvRdv.mode_paiement} onChange={e => setNvRdv({ ...nvRdv, mode_paiement: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]">
                  <option value="cash">Cash</option><option value="carte">Carte</option><option value="technicien">Collecte technicien</option>
                </select>
              </div>
              {/* Total */}
              <div className="bg-[#E3F2FD] rounded-xl p-4">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Sous-total</span><span className="font-bold">{nvRdv.sous_total} DA</span></div>
                {nvRdv.frais_deplacement > 0 && <div className="flex justify-between text-sm mt-1"><span className="text-gray-600">Deplacement</span><span className="font-bold">+{nvRdv.frais_deplacement} DA</span></div>}
                <div className="flex justify-between text-sm mt-1 pt-1 border-t border-blue-200"><span className="font-black text-[#1565C0]">TOTAL</span><span className="font-black text-[#1565C0]">{nvRdv.total} DA</span></div>
              </div>
            </div>
            <div className="px-6 pb-5 pt-3 flex gap-3 shrink-0 border-t border-gray-100">
              <button onClick={() => setModalNvRdv(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">Annuler</button>
              <button onClick={creerNvRdv} className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1]">Creer le RDV</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
