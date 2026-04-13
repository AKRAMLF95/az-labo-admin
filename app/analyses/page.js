'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';

// ─── Données analyses ─────────────────────────────────────────────────────────
const ANALYSES_DATA = [
  { id: 1,  nom: 'NFS',                   categorie: 'Hématologie',   prix: 350,  actif: true,  conditions: [] },
  { id: 2,  nom: 'Hémogramme',            categorie: 'Hématologie',   prix: 350,  actif: true,  conditions: [] },
  { id: 3,  nom: 'VS',                    categorie: 'Hématologie',   prix: 200,  actif: true,  conditions: [] },
  { id: 4,  nom: 'Groupe sanguin rhésus', categorie: 'Hématologie',   prix: 250,  actif: true,  conditions: [] },
  { id: 5,  nom: 'TP',                    categorie: 'Hématologie',   prix: 300,  actif: true,  conditions: [] },
  { id: 6,  nom: 'TCA',                   categorie: 'Hématologie',   prix: 300,  actif: true,  conditions: [] },
  { id: 7,  nom: 'Fibrinogène',           categorie: 'Hématologie',   prix: 350,  actif: true,  conditions: [] },
  { id: 8,  nom: 'INR',                   categorie: 'Hématologie',   prix: 300,  actif: true,  conditions: [] },
  { id: 9,  nom: 'Glycémie à jeun',       categorie: 'Biochimie',     prix: 200,  actif: true,  conditions: ['À jeun 8h minimum', 'Pas de sport 24h avant'] },
  { id: 10, nom: 'HbA1c',                 categorie: 'Biochimie',     prix: 400,  actif: true,  conditions: [] },
  { id: 11, nom: 'Cholestérol total',     categorie: 'Biochimie',     prix: 250,  actif: true,  conditions: ['À jeun 12h minimum', "Pas d'alcool 48h avant"] },
  { id: 12, nom: 'HDL',                   categorie: 'Biochimie',     prix: 250,  actif: true,  conditions: ['À jeun 12h minimum'] },
  { id: 13, nom: 'LDL',                   categorie: 'Biochimie',     prix: 250,  actif: true,  conditions: ['À jeun 12h minimum'] },
  { id: 14, nom: 'Triglycérides',         categorie: 'Biochimie',     prix: 250,  actif: true,  conditions: ['À jeun 12h minimum'] },
  { id: 15, nom: 'Créatinine',            categorie: 'Biochimie',     prix: 200,  actif: true,  conditions: [] },
  { id: 16, nom: 'Urée',                  categorie: 'Biochimie',     prix: 200,  actif: true,  conditions: [] },
  { id: 17, nom: 'Acide urique',          categorie: 'Biochimie',     prix: 200,  actif: true,  conditions: [] },
  { id: 18, nom: 'ASAT',                  categorie: 'Biochimie',     prix: 250,  actif: true,  conditions: [] },
  { id: 19, nom: 'ALAT',                  categorie: 'Biochimie',     prix: 250,  actif: true,  conditions: [] },
  { id: 20, nom: 'GGT',                   categorie: 'Biochimie',     prix: 250,  actif: true,  conditions: [] },
  { id: 21, nom: 'Fer sérique',           categorie: 'Biochimie',     prix: 300,  actif: true,  conditions: ['À jeun recommandé (non obligatoire)'] },
  { id: 22, nom: 'Ferritine',             categorie: 'Biochimie',     prix: 400,  actif: true,  conditions: [] },
  { id: 23, nom: 'Calcium',               categorie: 'Biochimie',     prix: 200,  actif: true,  conditions: [] },
  { id: 24, nom: 'Sodium',                categorie: 'Biochimie',     prix: 200,  actif: true,  conditions: [] },
  { id: 25, nom: 'Potassium',             categorie: 'Biochimie',     prix: 200,  actif: true,  conditions: [] },
  { id: 26, nom: 'CRP',                   categorie: 'Sérologie',     prix: 300,  actif: true,  conditions: [] },
  { id: 27, nom: 'HIV 1&2',               categorie: 'Sérologie',     prix: 500,  actif: true,  conditions: [] },
  { id: 28, nom: 'Hépatite B (AgHBs)',    categorie: 'Sérologie',     prix: 400,  actif: true,  conditions: [] },
  { id: 29, nom: 'Hépatite C',            categorie: 'Sérologie',     prix: 400,  actif: true,  conditions: [] },
  { id: 30, nom: 'Toxoplasmose IgG IgM',  categorie: 'Sérologie',     prix: 500,  actif: true,  conditions: [] },
  { id: 31, nom: 'Rubéole IgG IgM',       categorie: 'Sérologie',     prix: 500,  actif: true,  conditions: [] },
  { id: 32, nom: 'TSH',                   categorie: 'Hormonologie',  prix: 450,  actif: true,  conditions: ['Le matin de préférence', 'À jeun recommandé (non obligatoire)'] },
  { id: 33, nom: 'T3 libre',              categorie: 'Hormonologie',  prix: 400,  actif: true,  conditions: ['Le matin de préférence'] },
  { id: 34, nom: 'T4 libre',              categorie: 'Hormonologie',  prix: 400,  actif: true,  conditions: ['Le matin de préférence'] },
  { id: 35, nom: 'FSH',                   categorie: 'Hormonologie',  prix: 450,  actif: true,  conditions: ['J2-J5 du cycle menstruel', 'Le matin de préférence'] },
  { id: 36, nom: 'LH',                    categorie: 'Hormonologie',  prix: 450,  actif: true,  conditions: ['J2-J5 du cycle menstruel', 'Le matin de préférence'] },
  { id: 37, nom: 'Prolactine',            categorie: 'Hormonologie',  prix: 450,  actif: true,  conditions: ['Le matin de préférence', 'À jeun recommandé (non obligatoire)'] },
  { id: 38, nom: 'Testostérone',          categorie: 'Hormonologie',  prix: 500,  actif: true,  conditions: ['Le matin de préférence'] },
  { id: 39, nom: 'Beta HCG',              categorie: 'Hormonologie',  prix: 400,  actif: true,  conditions: [] },
  { id: 40, nom: 'PSA total',             categorie: 'Hormonologie',  prix: 500,  actif: true,  conditions: [] },
  { id: 41, nom: 'ECBU',                  categorie: 'Urines',        prix: 350,  actif: true,  conditions: ['Milieu de jet (urine)', 'Flacon stérile fourni par le labo', 'Le matin de préférence'] },
  { id: 42, nom: 'Bandelette urinaire',   categorie: 'Urines',        prix: 150,  actif: true,  conditions: [] },
  { id: 43, nom: 'Protéinurie 24h',       categorie: 'Urines',        prix: 300,  actif: true,  conditions: ['Recueil urines sur 24h', 'Flacon stérile fourni par le labo', 'Noter heure début et fin recueil'] },
  { id: 44, nom: 'Spermogramme complet',  categorie: 'Sperme',        prix: 1500, actif: true,  conditions: ['Abstinence 3-5 jours (sperme)', 'Recueil au laboratoire uniquement', 'Délai analyse 1h maximum'] },
  { id: 45, nom: 'Spermocytogramme',      categorie: 'Sperme',        prix: 1200, actif: true,  conditions: ['Abstinence 3-5 jours (sperme)', 'Recueil au laboratoire uniquement'] },
  { id: 46, nom: 'PCR COVID-19',          categorie: 'Microbiologie', prix: 2500, actif: false, conditions: [] },
  { id: 47, nom: 'Hémoculture',           categorie: 'Microbiologie', prix: 800,  actif: true,  conditions: ['En cas de fièvre > 38.5°C'] },
  { id: 48, nom: 'Coproculture',          categorie: 'Selles',        prix: 500,  actif: true,  conditions: ['Flacon stérile fourni par le labo'] },
];

// ─── Conditions prédéfinies ───────────────────────────────────────────────────
const CONDITIONS_INIT = [
  { id: 1,  categorie: 'Jeûne',          label: 'À jeun 8h minimum',                                     actif: true },
  { id: 2,  categorie: 'Jeûne',          label: 'À jeun 12h minimum',                                    actif: true },
  { id: 3,  categorie: 'Jeûne',          label: 'À jeun recommandé (non obligatoire)',                    actif: true },
  { id: 4,  categorie: 'Jeûne',          label: 'Pas de sport 24h avant',                                actif: true },
  { id: 5,  categorie: 'Jeûne',          label: "Pas d'alcool 48h avant",                                actif: true },
  { id: 6,  categorie: 'Jeûne',          label: 'Pas de café le matin',                                  actif: true },
  { id: 7,  categorie: 'Horaire',        label: 'Le matin de préférence',                                actif: true },
  { id: 8,  categorie: 'Horaire',        label: 'Avant 10h obligatoire',                                 actif: true },
  { id: 9,  categorie: 'Horaire',        label: 'À heure fixe (même heure que prélèvement précédent)',   actif: true },
  { id: 10, categorie: 'Cycle féminin',  label: 'J2-J5 du cycle menstruel',                              actif: true },
  { id: 11, categorie: 'Cycle féminin',  label: 'J21 du cycle menstruel',                                actif: true },
  { id: 12, categorie: 'Cycle féminin',  label: 'Peu importe le cycle',                                  actif: true },
  { id: 13, categorie: 'Prélèvement',    label: 'Milieu de jet (urine)',                                 actif: true },
  { id: 14, categorie: 'Prélèvement',    label: 'Flacon stérile fourni par le labo',                     actif: true },
  { id: 15, categorie: 'Prélèvement',    label: 'Recueil urines sur 24h',                                actif: true },
  { id: 16, categorie: 'Prélèvement',    label: 'Noter heure début et fin recueil',                      actif: true },
  { id: 17, categorie: 'Prélèvement',    label: 'Recueil au laboratoire uniquement',                     actif: true },
  { id: 18, categorie: 'Prélèvement',    label: 'Délai analyse 1h maximum',                              actif: true },
  { id: 19, categorie: 'Abstinence',     label: 'Abstinence 3-5 jours (sperme)',                         actif: true },
  { id: 20, categorie: 'Abstinence',     label: 'Abstinence minimum 2 jours',                            actif: true },
  { id: 21, categorie: 'Abstinence',     label: 'Abstinence maximum 7 jours',                            actif: true },
  { id: 22, categorie: 'Médicaments',    label: 'Arrêter antibiotiques 5 jours avant',                   actif: true },
  { id: 23, categorie: 'Médicaments',    label: 'Arrêter anticoagulants (avis médecin)',                 actif: true },
  { id: 24, categorie: 'Médicaments',    label: 'Signaler tous médicaments en cours',                    actif: true },
  { id: 25, categorie: 'Médicaments',    label: 'Prendre médicaments habituels normalement',             actif: true },
  { id: 26, categorie: 'Fièvre',         label: 'En cas de fièvre > 38.5°C',                            actif: true },
  { id: 27, categorie: 'Fièvre',         label: 'Pas de fièvre au moment du prélèvement',                actif: true },
  { id: 28, categorie: 'Documents',      label: 'Apporter ordonnance médicale',                          actif: true },
  { id: 29, categorie: 'Documents',      label: 'Apporter résultats précédents',                         actif: true },
  { id: 30, categorie: 'Documents',      label: 'Apporter carnet de santé',                              actif: true },
];

// ─── Config analyses ──────────────────────────────────────────────────────────
const ANALYSE_CATEGORIES = [
  'Hématologie', 'Biochimie', 'Sérologie', 'Hormonologie',
  'Urines', 'Sperme', 'Microbiologie', 'Selles',
];

const CAT_STYLE = {
  'Hématologie':   { bg: 'bg-[#FCE4EC]', text: 'text-[#E53935]' },
  'Biochimie':     { bg: 'bg-[#FFF3E0]', text: 'text-[#F57C00]' },
  'Sérologie':     { bg: 'bg-[#F3E5F5]', text: 'text-[#7B1FA2]' },
  'Hormonologie':  { bg: 'bg-[#E1F5FE]', text: 'text-[#0288D1]' },
  'Urines':        { bg: 'bg-[#FFFDE7]', text: 'text-[#F9A825]' },
  'Sperme':        { bg: 'bg-[#E8F5E9]', text: 'text-[#388E3C]' },
  'Microbiologie': { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]' },
  'Selles':        { bg: 'bg-[#EFEBE9]', text: 'text-[#8D6E63]' },
};

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

// ─── Inline prix ──────────────────────────────────────────────────────────────
function InlinePrixInput({ value, onCommit }) {
  const [val, setVal] = useState(value);
  return (
    <input
      autoFocus
      type="number"
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onCommit(val)}
      onKeyDown={e => {
        if (e.key === 'Enter') e.target.blur();
        if (e.key === 'Escape') onCommit(value);
      }}
      className="w-24 px-2 py-1 border border-[#1565C0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 bg-white"
    />
  );
}

// ─── Dropdown de sélection conditions (portail) ───────────────────────────────
function ConditionDropdown({ selectedConditions, conditionsList, pos, onAdd, onAddCustom, onClose }) {
  const ref = useRef(null);
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');

  // Fermer sur clic extérieur
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handle), 80);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handle); };
  }, [onClose]);

  const activeList = conditionsList.filter(c => c.actif !== false);
  const q = search.toLowerCase().trim();
  const filtered = activeList.filter(c => !q || c.label.toLowerCase().includes(q));
  const allCats = [...new Set(activeList.map(c => c.categorie))];

  function addCustom() {
    const val = customVal.trim();
    if (!val) return;
    onAddCustom(val);
    setCustomVal('');
    setShowCustom(false);
  }

  return (
    <div
      ref={ref}
      className="fixed z-[200] w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col"
      style={{ top: pos.top, left: pos.left, maxHeight: '360px' }}
    >
      {/* Recherche */}
      <div className="p-2.5 border-b border-gray-100 shrink-0">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">🔍</span>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une condition..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] transition"
          />
        </div>
      </div>

      {/* Liste groupée */}
      <div className="overflow-y-auto flex-1">
        {allCats.map(cat => {
          const items = filtered.filter(c => c.categorie === cat);
          if (!items.length) return null;
          return (
            <div key={cat}>
              <p className="px-3 pt-2.5 pb-0.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {cat}
              </p>
              {items.map(c => {
                const isSelected = selectedConditions.includes(c.label);
                return (
                  <button
                    key={c.id ?? c.label}
                    disabled={isSelected}
                    onClick={() => { if (!isSelected) onAdd(c.label); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#EEF6FF] cursor-default'
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    {/* Checkbox */}
                    <span className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#1565C0] border-[#1565C0]' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <span className="text-white font-black leading-none" style={{ fontSize: 9 }}>✓</span>
                      )}
                    </span>
                    <span className={`leading-snug ${isSelected ? 'text-[#1565C0] font-medium' : 'text-[#111]'}`}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-4 py-5 text-xs text-gray-400 text-center">Aucune condition trouvée</p>
        )}
      </div>

      {/* Condition personnalisée */}
      <div className="border-t border-gray-100 p-2.5 shrink-0">
        {showCustom ? (
          <div className="flex gap-1.5">
            <input
              autoFocus
              value={customVal}
              onChange={e => setCustomVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addCustom();
                if (e.key === 'Escape') { setShowCustom(false); setCustomVal(''); }
              }}
              placeholder="Décrire la condition..."
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#1565C0] transition"
            />
            <button
              onClick={addCustom}
              disabled={!customVal.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-[#1565C0] text-white font-bold text-xs hover:bg-[#0D47A1] disabled:opacity-30 transition-colors"
            >
              +
            </button>
            <button
              onClick={() => { setShowCustom(false); setCustomVal(''); }}
              className="px-2 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-[#1565C0] hover:bg-[#E3F2FD] transition-colors"
          >
            <span className="text-base font-black leading-none">+</span>
            Créer condition personnalisée
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Cellule conditions (tableau) ─────────────────────────────────────────────
function ConditionCell({ analyse, conditionsList, onAdd, onRemove, onAddCustom }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  function openPicker() {
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const pickerH = 360;
    const top  = spaceBelow >= pickerH ? rect.bottom + 6 : rect.top - pickerH - 6;
    const left = Math.min(rect.left, window.innerWidth - 320 - 16);
    setPos({ top, left });
    setOpen(true);
  }

  const visible = analyse.conditions.slice(0, 3);
  const extra   = analyse.conditions.length - 3;

  return (
    <>
      <div className="flex flex-wrap gap-1.5 items-center min-w-[220px] max-w-[360px] py-0.5">

        {/* Tags visibles */}
        {visible.map((cond, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-[#E3F2FD] text-[#1565C0] text-xs font-medium"
          >
            <span className="max-w-[120px] truncate">{cond}</span>
            <button
              onClick={() => onRemove(analyse.id, idx, analyse.conditions.length)}
              className="w-3.5 h-3.5 rounded-full bg-[#BBDEFB] hover:bg-red-100 text-[#1565C0] hover:text-red-500 transition-colors flex items-center justify-center text-[10px] font-black ml-0.5"
            >
              ×
            </button>
          </span>
        ))}

        {/* +X autres */}
        {extra > 0 && (
          <span className="text-xs font-semibold text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 cursor-default">
            +{extra} autres
          </span>
        )}

        {/* Bouton ajouter */}
        <button
          ref={btnRef}
          onClick={openPicker}
          className="text-xs font-semibold text-green-600 hover:text-green-700 px-2 py-0.5 rounded-full border border-green-200 hover:border-green-400 hover:bg-green-50 transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {open && createPortal(
        <ConditionDropdown
          selectedConditions={analyse.conditions}
          conditionsList={conditionsList}
          pos={pos}
          onAdd={label => onAdd(analyse.id, label)}
          onAddCustom={label => { onAddCustom(label); onAdd(analyse.id, label); }}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  );
}

// ─── Modal Ajouter / Modifier ─────────────────────────────────────────────────
function AnalyseModal({ mode, form, setForm, conditionsList, onAddCustom, onSave, onClose }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPos,  setPickerPos]  = useState({ top: 0, left: 0 });
  const addBtnRef = useRef(null);
  const isAdd = mode === 'add';

  function openPicker() {
    const rect = addBtnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const pickerH = 360;
    const top  = spaceBelow >= pickerH ? rect.bottom + 6 : rect.top - pickerH - 6;
    const left = Math.min(rect.left, window.innerWidth - 320 - 16);
    setPickerPos({ top, left });
    setPickerOpen(true);
  }

  function removeCondition(idx) {
    setForm({ ...form, conditions: form.conditions.filter((_, i) => i !== idx) });
  }

  function addCondition(label) {
    if (!form.conditions.includes(label)) {
      setForm(f => ({ ...f, conditions: [...f.conditions, label] }));
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[92vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="text-white font-bold text-base">
              {isAdd ? 'Ajouter une analyse' : "Modifier l'analyse"}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 transition-colors flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Corps */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nom de l'analyse
              </label>
              <input
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex: NFS, Glycémie..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Catégorie
              </label>
              <select
                value={form.categorie}
                onChange={e => setForm({ ...form, categorie: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111] bg-white focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
              >
                {ANALYSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Prix (DA)
              </label>
              <input
                type="number"
                value={form.prix}
                onChange={e => setForm({ ...form, prix: e.target.value })}
                placeholder="Ex: 350"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
              />
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Conditions ({form.conditions.length})
              </label>

              {/* Tags sélectionnés */}
              {form.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.conditions.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-[#E3F2FD] text-[#1565C0] text-xs font-medium"
                    >
                      <span className="max-w-[200px] truncate">{c}</span>
                      <button
                        onClick={() => removeCondition(i)}
                        className="w-3.5 h-3.5 rounded-full bg-[#BBDEFB] hover:bg-red-100 text-[#1565C0] hover:text-red-500 transition-colors flex items-center justify-center text-[10px] font-black ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                ref={addBtnRef}
                onClick={openPicker}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 px-3 py-1.5 rounded-xl border border-green-200 hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <span className="font-black text-sm leading-none">+</span>
                Ajouter une condition
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-4 flex gap-3 shrink-0 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onSave}
              disabled={!form.nom.trim() || !form.prix}
              className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Picker conditions du modal (portail pour passer au-dessus de l'overlay) */}
      {pickerOpen && createPortal(
        <ConditionDropdown
          selectedConditions={form.conditions}
          conditionsList={conditionsList}
          pos={pickerPos}
          onAdd={addCondition}
          onAddCustom={label => { onAddCustom(label); addCondition(label); }}
          onClose={() => setPickerOpen(false)}
        />,
        document.body
      )}
    </>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AnalysesPage() {
  const [analyses,       setAnalyses]       = useState([]);
  const [conditionsList, setConditionsList] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [catFilter,      setCatFilter]      = useState('Toutes');
  const [statusFilter,   setStatusFilter]   = useState('Toutes');
  const [editingPrix,    setEditingPrix]    = useState(null);
  const [modal,          setModal]          = useState(null);
  const [form,           setForm]           = useState({ nom: '', categorie: 'Hématologie', prix: '', conditions: [] });

  const total    = analyses.length;
  const actives  = analyses.filter(a => a.actif).length;
  const inactives = total - actives;

  // ── Supabase ──
  useEffect(() => { chargerAnalyses(); }, []);

  const chargerAnalyses = async () => {
    setLoading(true);
    const [{ data: aData }, { data: cData }] = await Promise.all([
      supabase.from('analyses').select('*').order('categorie'),
      supabase.from('conditions').select('*').order('categorie'),
    ]);
    if (aData) setAnalyses(aData);
    if (cData) setConditionsList(cData);
    setLoading(false);
  };

  const toggleActifAnalyse = async (id, actif) => {
    await supabase.from('analyses').update({ actif: !actif }).eq('id', id);
    chargerAnalyses();
  };

  const modifierPrix = async (id, prix) => {
    await supabase.from('analyses').update({ prix: Number(prix) }).eq('id', id);
    chargerAnalyses();
  };

  const ajouterAnalyse = async (formData) => {
    await supabase.from('analyses').insert(formData);
    chargerAnalyses();
  };

  const supprimerAnalyse = async (id) => {
    await supabase.from('analyses').delete().eq('id', id);
    chargerAnalyses();
  };

  // ── Ajouter condition personnalisée à la liste maître ──
  function addCustomCondition(label) {
    const exists = conditionsList.some(c => c.label.toLowerCase() === label.toLowerCase());
    if (exists) return;
    const newId = conditionsList.length > 0 ? Math.max(...conditionsList.map(c => c.id)) + 1 : 31;
    setConditionsList(prev => [...prev, { id: newId, categorie: 'Personnalisée', label, actif: true }]);
  }

  // ── Filtrage ──
  const filtered = analyses.filter(a => {
    const q = search.toLowerCase().trim();
    const matchSearch  = !q || a.nom.toLowerCase().includes(q);
    const matchCat     = catFilter    === 'Toutes' || a.categorie === catFilter;
    const matchStatus  = statusFilter === 'Toutes'
      || (statusFilter === 'Actives' ? a.actif : !a.actif);
    return matchSearch && matchCat && matchStatus;
  });

  function toggleActif(id) {
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, actif: !a.actif } : a));
  }

  function commitPrix(id, rawVal) {
    const val = Number(rawVal);
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, prix: val > 0 ? val : a.prix } : a));
    setEditingPrix(null);
  }

  function addConditionToAnalyse(id, label) {
    setAnalyses(prev => prev.map(a =>
      a.id === id && !a.conditions.includes(label)
        ? { ...a, conditions: [...a.conditions, label] }
        : a
    ));
  }

  function removeConditionFromAnalyse(id, idx, total) {
    if (total === 1 && !window.confirm('Supprimer la dernière condition ?')) return;
    setAnalyses(prev => prev.map(a =>
      a.id === id ? { ...a, conditions: a.conditions.filter((_, i) => i !== idx) } : a
    ));
  }

  function handleDelete(id) {
    if (window.confirm('Supprimer cette analyse ?')) {
      setAnalyses(prev => prev.filter(a => a.id !== id));
    }
  }

  function openAdd() {
    setForm({ nom: '', categorie: 'Hématologie', prix: '', conditions: [] });
    setModal('add');
  }
  function openEdit(analyse) {
    setForm({ nom: analyse.nom, categorie: analyse.categorie, prix: String(analyse.prix), conditions: [...analyse.conditions] });
    setModal(analyse);
  }
  function saveModal() {
    if (!form.nom.trim() || !form.prix) return;
    if (modal === 'add') {
      const newId = analyses.length > 0 ? Math.max(...analyses.map(a => a.id)) + 1 : 1;
      setAnalyses(prev => [...prev, { id: newId, nom: form.nom.trim(), categorie: form.categorie, prix: Number(form.prix), actif: true, conditions: form.conditions }]);
    } else {
      setAnalyses(prev => prev.map(a =>
        a.id === modal.id ? { ...a, nom: form.nom.trim(), categorie: form.categorie, prix: Number(form.prix), conditions: form.conditions } : a
      ));
    }
    setModal(null);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#111]">Paramètres Analyses</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total} analyses&nbsp;•&nbsp;
              <span className="text-green-600 font-semibold">{actives} actives</span>
              &nbsp;•&nbsp;{inactives} inactives
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm"
          >
            <span className="font-bold text-base leading-none">+</span>
            Ajouter analyse
          </button>
        </div>

        {/* ── Recherche + filtres ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une analyse..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Catégorie</span>
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-[#111] bg-white focus:outline-none focus:border-[#1565C0] transition cursor-pointer"
              >
                <option value="Toutes">Toutes</option>
                {ANALYSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Statut</span>
              {['Toutes', 'Actives', 'Inactives'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-sm font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                    statusFilter === s
                      ? 'bg-[#1565C0] text-white border-[#1565C0]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1565C0] hover:text-[#1565C0]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tableau ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Analyse', 'Catégorie', 'Prix (DA)', 'Conditions', 'Actif', 'Actions'].map(col => (
                    <th key={col} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                      Aucune analyse trouvée
                    </td>
                  </tr>
                ) : filtered.map(a => {
                  const cat = CAT_STYLE[a.categorie] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
                  return (
                    <tr key={a.id} className={`hover:bg-gray-50/60 transition-colors ${!a.actif ? 'opacity-50' : ''}`}>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#111]">{a.nom}</span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                          {a.categorie}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 w-32">
                        {editingPrix === a.id ? (
                          <InlinePrixInput value={String(a.prix)} onCommit={val => commitPrix(a.id, val)} />
                        ) : (
                          <button
                            onClick={() => setEditingPrix(a.id)}
                            title="Cliquer pour modifier"
                            className="font-semibold text-[#111] hover:text-[#1565C0] hover:underline decoration-dashed underline-offset-2 transition-colors"
                          >
                            {a.prix.toLocaleString('fr-DZ')} DA
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <ConditionCell
                          analyse={a}
                          conditionsList={conditionsList}
                          onAdd={addConditionToAnalyse}
                          onRemove={removeConditionFromAnalyse}
                          onAddCustom={label => { addCustomCondition(label); addConditionToAnalyse(a.id, label); }}
                        />
                      </td>

                      <td className="px-5 py-3.5">
                        <Toggle checked={a.actif} onChange={() => toggleActif(a.id)} />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(a)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                {filtered.length} analyse{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
                {filtered.length < total ? ` sur ${total}` : ''}
              </p>
            </div>
          )}
        </div>

      </div>

      {modal !== null && (
        <AnalyseModal
          mode={modal === 'add' ? 'add' : 'edit'}
          form={form}
          setForm={setForm}
          conditionsList={conditionsList}
          onAddCustom={addCustomCondition}
          onSave={saveModal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
