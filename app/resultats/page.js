'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const REFERENCES = {
  'NFS':               { unite: 'G/L',    ref: '4–10'    },
  'Hémoglobine':       { unite: 'g/dL',   ref: '12–17'   },
  'VS':                { unite: 'mm/h',   ref: '<20'     },
  'Glycémie à jeun':   { unite: 'mmol/L', ref: '3.9–5.5' },
  'HbA1c':             { unite: '%',      ref: '<5.7'    },
  'Cholestérol total': { unite: 'mmol/L', ref: '<5.2'    },
  'HDL':               { unite: 'mmol/L', ref: '>1.0'    },
  'LDL':               { unite: 'mmol/L', ref: '<3.4'    },
  'Triglycérides':     { unite: 'mmol/L', ref: '<1.7'    },
  'Créatinine':        { unite: 'µmol/L', ref: '62–106'  },
  'Urée':              { unite: 'mmol/L', ref: '2.5–7.5' },
  'ASAT':              { unite: 'UI/L',   ref: '<40'     },
  'ALAT':              { unite: 'UI/L',   ref: '<45'     },
  'CRP':               { unite: 'mg/L',   ref: '<5'      },
  'TSH':               { unite: 'mUI/L',  ref: '0.4–4.0' },
  'T3 libre':          { unite: 'pmol/L', ref: '3.5–6.5' },
  'T4 libre':          { unite: 'pmol/L', ref: '10–20'   },
  'Fer sérique':       { unite: 'µmol/L', ref: '10–30'   },
  'Ferritine':         { unite: 'ng/mL',  ref: '20–300'  },
  'PSA total':         { unite: 'ng/mL',  ref: '<4'      },
};

export default function ResultatsPage() {
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filtre, setFiltre]       = useState('tous');
  const [modalRdv, setModalRdv]   = useState(null);
  const [valeurs, setValeurs]     = useState([]);

  useEffect(() => {
    chargerResultats();
    const interval = setInterval(chargerResultats, 30000);
    return () => clearInterval(interval);
  }, []);

  const chargerResultats = async () => {
    try {
      setLoading(true);

      // Charge les RDV avec prélèvement terminé ou résultat saisi
      const { data: rdvData, error: rdvErr } = await supabase
        .from('rdv')
        .select('*, patients(id, nom, telephone, whatsapp, pref_notif), rdv_analyses(analyses(nom))')
        .in('statut_prelevement', ['termine', 'resultat_saisi'])
        .order('created_at', { ascending: false });

      if (rdvErr) throw rdvErr;

      // Normalise les analyses en array de noms
      const normalized = (rdvData || []).map(r => ({
        ...r,
        analyses: (r.rdv_analyses || []).map(ra => ra.analyses?.nom).filter(Boolean),
      }));

      setResultats(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirSaisie = (rdv) => {
    setModalRdv(rdv);
    setValeurs(
      (rdv.analyses || []).map(nom => ({
        nom,
        valeur: '',
        unite: REFERENCES[nom]?.unite || '',
        ref: REFERENCES[nom]?.ref || '',
        statut: 'normal',
      }))
    );
  };

  const validerResultats = async () => {
    try {
      const anomalies = valeurs.filter(v => v.statut !== 'normal').length;
      const token = `AZ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { error: insErr } = await supabase.from('resultats').insert({
        rdv_id: modalRdv.id,
        patient_id: modalRdv.patients?.id || modalRdv.patient_id,
        valeurs,
        statut: 'valide',
        anomalies,
        lien_token: token,
        valide_par: 'Dr. Meziane',
      });
      if (insErr) throw insErr;

      await supabase.from('rdv').update({ statut_prelevement: 'resultat_saisi' }).eq('id', modalRdv.id);

      setModalRdv(null);
      chargerResultats();
      alert('Resultats saisis !');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const filteredResultats = resultats.filter(r => {
    if (filtre === 'a_saisir') return r.statut_prelevement === 'termine';
    if (filtre === 'saisis') return r.statut_prelevement === 'resultat_saisi';
    return true;
  });

  const aSaisir = resultats.filter(r => r.statut_prelevement === 'termine').length;
  const saisis  = resultats.filter(r => r.statut_prelevement === 'resultat_saisi').length;

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
          <h1 className="text-xl font-black text-gray-900">Résultats</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {resultats.length} analyses terminées&nbsp;•&nbsp;
            <span className="text-orange-600 font-semibold">{aSaisir} à saisir</span>
            &nbsp;•&nbsp;
            <span className="text-green-600 font-semibold">{saisis} saisis</span>
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'tous',     label: 'Tous',        count: resultats.length },
            { key: 'a_saisir', label: '⏳ À saisir', count: aSaisir },
            { key: 'saisis',   label: '✓ Saisis',    count: saisis },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              className={`text-sm font-semibold px-4 py-1.5 rounded-xl border transition-colors ${
                filtre === f.key
                  ? 'bg-[#1565C0] text-white border-[#1565C0]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1565C0]'
              }`}>
              {f.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filtre === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filteredResultats.map(rdv => (
          <div key={rdv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center">
                  <span className="text-[#1565C0] text-xs font-black">
                    {(rdv.patients?.nom || '??').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{rdv.patients?.nom || 'Patient'}</p>
                  <p className="text-xs text-gray-500">{rdv.patients?.telephone || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{rdv.date || '—'} • {rdv.heure || '—'}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                rdv.statut_prelevement === 'resultat_saisi'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {rdv.statut_prelevement === 'resultat_saisi' ? '✓ Saisi' : '⏳ À saisir'}
              </span>
            </div>

            {/* Tags analyses */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(rdv.analyses || []).map((a, i) => (
                <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-[#1565C0]">{a}</span>
              ))}
              {(rdv.analyses || []).length === 0 && (
                <span className="text-xs text-gray-400">Aucune analyse liée</span>
              )}
            </div>

            {/* Actions */}
            {rdv.statut_prelevement === 'termine' && (
              <button onClick={() => ouvrirSaisie(rdv)}
                className="w-full bg-[#1565C0] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#0D47A1] transition-colors">
                📝 Saisir les résultats
              </button>
            )}
            {rdv.statut_prelevement === 'resultat_saisi' && (
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
                  📱 Envoyer WhatsApp
                </button>
                <button className="flex-1 border border-gray-200 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  💬 Envoyer SMS
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredResultats.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <div className="text-4xl mb-3">🧪</div>
          <p className="font-bold text-gray-400">Aucun résultat à traiter</p>
        </div>
      )}

      {/* Modal saisie résultats */}
      {modalRdv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalRdv(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-[#1565C0] px-6 py-4 shrink-0">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span>📝</span> Saisir les résultats
              </h2>
              <p className="text-blue-200 text-sm mt-0.5">
                {modalRdv.patients?.nom || 'Patient'} — {modalRdv.date || '—'}
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {valeurs.map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-gray-800">{v.nom}</p>
                    {v.ref && <span className="text-[10px] text-gray-400">Réf : {v.ref} {v.unite}</span>}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={v.valeur} placeholder="Valeur"
                      onChange={e => { const n = [...valeurs]; n[i].valeur = e.target.value; setValeurs(n); }}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#1565C0]" />
                    <input type="text" value={v.unite} placeholder="Unité"
                      onChange={e => { const n = [...valeurs]; n[i].unite = e.target.value; setValeurs(n); }}
                      className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 focus:outline-none focus:border-[#1565C0]" />
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { key: 'normal', label: '✓ Normal', cls: 'bg-green-100 text-green-700 border-green-300' },
                      { key: 'high',   label: '⬆ Élevé', cls: 'bg-red-100 text-red-600 border-red-300' },
                      { key: 'low',    label: '⬇ Bas',   cls: 'bg-blue-100 text-blue-600 border-blue-300' },
                    ].map(s => (
                      <button key={s.key} onClick={() => { const n = [...valeurs]; n[i].statut = s.key; setValeurs(n); }}
                        className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-all ${
                          v.statut === s.key ? s.cls + ' border-current shadow-sm' : 'bg-white text-gray-400 border-gray-200'
                        }`}>
                        {v.statut === s.key && '● '}{s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {valeurs.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Aucune analyse liée à ce RDV</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-3 flex gap-3 shrink-0 border-t border-gray-100">
              <button onClick={() => setModalRdv(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                Annuler
              </button>
              <button onClick={validerResultats}
                disabled={valeurs.some(v => !v.valeur.trim())}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-40">
                ✓ Valider ({valeurs.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
