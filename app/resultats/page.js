'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Données mock ─────────────────────────────────────────────────────────────
const RESULTATS_DATA = [
  {
    id: 1,
    patient: 'Karim Amrani',
    telephone: '+213 555 123 456',
    prefNotif: 'whatsapp',
    rdvDate: 'Auj. 07:30',
    lieu: 'labo',
    analyses: [
      { nom: 'Glycémie à jeun',  valeur: '7.8',  unite: 'mmol/L', refMin: 3.9,  refMax: 5.5,  statut: 'high'   },
      { nom: 'Hémoglobine',      valeur: '14.2', unite: 'g/dL',   refMin: 12,   refMax: 17,   statut: 'normal' },
      { nom: 'Globules blancs',  valeur: '6.8',  unite: 'G/L',    refMin: 4,    refMax: 10,   statut: 'normal' },
      { nom: 'Plaquettes',       valeur: '245',  unite: 'G/L',    refMin: 150,  refMax: 400,  statut: 'normal' },
    ],
    statut: 'en_attente',
  },
  {
    id: 2,
    patient: 'Sara Bensalem',
    telephone: '+213 661 789 012',
    prefNotif: 'sms',
    rdvDate: 'Auj. 08:00',
    lieu: 'labo',
    analyses: [
      { nom: 'CRP',   valeur: '48', unite: 'mg/L', refMin: 0, refMax: 5,  statut: 'high' },
      { nom: 'VS 1h', valeur: '42', unite: 'mm',   refMin: 0, refMax: 20, statut: 'high' },
    ],
    statut: 'valide',
  },
  {
    id: 3,
    patient: 'Mohamed Ouali',
    telephone: '+213 770 345 678',
    prefNotif: 'whatsapp',
    rdvDate: 'Auj. 08:30',
    lieu: 'labo',
    analyses: [
      { nom: 'CRP',  valeur: '3.2',    unite: 'mg/L', refMin: 0,    refMax: 5,    statut: 'normal' },
      { nom: 'ECBU', valeur: 'Négatif', unite: '',    refMin: null, refMax: null, statut: 'normal' },
    ],
    statut: 'en_attente',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUT_RESULT = {
  en_attente: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En attente'  },
  valide:     { bg: 'bg-green-100',  text: 'text-green-700',  label: '✓ Validé'    },
  envoye:     { bg: 'bg-blue-100',   text: 'text-[#1565C0]',  label: '✉ Envoyé'   },
  rejete:     { bg: 'bg-red-100',    text: 'text-red-700',    label: '✗ Rejeté'   },
};

const STATUT_ANALYSE = {
  normal: { bg: 'bg-green-100',  text: 'text-green-700',   label: '✓ Normal' },
  high:   { bg: 'bg-red-100',    text: 'text-red-700',     label: '⚠ HIGH'   },
  low:    { bg: 'bg-orange-100', text: 'text-orange-700',  label: '⚠ LOW'    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeStatut(valeur, refMin, refMax) {
  if (refMin === null || refMax === null) return 'normal';
  const n = parseFloat(valeur);
  if (isNaN(n)) return 'normal';
  if (n > refMax) return 'high';
  if (n < refMin) return 'low';
  return 'normal';
}

function getLink(patient) {
  const initials = patient.split(' ').map(w => w[0]).join('').toUpperCase();
  const d = new Date();
  const ds = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}`;
  return `azlabo.dz/r/${initials}-${ds}`;
}

function buildWhatsApp(result) {
  const prenom = result.patient.split(' ')[0];
  const link = getLink(result.patient);
  const anom = result.analyses.filter(a => a.statut !== 'normal').length;
  return `Bonjour ${prenom} 👋\nVos résultats sont prêts ✅\n🔗 ${link}${anom > 0 ? `\n⚠ ${anom} valeur(s) anormale(s)` : ''}\n🔒 Lien valable 30 jours`;
}

function buildSMS(result) {
  const link = getLink(result.patient);
  const anom = result.analyses.filter(a => a.statut !== 'normal').length;
  return `AZ Laboratoires: Vos resultats sont prets. ${link}${anom > 0 ? ` ${anom} val. anormale(s) - voir med.` : ''}`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, colorBg, colorText }) {
  return (
    <div className={`${colorBg} rounded-2xl p-5 flex items-start gap-4`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${colorText} opacity-70`}>{label}</p>
        <p className={`text-3xl font-black ${colorText} mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Modal aperçu message ─────────────────────────────────────────────────────
function MessagePreviewModal({ result, channel, onConfirm, onClose }) {
  const showWA  = channel === 'whatsapp' || channel === 'both';
  const showSMS = channel === 'sms'      || channel === 'both';
  const waMsg  = buildWhatsApp(result);
  const smsMsg = buildSMS(result);

  const btnLabel = channel === 'whatsapp' ? '📱 Envoyer WhatsApp'
                 : channel === 'sms'      ? '💬 Envoyer SMS'
                 :                         '📲 Envoyer les deux';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Aperçu du message</h2>
            <p className="text-white/70 text-xs mt-0.5">{result.patient} · {result.telephone}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 transition-colors flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* WhatsApp preview */}
          {showWA && (
            <div className="rounded-xl overflow-hidden border border-[#25D366]/30">
              <div className="bg-[#075E54] px-4 py-2 flex items-center gap-2">
                <span className="text-sm">📱</span>
                <span className="text-white text-xs font-bold">WhatsApp — AZ Laboratoires</span>
              </div>
              <div className="bg-[#ECE5DD] px-4 py-3">
                <div className="bg-[#DCF8C6] rounded-xl rounded-tl-none px-3 py-2.5 max-w-xs shadow-sm">
                  <pre className="text-xs text-[#303030] whitespace-pre-wrap font-sans leading-relaxed">{waMsg}</pre>
                  <p className="text-[10px] text-[#667781] mt-1 text-right">09:14 ✓✓</p>
                </div>
              </div>
            </div>
          )}

          {/* SMS preview */}
          {showSMS && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-700 px-4 py-2 flex items-center gap-2">
                <span className="text-sm">💬</span>
                <span className="text-white text-xs font-bold">SMS — AZ Laboratoires</span>
              </div>
              <div className="bg-gray-100 px-4 py-3">
                <div className="bg-white rounded-xl rounded-tl-none px-3 py-2.5 max-w-xs shadow-sm border border-gray-200">
                  <p className="text-xs text-[#303030] leading-relaxed">{smsMsg}</p>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">Envoyé</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Carte résultat ───────────────────────────────────────────────────────────
function ResultCard({ result, editingCell, onEditStart, onEditSave, onValidate, onSend, onReject }) {
  const anomalies  = result.analyses.filter(a => a.statut !== 'normal').length;
  const statutCfg  = STATUT_RESULT[result.statut] ?? STATUT_RESULT.en_attente;
  const isEnvoye   = result.statut === 'envoye';
  const isRejete   = result.statut === 'rejete';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      anomalies > 0 ? 'border-red-200' : 'border-gray-100'
    }`}>

      {/* ── Header carte ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-[#111] text-base">{result.patient}</p>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statutCfg.bg} ${statutCfg.text}`}>
              {statutCfg.label}
            </span>
            {anomalies > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                ⚠ {anomalies} anomalie{anomalies > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{result.telephone}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 shrink-0">
          <span className="font-medium">🕐 {result.rdvDate}</span>
          <span>
            {result.lieu === 'domicile' ? '🏠 Domicile' : '🏥 Labo'}
          </span>
          {result.prefNotif === 'whatsapp' ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              📱 WhatsApp
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
              💬 SMS
            </span>
          )}
        </div>
      </div>

      {/* ── Bannière anomalie ── */}
      {anomalies > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-start gap-2.5">
          <span className="text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700">
              {anomalies} valeur{anomalies > 1 ? 's' : ''} anormale{anomalies > 1 ? 's' : ''} détectée{anomalies > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Message automatique recommandé : "Consultez votre médecin pour ces résultats."
            </p>
          </div>
        </div>
      )}

      {/* ── Tableau analyses ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Analyse</th>
              <th className="px-5 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Valeur</th>
              <th className="px-5 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Référence</th>
              <th className="px-5 py-2.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {result.analyses.map((analyse, idx) => {
              const cellKey  = `${result.id}-${idx}`;
              const isEditing = editingCell === cellKey;
              const sCfg = STATUT_ANALYSE[analyse.statut] ?? STATUT_ANALYSE.normal;
              const refDisplay = analyse.refMin !== null && analyse.refMax !== null
                ? `${analyse.refMin} – ${analyse.refMax} ${analyse.unite}`
                : '—';

              return (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">

                  {/* Nom analyse */}
                  <td className="px-5 py-3">
                    <span className="font-medium text-[#111]">{analyse.nom}</span>
                  </td>

                  {/* Valeur — éditable inline */}
                  <td className="px-5 py-3 w-36">
                    {isEditing ? (
                      <InlineValueInput
                        initial={analyse.valeur}
                        onCommit={newVal => onEditSave(result.id, idx, newVal)}
                        onCancel={() => onEditStart(null)}
                      />
                    ) : (
                      <button
                        onClick={() => !isEnvoye && !isRejete && onEditStart(cellKey)}
                        title={isEnvoye || isRejete ? '' : 'Cliquer pour modifier'}
                        className={`font-mono font-semibold text-sm transition-colors ${
                          analyse.statut === 'high'   ? 'text-red-600'    :
                          analyse.statut === 'low'    ? 'text-orange-600' :
                          'text-green-700'
                        } ${!isEnvoye && !isRejete ? 'hover:underline decoration-dashed underline-offset-2 cursor-pointer' : 'cursor-default'}`}
                      >
                        {analyse.valeur}{analyse.unite ? ` ${analyse.unite}` : ''}
                      </button>
                    )}
                  </td>

                  {/* Référence */}
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">
                    {refDisplay}
                  </td>

                  {/* Statut */}
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sCfg.bg} ${sCfg.text}`}>
                      {sCfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Actions ── */}
      {!isRejete && !isEnvoye && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => onSend(result.id, 'whatsapp')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            📱 Valider + Envoyer WhatsApp
          </button>
          <button
            onClick={() => onSend(result.id, 'sms')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            💬 SMS
          </button>
          <button
            onClick={() => onSend(result.id, 'both')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            📲 Les deux
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onValidate(result.id)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] transition-colors"
          >
            ✓ Valider sans envoyer
          </button>
          <button
            onClick={() => onReject(result.id)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            ✗ Rejeter
          </button>
        </div>
      )}

      {isEnvoye && (
        <div className="px-5 py-3 border-t border-gray-100 bg-green-50 flex items-center gap-2">
          <span className="text-green-600 text-sm">✉</span>
          <p className="text-sm font-semibold text-green-700">Résultats envoyés au patient</p>
          <button
            onClick={() => onSend(result.id, result.prefNotif)}
            className="ml-auto text-xs font-semibold text-green-600 hover:text-green-700 underline"
          >
            Renvoyer
          </button>
        </div>
      )}

      {isRejete && (
        <div className="px-5 py-3 border-t border-gray-100 bg-red-50 flex items-center gap-2">
          <span className="text-red-500 text-sm">✗</span>
          <p className="text-sm font-semibold text-red-600">Résultat rejeté</p>
        </div>
      )}
    </div>
  );
}

// ─── Inline value input ───────────────────────────────────────────────────────
function InlineValueInput({ initial, onCommit, onCancel }) {
  const [val, setVal] = useState(initial);
  return (
    <input
      autoFocus
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onCommit(val)}
      onKeyDown={e => {
        if (e.key === 'Enter') e.target.blur();
        if (e.key === 'Escape') { onCancel(); }
      }}
      className="w-28 px-2 py-1 border-2 border-[#1565C0] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 bg-white"
    />
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ResultatsPage() {
  const [resultats,    setResultats]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState('tous');
  const [search,       setSearch]       = useState('');
  const [previewModal, setPreviewModal] = useState(null); // { resultId, channel }
  const [editingCell,  setEditingCell]  = useState(null); // '${resultId}-${analyseIdx}'

  // ── Supabase ──
  useEffect(() => { chargerResultats(); }, []);

  const chargerResultats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resultats')
      .select(`*, patients(nom, telephone, pref_notif), rdv(date, heure, lieu)`)
      .order('created_at', { ascending: false });
    if (!error) setResultats(data || []);
    setLoading(false);
  };

  const validerResultat = async (id) => {
    await supabase.from('resultats').update({
      valide: true, valide_par: 'Dr. Meziane',
      date_validation: new Date().toISOString(),
    }).eq('id', id);
    chargerResultats();
  };

  const envoyerResultat = async (id, via) => {
    await supabase.from('resultats').update({
      envoye: true, date_envoi: new Date().toISOString(),
    }).eq('id', id);
    chargerResultats();
  };

  // ── Stats dynamiques ──
  const stats = {
    en_attente: resultats.filter(r => r.statut === 'en_attente').length,
    valide:     resultats.filter(r => r.statut === 'valide').length,
    anomalies:  resultats.filter(r => r.analyses.some(a => a.statut !== 'normal')).length,
    envoye:     resultats.filter(r => r.statut === 'envoye').length,
  };

  // ── Filtrage ──
  const FILTERS = [
    { key: 'tous',       label: 'Tous',       count: resultats.length },
    { key: 'en_attente', label: 'En attente', count: stats.en_attente },
    { key: 'valide',     label: 'Validés',    count: stats.valide     },
    { key: 'anomalies',  label: 'Anomalies',  count: stats.anomalies  },
    { key: 'envoye',     label: 'Envoyés',    count: stats.envoye     },
  ];

  const filtered = resultats
    .filter(r => {
      if (activeFilter === 'en_attente') return r.statut === 'en_attente';
      if (activeFilter === 'valide')     return r.statut === 'valide';
      if (activeFilter === 'anomalies')  return r.analyses.some(a => a.statut !== 'normal');
      if (activeFilter === 'envoye')     return r.statut === 'envoye';
      return true;
    })
    .filter(r => !search || r.patient.toLowerCase().includes(search.toLowerCase()));

  // ── Actions ──
  function handleValidate(id) {
    setResultats(prev => prev.map(r => r.id === id ? { ...r, statut: 'valide' } : r));
  }

  function handleSend(id, channel) {
    setPreviewModal({ resultId: id, channel });
  }

  function confirmSend() {
    if (!previewModal) return;
    setResultats(prev => prev.map(r =>
      r.id === previewModal.resultId ? { ...r, statut: 'envoye' } : r
    ));
    setPreviewModal(null);
  }

  function handleReject(id) {
    if (window.confirm('Rejeter ce résultat ?')) {
      setResultats(prev => prev.map(r => r.id === id ? { ...r, statut: 'rejete' } : r));
    }
  }

  function handleEditSave(resultId, analyseIdx, newVal) {
    setResultats(prev => prev.map(r => {
      if (r.id !== resultId) return r;
      const newAnalyses = r.analyses.map((a, i) => {
        if (i !== analyseIdx) return a;
        const newStatut = computeStatut(newVal, a.refMin, a.refMax);
        return { ...a, valeur: newVal, statut: newStatut };
      });
      return { ...r, analyses: newAnalyses };
    }));
    setEditingCell(null);
  }

  function sendAllValidated() {
    const count = resultats.filter(r => r.statut === 'valide').length;
    if (!count) return;
    if (window.confirm(`Envoyer les résultats de ${count} patient(s) validé(s) ?`)) {
      setResultats(prev => prev.map(r => r.statut === 'valide' ? { ...r, statut: 'envoye' } : r));
    }
  }

  const modalResult = previewModal ? resultats.find(r => r.id === previewModal.resultId) : null;
  const validatedCount = resultats.filter(r => r.statut === 'valide').length;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <>
      <div className="space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon="⏳" label="En attente validation" value={stats.en_attente}
            colorBg="bg-orange-50 border border-orange-100"  colorText="text-orange-600" />
          <StatCard icon="✅" label="Validés aujourd'hui"   value={stats.valide}
            colorBg="bg-green-50  border border-green-100"   colorText="text-green-600"  />
          <StatCard icon="⚠️" label="Anomalies détectées"   value={stats.anomalies}
            colorBg="bg-red-50    border border-red-100"     colorText="text-red-600"    />
          <StatCard icon="✉️" label="Envoyés patients"      value={stats.envoye}
            colorBg="bg-[#E3F2FD] border border-[#BBDEFB]"  colorText="text-[#1565C0]"  />
        </div>

        {/* ── Recherche + filtres ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom patient..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`text-sm font-semibold px-4 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#1565C0] text-white border-[#1565C0]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1565C0] hover:text-[#1565C0]'
                  }`}
                >
                  {f.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cartes résultats ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-12 text-center text-gray-400">
            Aucun résultat trouvé
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(result => (
              <ResultCard
                key={result.id}
                result={result}
                editingCell={editingCell}
                onEditStart={setEditingCell}
                onEditSave={handleEditSave}
                onValidate={handleValidate}
                onSend={handleSend}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

        {/* ── Bouton global ── */}
        {validatedCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={sendAllValidated}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors shadow-md"
            >
              📤 Envoyer tous les résultats validés ({validatedCount})
            </button>
          </div>
        )}

        {/* ── Info liens sécurisés ── */}
        <div className="bg-[#E3F2FD] rounded-2xl border border-[#BBDEFB] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🔗</span>
            <div>
              <p className="font-bold text-[#1565C0] text-sm">Liens sécurisés générés automatiquement</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                {[
                  ['🔐', 'Token unique par patient'],
                  ['🛡️', 'SSL crypté'],
                  ['⏱️', 'Expire dans 30 jours'],
                  ['📱', 'Accessible sans application'],
                ].map(([icon, label]) => (
                  <span key={label} className="text-xs text-[#1565C0] flex items-center gap-1.5">
                    <span>{icon}</span>{label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Modal aperçu message ── */}
      {previewModal && modalResult && (
        <MessagePreviewModal
          result={modalResult}
          channel={previewModal.channel}
          onConfirm={confirmSend}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </>
  );
}
