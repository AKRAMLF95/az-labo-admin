// Dashboard — server component

const STAT_CARDS = [
  { icon: '📅', label: 'RDV aujourd\'hui',  value: '24',        sub: '+3 vs hier',     color: 'bg-[#1565C0]', light: false },
  { icon: '👥', label: 'Patients total',    value: '312',       sub: '+12 ce mois',    color: 'bg-white',     light: true  },
  { icon: '🧪', label: 'Résultats en att.', value: '7',         sub: 'À traiter',      color: 'bg-white',     light: true  },
  { icon: '💰', label: 'CA ce mois',        value: '42 600 DA', sub: '+8% vs mois der',color: 'bg-white',     light: true  },
];

const RDV_JOUR = [
  { heure: '08h00', patient: 'Amira Benali',    analyse: 'Glycémie + NFS',   statut: 'Confirmé',  statutColor: 'bg-green-100 text-green-700'  },
  { heure: '09h30', patient: 'Karim Ouazzan',   analyse: 'Bilan hépatique',  statut: 'En attente',statusColor: 'bg-yellow-100 text-yellow-700' },
  { heure: '10h15', patient: 'Farah Hadj Ali',  analyse: 'TSH + T4',         statut: 'Confirmé',  statutColor: 'bg-green-100 text-green-700'  },
  { heure: '11h00', patient: 'Youcef Medjeber', analyse: 'Ionogramme',       statut: 'Annulé',    statutColor: 'bg-red-100 text-red-600'      },
];

const ALERTES = [
  { icon: '⚠️', message: '3 résultats non envoyés depuis +24h',  urgence: 'high'   },
  { icon: '🔔', message: '2 RDV sans confirmation patient',       urgence: 'medium' },
  { icon: 'ℹ️', message: 'Mise à jour tarifaire disponible',      urgence: 'low'    },
];

const GRAPHIQUE = [
  { jour: 'Lun', rdv: 18 },
  { jour: 'Mar', rdv: 24 },
  { jour: 'Mer', rdv: 20 },
  { jour: 'Jeu', rdv: 28 },
  { jour: 'Ven', rdv: 32 },
  { jour: 'Sam', rdv: 14 },
];

const MAX_RDV = Math.max(...GRAPHIQUE.map(g => g.rdv));
const BAR_MAX_PX = 96;

const URGENCE_STYLES: Record<string, string> = {
  high:   'border-l-4 border-red-400 bg-red-50',
  medium: 'border-l-4 border-yellow-400 bg-yellow-50',
  low:    'border-l-4 border-blue-300 bg-blue-50',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className={`${card.color} rounded-2xl p-5 shadow-sm flex items-start gap-4 ${card.light ? 'border border-gray-100' : ''}`}
          >
            <span className="text-3xl">{card.icon}</span>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${card.light ? 'text-gray-500' : 'text-white/70'}`}>
                {card.label}
              </p>
              <p className={`text-2xl font-black mt-0.5 ${card.light ? 'text-[#111]' : 'text-white'}`}>
                {card.value}
              </p>
              <p className={`text-xs mt-1 ${card.light ? 'text-gray-400' : 'text-white/60'}`}>
                {card.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* RDV du jour */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#111]">RDV du jour</h2>
            <span className="text-xs font-semibold bg-[#E3F2FD] text-[#1565C0] px-2 py-0.5 rounded-full">
              {RDV_JOUR.length} RDV
            </span>
          </div>
          <ul className="divide-y divide-gray-50">
            {RDV_JOUR.map((rdv, i) => (
              <li key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-bold text-[#1565C0] w-12 shrink-0">{rdv.heure}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111] truncate">{rdv.patient}</p>
                  <p className="text-xs text-gray-500 truncate">{rdv.analyse}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${rdv.statutColor}`}>
                  {rdv.statut}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#111]">Alertes</h2>
          </div>
          <ul className="p-4 space-y-3">
            {ALERTES.map((a, i) => (
              <li key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${URGENCE_STYLES[a.urgence]}`}>
                <span className="text-lg mt-0.5">{a.icon}</span>
                <p className="text-sm font-medium text-[#111]">{a.message}</p>
              </li>
            ))}
          </ul>

          {/* Bar chart */}
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">RDV / semaine</p>
            <div className="flex items-end gap-2 h-28">
              {GRAPHIQUE.map((g) => {
                const h = Math.round((g.rdv / MAX_RDV) * BAR_MAX_PX);
                return (
                  <div key={g.jour} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-[#1565C0]">{g.rdv}</span>
                    <div className="w-full flex items-end" style={{ height: `${BAR_MAX_PX}px` }}>
                      <div
                        className="w-full rounded-t-md bg-[#1565C0]"
                        style={{ height: `${h}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{g.jour}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
