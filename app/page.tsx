'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({ rdv: 0, patients: 0, resultatsAttente: 0, ca: 0 });
  const [rdvJour, setRdvJour] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { chargerStats(); chargerRdvJour(); }, []);

  const chargerStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [rdvRes, patRes, attRes, caRes] = await Promise.all([
        supabase.from('rdv').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('rdv').select('*', { count: 'exact', head: true }).eq('statut_prelevement', 'termine'),
        supabase.from('paiements').select('total').gte('created_at', today),
      ]);

      const ca = (caRes.data || []).reduce((s: number, r: any) => s + (r.total || 0), 0);
      setStats({
        rdv: rdvRes.count || 0,
        patients: patRes.count || 0,
        resultatsAttente: attRes.count || 0,
        ca,
      });
    } catch (e) { console.error('Stats error:', e); }
  };

  const chargerRdvJour = async () => {
    try {
      const { data } = await supabase
        .from('rdv')
        .select('*, patients(nom)')
        .neq('statut', 'termine')
        .order('created_at', { ascending: false })
        .limit(6);

      setRdvJour(data || []);
    } catch (e) { console.error('RDV error:', e); }
    setLoading(false);
  };

  const STAT_CARDS = [
    { icon: '📅', label: "RDV aujourd'hui",  value: String(stats.rdv),              color: 'bg-[#1565C0]', light: false },
    { icon: '👥', label: 'Patients total',    value: String(stats.patients),         color: 'bg-white',     light: true  },
    { icon: '🧪', label: 'Résultats en att.', value: String(stats.resultatsAttente), color: 'bg-white',     light: true  },
    { icon: '💰', label: "CA aujourd'hui",    value: `${stats.ca.toLocaleString('fr-DZ')} DA`, color: 'bg-white', light: true },
  ];

  const STATUT_CFG: Record<string, { label: string; cls: string }> = {
    confirme:   { label: '✓ Confirmé',  cls: 'bg-green-100 text-green-700' },
    en_attente: { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-700' },
    annule:     { label: '✗ Annulé',    cls: 'bg-red-100 text-red-600' },
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className={`${card.color} rounded-2xl p-5 shadow-sm flex items-start gap-4 ${card.light ? 'border border-gray-100' : ''}`}>
            <span className="text-3xl">{card.icon}</span>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${card.light ? 'text-gray-500' : 'text-white/70'}`}>{card.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${card.light ? 'text-[#111]' : 'text-white'}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* RDV récents + Alertes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* RDV récents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#111]">RDV récents</h2>
            <span className="text-xs font-semibold bg-[#E3F2FD] text-[#1565C0] px-2 py-0.5 rounded-full">{rdvJour.length} RDV</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {rdvJour.length === 0 ? (
              <li className="px-5 py-8 text-center text-gray-400 text-sm">Aucun RDV</li>
            ) : rdvJour.map((rdv: any) => {
              const cfg = STATUT_CFG[rdv.statut] || { label: rdv.statut, cls: 'bg-gray-100 text-gray-500' };
              return (
                <li key={rdv.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-bold text-[#1565C0] w-14 shrink-0">{rdv.heure || '—'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111] truncate">{rdv.patients?.nom || 'Patient'}</p>
                    <p className="text-xs text-gray-500 truncate">{rdv.lieu === 'domicile' ? '🏠 Domicile' : '🏥 Labo'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#111]">Alertes</h2>
          </div>
          <ul className="p-4 space-y-3">
            {stats.resultatsAttente > 0 && (
              <li className="flex items-start gap-3 rounded-xl px-4 py-3 border-l-4 border-red-400 bg-red-50">
                <span className="text-lg mt-0.5">⚠️</span>
                <p className="text-sm font-medium text-[#111]">{stats.resultatsAttente} résultat(s) à saisir</p>
              </li>
            )}
            <li className="flex items-start gap-3 rounded-xl px-4 py-3 border-l-4 border-blue-300 bg-blue-50">
              <span className="text-lg mt-0.5">ℹ️</span>
              <p className="text-sm font-medium text-[#111]">Système AZ Laboratoires opérationnel</p>
            </li>
          </ul>

          {/* Mini chart */}
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Résumé</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-[#1565C0]">{stats.rdv}</p>
                <p className="text-[10px] text-gray-500">RDV aujourd&apos;hui</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-green-600">{stats.patients}</p>
                <p className="text-[10px] text-gray-500">Patients</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
