'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';

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

  // ── Ajouter condition personnalisée à la liste maître (Supabase) ──
  async function addCustomCondition(label) {
    const exists = conditionsList.some(c => c.label.toLowerCase() === label.toLowerCase());
    if (exists) return;
    await supabase.from('conditions').insert({ categorie: 'Personnalisée', label, actif: true });
    const { data } = await supabase.from('conditions').select('*').order('categorie');
    if (data) setConditionsList(data);
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

  async function toggleActif(id) {
    const analyse = analyses.find(a => a.id === id);
    if (!analyse) return;
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, actif: !a.actif } : a));
    await supabase.from('analyses').update({ actif: !analyse.actif }).eq('id', id);
  }

  async function commitPrix(id, rawVal) {
    const val = Number(rawVal);
    if (val <= 0) { setEditingPrix(null); return; }
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, prix: val } : a));
    setEditingPrix(null);
    await supabase.from('analyses').update({ prix: val }).eq('id', id);
  }

  async function addConditionToAnalyse(id, label) {
    const analyse = analyses.find(a => a.id === id);
    if (!analyse || analyse.conditions.includes(label)) return;
    const updated = [...analyse.conditions, label];
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, conditions: updated } : a));
    await supabase.from('analyses').update({ conditions: updated }).eq('id', id);
  }

  async function removeConditionFromAnalyse(id, idx, total) {
    if (total === 1 && !window.confirm('Supprimer la dernière condition ?')) return;
    const analyse = analyses.find(a => a.id === id);
    if (!analyse) return;
    const updated = analyse.conditions.filter((_, i) => i !== idx);
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, conditions: updated } : a));
    await supabase.from('analyses').update({ conditions: updated }).eq('id', id);
  }

  async function handleDelete(id) {
    if (window.confirm('Supprimer cette analyse ?')) {
      setAnalyses(prev => prev.filter(a => a.id !== id));
      await supabase.from('analyses').delete().eq('id', id);
    }
  }

  function openAdd() {
    setForm({ nom: '', categorie: 'Hématologie', prix: '', conditions: [] });
    setModal('add');
  }
  function openEdit(analyse) {
    setForm({ nom: analyse.nom, categorie: analyse.categorie, prix: String(analyse.prix), conditions: [...(analyse.conditions || [])] });
    setModal(analyse);
  }
  async function saveModal() {
    if (!form.nom.trim() || !form.prix) return;
    const payload = {
      nom: form.nom.trim(),
      categorie: form.categorie,
      prix: Number(form.prix),
      conditions: form.conditions,
    };
    if (modal === 'add') {
      await supabase.from('analyses').insert({ ...payload, actif: true });
    } else {
      await supabase.from('analyses').update(payload).eq('id', modal.id);
    }
    setModal(null);
    chargerAnalyses();
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
