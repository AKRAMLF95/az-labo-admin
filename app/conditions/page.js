'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Données ──────────────────────────────────────────────────────────────────
const CONDITIONS_INIT = [
  { id: 1,  categorie: 'Jeûne',          label: 'À jeun 8h minimum',                                   actif: true },
  { id: 2,  categorie: 'Jeûne',          label: 'À jeun 12h minimum',                                  actif: true },
  { id: 3,  categorie: 'Jeûne',          label: 'À jeun recommandé (non obligatoire)',                  actif: true },
  { id: 4,  categorie: 'Jeûne',          label: 'Pas de sport 24h avant',                              actif: true },
  { id: 5,  categorie: 'Jeûne',          label: "Pas d'alcool 48h avant",                              actif: true },
  { id: 6,  categorie: 'Jeûne',          label: 'Pas de café le matin',                                actif: true },
  { id: 7,  categorie: 'Horaire',        label: 'Le matin de préférence',                              actif: true },
  { id: 8,  categorie: 'Horaire',        label: 'Avant 10h obligatoire',                               actif: true },
  { id: 9,  categorie: 'Horaire',        label: 'À heure fixe (même heure que prélèvement précédent)', actif: true },
  { id: 10, categorie: 'Cycle féminin',  label: 'J2-J5 du cycle menstruel',                            actif: true },
  { id: 11, categorie: 'Cycle féminin',  label: 'J21 du cycle menstruel',                              actif: true },
  { id: 12, categorie: 'Cycle féminin',  label: 'Peu importe le cycle',                                actif: true },
  { id: 13, categorie: 'Prélèvement',    label: 'Milieu de jet (urine)',                               actif: true },
  { id: 14, categorie: 'Prélèvement',    label: 'Flacon stérile fourni par le labo',                   actif: true },
  { id: 15, categorie: 'Prélèvement',    label: 'Recueil urines sur 24h',                              actif: true },
  { id: 16, categorie: 'Prélèvement',    label: 'Noter heure début et fin recueil',                    actif: true },
  { id: 17, categorie: 'Prélèvement',    label: 'Recueil au laboratoire uniquement',                   actif: true },
  { id: 18, categorie: 'Prélèvement',    label: 'Délai analyse 1h maximum',                            actif: true },
  { id: 19, categorie: 'Abstinence',     label: 'Abstinence 3-5 jours (sperme)',                       actif: true },
  { id: 20, categorie: 'Abstinence',     label: 'Abstinence minimum 2 jours',                          actif: true },
  { id: 21, categorie: 'Abstinence',     label: 'Abstinence maximum 7 jours',                          actif: true },
  { id: 22, categorie: 'Médicaments',    label: 'Arrêter antibiotiques 5 jours avant',                 actif: true },
  { id: 23, categorie: 'Médicaments',    label: 'Arrêter anticoagulants (avis médecin)',               actif: true },
  { id: 24, categorie: 'Médicaments',    label: 'Signaler tous médicaments en cours',                  actif: true },
  { id: 25, categorie: 'Médicaments',    label: 'Prendre médicaments habituels normalement',           actif: true },
  { id: 26, categorie: 'Fièvre',         label: 'En cas de fièvre > 38.5°C',                          actif: true },
  { id: 27, categorie: 'Fièvre',         label: 'Pas de fièvre au moment du prélèvement',              actif: true },
  { id: 28, categorie: 'Documents',      label: 'Apporter ordonnance médicale',                        actif: true },
  { id: 29, categorie: 'Documents',      label: 'Apporter résultats précédents',                       actif: true },
  { id: 30, categorie: 'Documents',      label: 'Apporter carnet de santé',                            actif: true },
];

const BASE_CATEGORIES = [
  'Jeûne', 'Horaire', 'Cycle féminin', 'Prélèvement',
  'Abstinence', 'Médicaments', 'Fièvre', 'Documents',
];

const CAT_STYLE = {
  'Jeûne':          { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]',  dot: 'bg-[#1565C0]'  },
  'Horaire':        { bg: 'bg-[#E8F5E9]', text: 'text-[#388E3C]',  dot: 'bg-[#388E3C]'  },
  'Cycle féminin':  { bg: 'bg-[#F3E5F5]', text: 'text-[#7B1FA2]',  dot: 'bg-[#7B1FA2]'  },
  'Prélèvement':    { bg: 'bg-[#FFF3E0]', text: 'text-[#F57C00]',  dot: 'bg-[#F57C00]'  },
  'Abstinence':     { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]',  dot: 'bg-[#D32F2F]'  },
  'Médicaments':    { bg: 'bg-[#FFFDE7]', text: 'text-[#F9A825]',  dot: 'bg-[#F9A825]'  },
  'Fièvre':         { bg: 'bg-[#FCE4EC]', text: 'text-[#E53935]',  dot: 'bg-[#E53935]'  },
  'Documents':      { bg: 'bg-[#EFEBE9]', text: 'text-[#8D6E63]',  dot: 'bg-[#8D6E63]'  },
  'Personnalisée':  { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]',  dot: 'bg-[#2E7D32]'  },
};

const DEFAULT_STYLE = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

// ─── Modal Ajouter / Modifier ─────────────────────────────────────────────────
function ConditionModal({ mode, form, setForm, allCategories, onSave, onClose }) {
  const isAdd = mode === 'add';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-base">
            {isAdd ? 'Ajouter une condition' : 'Modifier la condition'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 transition-colors flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Label de la condition
            </label>
            <input
              autoFocus
              value={form.label}
              onChange={e => setForm({ ...form, label: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && onSave()}
              placeholder="Ex: À jeun 8h minimum"
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
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={!form.label.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ConditionsPage() {
  const [conditions, setConditions] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({ label: '', categorie: 'Jeûne' });

  const total    = conditions.length;
  const actives  = conditions.filter(c => c.actif).length;
  const inactives = total - actives;

  // ── Supabase ──
  useEffect(() => { chargerConditions(); }, []);

  const chargerConditions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('conditions')
      .select('*')
      .order('categorie');
    if (!error) setConditions(data || []);
    setLoading(false);
  };

  const toggleActifSupabase = async (id, actif) => {
    await supabase.from('conditions').update({ actif: !actif }).eq('id', id);
    chargerConditions();
  };

  const supprimerCondition = async (id) => {
    await supabase.from('conditions').delete().eq('id', id);
    chargerConditions();
  };

  const sauvegarderCondition = async () => {
    if (!form.label.trim()) return;
    if (modal === 'add') {
      await supabase.from('conditions').insert({ label: form.label.trim(), categorie: form.categorie, actif: true });
    } else {
      await supabase.from('conditions').update({ label: form.label.trim(), categorie: form.categorie }).eq('id', modal.id);
    }
    setModal(null);
    chargerConditions();
  };

  // Toutes les catégories (base + éventuelles perso)
  const allCategories = [
    ...BASE_CATEGORIES,
    ...conditions
      .map(c => c.categorie)
      .filter(c => !BASE_CATEGORIES.includes(c))
      .filter((c, i, arr) => arr.indexOf(c) === i),
  ];

  // Filtrage
  const q = search.toLowerCase().trim();
  const filteredConditions = conditions.filter(c =>
    !q || c.label.toLowerCase().includes(q) || c.categorie.toLowerCase().includes(q)
  );

  // Groupement par catégorie
  const groups = allCategories
    .map(cat => ({ cat, items: filteredConditions.filter(c => c.categorie === cat) }))
    .filter(g => g.items.length > 0);

  // ── Actions ──
  function toggleActif(id, actif) {
    toggleActifSupabase(id, actif);
  }

  function handleDelete(id) {
    if (window.confirm('Supprimer cette condition ?\nElle ne sera plus disponible dans le sélecteur des analyses.')) {
      supprimerCondition(id);
    }
  }

  function openAdd() {
    setForm({ label: '', categorie: allCategories[0] });
    setModal('add');
  }

  function openEdit(cond) {
    setForm({ label: cond.label, categorie: cond.categorie });
    setModal(cond);
  }

  function saveModal() {
    sauvegarderCondition();
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#111]">Gestion des Conditions</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total} conditions&nbsp;•&nbsp;
              <span className="text-green-600 font-semibold">{actives} actives</span>
              &nbsp;•&nbsp;{inactives} inactives
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm"
          >
            <span className="font-bold text-base leading-none">+</span>
            Ajouter condition
          </button>
        </div>

        {/* ── Recherche ── */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une condition ou une catégorie..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition shadow-sm"
          />
        </div>

        {/* ── Groupes par catégorie ── */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-12 text-center text-gray-400 text-sm">
            Aucune condition trouvée
          </div>
        ) : (
          groups.map(({ cat, items }) => {
            const style = CAT_STYLE[cat] ?? DEFAULT_STYLE;
            const activeCount = items.filter(c => c.actif).length;
            return (
              <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* En-tête groupe */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <h2 className="font-bold text-sm text-[#111]">{cat}</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {items.length}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {activeCount} active{activeCount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Liste conditions */}
                <ul className="divide-y divide-gray-50">
                  {items.map(c => (
                    <li
                      key={c.id}
                      className={`flex items-center gap-4 px-5 py-3 hover:bg-gray-50/70 transition-colors ${!c.actif ? 'opacity-50' : ''}`}
                    >
                      {/* Badge catégorie */}
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                        {cat}
                      </span>

                      {/* Label */}
                      <span className="flex-1 text-sm text-[#111] font-medium">{c.label}</span>

                      {/* Statut badge */}
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        c.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.actif ? 'Active' : 'Inactive'}
                      </span>

                      {/* Toggle */}
                      <Toggle checked={c.actif} onChange={() => toggleActif(c.id, c.actif)} />

                      {/* Modifier */}
                      <button
                        onClick={() => openEdit(c)}
                        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] transition-colors"
                      >
                        ✏️
                      </button>

                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] transition-colors"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}

      </div>

      {/* ── Modal ── */}
      {modal !== null && (
        <ConditionModal
          mode={modal === 'add' ? 'add' : 'edit'}
          form={form}
          setForm={setForm}
          allCategories={allCategories}
          onSave={saveModal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
