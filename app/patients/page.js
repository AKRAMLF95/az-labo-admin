'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/* ─── Mock Data ─────────────────────────────────────────────────── */
const PATIENTS_DATA = [
  {
    id: 1,
    nom: 'Karim Boussaid',
    email: 'karim.boussaid@gmail.com',
    initiales: 'KB',
    age: 42,
    sexe: 'M',
    telephone: '0555 123 456',
    whatsapp: '0555 123 456',
    statut: 'vip',
    wilaya: 'Alger',
    rdvTotal: 14,
    dernierRdv: '2026-04-03',
    prefNotif: 'WhatsApp',
    adresse: '12 Rue Didouche, Alger Centre',
    groupeSanguin: 'A+',
    antecedents: 'Hypertension, Diabète type 2',
    rdvHistorique: [
      { date: '2026-04-03', analyse: 'NFS + Glycémie', technicien: 'Amina B.', statut: 'validé' },
      { date: '2026-02-15', analyse: 'Bilan lipidique', technicien: 'Riad K.', statut: 'validé' },
      { date: '2025-12-10', analyse: 'HbA1c + Créatinine', technicien: 'Amina B.', statut: 'validé' },
    ],
    resultats: [
      { date: '2026-04-03', analyse: 'Glycémie à jeun', valeur: '7.2', unite: 'mmol/L', statut: 'high' },
      { date: '2026-04-03', analyse: 'NFS — Globules rouges', valeur: '4.5', unite: '10⁶/µL', statut: 'normal' },
      { date: '2026-02-15', analyse: 'LDL Cholestérol', valeur: '3.8', unite: 'mmol/L', statut: 'high' },
    ],
  },
  {
    id: 2,
    nom: 'Sara Amrani',
    email: 'sara.amrani@yahoo.fr',
    initiales: 'SA',
    age: 29,
    sexe: 'F',
    telephone: '0661 789 012',
    whatsapp: '0661 789 012',
    statut: 'actif',
    wilaya: 'Alger',
    rdvTotal: 5,
    dernierRdv: '2026-04-08',
    prefNotif: 'SMS',
    adresse: '8 Cité Ain Allah, Alger',
    groupeSanguin: 'O+',
    antecedents: 'Aucun',
    rdvHistorique: [
      { date: '2026-04-08', analyse: 'Sérologie grossesse', technicien: 'Riad K.', statut: 'en attente' },
      { date: '2026-01-20', analyse: 'NFS', technicien: 'Amina B.', statut: 'validé' },
    ],
    resultats: [
      { date: '2026-01-20', analyse: 'Hémoglobine', valeur: '11.2', unite: 'g/dL', statut: 'low' },
      { date: '2026-01-20', analyse: 'Ferritine', valeur: '8', unite: 'µg/L', statut: 'low' },
    ],
  },
  {
    id: 3,
    nom: 'Mohamed Tlemcani',
    email: 'med.tlemcani@hotmail.com',
    initiales: 'MT',
    age: 55,
    sexe: 'M',
    telephone: '0770 334 556',
    whatsapp: null,
    statut: 'actif',
    wilaya: 'Oran',
    rdvTotal: 9,
    dernierRdv: '2026-03-22',
    prefNotif: 'SMS',
    adresse: '3 Rue des Frères Khéroufi, Oran',
    groupeSanguin: 'B-',
    antecedents: 'Insuffisance rénale légère',
    rdvHistorique: [
      { date: '2026-03-22', analyse: 'Créatinine + Urée', technicien: 'Riad K.', statut: 'validé' },
      { date: '2026-01-05', analyse: 'Bilan rénal complet', technicien: 'Amina B.', statut: 'validé' },
    ],
    resultats: [
      { date: '2026-03-22', analyse: 'Créatinine', valeur: '130', unite: 'µmol/L', statut: 'high' },
      { date: '2026-03-22', analyse: 'Urée', valeur: '8.2', unite: 'mmol/L', statut: 'normal' },
    ],
  },
  {
    id: 4,
    nom: 'Fatima Zerrouk',
    email: 'f.zerrouk@gmail.com',
    initiales: 'FZ',
    age: 38,
    sexe: 'F',
    telephone: '0554 901 234',
    whatsapp: '0554 901 234',
    statut: 'vip',
    wilaya: 'Alger',
    rdvTotal: 22,
    dernierRdv: '2026-04-10',
    prefNotif: 'WhatsApp',
    adresse: '5 Bd Colonel Amirouche, Alger',
    groupeSanguin: 'AB+',
    antecedents: 'Thyroïdite de Hashimoto',
    rdvHistorique: [
      { date: '2026-04-10', analyse: 'TSH + T4 libre', technicien: 'Amina B.', statut: 'en attente' },
      { date: '2026-03-01', analyse: 'NFS + CRP', technicien: 'Riad K.', statut: 'validé' },
      { date: '2026-01-12', analyse: 'Bilan thyroïdien complet', technicien: 'Amina B.', statut: 'validé' },
    ],
    resultats: [
      { date: '2026-03-01', analyse: 'TSH', valeur: '6.8', unite: 'mUI/L', statut: 'high' },
      { date: '2026-03-01', analyse: 'CRP', valeur: '12', unite: 'mg/L', statut: 'high' },
      { date: '2026-01-12', analyse: 'T4 libre', valeur: '11.5', unite: 'pmol/L', statut: 'normal' },
    ],
  },
  {
    id: 5,
    nom: 'Youcef Mahdjoub',
    email: 'youcef.m@outlook.com',
    initiales: 'YM',
    age: 31,
    sexe: 'M',
    telephone: '0668 567 890',
    whatsapp: '0668 567 890',
    statut: 'actif',
    wilaya: 'Blida',
    rdvTotal: 3,
    dernierRdv: '2026-03-15',
    prefNotif: 'WhatsApp',
    adresse: '22 Rue Ben Boulaid, Blida',
    groupeSanguin: 'O-',
    antecedents: 'Aucun',
    rdvHistorique: [
      { date: '2026-03-15', analyse: 'NFS + VS', technicien: 'Riad K.', statut: 'validé' },
    ],
    resultats: [
      { date: '2026-03-15', analyse: 'Globules blancs', valeur: '7.2', unite: '10³/µL', statut: 'normal' },
      { date: '2026-03-15', analyse: 'VS 1h', valeur: '18', unite: 'mm/h', statut: 'normal' },
    ],
  },
];

const WILAYAS = ['Toutes', 'Alger', 'Oran', 'Blida', 'Constantine', 'Tizi Ouzou', 'Sétif'];

const STATUT_FILTERS = [
  { key: 'tous',    label: 'Tous'     },
  { key: 'actif',   label: 'Actifs'   },
  { key: 'vip',     label: 'VIP'      },
  { key: 'inactif', label: 'Inactifs' },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function StatutBadge({ statut }) {
  if (statut === 'vip') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: '#FFF8E1', color: '#E65100' }}>
      ⭐ VIP
    </span>
  );
  if (statut === 'actif') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
      ● Actif
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
      ● Inactif
    </span>
  );
}

function ResultStatutBadge({ statut }) {
  if (statut === 'high') return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">↑ ÉLEVÉ</span>;
  if (statut === 'low') return <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">↓ BAS</span>;
  return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Normal</span>;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
];
function avatarColor(id) { return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length]; }

/* ─── Dossier Modal ──────────────────────────────────────────────── */
function DossierModal({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('infos');
  const color = avatarColor(patient.id);

  const tabs = [
    { key: 'infos',      label: 'Infos personnelles' },
    { key: 'stats',      label: 'Statistiques'       },
    { key: 'historique', label: 'Historique RDV'     },
    { key: 'resultats',  label: 'Résultats'          },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className={`w-14 h-14 rounded-2xl ${color.bg} flex items-center justify-center shrink-0`}>
            <span className={`${color.text} text-lg font-black`}>{patient.initiales}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{patient.nom}</h2>
              <StatutBadge statut={patient.statut} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{patient.email} · {patient.wilaya}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === t.key
                  ? 'bg-[#E3F2FD] text-[#1565C0] border-b-2 border-[#1565C0]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Infos personnelles ── */}
          {activeTab === 'infos' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nom complet',       value: patient.nom },
                { label: 'Téléphone',          value: patient.telephone },
                { label: 'WhatsApp',           value: patient.whatsapp || '—' },
                { label: 'Email',              value: patient.email },
                { label: 'Âge',               value: `${patient.age} ans` },
                { label: 'Sexe',              value: patient.sexe === 'M' ? 'Masculin' : 'Féminin' },
                { label: 'Wilaya',            value: patient.wilaya },
                { label: 'Adresse',           value: patient.adresse },
                { label: 'Groupe sanguin',    value: patient.groupeSanguin },
                { label: 'Notification pref.', value: patient.prefNotif },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                  <p className="text-sm text-gray-800 font-semibold">{value}</p>
                </div>
              ))}
              <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium mb-1">Antécédents médicaux</p>
                <p className="text-sm text-gray-800 font-semibold">{patient.antecedents}</p>
              </div>
            </div>
          )}

          {/* ── Statistiques ── */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'RDV total',       value: patient.rdvTotal,                          color: 'text-[#1565C0]', bg: 'bg-blue-50' },
                  { label: 'Dernier RDV',     value: formatDate(patient.dernierRdv),             color: 'text-gray-700',  bg: 'bg-gray-50' },
                  { label: 'Résultats anorm.',value: patient.resultats.filter(r => r.statut !== 'normal').length, color: 'text-red-600', bg: 'bg-red-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-medium mb-3">Fréquence des analyses</p>
                {['NFS', 'Glycémie', 'Bilan lipidique', 'Bilan rénal'].map((a, i) => {
                  const pct = [70, 50, 30, 40][i];
                  return (
                    <div key={a} className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{a}</span><span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-[#1565C0]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Historique RDV ── */}
          {activeTab === 'historique' && (
            <div className="space-y-3">
              {patient.rdvHistorique.map((rdv, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center shrink-0">
                    <span className="text-base">📅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{rdv.analyse}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tech: {rdv.technicien} · {formatDate(rdv.date)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    rdv.statut === 'validé'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {rdv.statut}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Résultats ── */}
          {activeTab === 'resultats' && (
            <div className="space-y-2">
              {patient.resultats.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center shrink-0">
                    <span className="text-base">🧪</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{r.analyse}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">{r.valeur} <span className="text-xs font-normal text-gray-400">{r.unite}</span></span>
                    <ResultStatutBadge statut={r.statut} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            Fermer
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">
            📅 Nouveau RDV
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── New Patient Modal ──────────────────────────────────────────── */
function NewPatientModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    nom: '', telephone: '', whatsappSame: true, whatsapp: '',
    email: '', age: '', sexe: 'M', prefNotif: 'WhatsApp', wilaya: 'Alger',
  });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Champ requis';
    if (!form.telephone.trim()) e.telephone = 'Champ requis';
    if (!form.age || isNaN(parseInt(form.age))) e.age = 'Âge invalide';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const initiales = form.nom.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    onSave({
      id: Date.now(),
      initiales,
      statut: 'actif',
      rdvTotal: 0,
      dernierRdv: new Date().toISOString().slice(0, 10),
      rdvHistorique: [],
      resultats: [],
      groupeSanguin: '—',
      antecedents: '—',
      adresse: '—',
      ...form,
      whatsapp: form.whatsappSame ? form.telephone : form.whatsapp,
      age: parseInt(form.age),
    });
    onClose();
  }

  const inputCls = (field) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-[#1565C0]/20 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-[#1565C0]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouveau patient</h2>
            <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations du patient</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom complet <span className="text-red-500">*</span></label>
            <input className={inputCls('nom')} placeholder="ex: Karim Boussaid"
              value={form.nom} onChange={e => set('nom', e.target.value)} />
            {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone <span className="text-red-500">*</span></label>
            <input className={inputCls('telephone')} placeholder="0555 123 456"
              value={form.telephone} onChange={e => set('telephone', e.target.value)} />
            {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>}
          </div>

          {/* WhatsApp toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600">WhatsApp</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Même numéro</span>
                <button
                  type="button"
                  onClick={() => set('whatsappSame', !form.whatsappSame)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.whatsappSame ? 'bg-[#1565C0]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    form.whatsappSame ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
            {!form.whatsappSame && (
              <input className={inputCls('whatsapp')} placeholder="Numéro WhatsApp différent"
                value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
            <input type="email" className={inputCls('email')} placeholder="exemple@email.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          {/* Âge + Sexe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Âge <span className="text-red-500">*</span></label>
              <input type="number" min="0" max="120" className={inputCls('age')} placeholder="ex: 35"
                value={form.age} onChange={e => set('age', e.target.value)} />
              {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sexe</label>
              <select className={inputCls('sexe')} value={form.sexe} onChange={e => set('sexe', e.target.value)}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          {/* Préférence notification */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Préférence de notification</label>
            <div className="flex gap-2">
              {['WhatsApp', 'SMS', 'Email'].map(opt => (
                <button key={opt} type="button"
                  onClick={() => set('prefNotif', opt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    form.prefNotif === opt
                      ? 'bg-[#1565C0] text-white border-[#1565C0]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1565C0]/40'
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Wilaya */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Wilaya</label>
            <select className={inputCls('wilaya')} value={form.wilaya} onChange={e => set('wilaya', e.target.value)}>
              {WILAYAS.filter(w => w !== 'Toutes').map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">
            Enregistrer le patient
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm ─────────────────────────────────────────────── */
function DeleteConfirm({ patient, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🗑️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Supprimer le patient</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-gray-800">{patient.nom}</span> ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('tous');
  const [wilayaFilter, setWilayaFilter] = useState('Toutes');
  const [dossierPatient, setDossierPatient] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deletePatient, setDeletePatient] = useState(null);

  // ── Supabase ──
  useEffect(() => { chargerPatients(); }, []);

  const chargerPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Normalize DB rows into the shape the UI expects
      const normalized = (data || []).map(p => {
        const nameParts = (p.nom || '').split(' ');
        const initiales = nameParts.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2) || '??';
        return {
          ...p,
          initiales,
          age: p.age || '—',
          sexe: p.sexe || '—',
          email: p.email || '',
          statut: p.statut || 'regulier',
          wilaya: p.wilaya || 'Alger',
          rdvTotal: p.total_rdv || 0,
          dernierRdv: p.dernierRdv || p.created_at?.split('T')[0] || '—',
          whatsapp: p.whatsapp || p.telephone,
          prefNotif: p.pref_notif || 'whatsapp',
          rdvHistorique: p.rdvHistorique || [],
          resultats: p.resultats || [],
        };
      });

      setPatients(normalized);
    } catch (err) {
      console.error('chargerPatients error:', err);
      setPatients([]);
    }
    setLoading(false);
  };

  const ajouterPatient = async (formData) => {
    await supabase.from('patients').insert(formData);
    chargerPatients();
  };

  const supprimerPatient = async (id) => {
    await supabase.from('patients').delete().eq('id', id);
    chargerPatients();
  };

  /* Derived */
  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || (p.nom || '').toLowerCase().includes(q) || (p.telephone || '').includes(q);
    const matchStatut = statutFilter === 'tous' || p.statut === statutFilter;
    const matchWilaya = wilayaFilter === 'Toutes' || p.wilaya === wilayaFilter;
    return matchSearch && matchStatut && matchWilaya;
  });

  const stats = {
    total: patients.length,
    nouveaux: 18,
    vip: patients.filter(p => p.statut === 'vip').length,
    rdvAujourdhui: 6,
  };

  function handleSaveNew(data) {
    setPatients(prev => [data, ...prev]);
  }

  function handleDelete(id) {
    setPatients(prev => prev.filter(p => p.id !== id));
    setDeletePatient(null);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <div className="p-6 space-y-6">

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total patients',   value: stats.total,          icon: '👥', color: 'text-[#1565C0]', bg: 'bg-blue-50',   border: 'border-blue-100' },
          { label: 'Nouveaux ce mois', value: stats.nouveaux,       icon: '✨', color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-100' },
          { label: 'Patients VIP',     value: stats.vip,            icon: '⭐', color: 'text-orange-600',bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: "RDV aujourd'hui",  value: stats.rdvAujourdhui,  icon: '📅', color: 'text-purple-600',bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map(({ label, value, icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou téléphone…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-colors"
            />
          </div>

          {/* Statut filter */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {STATUT_FILTERS.map(f => (
              <button key={f.key} onClick={() => setStatutFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statutFilter === f.key
                    ? 'bg-white text-[#1565C0] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Wilaya dropdown */}
          <select
            value={wilayaFilter}
            onChange={e => setWilayaFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#1565C0] transition-colors">
            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          {/* New patient btn */}
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors ml-auto">
            <span className="text-base">+</span>
            Nouveau patient
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            Liste des patients
            <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Patient', 'Âge · Sexe', 'Téléphone', 'RDV total', 'Dernier RDV', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    Aucun patient ne correspond à votre recherche.
                  </td>
                </tr>
              ) : filtered.map(patient => {
                const color = avatarColor(patient.id);
                return (
                  <tr key={patient.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Patient */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${color.bg} flex items-center justify-center shrink-0`}>
                          <span className={`${color.text} text-xs font-black`}>{patient.initiales}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{patient.nom}</p>
                          <p className="text-xs text-gray-400 truncate">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Âge · Sexe */}
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                      {patient.age} ans · {patient.sexe === 'M' ? '♂' : '♀'}
                    </td>
                    {/* Téléphone */}
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap font-mono text-xs">
                      {patient.telephone}
                    </td>
                    {/* RDV total */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#1565C0]">{patient.rdvTotal}</span>
                    </td>
                    {/* Dernier RDV */}
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(patient.dernierRdv)}
                    </td>
                    {/* Statut */}
                    <td className="px-5 py-4">
                      <StatutBadge statut={patient.statut} />
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDossierPatient(patient)}
                          title="Voir dossier"
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors text-sm">
                          👁️
                        </button>
                        <button title="Nouveau RDV"
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors text-sm">
                          📅
                        </button>
                        {patient.whatsapp && (
                          <button title="Contacter WhatsApp"
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors text-sm">
                            📱
                          </button>
                        )}
                        <button onClick={() => setDeletePatient(patient)}
                          title="Supprimer"
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors text-sm">
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

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">
          Affichage de {filtered.length} sur {patients.length} patients
        </div>
      </div>

      {/* ── Modals ── */}
      {dossierPatient && (
        <DossierModal patient={dossierPatient} onClose={() => setDossierPatient(null)} />
      )}
      {showNewModal && (
        <NewPatientModal onClose={() => setShowNewModal(false)} onSave={handleSaveNew} />
      )}
      {deletePatient && (
        <DeleteConfirm
          patient={deletePatient}
          onConfirm={() => handleDelete(deletePatient.id)}
          onCancel={() => setDeletePatient(null)}
        />
      )}
    </div>
  );
}
