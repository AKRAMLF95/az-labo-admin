'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const STATUTS = [
  { id: 'actif',   label: 'Actif',      bg: 'bg-green-100',  color: 'text-green-700'  },
  { id: 'vip',     label: 'VIP',        bg: 'bg-yellow-100', color: 'text-yellow-700' },
  { id: 'inactif', label: 'Inactif',    bg: 'bg-gray-100',   color: 'text-gray-500'   },
  { id: 'bloque',  label: 'Bloqué',     bg: 'bg-red-100',    color: 'text-red-700'    },
];

function getStatutCfg(statut) {
  return STATUTS.find(s => s.id === statut) || STATUTS[0];
}

export default function PatientsPage() {
  const [patients, setPatients]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [search, setSearch]                 = useState('');
  const [statutFilter, setStatutFilter]     = useState('tous');
  const [showModal, setShowModal]           = useState(false);
  const [editPatient, setEditPatient]       = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({ nom: '', telephone: '', whatsapp: '', email: '', pref_notif: 'whatsapp' });

  useEffect(() => { chargerPatients(); }, []);

  const chargerPatients = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (err) throw err;
      setPatients(data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const ajouterPatient = async () => {
    if (!form.nom || !form.telephone) { alert('Nom et téléphone obligatoires'); return; }
    const { error } = await supabase.from('patients').insert({ ...form, statut: 'actif', total_rdv: 0 });
    if (error) { alert('Erreur: ' + error.message); return; }
    setShowModal(false);
    setForm({ nom: '', telephone: '', whatsapp: '', email: '', pref_notif: 'whatsapp' });
    chargerPatients();
  };

  const modifierPatient = async () => {
    if (!editPatient) return;
    const { error } = await supabase.from('patients').update(form).eq('id', editPatient.id);
    if (error) { alert('Erreur: ' + error.message); return; }
    setEditPatient(null);
    chargerPatients();
  };

  const changerStatut = async (id, statut) => {
    await supabase.from('patients').update({ statut }).eq('id', id);
    chargerPatients();
  };

  const supprimerPatient = async (id) => {
    if (!confirm('Supprimer ce patient ?')) return;
    await supabase.from('patients').delete().eq('id', id);
    chargerPatients();
  };

  const openEdit = (p) => {
    setForm({ nom: p.nom || '', telephone: p.telephone || '', whatsapp: p.whatsapp || '', email: p.email || '', pref_notif: p.pref_notif || 'whatsapp' });
    setEditPatient(p);
  };

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || (p.nom || '').toLowerCase().includes(q) || (p.telephone || '').includes(q);
    const matchStatut = statutFilter === 'tous' || (p.statut || 'actif') === statutFilter;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: patients.length,
    actifs: patients.filter(p => (p.statut || 'actif') === 'actif').length,
    vip: patients.filter(p => p.statut === 'vip' || (p.total_rdv || 0) >= 10).length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-6 m-6 bg-red-50 text-red-600 rounded-lg">Erreur : {error}</div>;

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: '👥', color: 'text-[#1565C0]', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Actifs', value: stats.actifs, icon: '🟢', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'VIP', value: stats.vip, icon: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-5 py-4 flex items-center gap-4`}>
            <span className="text-2xl">{s.icon}</span>
            <div><p className={`text-2xl font-black ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher nom ou téléphone..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20" />
        </div>
        <div className="flex gap-1">
          {[{ key: 'tous', label: 'Tous' }, ...STATUTS.map(s => ({ key: s.id, label: s.label }))].map(f => (
            <button key={f.key} onClick={() => setStatutFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statutFilter === f.key ? 'bg-[#1565C0] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => { setForm({ nom: '', telephone: '', whatsapp: '', email: '', pref_notif: 'whatsapp' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] ml-auto">
          + Nouveau
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Patient', 'Téléphone', 'WhatsApp', 'RDV', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">Aucun patient</td></tr>
              ) : filtered.map(p => {
                const cfg = getStatutCfg(p.statut || 'actif');
                return (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] flex items-center justify-center">
                          <span className="text-[#1565C0] text-xs font-black">{(p.nom || '??').slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.nom || '—'}</p>
                          <p className="text-[10px] text-gray-400">{p.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-600">{p.telephone || '—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-600">{p.whatsapp || '—'}</td>
                    <td className="px-5 py-4"><span className="font-bold text-[#1565C0]">{p.total_rdv || 0}</span></td>
                    <td className="px-5 py-4">
                      <select value={p.statut || 'actif'} onChange={e => changerStatut(p.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${cfg.bg} ${cfg.color}`}>
                        {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedPatient(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center text-sm">👁️</button>
                        <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center text-sm">✏️</button>
                        <button onClick={() => supprimerPatient(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">{filtered.length} sur {patients.length}</div>}
      </div>

      {/* Modal Nouveau / Modifier */}
      {(showModal || editPatient) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowModal(false); setEditPatient(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold">{editPatient ? 'Modifier patient' : 'Nouveau patient'}</h2>
              <button onClick={() => { setShowModal(false); setEditPatient(null); }} className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 flex items-center justify-center text-lg">×</button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: 'nom', label: 'Nom *', placeholder: 'Karim Amrani' },
                { key: 'telephone', label: 'Téléphone *', placeholder: '0555 123 456' },
                { key: 'whatsapp', label: 'WhatsApp', placeholder: 'Même ou autre' },
                { key: 'email', label: 'Email', placeholder: 'karim@email.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notification</label>
                <select value={form.pref_notif} onChange={e => setForm({ ...form, pref_notif: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]">
                  <option value="whatsapp">📱 WhatsApp</option>
                  <option value="sms">💬 SMS</option>
                  <option value="telephone">📞 Téléphone</option>
                </select>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => { setShowModal(false); setEditPatient(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Annuler</button>
              <button onClick={editPatient ? modifierPatient : ajouterPatient} disabled={!form.nom || !form.telephone}
                className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm disabled:opacity-40">
                {editPatient ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détail */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPatient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1565C0] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white text-lg">
                  {(selectedPatient.nom || '??').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-black text-lg">{selectedPatient.nom || '—'}</p>
                  <p className="text-white/70 text-sm">{selectedPatient.telephone || '—'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-2">
              {[
                { l: 'WhatsApp', v: selectedPatient.whatsapp },
                { l: 'Email', v: selectedPatient.email },
                { l: 'Notification', v: selectedPatient.pref_notif },
                { l: 'Statut', v: getStatutCfg(selectedPatient.statut).label },
                { l: 'Total RDV', v: selectedPatient.total_rdv || 0 },
                { l: 'Inscrit le', v: selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString('fr-DZ') : '—' },
              ].map(r => (
                <div key={r.l} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{r.l}</span>
                  <span className="font-bold text-sm text-gray-800">{r.v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setSelectedPatient(null)} className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
