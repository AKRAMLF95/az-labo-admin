'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    nom: '', telephone: '', whatsapp: '', email: '', pref_notif: 'whatsapp',
  });

  useEffect(() => { chargerPatients(); }, []);

  const chargerPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ajouterPatient = async () => {
    try {
      const { error } = await supabase.from('patients').insert(newPatient);
      if (error) throw error;
      setShowModal(false);
      setNewPatient({ nom: '', telephone: '', whatsapp: '', email: '', pref_notif: 'whatsapp' });
      chargerPatients();
      alert('Patient ajouté !');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const supprimerPatient = async (id) => {
    if (!confirm('Supprimer ce patient ?')) return;
    await supabase.from('patients').delete().eq('id', id);
    chargerPatients();
  };

  const patientsFiltres = patients.filter(p =>
    (p.nom || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.telephone || '').includes(search)
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 m-6 bg-red-50 text-red-600 rounded-lg">Erreur : {error}</div>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500">{patients.length} patients enregistrés</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-[#1565C0] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0D47A1] transition-colors">
          + Nouveau patient
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input type="text" placeholder="Rechercher nom ou téléphone..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition" />
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Patient', 'Téléphone', 'WhatsApp', 'Email', 'RDV', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patientsFiltres.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">Aucun patient trouvé</td></tr>
              ) : patientsFiltres.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] flex items-center justify-center shrink-0">
                        <span className="text-[#1565C0] text-xs font-black">{(p.nom || '??').slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{p.nom || '—'}</p>
                        <p className="text-[10px] text-gray-400">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-DZ') : '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap font-mono text-xs">{p.telephone || '—'}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap text-xs">{p.whatsapp || '—'}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs truncate max-w-[160px]">{p.email || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#1565C0]">{p.total_rdv || 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      (p.total_rdv || 0) >= 10
                        ? 'bg-yellow-100 text-yellow-700'
                        : (p.total_rdv || 0) >= 3
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {(p.total_rdv || 0) >= 10 ? '⭐ VIP' : (p.total_rdv || 0) >= 3 ? 'Régulier' : 'Nouveau'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedPatient(p)} title="Voir dossier"
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors text-sm">
                        👁️
                      </button>
                      <button onClick={() => supprimerPatient(p.id)} title="Supprimer"
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors text-sm">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {patientsFiltres.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">
            {patientsFiltres.length} sur {patients.length} patients
          </div>
        )}
      </div>

      {/* Modal nouveau patient */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-base">Nouveau patient</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 flex items-center justify-center text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nom complet *</label>
                <input value={newPatient.nom} onChange={e => setNewPatient({ ...newPatient, nom: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" placeholder="Ex: Karim Amrani" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Téléphone *</label>
                <input value={newPatient.telephone} onChange={e => setNewPatient({ ...newPatient, telephone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" placeholder="Ex: 0555 123 456" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">WhatsApp</label>
                <input value={newPatient.whatsapp} onChange={e => setNewPatient({ ...newPatient, whatsapp: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" placeholder="Même numéro ou autre" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                <input value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1565C0]" placeholder="Ex: karim@email.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notification préférée</label>
                <select value={newPatient.pref_notif} onChange={e => setNewPatient({ ...newPatient, pref_notif: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1565C0]">
                  <option value="whatsapp">📱 WhatsApp</option>
                  <option value="sms">💬 SMS</option>
                  <option value="telephone">📞 Téléphone</option>
                </select>
              </div>
            </div>
            <div className="px-6 pb-5 pt-2 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">Annuler</button>
              <button onClick={ajouterPatient} disabled={!newPatient.nom || !newPatient.telephone}
                className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors disabled:opacity-40">
                Créer le patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail patient */}
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
            <div className="p-6 space-y-3">
              {[
                { label: 'WhatsApp', value: selectedPatient.whatsapp },
                { label: 'Email', value: selectedPatient.email },
                { label: 'Notification', value: selectedPatient.pref_notif },
                { label: 'Total RDV', value: selectedPatient.total_rdv || 0 },
                { label: 'Inscrit le', value: selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString('fr-DZ') : '—' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className="font-bold text-sm text-gray-800">{row.value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setSelectedPatient(null)}
                className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
