'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/* ─── Mock Data ──────────────────────────────────────────────────── */
const COLLECTES_DATA_INIT = [
  {
    technicien: { id: 1, nom: 'Amine Merzougui', telephone: '+213 555 111 222', avatar: 'AM', couleur: '#43A047' },
    collectes: [
      {
        id: 'COL-2604-001', patient: 'Fatima Djilali',  telephone: '+213 550 901 234',
        adresse: 'Cité Mohamadia, Birkhadem',
        dateRdv: 'Auj. 09:00', dateCollecte: 'Auj. 09:45',
        analyses: ['Hormones', 'TSH'],
        montantAnalyses: 900, remise: 270, fraisDeplacement: 500, totalCollecte: 1130,
        statut: 'collecte', retardHeures: 0,
        dateRemise: null, confirmeePar: null,
      },
      {
        id: 'COL-2604-002', patient: 'Amina Kaci',      telephone: '+213 661 777 888',
        adresse: 'Kouba, Alger',
        dateRdv: 'Auj. 11:00', dateCollecte: 'Auj. 11:50',
        analyses: ['TSH', 'T4 libre'],
        montantAnalyses: 850, remise: 0, fraisDeplacement: 700, totalCollecte: 1550,
        statut: 'collecte', retardHeures: 0,
        dateRemise: null, confirmeePar: null,
      },
    ],
    soldeTotal: 2680, dernierRemise: 'Hier 17:00',
  },
  {
    technicien: { id: 2, nom: 'Ryad Boukhalfa', telephone: '+213 661 333 444', avatar: 'RB', couleur: '#FF7043' },
    collectes: [
      {
        id: 'COL-2604-003', patient: 'Youcef Hamdi',    telephone: '+213 661 456 789',
        adresse: 'Hydra, Alger',
        dateRdv: 'Auj. 10:00', dateCollecte: 'Auj. 10:45',
        analyses: ['NFS', 'Cholestérol'],
        montantAnalyses: 600, remise: 0, fraisDeplacement: 800, totalCollecte: 1400,
        statut: 'collecte', retardHeures: 0,
        dateRemise: null, confirmeePar: null,
      },
      {
        id: 'COL-2603-001', patient: 'Khaled Messaoud', telephone: '+213 770 111 222',
        adresse: 'El Biar, Alger',
        dateRdv: 'Hier 14:00', dateCollecte: 'Hier 14:45',
        analyses: ['Bilan complet'],
        montantAnalyses: 1200, remise: 120, fraisDeplacement: 600, totalCollecte: 1680,
        statut: 'collecte', retardHeures: 26,
        dateRemise: null, confirmeePar: null,
      },
    ],
    soldeTotal: 3080, dernierRemise: 'Avant-hier 18:00',
  },
  {
    technicien: { id: 3, nom: 'Lynda Kaci', telephone: '+213 770 555 666', avatar: 'LK', couleur: '#9C27B0' },
    collectes: [
      {
        id: 'COL-2603-002', patient: 'Mohamed Hamidi',  telephone: '+213 661 999 000',
        adresse: 'Bir Mourad Raïs, Alger',
        dateRdv: 'Hier 14:30', dateCollecte: 'Hier 15:10',
        analyses: ['Bilan lipidique'],
        montantAnalyses: 750, remise: 0, fraisDeplacement: 600, totalCollecte: 1350,
        statut: 'remis', retardHeures: 0,
        dateRemise: 'Hier 17:00', confirmeePar: 'Dr. Meziane',
      },
    ],
    soldeTotal: 0, dernierRemise: 'Hier 17:00',
  },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtDA(n) { return n.toLocaleString('fr-DZ') + ' DA'; }

function StatutBadge({ statut, retardHeures }) {
  if (statut === 'remis') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">✓ Remis</span>
  );
  if (retardHeures > 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
      ⚠ En retard +{retardHeures}h
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
      💰 Collecté
    </span>
  );
}

/* ─── Confirm Remise Modal ───────────────────────────────────────── */
function ConfirmRemiseModal({ tech, collectes, onClose, onConfirm }) {
  const [selected, setSelected] = useState(new Set(collectes.filter(c => c.statut === 'collecte').map(c => c.id)));
  const [montantRecu, setMontantRecu] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [ecart, setEcart] = useState(null);

  const totalAttendu = collectes.filter(c => selected.has(c.id)).reduce((s, c) => s + c.totalCollecte, 0);

  function toggle(id) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setMontantRecu('');
    setEcart(null);
  }

  function handleConfirm() {
    const recu = parseInt(montantRecu) || totalAttendu;
    const diff = recu - totalAttendu;
    if (diff !== 0) { setEcart(diff); return; }
    onConfirm(tech.id, [...selected]);
    setConfirmed(true);
  }

  function forceConfirm() {
    onConfirm(tech.id, [...selected]);
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Remise confirmée !</h3>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-800">{tech.nom}</span>
          </p>
          <p className="text-2xl font-black text-[#1565C0] mb-5">{fmtDA(totalAttendu)}</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shrink-0"
            style={{ background: tech.couleur }}>
            {tech.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Confirmer la remise</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tech.nom} · {tech.telephone}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Sélection collectes */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Collectes à solder ({selected.size})
            </p>
            <div className="space-y-2">
              {collectes.filter(c => c.statut === 'collecte').map(c => (
                <label key={c.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    selected.has(c.id) ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}>
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)}
                    className="w-4 h-4 accent-[#1565C0] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 truncate">{c.patient}</p>
                      <span className="font-black text-[#1565C0] text-sm shrink-0">{fmtDA(c.totalCollecte)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{c.id} · {c.dateCollecte}</p>
                    {c.retardHeures > 0 && (
                      <span className="text-[10px] font-bold text-red-500">⚠ En retard de {c.retardHeures}h</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Total attendu */}
          <div className="bg-[#E3F2FD] rounded-xl px-5 py-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Montant total attendu</p>
              <p className="text-2xl font-black text-[#1565C0]">{fmtDA(totalAttendu)}</p>
            </div>
          </div>

          {/* Montant physiquement reçu */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Montant physiquement reçu (DA)
            </label>
            <input
              type="number"
              value={montantRecu}
              onChange={e => { setMontantRecu(e.target.value); setEcart(null); }}
              placeholder={`${totalAttendu} DA (laisser vide = montant exact)`}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-colors"
            />
          </div>

          {/* Alerte écart */}
          {ecart !== null && (
            <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${ecart > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <span className="text-xl shrink-0">{ecart > 0 ? '➕' : '➖'}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${ecart > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {ecart > 0 ? `Excédent de ${fmtDA(Math.abs(ecart))}` : `Manque de ${fmtDA(Math.abs(ecart))}`}
                </p>
                <p className={`text-xs mt-0.5 ${ecart > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ecart > 0 ? 'Le technicien a remis plus que prévu. Vérifier.' : 'Le montant reçu est inférieur au montant collecté.'}
                </p>
              </div>
              <button onClick={forceConfirm}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gray-600 hover:bg-gray-700 transition-colors whitespace-nowrap shrink-0">
                Confirmer quand même
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
          <button onClick={handleConfirm} disabled={selected.size === 0}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
              selected.size > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
            }`}>
            ✓ Confirmer la remise — {fmtDA(totalAttendu)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Collecte Modal ──────────────────────────────────────── */
function DetailCollecteModal({ collecte, tech, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: tech.couleur }}>
            {tech.avatar}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">{collecte.id}</h3>
            <p className="text-xs text-gray-400">{tech.nom}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            ['Patient',       collecte.patient],
            ['Téléphone',     collecte.telephone],
            ['Adresse',       collecte.adresse],
            ['Date RDV',      collecte.dateRdv],
            ['Date collecte', collecte.dateCollecte],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase w-24 shrink-0 pt-0.5">{label}</span>
              <span className="text-sm text-gray-800">{value}</span>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase w-24 shrink-0 pt-0.5">Analyses</span>
            <div className="flex flex-wrap gap-1">
              {collecte.analyses.map(a => (
                <span key={a} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">{a}</span>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Analyses</span>
              <span className="font-semibold">{fmtDA(collecte.montantAnalyses)}</span>
            </div>
            {collecte.remise > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Remise</span>
                <span className="font-semibold">-{fmtDA(collecte.remise)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-teal-600">
              <span>Frais déplacement</span>
              <span className="font-semibold">+{fmtDA(collecte.fraisDeplacement)}</span>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-gray-100 pt-1.5">
              <span className="text-gray-800">Total collecté</span>
              <span className="text-[#1565C0] text-base">{fmtDA(collecte.totalCollecte)}</span>
            </div>
          </div>
          {collecte.statut === 'remis' && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700">
              <p className="font-bold">✓ Remis le {collecte.dateRemise}</p>
              <p className="text-green-600 mt-0.5">Confirmé par {collecte.confirmeePar}</p>
            </div>
          )}
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Rappels Modal ──────────────────────────────────────────────── */
function RappelsModal({ techList, onClose }) {
  const [sent, setSent] = useState(new Set());

  function sendReminder(techId) {
    setSent(prev => new Set([...prev, techId]));
  }

  function sendAll() {
    setSent(new Set(techList.map(t => t.technicien.id)));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Rappels WhatsApp</h3>
            <p className="text-xs text-gray-400 mt-0.5">Demander la remise du cash</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {techList.filter(t => t.soldeTotal > 0).map(t => (
            <div key={t.technicien.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                style={{ background: t.technicien.couleur }}>
                {t.technicien.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{t.technicien.nom}</p>
                <p className="text-xs font-bold text-orange-600">{fmtDA(t.soldeTotal)} à remettre</p>
              </div>
              {sent.has(t.technicien.id) ? (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[9px] font-black">✓</span>
                  Envoyé
                </span>
              ) : (
                <button onClick={() => sendReminder(t.technicien.id)}
                  className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold transition-colors whitespace-nowrap">
                  📱 Envoyer
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">Fermer</button>
          <button onClick={sendAll} className="flex-1 py-2 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">
            Envoyer à tous
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Historique Remises ─────────────────────────────────────────── */
function HistoriqueSection({ data }) {
  const allRemises = data.flatMap(t =>
    t.collectes
      .filter(c => c.statut === 'remis')
      .map(c => ({ ...c, tech: t.technicien }))
  ).sort((a, b) => (b.dateRemise || '').localeCompare(a.dateRemise || ''));

  if (allRemises.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Historique des remises</h3>
        <p className="text-xs text-gray-400 mt-0.5">Collectes déjà soldées</p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['ID','Technicien','Patient','Montant','Date remise','Confirmé par'].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {allRemises.map(c => (
            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-3 font-mono text-xs text-gray-500">{c.id}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black shrink-0"
                    style={{ background: c.tech.couleur }}>
                    {c.tech.avatar}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{c.tech.nom}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-xs text-gray-700">{c.patient}</td>
              <td className="px-5 py-3 font-black text-green-600 text-sm">{fmtDA(c.totalCollecte)}</td>
              <td className="px-5 py-3 text-xs text-gray-500">{c.dateRemise}</td>
              <td className="px-5 py-3 text-xs text-gray-500">{c.confirmeePar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function CollectePage() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [remiseModal, setRemiseModal] = useState(null);
  const [detailCollecte, setDetailCollecte] = useState(null);
  const [showRappels, setShowRappels] = useState(false);
  const [activeTab, setActiveTab] = useState('en_cours');

  // ── Supabase ──
  useEffect(() => { chargerCollectes(); }, []);

  const chargerCollectes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('collectes')
      .select(`*, techniciens(nom, telephone, avatar, couleur)`)
      .order('date_collecte', { ascending: false });
    if (!error && data) {
      // Regrouper par technicien (comme COLLECTES_DATA_INIT)
      const grouped = data.reduce((acc, c) => {
        const techId = c.technicien_id;
        if (!acc[techId]) {
          acc[techId] = { technicien: { id: techId, ...c.techniciens }, collectes: [], soldeTotal: 0, dernierRemise: null };
        }
        acc[techId].collectes.push(c);
        if (c.statut === 'collecte') acc[techId].soldeTotal += c.total_collecte;
        return acc;
      }, {});
      setData(Object.values(grouped));
    }
    setLoading(false);
  };

  const confirmerRemiseSupabase = async (technicienId, collecteIds) => {
    await supabase.from('collectes')
      .update({ statut: 'remis', date_remise: new Date().toISOString(), confirmee_par: 'Dr. Meziane' })
      .in('id', collecteIds);
    chargerCollectes();
  };

  /* KPIs */
  const allCollectes = data.flatMap(t => t.collectes);
  const nonRemis     = allCollectes.filter(c => c.statut === 'collecte');
  const totalNonRemis = data.reduce((s, t) => s + t.soldeTotal, 0);
  const collectesAujourdhui = allCollectes.filter(c => c.dateCollecte?.startsWith('Auj.')).length;
  const remisAujourdhui = allCollectes.filter(c => c.statut === 'remis' && c.dateRemise?.startsWith('Auj.')).reduce((s, c) => s + c.totalCollecte, 0);
  const enRetard = allCollectes.filter(c => c.statut === 'collecte' && c.retardHeures > 0);

  /* Overdue technicians */
  const retardTechNames = [...new Set(
    data.filter(t => t.collectes.some(c => c.statut === 'collecte' && c.retardHeures > 0)).map(t => t.technicien.nom)
  )];

  async function handleConfirmRemise(techId, collecteIds) {
    await confirmerRemiseSupabase(techId, collecteIds);
    setRemiseModal(null);
  }

  const pendingTechs = data.filter(t => t.soldeTotal > 0);
  const soldedTechs  = data.filter(t => t.soldeTotal === 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <div className="p-6 space-y-6">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="text-[#1565C0] font-semibold cursor-pointer hover:underline">Finance</span>
        <span>›</span>
        <span className="text-gray-600 font-medium">Collecte terrain</span>
      </div>

      {/* ── Alert overdue ── */}
      {enRetard.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <span className="text-2xl shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-red-700 text-sm">
              {enRetard.length} collecte{enRetard.length > 1 ? 's' : ''} en retard de remise (&gt; 24h)
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {retardTechNames.join(', ')} — Cash non remis depuis plus de 24 heures
            </p>
          </div>
          <button onClick={() => setShowRappels(true)}
            className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0">
            📱 Envoyer rappel
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Cash non remis total',   value: fmtDA(totalNonRemis),      icon: '💰', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: "Collectes aujourd'hui",  value: collectesAujourdhui,        icon: '🚗', color: 'text-[#1565C0]',  bg: 'bg-blue-50',   border: 'border-blue-100'   },
          { label: "Remis aujourd'hui",      value: fmtDA(remisAujourdhui),     icon: '✅', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100'  },
          { label: 'En retard > 24h',        value: enRetard.length,            icon: '⚠️', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100'    },
        ].map(({ label, value, icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="text-2xl mb-3">{icon}</div>
            <p className={`text-2xl font-black ${color} leading-tight`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Header actions ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setActiveTab('en_cours')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'en_cours' ? 'bg-white text-[#1565C0] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            ⏳ En cours
            {pendingTechs.length > 0 && <span className="ml-1.5 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">{pendingTechs.length}</span>}
          </button>
          <button onClick={() => setActiveTab('historique')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'historique' ? 'bg-white text-[#1565C0] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            ✓ Historique
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRappels(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">
            📱 Rappels WhatsApp
          </button>
          <button onClick={() => { const t = pendingTechs[0]; if (t) setRemiseModal(t); }}
            disabled={pendingTechs.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              pendingTechs.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            ✓ Confirmer remise
          </button>
        </div>
      </div>

      {/* ══ EN COURS ══ */}
      {activeTab === 'en_cours' && (
        <div className="space-y-5">
          {pendingTechs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-bold text-gray-700">Tous les techniciens ont soldé leurs collectes</p>
              <p className="text-sm text-gray-400 mt-1">Aucun cash en attente de remise</p>
            </div>
          ) : pendingTechs.map(t => {
            const enCours = t.collectes.filter(c => c.statut === 'collecte');
            const hasRetard = enCours.some(c => c.retardHeures > 0);
            return (
              <div key={t.technicien.id} className={`bg-white rounded-2xl border overflow-hidden ${hasRetard ? 'border-red-200' : 'border-gray-100'}`}>
                {/* Card header */}
                <div className={`flex items-center justify-between px-5 py-4 ${hasRetard ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shrink-0 relative"
                      style={{ background: t.technicien.couleur }}>
                      {t.technicien.avatar}
                      {hasRetard && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-black">!</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.technicien.nom}</p>
                      <p className="text-xs text-gray-400">{t.technicien.telephone}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Dernière remise : {t.dernierRemise}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ${
                        hasRetard ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        💰 {fmtDA(t.soldeTotal)} à remettre
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{enCours.length} collecte{enCours.length > 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setRemiseModal(t)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors whitespace-nowrap">
                      ✓ Confirmer remise
                    </button>
                  </div>
                </div>

                {/* Collectes table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-gray-100 bg-gray-50/50">
                        {['ID Collecte','Patient · Adresse','Date RDV','Date collecte','Analyses','Montant','Statut','Actions'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {enCours.map(c => (
                        <tr key={c.id} className={`hover:bg-gray-50/60 transition-colors ${c.retardHeures > 0 ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-gray-500">{c.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800 text-xs">{c.patient}</p>
                            <p className="text-[10px] text-gray-400">{c.adresse}</p>
                            <p className="text-[10px] text-gray-400">{c.telephone}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.dateRdv}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.dateCollecte}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {c.analyses.map(a => (
                                <span key={a} className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">{a}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              {c.remise > 0 && <p className="text-[10px] text-gray-400 line-through">{fmtDA(c.montantAnalyses)}</p>}
                              <p className="text-sm font-black text-[#1565C0]">{fmtDA(c.totalCollecte)}</p>
                              {c.fraisDeplacement > 0 && (
                                <p className="text-[10px] text-teal-500">dont {fmtDA(c.fraisDeplacement)} dépl.</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatutBadge statut={c.statut} retardHeures={c.retardHeures} />
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setDetailCollecte({ collecte: c, tech: t.technicien })}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center text-sm transition-colors">
                              👁️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary footer */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                  <div className="flex gap-6 text-xs text-gray-500">
                    <span>Analyses : <strong className="text-gray-700">{fmtDA(enCours.reduce((s, c) => s + c.montantAnalyses, 0))}</strong></span>
                    <span>Remises : <strong className="text-red-500">-{fmtDA(enCours.reduce((s, c) => s + c.remise, 0))}</strong></span>
                    <span>Déplacements : <strong className="text-teal-600">+{fmtDA(enCours.reduce((s, c) => s + c.fraisDeplacement, 0))}</strong></span>
                  </div>
                  <span className="font-black text-[#1565C0]">Total : {fmtDA(t.soldeTotal)}</span>
                </div>
              </div>
            );
          })}

          {/* Soldé section */}
          {soldedTechs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Techniciens soldés</p>
              {soldedTechs.map(t => (
                <div key={t.technicien.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ background: t.technicien.couleur }}>
                    {t.technicien.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{t.technicien.nom}</p>
                    <p className="text-xs text-gray-400">Dernière remise : {t.dernierRemise}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-green-100 text-green-700">✓ Soldé</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ HISTORIQUE ══ */}
      {activeTab === 'historique' && <HistoriqueSection data={data} />}

      {/* ── Modals ── */}
      {remiseModal && (
        <ConfirmRemiseModal
          tech={remiseModal.technicien}
          collectes={remiseModal.collectes}
          onClose={() => setRemiseModal(null)}
          onConfirm={handleConfirmRemise}
        />
      )}
      {detailCollecte && (
        <DetailCollecteModal
          collecte={detailCollecte.collecte}
          tech={detailCollecte.tech}
          onClose={() => setDetailCollecte(null)}
        />
      )}
      {showRappels && (
        <RappelsModal
          techList={data}
          onClose={() => setShowRappels(false)}
        />
      )}
    </div>
  );
}
