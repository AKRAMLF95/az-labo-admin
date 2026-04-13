'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/* ─── Mock Data ──────────────────────────────────────────────────── */
const PROMOS_DATA = [
  {
    id: 1, code: 'AZLAUNCH', type: 'pourcentage', categorie: 'lancement',
    valeur: 20, description: 'Offre lancement ouverture',
    dateDebut: '01/04/2026', dateFin: '30/04/2026',
    utilisationsMax: 500, utilisationsActuelles: 47,
    uniqueParClient: true, actif: true,
    analyses: [], montantMinCommande: 0, entreprise: null, medecin: null, listeBlanche: null,
  },
  {
    id: 2, code: 'FAMILLE10', type: 'pourcentage', categorie: 'fidélité',
    valeur: 10, description: 'Pack famille 3 personnes min',
    dateDebut: '01/01/2026', dateFin: null,
    utilisationsMax: null, utilisationsActuelles: 12,
    uniqueParClient: false, actif: true,
    analyses: [], montantMinCommande: 1500, entreprise: null, medecin: null, listeBlanche: null,
  },
  {
    id: 3, code: 'SONATRACH2026', type: 'entreprise', categorie: 'entreprise',
    valeur: 30, description: 'Convention Sonatrach employés',
    dateDebut: '01/01/2026', dateFin: '31/12/2026',
    utilisationsMax: 1000, utilisationsActuelles: 234,
    uniqueParClient: false, actif: true,
    analyses: [], montantMinCommande: 0, medecin: null, listeBlanche: null,
    entreprise: {
      nom: 'Sonatrach', nif: '000123456789012', contact: 'DRH Sonatrach',
      telephone: '+213 21 XX XX XX', email: 'drh@sonatrach.dz',
      employesAutorises: 1000, facturationMensuelle: true,
    },
  },
  {
    id: 4, code: 'RAMADAN2026', type: 'pourcentage', categorie: 'saisonnier',
    valeur: 15, description: 'Offre spéciale Ramadan',
    dateDebut: '01/03/2026', dateFin: '30/03/2026',
    utilisationsMax: 200, utilisationsActuelles: 89,
    uniqueParClient: true, actif: false,
    analyses: [], montantMinCommande: 0, entreprise: null, medecin: null, listeBlanche: null,
  },
  {
    id: 5, code: 'DRKAMEL', type: 'parrainage', categorie: 'partenaire',
    valeur: 10, description: 'Code Dr. Kamel Bensalem',
    dateDebut: '01/04/2026', dateFin: null,
    utilisationsMax: null, utilisationsActuelles: 38,
    uniqueParClient: false, actif: true,
    analyses: [], montantMinCommande: 0, entreprise: null, listeBlanche: null,
    medecin: { nom: 'Dr. Kamel Bensalem', specialite: 'Médecin généraliste', telephone: '+213 555 999 888' },
  },
  {
    id: 6, code: 'BILANFREE', type: 'analyse_gratuite', categorie: 'lancement',
    valeur: 0, description: 'NFS offerte premier RDV',
    dateDebut: '01/04/2026', dateFin: '15/04/2026',
    utilisationsMax: 100, utilisationsActuelles: 23,
    uniqueParClient: true, actif: true,
    analyses: ['NFS'], montantMinCommande: 500, entreprise: null, medecin: null, listeBlanche: null,
  },
  {
    id: 7, code: 'MUTUELLE2026', type: 'liste_blanche', categorie: 'entreprise',
    valeur: 40, description: 'Mutuelle employés — accès liste nominative uniquement',
    dateDebut: '01/01/2026', dateFin: '31/12/2026',
    utilisationsMax: 150, utilisationsActuelles: 45,
    uniqueParClient: true, actif: true,
    analyses: [], montantMinCommande: 0, medecin: null,
    entreprise: {
      nom: 'Air Algérie Mutuelle', nif: '000987654321098', contact: 'Mme Zerrouki DRH',
      telephone: '+213 21 XX XX XX', email: 'mutuelle@airalgerie.dz',
      employesAutorises: 150, facturationMensuelle: true,
    },
    listeBlanche: {
      active: true,
      personnes: [
        { id: 1, nom: 'Amrani',  prenom: 'Karim',   telephone: '0555123456', utilise: false, dateUtilisation: null },
        { id: 2, nom: 'Bensalem',prenom: 'Sara',    telephone: '0661789012', utilise: false, dateUtilisation: null },
        { id: 3, nom: 'Ouali',   prenom: 'Mohamed', telephone: '0770345678', utilise: false, dateUtilisation: null },
        { id: 4, nom: 'Djilali', prenom: 'Fatima',  telephone: '0550901234', utilise: false, dateUtilisation: null },
        { id: 5, nom: 'Hamdi',   prenom: 'Youcef',  telephone: '0661456789', utilise: false, dateUtilisation: null },
      ],
    },
  },
];

const ANALYSES_LIST = ['NFS', 'Glycémie à jeun', 'HbA1c', 'TSH', 'Bilan lipidique', 'Créatinine', 'Urée', 'CRP', 'Sérologie', 'Ionogramme', 'Transaminases', 'TP/INR'];

const TYPE_CONFIG = {
  pourcentage:     { label: 'Pourcentage',     icon: '%',  bg: 'bg-blue-100',    text: 'text-blue-700',    hex: '#1565C0' },
  montant_fixe:    { label: 'Montant fixe',     icon: '₋',  bg: 'bg-green-100',   text: 'text-green-700',   hex: '#2E7D32' },
  analyse_gratuite:{ label: 'Analyse gratuite', icon: '🧪', bg: 'bg-purple-100',  text: 'text-purple-700',  hex: '#7B1FA2' },
  pack_special:    { label: 'Pack spécial',      icon: '📦', bg: 'bg-orange-100',  text: 'text-orange-700',  hex: '#E65100' },
  livraison:       { label: 'Livraison offerte', icon: '🚗', bg: 'bg-teal-100',    text: 'text-teal-700',    hex: '#00796B' },
  premier_rdv:     { label: 'Premier RDV',       icon: '⭐', bg: 'bg-pink-100',    text: 'text-pink-700',    hex: '#C2185B' },
  parrainage:      { label: 'Parrainage',         icon: '👨‍⚕️',bg: 'bg-indigo-100',  text: 'text-indigo-700',  hex: '#303F9F' },
  entreprise:      { label: 'Entreprise B2B',    icon: '🏢', bg: 'bg-yellow-100',  text: 'text-yellow-800',  hex: '#F57F17' },
  anniversaire:    { label: 'Anniversaire',       icon: '🎂', bg: 'bg-red-100',     text: 'text-red-700',     hex: '#C62828' },
  fidelite:        { label: 'Fidélité',           icon: '💎', bg: 'bg-amber-100',   text: 'text-amber-800',   hex: '#5D4037' },
  liste_blanche:   { label: 'Liste blanche',      icon: '📋', bg: 'bg-rose-100',    text: 'text-rose-900',    hex: '#880E4F' },
};

const CAT_LABELS = {
  lancement: 'Lancement', saisonnier: 'Saisonnier', 'fidélité': 'Fidélité',
  partenaire: 'Partenaire', entreprise: 'Entreprise', événement: 'Événement',
  urgence: 'Urgence', vip: 'VIP',
};

/* ─── Validation helpers ─────────────────────────────────────────── */
function validateNIF(nif) {
  return /^\d{15}$/.test(nif.replace(/\s/g, '')) ? 'valid' : 'invalid';
}

function validateTelAlgerien(tel) {
  return /^0[5-7]\d{8}$/.test(tel.replace(/\s/g, ''));
}

/* ─── Whitelist logic (shared with VerificateurCode) ─────────────── */
function verifierListeBlanche(promo, nom, prenom, telephone) {
  if (!promo || !promo.listeBlanche?.active) return { ok: true };
  const tel = telephone.replace(/\s/g, '');
  const entry = promo.listeBlanche.personnes.find(
    p => p.nom.toLowerCase() === nom.trim().toLowerCase() &&
         p.prenom.toLowerCase() === prenom.trim().toLowerCase() &&
         p.telephone.replace(/\s/g, '') === tel
  );
  if (!entry) return { ok: false, raison: 'non_liste' };
  if (promo.uniqueParClient && entry.utilise) return { ok: false, raison: 'deja_utilise', date: entry.dateUtilisation };
  return { ok: true, entry };
}

/* ─── UI Helpers ─────────────────────────────────────────────────── */
function NIFInput({ value, onChange }) {
  const status = value.length > 0 ? validateNIF(value) : null;
  return (
    <div>
      <input value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 15))}
        placeholder="15 chiffres (NIF algérien)"
        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors font-mono focus:ring-2 ${
          status === 'valid'   ? 'border-green-400 bg-green-50 focus:ring-green-200' :
          status === 'invalid' ? 'border-red-400 bg-red-50 focus:ring-red-200' :
          'border-gray-200 bg-gray-50 focus:border-[#1565C0] focus:ring-[#1565C0]/20'
        }`} />
      {status === 'valid'   && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-full bg-green-500 text-white text-[8px] flex items-center justify-center font-black">✓</span> Format valide · Vérification manuelle requise</p>}
      {status === 'invalid' && <p className="text-xs text-red-500 mt-1">✗ NIF invalide — 15 chiffres requis</p>}
    </div>
  );
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || { label: type, icon: '?', bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  );
}

function ValeurDisplay({ promo }) {
  if (['pourcentage','parrainage','entreprise','liste_blanche'].includes(promo.type))
    return <span className="font-bold" style={{ color: TYPE_CONFIG[promo.type]?.hex }}>-{promo.valeur}%</span>;
  if (promo.type === 'montant_fixe')    return <span className="font-bold text-green-700">-{promo.valeur} DA</span>;
  if (promo.type === 'analyse_gratuite') return <span className="font-bold text-purple-700">{promo.analyses.join(', ')} offert(e)</span>;
  if (promo.type === 'livraison')       return <span className="font-bold text-teal-700">Livraison offerte</span>;
  if (promo.type === 'pack_special')    return <span className="font-bold text-orange-700">{promo.valeur} DA fixe</span>;
  return <span className="font-bold text-gray-600">—</span>;
}

function isExpired(promo) {
  if (!promo.dateFin) return false;
  const [d, m, y] = promo.dateFin.split('/').map(Number);
  return new Date(y, m - 1, d) < new Date();
}

function StatutBadge({ promo }) {
  if (isExpired(promo)) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Expiré</span>;
  if (promo.actif) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">● Actif</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">● Inactif</span>;
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!checked)} disabled={disabled}
      className={`relative w-9 h-5 rounded-full transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${checked ? 'bg-[#1565C0]' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

function inputCls(err) {
  return `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 ${
    err ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-200 bg-gray-50 focus:border-[#1565C0] focus:ring-[#1565C0]/20'
  }`;
}

/* ─── Add Personne Modal ─────────────────────────────────────────── */
function AddPersonneModal({ onClose, onSave }) {
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '' });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.nom.trim())    e.nom    = 'Requis';
    if (!form.prenom.trim()) e.prenom = 'Requis';
    const tel = form.telephone.replace(/\s/g, '');
    if (!validateTelAlgerien(tel)) e.telephone = 'Format invalide (ex: 0555123456)';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ nom: form.nom.trim(), prenom: form.prenom.trim(), telephone: form.telephone.replace(/\s/g, '') });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Ajouter une personne</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nom <span className="text-red-500">*</span></label>
            <input className={inputCls(errors.nom)} placeholder="AMRANI" value={form.nom}
              onChange={e => { setForm(p=>({...p, nom: e.target.value})); setErrors(p=>({...p, nom:''})); }} />
            {errors.nom && <p className="text-xs text-red-500 mt-0.5">{errors.nom}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Prénom <span className="text-red-500">*</span></label>
            <input className={inputCls(errors.prenom)} placeholder="Karim" value={form.prenom}
              onChange={e => { setForm(p=>({...p, prenom: e.target.value})); setErrors(p=>({...p, prenom:''})); }} />
            {errors.prenom && <p className="text-xs text-red-500 mt-0.5">{errors.prenom}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone <span className="text-red-500">*</span></label>
            <input className={inputCls(errors.telephone)} placeholder="0555123456" value={form.telephone}
              onChange={e => { setForm(p=>({...p, telephone: e.target.value.replace(/\D/g,'')})); setErrors(p=>({...p, telephone:''})); }}
              maxLength={10} style={{ fontFamily: 'monospace' }} />
            {errors.telephone
              ? <p className="text-xs text-red-500 mt-0.5">{errors.telephone}</p>
              : form.telephone.length === 10 && validateTelAlgerien(form.telephone)
                ? <p className="text-xs text-green-600 mt-0.5">✓ Format valide</p>
                : null
            }
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-[#880E4F] hover:bg-[#6A0036] transition-colors">Ajouter</button>
        </div>
      </div>
    </div>
  );
}

/* ─── CSV Import Modal ───────────────────────────────────────────── */
function CSVImportModal({ onClose, onImport }) {
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  function parseCSV(text) {
    const lines = text.trim().split('\n').filter(l => l.trim());
    const valid = [], errors = [];
    lines.forEach((line, i) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 3) { errors.push({ line: i + 1, raw: line, raison: 'Colonnes insuffisantes' }); return; }
      const [nom, prenom, telephone] = parts;
      if (!nom || !prenom) { errors.push({ line: i + 1, raw: line, raison: 'Nom ou prénom vide' }); return; }
      if (!validateTelAlgerien(telephone)) { errors.push({ line: i + 1, raw: line, raison: `Téléphone invalide: ${telephone}` }); return; }
      valid.push({ id: Date.now() + i, nom, prenom, telephone, utilise: false, dateUtilisation: null });
    });
    return { valid, errors };
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      setRaw(text);
      setPreview(parseCSV(text));
    };
    reader.readAsText(file);
  }

  function handlePaste(e) {
    const text = e.target.value;
    setRaw(text);
    setPreview(text.trim() ? parseCSV(text) : null);
  }

  function downloadExample() {
    const csv = 'nom,prenom,telephone\nAmrani,Karim,0555123456\nBensalem,Sara,0661789012\nOuali,Mohamed,0770345678';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'exemple_liste_blanche.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Importer depuis CSV</h3>
            <p className="text-xs text-gray-400 mt-0.5">Format attendu : nom,prenom,telephone</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Upload + example */}
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-green-300 bg-green-50 text-green-700 text-sm font-semibold hover:border-green-400 transition-colors">
              📂 Choisir un fichier CSV
            </button>
            <button onClick={downloadExample}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
              ⬇ Exemple
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </div>

          {/* Or paste */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">— ou coller le contenu CSV —</label>
            <textarea rows={5} value={raw} onChange={handlePaste}
              placeholder={'Amrani,Karim,0555123456\nBensalem,Sara,0661789012\n...'}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono outline-none focus:border-[#880E4F] focus:ring-2 focus:ring-[#880E4F]/20 transition-colors resize-none" />
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  ✓ {preview.valid.length} personne{preview.valid.length !== 1 ? 's' : ''} détectée{preview.valid.length !== 1 ? 's' : ''}
                </span>
                {preview.errors.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                    ✗ {preview.errors.length} erreur{preview.errors.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {preview.valid.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-100">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {['Nom','Prénom','Téléphone'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {preview.valid.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5 font-semibold text-gray-700">{p.nom}</td>
                          <td className="px-3 py-1.5 text-gray-600">{p.prenom}</td>
                          <td className="px-3 py-1.5 font-mono text-gray-500">{p.telephone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {preview.errors.length > 0 && (
                <div className="space-y-1">
                  {preview.errors.map(e => (
                    <div key={e.line} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                      <span className="font-bold shrink-0">Ligne {e.line}:</span>
                      <span>{e.raison}</span>
                      <span className="text-red-400 font-mono truncate">({e.raw})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
          <button
            disabled={!preview || preview.valid.length === 0}
            onClick={() => { onImport(preview.valid); onClose(); }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors ${preview?.valid.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}>
            Confirmer l'import ({preview?.valid.length ?? 0})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Liste Blanche Modal ────────────────────────────────────────── */
function ListeBlanchemModal({ promo, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('liste');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const lb = promo.listeBlanche;
  const personnes = lb?.personnes || [];
  const utilisees = personnes.filter(p => p.utilise).length;

  const filtered = personnes.filter(p => {
    const q = search.toLowerCase();
    return !q || p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.telephone.includes(q);
  });

  function addPersonne(data) {
    const newId = personnes.length ? Math.max(...personnes.map(p => p.id)) + 1 : 1;
    onUpdate({ ...promo, listeBlanche: { ...lb, personnes: [...personnes, { id: newId, ...data, utilise: false, dateUtilisation: null }] } });
  }

  function importPersonnes(list) {
    const maxId = personnes.length ? Math.max(...personnes.map(p => p.id)) : 0;
    const newOnes = list.map((p, i) => ({ ...p, id: maxId + i + 1 }));
    const merged = [...personnes];
    newOnes.forEach(np => {
      const exists = merged.find(p => p.telephone === np.telephone);
      if (!exists) merged.push(np);
    });
    onUpdate({ ...promo, listeBlanche: { ...lb, personnes: merged } });
  }

  function deletePersonne(id) {
    onUpdate({ ...promo, listeBlanche: { ...lb, personnes: personnes.filter(p => p.id !== id) } });
    setDeleteId(null);
  }

  function exportCSV() {
    const rows = ['nom,prenom,telephone,utilise,date_utilisation', ...personnes.map(p =>
      `${p.nom},${p.prenom},${p.telephone},${p.utilise ? 'oui' : 'non'},${p.dateUtilisation || ''}`
    )].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${promo.code}_liste_blanche.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-xl shrink-0">📋</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                <span className="font-mono text-[#880E4F]">{promo.code}</span> — Liste blanche
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{promo.description}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-3 border-b border-gray-100">
            {[{ key: 'liste', label: '👥 Liste autorisée' }, { key: 'verif', label: '🔍 Vérificateur' }].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                  activeTab === t.key ? 'bg-rose-50 text-[#880E4F] border-b-2 border-[#880E4F]' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Liste tab ── */}
            {activeTab === 'liste' && (
              <div className="px-6 py-4 space-y-4">
                {/* Stats + actions */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-700">{personnes.length} personne{personnes.length !== 1 ? 's' : ''}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs font-semibold text-green-600">{utilisees} ont utilisé</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs font-semibold text-gray-500">{personnes.length - utilisees} restantes</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCSV(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold transition-colors">
                      📥 Importer CSV
                    </button>
                    <button onClick={exportCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-semibold transition-colors">
                      📤 Exporter
                    </button>
                    <button onClick={() => setShowAdd(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#880E4F] text-white hover:bg-[#6A0036] text-xs font-semibold transition-colors">
                      + Ajouter
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par nom, prénom ou téléphone…"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#880E4F] focus:ring-2 focus:ring-[#880E4F]/20 transition-colors" />
                </div>

                {/* Table */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Nom','Prénom','Téléphone','Statut','Actions'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Aucune personne trouvée.</td></tr>
                      ) : filtered.map(p => (
                        <tr key={p.id} className={`hover:bg-gray-50/60 transition-colors ${p.utilise ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-2.5 font-semibold text-gray-800">{p.nom}</td>
                          <td className="px-4 py-2.5 text-gray-600">{p.prenom}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{p.telephone}</td>
                          <td className="px-4 py-2.5">
                            {p.utilise
                              ? <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                  <span className="w-3.5 h-3.5 rounded-full bg-green-500 text-white text-[8px] flex items-center justify-center font-black">✓</span>
                                  Utilisé {p.dateUtilisation && <span className="text-gray-400 font-normal">· {p.dateUtilisation}</span>}
                                </span>
                              : <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                                  <span className="w-3 h-3 rounded-full border-2 border-gray-300 inline-block" />
                                  Non utilisé
                                </span>
                            }
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1">
                              <button
                                className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-xs transition-colors"
                                title="Modifier">✏️</button>
                              <button onClick={() => setDeleteId(p.id)}
                                className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-xs transition-colors"
                                title="Supprimer">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 text-right">{filtered.length} affiché(e)s sur {personnes.length}</p>
              </div>
            )}

            {/* ── Vérificateur tab ── */}
            {activeTab === 'verif' && (
              <div className="px-6 py-6">
                <VerificateurCode promo={promo} embedded />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Fermer</button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showAdd && <AddPersonneModal onClose={() => setShowAdd(false)} onSave={addPersonne} />}
      {showCSV && <CSVImportModal  onClose={() => setShowCSV(false)} onImport={importPersonnes} />}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="font-bold text-gray-900 mb-1">Supprimer cette personne ?</h3>
            <p className="text-sm text-gray-400 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
              <button onClick={() => deletePersonne(deleteId)} className="flex-1 py-2 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Vérificateur Code ──────────────────────────────────────────── */
function VerificateurCode({ promos, promo: promoFixed, embedded }) {
  const [code, setCode]   = useState(promoFixed?.code || '');
  const [nom, setNom]     = useState('');
  const [prenom, setPrenom] = useState('');
  const [tel, setTel]     = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function verify() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const target = promoFixed || promos?.find(p => p.code === code.trim().toUpperCase());
      if (!target) { setResult({ ok: false, raison: 'code_inexistant' }); return; }
      if (!target.actif || isExpired(target)) { setResult({ ok: false, raison: 'code_inactif' }); return; }
      if (target.type !== 'liste_blanche') { setResult({ ok: true, promo: target, bypass: true }); return; }
      const check = verifierListeBlanche(target, nom, prenom, tel);
      setResult({ ...check, promo: target });
    }, 600);
  }

  const MESSAGES = {
    non_liste:       { icon: '🚫', color: 'text-red-700', bg: 'bg-red-50 border-red-200', title: 'Non autorisé', body: 'Ce code est réservé à une liste de bénéficiaires. Votre nom ne figure pas dans la liste.' },
    deja_utilise:    { icon: '⚠️', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', title: 'Déjà utilisé', body: 'Vous avez déjà bénéficié de cette offre.' },
    code_inexistant: { icon: '❓', color: 'text-gray-700',  bg: 'bg-gray-50 border-gray-200',  title: 'Code invalide', body: 'Ce code promo n\'existe pas.' },
    code_inactif:    { icon: '🔒', color: 'text-gray-700',  bg: 'bg-gray-50 border-gray-200',  title: 'Code inactif', body: 'Ce code promo est expiré ou désactivé.' },
  };

  return (
    <div className={embedded ? '' : 'bg-white rounded-2xl border border-gray-100 p-5'}>
      {!embedded && (
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-[#E3F2FD] flex items-center justify-center text-base">🔍</div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Vérificateur de code promo</h3>
            <p className="text-xs text-gray-400">Outil de test pour l'admin — simule la vérification côté patient</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {!promoFixed && (
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Code promo</label>
            <input className={inputCls()} placeholder="ex: MUTUELLE2026" value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null); }}
              style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }} />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom</label>
          <input className={inputCls()} placeholder="AMRANI" value={nom}
            onChange={e => { setNom(e.target.value); setResult(null); }} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prénom</label>
          <input className={inputCls()} placeholder="Karim" value={prenom}
            onChange={e => { setPrenom(e.target.value); setResult(null); }} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label>
          <input className={inputCls()} placeholder="0555123456" value={tel}
            onChange={e => { setTel(e.target.value.replace(/\D/g,'')); setResult(null); }}
            maxLength={10} style={{ fontFamily: 'monospace' }} />
        </div>
      </div>

      <button onClick={verify} disabled={loading || (!promoFixed && !code)}
        className={`w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          loading || (!promoFixed && !code)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#880E4F] text-white hover:bg-[#6A0036]'
        }`}>
        {loading ? '⏳ Vérification…' : '🔍 Vérifier le code'}
      </button>

      {result && (
        <div className={`mt-4 rounded-xl border p-4 ${result.ok ? 'bg-green-50 border-green-200' : (MESSAGES[result.raison]?.bg || 'bg-gray-50 border-gray-200')}`}>
          {result.ok ? (
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">✅</span>
              <div>
                <p className="font-bold text-green-700">Code valide</p>
                <p className="text-xs text-green-600 mt-0.5">
                  {result.bypass
                    ? 'Code actif — aucune liste blanche requise pour ce type.'
                    : `Réduction de ${result.promo?.valeur}% appliquée pour ${prenom} ${nom}.`
                  }
                </p>
                {result.promo && (
                  <div className="flex items-center gap-2 mt-2">
                    <TypeBadge type={result.promo.type} />
                    <span className="text-xs text-gray-500">{result.promo.description}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{MESSAGES[result.raison]?.icon || '✗'}</span>
              <div>
                <p className={`font-bold ${MESSAGES[result.raison]?.color || 'text-gray-700'}`}>
                  {MESSAGES[result.raison]?.title || 'Erreur'}
                </p>
                <p className={`text-xs mt-0.5 ${MESSAGES[result.raison]?.color || 'text-gray-600'}`}>
                  {MESSAGES[result.raison]?.body}
                  {result.raison === 'deja_utilise' && result.date && ` (${result.date})`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Create Promo Modal ─────────────────────────────────────────── */
const STEP_LABELS = ['Type & catégorie', 'Paramètres', 'Restrictions', 'Confirmation'];

function CreatePromoModal({ onClose, onSave }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: '', categorie: '', valeur: 20, montantMinCommande: 0, montantFixe: 500,
    analyses: [],
    entreprise: { nom: '', nif: '', contact: '', telephone: '', email: '', employesAutorises: 100, facturationMensuelle: false },
    medecin: { nom: '', specialite: '', telephone: '' },
    code: '', autoCode: true, dateDebut: '', dateFin: '',
    utilisationsMax: '', uniqueParClient: true, actif: true, description: '',
  });
  const [errors, setErrors] = useState({});

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })); }
  function setEnt(f, v) { setForm(p => ({ ...p, entreprise: { ...p.entreprise, [f]: v } })); }
  function setMed(f, v) { setForm(p => ({ ...p, medecin: { ...p.medecin, [f]: v } })); }

  function generateCode() {
    const prefix = ['entreprise','liste_blanche'].includes(form.type) ? 'ENT' :
                   form.type === 'parrainage' ? 'REF' : form.type === 'anniversaire' ? 'BDAY' : 'AZ';
    return `${prefix}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  function canNext() {
    if (step === 0) return form.type && form.categorie;
    if (step === 1 && ['entreprise','liste_blanche'].includes(form.type))
      return form.entreprise.nom && validateNIF(form.entreprise.nif) === 'valid';
    return true;
  }

  function handleSave() {
    const code = form.autoCode ? generateCode() : form.code.toUpperCase();
    onSave({
      id: Date.now(), code, type: form.type, categorie: form.categorie,
      valeur: form.type === 'montant_fixe' ? form.montantFixe : form.type === 'livraison' ? 0 : form.valeur,
      description: form.description || TYPE_CONFIG[form.type]?.label || '',
      dateDebut: form.dateDebut || new Date().toLocaleDateString('fr-DZ'), dateFin: form.dateFin || null,
      utilisationsMax: form.utilisationsMax ? parseInt(form.utilisationsMax) : null,
      utilisationsActuelles: 0, uniqueParClient: form.uniqueParClient, actif: true,
      analyses: form.analyses, montantMinCommande: form.montantMinCommande,
      entreprise: ['entreprise','liste_blanche'].includes(form.type) ? form.entreprise : null,
      medecin: form.type === 'parrainage' ? form.medecin : null,
      listeBlanche: form.type === 'liste_blanche' ? { active: true, personnes: [] } : null,
    });
    onClose();
  }

  const finalCode = form.autoCode ? generateCode() : (form.code.toUpperCase() || '—');
  const isEntType = ['entreprise','liste_blanche'].includes(form.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Créer un code promo</h2>
            <p className="text-xs text-gray-400 mt-0.5">Étape {step + 1} sur 4 — {STEP_LABELS[step]}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
        </div>

        <div className="flex gap-1 px-6 pt-4">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-[#1565C0]' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Step 0 */}
          {step === 0 && (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Type de code promo</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => set('type', key)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        form.type === key ? 'border-[#1565C0] bg-[#E3F2FD] shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}>
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${cfg.bg}`}>{cfg.icon}</span>
                      <span className={`text-xs font-semibold ${form.type === key ? 'text-[#1565C0]' : 'text-gray-700'}`}>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Catégorie</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CAT_LABELS).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => set('categorie', key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        form.categorie === key ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description (optionnel)</label>
                <input className={inputCls()} placeholder="Ex: Offre spéciale clients fidèles"
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <>
              {['pourcentage','parrainage','premier_rdv'].includes(form.type) && (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-600">Pourcentage de réduction</label>
                      <span className="text-sm font-black text-[#1565C0]">{form.valeur}%</span>
                    </div>
                    <input type="range" min={5} max={80} step={5} value={form.valeur} onChange={e => set('valeur', parseInt(e.target.value))} className="w-full accent-[#1565C0]" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>5%</span><span>80%</span></div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Montant minimum commande (DA)</label>
                    <input type="number" min={0} className={inputCls()} placeholder="0 = sans minimum"
                      value={form.montantMinCommande} onChange={e => set('montantMinCommande', parseInt(e.target.value) || 0)} />
                  </div>
                </>
              )}
              {form.type === 'montant_fixe' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Montant de la réduction (DA)</label>
                    <input type="number" min={0} className={inputCls()} value={form.montantFixe} onChange={e => set('montantFixe', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Montant minimum commande (DA)</label>
                    <input type="number" min={0} className={inputCls()} placeholder="0 = sans minimum"
                      value={form.montantMinCommande} onChange={e => set('montantMinCommande', parseInt(e.target.value) || 0)} />
                  </div>
                </>
              )}
              {['analyse_gratuite','pack_special'].includes(form.type) && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Analyses offertes</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.analyses.map(a => (
                        <span key={a} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold">
                          {a}<button type="button" onClick={() => set('analyses', form.analyses.filter(x => x !== a))} className="text-purple-400 hover:text-purple-700">✕</button>
                        </span>
                      ))}
                    </div>
                    <select className={inputCls()} value="" onChange={e => { if (e.target.value && !form.analyses.includes(e.target.value)) set('analyses', [...form.analyses, e.target.value]); }}>
                      <option value="">+ Ajouter une analyse…</option>
                      {ANALYSES_LIST.filter(a => !form.analyses.includes(a)).map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </>
              )}
              {isEntType && (
                <>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-600">Réduction accordée</label>
                      <span className="text-sm font-black text-[#880E4F]">{form.valeur}%</span>
                    </div>
                    <input type="range" min={5} max={80} step={5} value={form.valeur} onChange={e => set('valeur', parseInt(e.target.value))} className="w-full accent-[#880E4F]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom de l'entreprise / mutuelle</label>
                      <input className={inputCls()} placeholder="ex: Air Algérie Mutuelle" value={form.entreprise.nom} onChange={e => setEnt('nom', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">NIF <span className="text-red-500">*</span></label>
                      <NIFInput value={form.entreprise.nif} onChange={v => setEnt('nif', v)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact DRH</label>
                      <input className={inputCls()} placeholder="Nom complet" value={form.entreprise.contact} onChange={e => setEnt('contact', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label>
                      <input className={inputCls()} placeholder="+213 xx xx xx xx" value={form.entreprise.telephone} onChange={e => setEnt('telephone', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                      <input type="email" className={inputCls()} placeholder="drh@entreprise.dz" value={form.entreprise.email} onChange={e => setEnt('email', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Employés autorisés</label>
                      <input type="number" min={1} className={inputCls()} value={form.entreprise.employesAutorises} onChange={e => setEnt('employesAutorises', parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="col-span-2 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Facturation mensuelle</p>
                        <p className="text-xs text-gray-400">Générer une facture groupée chaque mois</p>
                      </div>
                      <ToggleSwitch checked={form.entreprise.facturationMensuelle} onChange={v => setEnt('facturationMensuelle', v)} />
                    </div>
                  </div>
                  {form.type === 'liste_blanche' && (
                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                      <span className="text-xl">📋</span>
                      <div>
                        <p className="text-sm font-semibold text-[#880E4F]">Liste blanche activée</p>
                        <p className="text-xs text-rose-600/80">Vous pourrez importer la liste nominative après la création du code.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              {form.type === 'parrainage' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Médecin partenaire</label>
                    <input className={inputCls()} placeholder="Dr. Prénom Nom" value={form.medecin.nom} onChange={e => setMed('nom', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Spécialité</label>
                    <input className={inputCls()} placeholder="Médecin généraliste" value={form.medecin.specialite} onChange={e => setMed('specialite', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label>
                    <input className={inputCls()} placeholder="+213 xxx xxx xxx" value={form.medecin.telephone} onChange={e => setMed('telephone', e.target.value)} />
                  </div>
                </div>
              )}
              {['livraison','anniversaire','fidelite'].includes(form.type) && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{TYPE_CONFIG[form.type]?.icon}</div>
                    <p className="text-sm text-gray-600 font-medium">Type <strong>{TYPE_CONFIG[form.type]?.label}</strong></p>
                    <p className="text-xs text-gray-400 mt-1">Aucun paramètre supplémentaire requis</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2 — Restrictions */}
          {step === 2 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Code promo</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Générer auto</span>
                    <ToggleSwitch checked={form.autoCode} onChange={v => set('autoCode', v)} />
                  </div>
                </div>
                {!form.autoCode
                  ? <input className={inputCls(errors.code)} placeholder="Ex: SUMMER25"
                      value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                      style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                  : <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 font-mono text-sm font-bold text-[#1565C0] tracking-widest">
                      {finalCode}<span className="ml-2 text-xs font-normal text-blue-400">· généré automatiquement</span>
                    </div>
                }
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date de début</label>
                  <input type="date" className={inputCls()} value={form.dateDebut} onChange={e => set('dateDebut', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date de fin (optionnel)</label>
                  <input type="date" className={inputCls()} value={form.dateFin} onChange={e => set('dateFin', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Utilisations maximum (optionnel)</label>
                <input type="number" min={1} className={inputCls()} placeholder="Laisser vide pour illimité"
                  value={form.utilisationsMax} onChange={e => set('utilisationsMax', e.target.value)} />
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">1 utilisation par client</p>
                  <p className="text-xs text-gray-400">Chaque client ne peut utiliser le code qu'une fois</p>
                </div>
                <ToggleSwitch checked={form.uniqueParClient} onChange={v => set('uniqueParClient', v)} />
              </div>
            </>
          )}

          {/* Step 3 — Confirmation */}
          {step === 3 && (
            <div className="bg-[#E3F2FD] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${TYPE_CONFIG[form.type]?.bg}`}>{TYPE_CONFIG[form.type]?.icon}</div>
                <div>
                  <p className="font-black text-[#1565C0] text-lg font-mono tracking-widest">{form.autoCode ? finalCode : (form.code || '—')}</p>
                  <TypeBadge type={form.type} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Catégorie', CAT_LABELS[form.categorie] || form.categorie],
                  ['Réduction', form.type === 'montant_fixe' ? `-${form.montantFixe} DA` : form.type === 'analyse_gratuite' ? `${form.analyses.join(', ')} offert(e)` : form.type === 'livraison' ? 'Livraison offerte' : `-${form.valeur}%`],
                  ['Date début', form.dateDebut || "Aujourd'hui"],
                  ['Date fin', form.dateFin || 'Sans limite'],
                  ['Utilisations max', form.utilisationsMax || 'Illimitées'],
                  ['1 utilisation/client', form.uniqueParClient ? 'Oui' : 'Non'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white rounded-xl p-2.5">
                    <p className="text-gray-400 font-medium">{label}</p>
                    <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {form.description && (
                <div className="mt-2 bg-white rounded-xl p-2.5">
                  <p className="text-xs text-gray-400">Description</p>
                  <p className="text-xs text-gray-800 font-semibold mt-0.5">{form.description}</p>
                </div>
              )}
              {form.type === 'liste_blanche' && (
                <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  <p className="text-xs text-[#880E4F] font-semibold">📋 Liste blanche vide — importez les bénéficiaires après création</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
          <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            {step === 0 ? 'Annuler' : '← Retour'}
          </button>
          {step < 3
            ? <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className={`px-5 py-2 rounded-xl text-sm font-medium text-white transition-colors ${canNext() ? 'bg-[#1565C0] hover:bg-[#0D47A1]' : 'bg-gray-300 cursor-not-allowed'}`}>
                Suivant →
              </button>
            : <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">
                ✓ Créer le code
              </button>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Enterprise Detail Modal ────────────────────────────────────── */
function EntrepriseModal({ promo, onClose }) {
  const ent = promo.entreprise;
  const usageHistory = [
    { mois: 'Avril 2026',   utilisations: 48, montant: 57600 },
    { mois: 'Mars 2026',    utilisations: 62, montant: 74400 },
    { mois: 'Février 2026', utilisations: 55, montant: 66000 },
    { mois: 'Janvier 2026', utilisations: 69, montant: 82800 },
  ];
  const maxUtil = Math.max(...usageHistory.map(h => h.utilisations));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl shrink-0">🏢</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{ent.nom}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-gray-500">NIF: {ent.nif}</span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">✓ Vérifié</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Employés autorisés', value: ent.employesAutorises.toLocaleString(), icon: '👥' },
              { label: 'Utilisations totales', value: promo.utilisationsActuelles.toLocaleString(), icon: '📊' },
              { label: 'Réduction accordée', value: `${promo.valeur}%`, icon: '💸' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-yellow-50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-xl font-black text-yellow-700">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact DRH</p>
            <div className="grid grid-cols-2 gap-2">
              {[['Nom', ent.contact],['Téléphone', ent.telephone],['Email', ent.email],['Facturation', ent.facturationMensuelle ? 'Mensuelle groupée' : 'À la demande']].map(([label, val]) => (
                <div key={label}><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-semibold text-gray-700">{val}</p></div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Historique des utilisations</p>
            {usageHistory.map(h => (
              <div key={h.mois} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-2">
                <div className="w-28 shrink-0"><p className="text-xs font-semibold text-gray-700">{h.mois}</p></div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-500" style={{ width: `${Math.round((h.utilisations / maxUtil) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-right w-28 shrink-0">
                  <p className="text-xs font-bold text-gray-700">{h.utilisations} utilisations</p>
                  <p className="text-[10px] text-gray-400">{h.montant.toLocaleString()} DA</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Fermer</button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">📄 Générer facture</button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">📧 Envoyer rapport</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm ─────────────────────────────────────────────── */
function DeleteConfirm({ code, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Supprimer le code</h3>
        <p className="text-sm text-gray-500 mb-6">Supprimer <span className="font-mono font-bold text-gray-800">{code}</span> ? Cette action est irréversible.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats Section ──────────────────────────────────────────────── */
function StatsSection({ promos }) {
  const rows = promos.map(p => {
    const remise = ['pourcentage','parrainage','entreprise','liste_blanche'].includes(p.type)
      ? Math.round(p.utilisationsActuelles * 1200 * p.valeur / 100)
      : p.type === 'montant_fixe' ? p.utilisationsActuelles * p.valeur : 0;
    const tauxPct = p.utilisationsMax
      ? Math.round((p.utilisationsActuelles / p.utilisationsMax) * 100)
      : null;
    const meilleurJour = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][p.id % 7];
    return { promo: p, remise, tauxPct, meilleurJour };
  }).sort((a, b) => b.promo.utilisationsActuelles - a.promo.utilisationsActuelles);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Statistiques des codes</h2>
        <p className="text-xs text-gray-400 mt-0.5">Récapitulatif des performances par code promo</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Code','Type','Utilisations','Réduction totale accordée','Meilleur jour','Taux utilisation'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(({ promo: p, remise, tauxPct, meilleurJour }) => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#E3F2FD] text-[#1565C0] font-mono text-sm font-bold">{p.code}</span>
                </td>
                <td className="px-5 py-3"><TypeBadge type={p.type} /></td>
                <td className="px-5 py-3">
                  <span className="font-bold text-gray-800">{p.utilisationsActuelles.toLocaleString()}</span>
                  {p.utilisationsMax && <span className="text-gray-400 text-xs"> / {p.utilisationsMax.toLocaleString()}</span>}
                </td>
                <td className="px-5 py-3">
                  {remise > 0
                    ? <span className="font-bold text-orange-600">{remise.toLocaleString()} DA</span>
                    : <span className="text-gray-400 text-xs">—</span>
                  }
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">{meilleurJour}</span>
                </td>
                <td className="px-5 py-3">
                  {tauxPct !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden w-20">
                        <div className={`h-full rounded-full ${tauxPct > 80 ? 'bg-red-400' : tauxPct > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(tauxPct, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${tauxPct > 80 ? 'text-red-600' : tauxPct > 50 ? 'text-yellow-600' : 'text-green-600'}`}>{tauxPct}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Illimité</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
const TYPE_OPTIONS = [{ value: '', label: 'Tous les types' }, ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))];
const CAT_OPTIONS  = [{ value: '', label: 'Toutes les catégories' }, ...Object.entries(CAT_LABELS).map(([k, v]) => ({ value: k, label: v }))];
const STATUT_OPTS  = [{ value: 'tous', label: 'Tous' }, { value: 'actif', label: 'Actifs' }, { value: 'inactif', label: 'Inactifs' }, { value: 'expiré', label: 'Expirés' }];

export default function PromosPage() {
  const [promos,  setPromos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('tous');
  const [activeTab, setActiveTab] = useState('codes');
  const [showCreate, setShowCreate] = useState(false);
  const [entModal, setEntModal] = useState(null);
  const [lbModal, setLbModal] = useState(null);
  const [deletePromo, setDeletePromo] = useState(null);
  const [showVerif, setShowVerif] = useState(false);

  // ── Supabase ──
  useEffect(() => { chargerPromos(); }, []);

  const chargerPromos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPromos(data || []);
    setLoading(false);
  };

  const ajouterPromo = async (formData) => {
    await supabase.from('promos').insert(formData);
    chargerPromos();
  };

  const togglePromo = async (id, actif) => {
    await supabase.from('promos').update({ actif: !actif }).eq('id', id);
    chargerPromos();
  };

  const supprimerPromo = async (id) => {
    await supabase.from('promos').delete().eq('id', id);
    chargerPromos();
  };

  const actifs      = promos.filter(p => p.actif && !isExpired(p));
  const totalUtil   = promos.reduce((s, p) => s + p.utilisationsActuelles, 0);
  const totalRemise = promos.reduce((s, p) => {
    if (['pourcentage','parrainage','entreprise','liste_blanche'].includes(p.type)) return s + (p.utilisationsActuelles * 1200 * p.valeur / 100);
    if (p.type === 'montant_fixe') return s + (p.utilisationsActuelles * p.valeur);
    return s;
  }, 0);
  const entreprises = promos.filter(p => ['entreprise','liste_blanche'].includes(p.type) && p.entreprise);

  const filtered = promos.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchType = !typeFilter || p.type === typeFilter;
    const matchCat  = !catFilter  || p.categorie === catFilter;
    const expired   = isExpired(p);
    const matchStat = statutFilter === 'tous' ? true : statutFilter === 'actif' ? (p.actif && !expired) : statutFilter === 'inactif' ? (!p.actif && !expired) : expired;
    return matchSearch && matchType && matchCat && matchStat;
  });

  function handleToggle(id) { setPromos(prev => prev.map(p => p.id === id ? { ...p, actif: !p.actif } : p)); }
  function handleSaveNew(data) { setPromos(prev => [data, ...prev]); }
  function handleDelete(id) { setPromos(prev => prev.filter(p => p.id !== id)); setDeletePromo(null); }
  function handleUpdatePromo(updated) { setPromos(prev => prev.map(p => p.id === updated.id ? updated : p)); setLbModal(updated); }

  const selectCls = "px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#1565C0] transition-colors";

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <div className="p-6 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Codes actifs',           value: actifs.length,                          icon: '✅', color: 'text-[#1565C0]',  bg: 'bg-blue-50',   border: 'border-blue-100'   },
          { label: 'Utilisations totales',   value: totalUtil.toLocaleString(),              icon: '📊', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100'  },
          { label: 'Réduction accordée',     value: `${Math.round(totalRemise / 1000)}K DA`, icon: '💸', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Entreprises partenaires',value: entreprises.length,                     icon: '🏢', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
        ].map(({ label, value, icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="text-2xl mb-3">{icon}</div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[{ key: 'codes', label: '🎟️ Codes promo' }, { key: 'entreprises', label: '🏢 Entreprises' }, { key: 'verif', label: '🔍 Vérificateur' }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === t.key ? 'bg-white text-[#1565C0] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
              {t.key === 'entreprises' && <span className="ml-1.5 text-xs bg-yellow-200 text-yellow-800 font-bold px-1.5 py-0.5 rounded-full">{entreprises.length}</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('entreprises')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
            🏢 Ajouter entreprise
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">
            + Créer un code
          </button>
        </div>
      </div>

      {/* ══ CODES TAB ══ */}
      {activeTab === 'codes' && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par code ou description…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-colors" />
              </div>
              <select className={selectCls} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className={selectCls} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {STATUT_OPTS.map(o => (
                  <button key={o.value} onClick={() => setStatutFilter(o.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statutFilter === o.value ? 'bg-white text-[#1565C0] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Codes promo <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span></h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Code','Type','Catégorie','Valeur','Utilisations','Validité','Statut','Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">Aucun code promo trouvé.</td></tr>
                  ) : filtered.map(promo => {
                    const expired = isExpired(promo);
                    const pct = promo.utilisationsMax ? Math.round((promo.utilisationsActuelles / promo.utilisationsMax) * 100) : null;
                    const hasLB = promo.type === 'liste_blanche' && promo.listeBlanche;
                    const lbCount = hasLB ? promo.listeBlanche.personnes.length : 0;
                    return (
                      <tr key={promo.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-[#E3F2FD] text-[#1565C0] font-mono text-sm font-bold tracking-wider">{promo.code}</span>
                            {hasLB && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                👥 {lbCount}
                              </span>
                            )}
                          </div>
                          {promo.description && <p className="text-xs text-gray-400 mt-0.5 max-w-[140px] truncate">{promo.description}</p>}
                        </td>
                        <td className="px-5 py-4"><TypeBadge type={promo.type} /></td>
                        <td className="px-5 py-4 text-xs text-gray-500 font-medium">{CAT_LABELS[promo.categorie] || promo.categorie}</td>
                        <td className="px-5 py-4"><ValeurDisplay promo={promo} /></td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-semibold text-gray-700">{promo.utilisationsActuelles}</span>
                            <span className="text-gray-400"> / {promo.utilisationsMax ?? '∞'}</span>
                          </div>
                          {pct !== null && (
                            <div className="mt-1 h-1.5 w-20 rounded-full bg-gray-200 overflow-hidden">
                              <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                          <span>{promo.dateDebut}</span>
                          {promo.dateFin ? <><br /><span className={expired ? 'text-red-500 font-medium' : ''}>→ {promo.dateFin}</span></> : <><br /><span className="text-gray-400">Sans limite</span></>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ToggleSwitch checked={promo.actif && !expired} onChange={() => handleToggle(promo.id)} disabled={expired} />
                            <StatutBadge promo={promo} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            {hasLB && (
                              <button onClick={() => setLbModal(promo)} title="Gérer liste blanche"
                                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-sm transition-colors text-rose-700">
                                📋
                              </button>
                            )}
                            {['entreprise','liste_blanche'].includes(promo.type) && promo.entreprise && (
                              <button onClick={() => setEntModal(promo)} title="Détails entreprise"
                                className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center text-sm transition-colors">
                                🏢
                              </button>
                            )}
                            <button onClick={() => navigator.clipboard?.writeText(promo.code)} title="Copier le code"
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center text-sm transition-colors">
                              📋
                            </button>
                            <button onClick={() => setDeletePromo(promo)} title="Supprimer"
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm transition-colors">
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
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">
              {filtered.length} code(s) affiché(s) sur {promos.length}
            </div>
          </div>
        </>
      )}

      {/* ══ ENTREPRISES TAB ══ */}
      {activeTab === 'entreprises' && (
        <div className="space-y-4">
          {entreprises.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <div className="text-4xl mb-3">🏢</div>
              <p className="font-semibold text-gray-600">Aucune entreprise partenaire</p>
              <button onClick={() => setShowCreate(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">
                + Ajouter une entreprise
              </button>
            </div>
          ) : entreprises.map(promo => {
            const ent = promo.entreprise;
            const usagePct = Math.round((promo.utilisationsActuelles / ent.employesAutorises) * 100);
            const hasLB = promo.type === 'liste_blanche';
            return (
              <div key={promo.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${hasLB ? 'bg-rose-100' : 'bg-yellow-100'}`}>
                    {hasLB ? '📋' : '🏢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{ent.nom}</h3>
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ NIF vérifié</span>
                      <StatutBadge promo={promo} />
                      {hasLB && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">📋 Liste blanche</span>}
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">NIF: {ent.nif} · Code: <span className="font-bold" style={{ color: TYPE_CONFIG[promo.type]?.hex }}>{promo.code}</span></p>
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {[
                        { label: 'Employés autorisés', value: ent.employesAutorises.toLocaleString() },
                        { label: 'Utilisations ce mois', value: '48' },
                        { label: 'Facturé ce mois', value: '57 600 DA' },
                        { label: 'Contact DRH', value: ent.contact },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Utilisation des quotas</span>
                        <span>{promo.utilisationsActuelles} / {ent.employesAutorises} ({usagePct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className={`h-full rounded-full ${usagePct > 80 ? 'bg-red-400' : usagePct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(usagePct, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => setEntModal(promo)} className="px-3 py-2 rounded-xl bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-xs font-semibold transition-colors whitespace-nowrap">Voir détails</button>
                    {hasLB && <button onClick={() => setLbModal(promo)} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors whitespace-nowrap">📋 Liste ({promo.listeBlanche?.personnes?.length ?? 0})</button>}
                    <button className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-semibold transition-colors whitespace-nowrap">Modifier</button>
                    <button onClick={() => handleToggle(promo.id)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${promo.actif ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {promo.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ VÉRIFICATEUR TAB ══ */}
      {activeTab === 'verif' && (
        <div className="max-w-lg">
          <VerificateurCode promos={promos} />
        </div>
      )}

      {/* Stats section — always visible */}
      <StatsSection promos={promos} />

      {/* Modals */}
      {showCreate && <CreatePromoModal onClose={() => setShowCreate(false)} onSave={handleSaveNew} />}
      {entModal   && <EntrepriseModal promo={entModal} onClose={() => setEntModal(null)} />}
      {lbModal    && <ListeBlanchemModal promo={lbModal} onClose={() => setLbModal(null)} onUpdate={handleUpdatePromo} />}
      {deletePromo && <DeleteConfirm code={deletePromo.code} onConfirm={() => handleDelete(deletePromo.id)} onCancel={() => setDeletePromo(null)} />}
    </div>
  );
}
