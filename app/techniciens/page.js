'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Données ──────────────────────────────────────────────────────────────────
const TECHNICIENS_INIT = [
  { id: 1, nom: 'Amine Merzougui', telephone: '+213 555 111 222', whatsapp: '+213 555 111 222',
    zone: 'Birkhadem, Mohamadia, Hydra', statut: 'actif',      rdvAssignes: 2, rdvTermines: 1,
    position: 'En route — Cité Mohamadia', disponible: true },
  { id: 2, nom: 'Ryad Boukhalfa',  telephone: '+213 661 333 444', whatsapp: '+213 661 333 444',
    zone: 'Birkhadem, Kouba',            statut: 'disponible',  rdvAssignes: 1, rdvTermines: 0,
    position: 'Birkhadem centre',        disponible: true },
  { id: 3, nom: 'Lynda Kaci',      telephone: '+213 770 555 666', whatsapp: '+213 770 555 666',
    zone: 'Birkhadem, Bir Mourad Raïs',  statut: 'libre',       rdvAssignes: 0, rdvTermines: 0,
    position: 'Au laboratoire',          disponible: true },
];

const RDV_DOMICILE_INIT = [
  { id: 1, patient: 'Fatima Djilali', heure: '09:00', adresse: 'Cité Mohamadia, Birkhadem',
    analyses: ['Hormones', 'TSH'],        distance: '2.1 km du labo', assignedTo: null },
  { id: 2, patient: 'Youcef Hamdi',   heure: '10:00', adresse: 'Hydra, Alger',
    analyses: ['NFS', 'Cholestérol'],    distance: '5.8 km du labo', assignedTo: null },
  { id: 3, patient: 'Amina Kaci',     heure: '11:00', adresse: 'Kouba, Alger',
    analyses: ['TSH', 'T4 libre'],       distance: '7.2 km du labo', assignedTo: null },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: 'bg-green-500',  hex: '#22C55E', light: 'bg-green-100',  text: 'text-green-700'  },
  { bg: 'bg-orange-500', hex: '#F97316', light: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-purple-500', hex: '#A855F7', light: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-blue-500',   hex: '#3B82F6', light: 'bg-blue-100',   text: 'text-blue-700'  },
  { bg: 'bg-pink-500',   hex: '#EC4899', light: 'bg-pink-100',   text: 'text-pink-700'  },
];
function getColor(id) { return PALETTE[(id - 1) % PALETTE.length]; }

const STATUT_CFG = {
  actif:      { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  label: '🟢 Actif'      },
  disponible: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400', label: '🟡 Disponible' },
  libre:      { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', label: '🟣 Libre'      },
  absent:     { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    label: '🔴 Absent'     },
};

// Positions map (top%, left%) par tech id + labo
const MAP_POSITIONS = {
  labo: { top: '44%', left: '30%' },
  1:    { top: '17%', left: '66%' },
  2:    { top: '56%', left: '50%' },
  3:    { top: '70%', left: '31%' },
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, colorBg, colorText }) {
  return (
    <div className={`${colorBg} rounded-2xl p-5 flex items-start gap-4`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${colorText} opacity-70`}>{label}</p>
        <p className={`text-2xl font-black ${colorText} mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Carte MAP CSS simulée ────────────────────────────────────────────────────
function SimulatedMap({ techniciens }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-[#111] text-sm">Positions en temps réel</h2>
        <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Map container */}
      <div className="relative w-full overflow-hidden" style={{ height: '280px', background: '#e8efe8' }}>

        {/* ── Grille routes principales (horizontal) ── */}
        <div className="absolute inset-x-0 bg-white/90 shadow-sm" style={{ top: '46%', height: '22px' }} />
        <div className="absolute inset-x-0 bg-white/70" style={{ top: '22%', height: '14px' }} />
        <div className="absolute inset-x-0 bg-white/70" style={{ top: '70%', height: '14px' }} />

        {/* ── Routes verticales ── */}
        <div className="absolute inset-y-0 bg-white/90 shadow-sm" style={{ left: '32%', width: '20px' }} />
        <div className="absolute inset-y-0 bg-white/70" style={{ left: '60%', width: '14px' }} />
        <div className="absolute inset-y-0 bg-white/60" style={{ left: '80%', width: '10px' }} />

        {/* ── Route diagonale simulée ── */}
        <div className="absolute bg-white/50"
          style={{ top: '30%', left: '33%', width: '120px', height: '10px', transform: 'rotate(-20deg)', transformOrigin: 'left center' }} />

        {/* ── Blocs bâtiments ── */}
        {[
          { top: '6%',  left: '4%',  w: '60px',  h: '60px'  },
          { top: '6%',  left: '14%', w: '80px',  h: '40px'  },
          { top: '6%',  left: '36%', w: '50px',  h: '50px'  },
          { top: '6%',  left: '50%', w: '40px',  h: '30px'  },
          { top: '6%',  left: '64%', w: '70px',  h: '45px'  },
          { top: '6%',  left: '83%', w: '80px',  h: '55px'  },
          { top: '30%', left: '4%',  w: '55px',  h: '45px'  },
          { top: '30%', left: '14%', w: '45px',  h: '35px'  },
          { top: '30%', left: '36%', w: '45px',  h: '32px'  },
          { top: '30%', left: '64%', w: '60px',  h: '50px'  },
          { top: '30%', left: '78%', w: '50px',  h: '40px'  },
          { top: '57%', left: '4%',  w: '70px',  h: '50px'  },
          { top: '57%', left: '14%', w: '55px',  h: '40px'  },
          { top: '57%', left: '36%', w: '45px',  h: '38px'  },
          { top: '57%', left: '64%', w: '65px',  h: '55px'  },
          { top: '57%', left: '83%', w: '75px',  h: '45px'  },
          { top: '80%', left: '4%',  w: '80px',  h: '50px'  },
          { top: '80%', left: '36%', w: '50px',  h: '40px'  },
          { top: '80%', left: '64%', w: '60px',  h: '35px'  },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-md"
            style={{ top: b.top, left: b.left, width: b.w, height: b.h, background: '#c8d8c8' }} />
        ))}

        {/* ── Marqueur Labo ── */}
        <div className="absolute flex flex-col items-center" style={{ top: MAP_POSITIONS.labo.top, left: MAP_POSITIONS.labo.left, transform: 'translate(-50%,-100%)' }}>
          <div className="w-11 h-11 rounded-full bg-[#1565C0] border-4 border-white shadow-xl flex items-center justify-center">
            <span className="text-lg">🏥</span>
          </div>
          <div className="mt-1 bg-[#1565C0] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap">
            AZ Labo
          </div>
          {/* Stem */}
          <div className="w-0.5 h-2 bg-[#1565C0]" style={{ marginTop: '-2px' }} />
        </div>

        {/* ── Marqueurs techniciens ── */}
        {techniciens.map(tech => {
          const pos = MAP_POSITIONS[tech.id];
          if (!pos) return null;
          const col = getColor(tech.id);
          const initiales = tech.nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={tech.id} className="absolute flex flex-col items-center" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%,-100%)' }}>
              <div className={`w-10 h-10 rounded-full ${col.bg} border-4 border-white shadow-xl flex items-center justify-center`}>
                <span className="text-white text-xs font-black">{initiales}</span>
              </div>
              <div className="mt-1 bg-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap border border-gray-200"
                style={{ color: col.hex }}>
                {tech.nom.split(' ')[0]}
              </div>
              <div className="w-0.5 h-2 bg-gray-400" style={{ marginTop: '-2px' }} />
            </div>
          );
        })}

        {/* ── Légende ── */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-md border border-white text-[11px] space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#1565C0] border-2 border-white shadow shrink-0" />
            <span className="font-semibold text-gray-600">AZ Labo Birkhadem</span>
          </div>
          {techniciens.map(tech => {
            const col = getColor(tech.id);
            return (
              <div key={tech.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${col.bg} border-2 border-white shadow shrink-0`} />
                <span className="text-gray-600">{tech.nom.split(' ')[0]} — <span className="text-gray-400">{tech.position}</span></span>
              </div>
            );
          })}
        </div>

        {/* Overlay "Vue simulée" */}
        <div className="absolute top-3 left-3 bg-black/30 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
          📍 Vue simulée — Birkhadem, Alger
        </div>
      </div>
    </div>
  );
}

// ─── Carte technicien ─────────────────────────────────────────────────────────
function TechCard({ tech, onViewRdv, onEdit, onDelete, onFiche }) {
  const col       = getColor(tech.id);
  const statutCfg = STATUT_CFG[tech.statut] ?? STATUT_CFG.libre;
  const total     = tech.rdvAssignes + tech.rdvTermines;
  const pct       = total > 0 ? Math.round((tech.rdvTermines / total) * 100) : 0;
  const initiales = tech.nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-4">

        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full ${col.bg} flex items-center justify-center shrink-0 shadow-sm`}>
          <span className="text-white font-black text-base">{initiales}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-[#111] text-base leading-tight">{tech.nom}</p>
              <p className="text-xs text-gray-400 mt-0.5">{tech.telephone}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statutCfg.bg} ${statutCfg.text}`}>
              {statutCfg.label}
            </span>
          </div>

          {/* Position */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-gray-400 text-xs">📍</span>
            <span className="text-xs text-gray-500">{tech.position}</span>
          </div>

          {/* Zone */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-gray-400 text-xs">🗺️</span>
            <span className="text-xs text-gray-400">{tech.zone}</span>
          </div>

          {/* Stats RDV */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-600">
                {tech.rdvTermines}/{tech.rdvAssignes > 0 ? tech.rdvAssignes + tech.rdvTermines : 0} RDV aujourd'hui
              </span>
              <span className="text-xs font-bold" style={{ color: col.hex }}>{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${col.bg}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex gap-3 mt-1.5">
              <span className="text-[10px] text-gray-400">
                <span className="font-semibold text-gray-600">{tech.rdvAssignes}</span> en cours
              </span>
              <span className="text-[10px] text-gray-400">
                <span className="font-semibold text-green-600">{tech.rdvTermines}</span> terminés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewRdv(tech)}
          className="flex-1 text-xs font-semibold py-2 rounded-xl bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] transition-colors"
        >
          📋 Voir ses RDV
        </button>
        <a
          href={`tel:${tech.telephone.replace(/\s/g, '')}`}
          className="flex-1 text-xs font-semibold py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-center"
        >
          📞 Appeler
        </a>
        <button
          onClick={() => onEdit(tech)}
          className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-xs font-semibold"
        >
          ✏️
        </button>
        <button
          onClick={() => onFiche(tech)}
          className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold"
        >
          📋
        </button>
        <button
          onClick={() => onDelete(tech.id, tech.nom)}
          className="px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-xs font-semibold"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ─── Carte RDV domicile non assigné ──────────────────────────────────────────
function RdvAssignCard({ rdv, techniciens, selectedTech, onSelectTech, onAssign }) {
  const disponibles = techniciens.filter(t => t.statut !== 'absent');

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-4">
      <div className="flex items-start gap-3 flex-wrap">

        {/* Info patient */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#111]">{rdv.patient}</p>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
              🕐 {rdv.heure}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">📍 {rdv.adresse}</p>
          <p className="text-xs text-gray-400 mt-0.5">🚗 {rdv.distance}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {rdv.analyses.map(a => (
              <span key={a} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Assignation */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <select
            value={selectedTech ?? ''}
            onChange={e => onSelectTech(rdv.id, e.target.value ? Number(e.target.value) : null)}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#111] focus:outline-none focus:border-[#1565C0] transition cursor-pointer"
          >
            <option value="">Assigner à...</option>
            {disponibles.map(t => {
              const col = getColor(t.id);
              return (
                <option key={t.id} value={t.id}>
                  {t.nom.split(' ')[0]} — {STATUT_CFG[t.statut]?.label ?? t.statut}
                </option>
              );
            })}
          </select>
          <button
            onClick={() => onAssign(rdv.id)}
            disabled={!selectedTech}
            className="px-4 py-2 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Voir RDV technicien ────────────────────────────────────────────────
function ViewRdvModal({ tech, rdvDomicile, onClose }) {
  const col     = getColor(tech.id);
  const techRdv = rdvDomicile.filter(r => r.assignedTo === tech.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
          <div className={`w-10 h-10 rounded-full ${col.bg} flex items-center justify-center shrink-0`}>
            <span className="text-white font-black text-sm">
              {tech.nom.split(' ').map(w => w[0]).join('').slice(0,2)}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-[#111]">{tech.nom}</h2>
            <p className="text-xs text-gray-400">{techRdv.length} RDV domicile assigné{techRdv.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center text-lg leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {techRdv.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">Aucun RDV domicile assigné</p>
            </div>
          ) : (
            <div className="space-y-3">
              {techRdv.map(rdv => (
                <div key={rdv.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#111]">{rdv.patient}</p>
                    <span className="text-xs font-bold text-[#1565C0] bg-[#E3F2FD] px-2 py-0.5 rounded-full">
                      🕐 {rdv.heure}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">📍 {rdv.adresse}</p>
                  <p className="text-xs text-gray-400">🚗 {rdv.distance}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rdv.analyses.map(a => (
                      <span key={a} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-200 text-gray-600">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Ajouter / Modifier technicien ─────────────────────────────────────
function TechModal({ mode, form, setForm, onSave, onClose }) {
  const isAdd = mode === 'add';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold">{isAdd ? 'Ajouter un technicien' : 'Modifier le technicien'}</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 transition-colors flex items-center justify-center text-lg leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {[
            { key: 'nom',       label: 'Nom complet *',        placeholder: 'Ex: Amine Merzougui'       },
            { key: 'telephone', label: 'Téléphone *',          placeholder: '+213 555 000 000'          },
            { key: 'zone',      label: 'Zone de couverture',  placeholder: 'Ex: Birkhadem, Kouba...'   },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {label}
              </label>
              <input
                value={form[key] ?? ''}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Statut initial
            </label>
            <select
              value={form.statut ?? 'disponible'}
              onChange={e => setForm({ ...form, statut: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111] bg-white focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 transition"
            >
              <option value="disponible">🟡 Disponible</option>
              <option value="actif">🟢 Actif</option>
              <option value="libre">🟣 Libre</option>
              <option value="absent">🔴 Absent</option>
            </select>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
            Annuler
          </button>
          <button onClick={onSave} disabled={!form.nom?.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {isAdd ? 'Ajouter' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function TechniciensPage() {
  const [techniciens,   setTechniciens]   = useState([]);
  const [rdvDomicile,   setRdvDomicile]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedTech,  setSelectedTech]  = useState({}); // { rdvId: techId }
  const [viewRdvModal,  setViewRdvModal]  = useState(null);
  const [techModal,     setTechModal]     = useState(null);
  const [ficheTech,     setFicheTech]     = useState(null);
  const [rdvTech,       setRdvTech]       = useState([]);
  const [form,          setForm]          = useState({ nom: '', telephone: '', zone: '', statut: 'disponible' });

  // ── Supabase ──
  useEffect(() => { chargerTechniciens(); }, []);

  const chargerTechniciens = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('techniciens').select('*');
    if (!error) setTechniciens(data || []);
    const { data: rdvData } = await supabase
      .from('rdv')
      .select('*, patients(nom, telephone)')
      .eq('lieu', 'domicile')
      .eq('statut', 'confirme');
    if (rdvData) setRdvDomicile(rdvData);
    setLoading(false);
  };

  // ajouterTechnicien removed — saveTechModal handles insert

  const modifierStatut = async (id, statut) => {
    await supabase.from('techniciens').update({ statut }).eq('id', id);
    chargerTechniciens();
  };

  // ── Stats ──
  const totalActifs    = techniciens.filter(t => t.statut !== 'absent').length;
  const rdvAujourd    = rdvDomicile.length;
  const rdvAssignes   = rdvDomicile.filter(r => r.assignedTo !== null).length;
  const rdvNonAssignes = rdvDomicile.filter(r => r.assignedTo === null).length;

  // ── Assigner un RDV ──
  async function handleAssign(rdvId) {
    const techId = selectedTech[rdvId];
    if (!techId) return;

    await supabase.from('rdv').update({ technicien_id: techId, technicien_nom: techniciens.find(t => t.id === techId)?.nom || '' }).eq('id', rdvId);
    setSelectedTech(prev => { const n = { ...prev }; delete n[rdvId]; return n; });
    chargerTechniciens();
  }

  // ── Modal technicien ──
  function openAdd() {
    setForm({ nom: '', telephone: '', zone: '', statut: 'disponible' });
    setTechModal('add');
  }
  function openEdit(tech) {
    setForm({ nom: tech.nom || '', telephone: tech.telephone || '', zone: tech.zone || '', statut: tech.statut || 'disponible' });
    setTechModal(tech);
  }
  async function saveTechModal() {
    if (!form.nom?.trim()) { window.alert('Nom obligatoire'); return; }
    if (!form.telephone?.trim()) { window.alert('Telephone obligatoire'); return; }
    const techData = {
      nom: form.nom.trim(),
      telephone: form.telephone.trim(),
      zone: form.zone || null,
      statut: form.statut || 'disponible',
      actif: true,
    };
    console.log('[Techniciens] Mode:', techModal === 'add' ? 'INSERT' : 'UPDATE', techData);
    try {
      if (techModal === 'add') {
        const { data, error } = await supabase.from('techniciens').insert(techData).select();
        console.log('[Techniciens] Insert result:', data, 'error:', error);
        if (error) { window.alert('Erreur: ' + error.message); return; }
        window.alert('Technicien ajoute !');
      } else {
        const { data, error } = await supabase.from('techniciens').update(techData).eq('id', techModal.id).select();
        console.log('[Techniciens] Update result:', data, 'error:', error);
        if (error) { window.alert('Erreur: ' + error.message); return; }
      }
      setTechModal(null);
      chargerTechniciens();
    } catch (err) {
      console.log('[Techniciens] Error:', err);
      window.alert('Erreur: ' + (err.message || err));
    }
  }

  const supprimerTechnicien = async (id, nom) => {
    if (!window.confirm('Supprimer ' + nom + ' ?')) return;
    const { error } = await supabase.from('techniciens').delete().eq('id', id);
    if (error) { window.alert('Erreur: ' + error.message); return; }
    await chargerTechniciens();
  };

  const voirRdvTechnicien = async (tech) => {
    setFicheTech(tech);
    const { data } = await supabase.from('rdv').select('*, patients(nom, telephone)').eq('technicien_id', tech.id).order('created_at', { ascending: false });
    setRdvTech(data || []);
  };

  const nonAssignes = rdvDomicile.filter(r => r.assignedTo === null);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <>
      <div className="space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon="👨‍⚕️" label="Techniciens actifs"        value={`${totalActifs}/${techniciens.length}`}
            colorBg="bg-green-50 border border-green-100"   colorText="text-green-700" />
          <StatCard icon="🏠" label="RDV domicile aujourd'hui"  value={rdvAujourd}
            colorBg="bg-white border border-gray-100 shadow-sm"  colorText="text-[#111]"   />
          <StatCard icon="✅" label="Assignés"                   value={rdvAssignes}
            colorBg="bg-[#E3F2FD] border border-[#BBDEFB]"  colorText="text-[#1565C0]" />
          <StatCard icon="⏳" label="Non assignés"               value={rdvNonAssignes}
            colorBg="bg-orange-50 border border-orange-100" colorText="text-orange-600" />
        </div>

        {/* ── Carte MAP ── */}
        <SimulatedMap techniciens={techniciens} />

        {/* ── Header liste + ajouter ── */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#111] text-base">
            Techniciens terrain
            <span className="ml-2 text-sm font-normal text-gray-400">({techniciens.length})</span>
          </h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white font-semibold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm"
          >
            <span className="font-bold text-base leading-none">+</span>
            Ajouter technicien
          </button>
        </div>

        {/* ── Grille cartes techniciens ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {techniciens.map(tech => (
            <TechCard
              key={tech.id}
              tech={tech}
              onViewRdv={setViewRdvModal}
              onEdit={openEdit}
              onDelete={supprimerTechnicien}
              onFiche={voirRdvTechnicien}
            />
          ))}
        </div>

        {/* ── RDV domicile non assignés ── */}
        {nonAssignes.length > 0 && (
          <div className="bg-orange-50 rounded-2xl border border-orange-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-orange-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-orange-700">
                  ⏳ RDV domicile en attente d'assignation
                </h2>
                <p className="text-xs text-orange-500 mt-0.5">
                  {nonAssignes.length} RDV non assigné{nonAssignes.length > 1 ? 's' : ''}
                </p>
              </div>
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center">
                {nonAssignes.length}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {nonAssignes.map(rdv => (
                <RdvAssignCard
                  key={rdv.id}
                  rdv={rdv}
                  techniciens={techniciens}
                  selectedTech={selectedTech[rdv.id]}
                  onSelectTech={(id, techId) => setSelectedTech(prev => ({ ...prev, [id]: techId }))}
                  onAssign={handleAssign}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message si tous les RDV sont assignés */}
        {nonAssignes.length === 0 && rdvDomicile.length > 0 && (
          <div className="bg-green-50 rounded-2xl border border-green-200 px-5 py-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-bold text-green-700 text-sm">Tous les RDV domicile sont assignés !</p>
            <p className="text-xs text-green-500 mt-1">{rdvDomicile.length} RDV répartis entre les techniciens</p>
          </div>
        )}

      </div>

      {/* ── Modal Voir RDV ── */}
      {viewRdvModal && (
        <ViewRdvModal
          tech={viewRdvModal}
          rdvDomicile={rdvDomicile}
          onClose={() => setViewRdvModal(null)}
        />
      )}

      {/* ── Modal Technicien ── */}
      {techModal !== null && (
        <TechModal
          mode={techModal === 'add' ? 'add' : 'edit'}
          form={form}
          setForm={setForm}
          onSave={saveTechModal}
          onClose={() => setTechModal(null)}
        />
      )}
      {ficheTech && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setFicheTech(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg">{(ficheTech.nom || '??').slice(0, 2).toUpperCase()}</div>
                <div>
                  <p className="text-white font-black text-lg">{ficheTech.nom}</p>
                  <p className="text-blue-200 text-sm">{ficheTech.telephone || '—'} — {ficheTech.zone || 'Zone non définie'}</p>
                </div>
              </div>
              <button onClick={() => setFicheTech(null)} className="w-7 h-7 rounded-full bg-white/20 text-white font-bold hover:bg-white/30 flex items-center justify-center text-lg">×</button>
            </div>
            <div className="grid grid-cols-3 gap-3 p-5 shrink-0">
              <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-2xl font-black text-[#1565C0]">{rdvTech.length}</p><p className="text-[10px] text-gray-500">Total RDV</p></div>
              <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-2xl font-black text-green-600">{rdvTech.filter(r => r.statut_prelevement === 'termine' || r.statut_prelevement === 'resultat_saisi').length}</p><p className="text-[10px] text-gray-500">Terminés</p></div>
              <div className="bg-orange-50 rounded-xl p-3 text-center"><p className="text-2xl font-black text-orange-600">{rdvTech.filter(r => r.statut_prelevement === 'assigne').length}</p><p className="text-[10px] text-gray-500">En cours</p></div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
              <p className="font-bold text-sm text-gray-700 mb-1">RDV assignés :</p>
              {rdvTech.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">Aucun RDV assigné</p>
              ) : rdvTech.map(rdv => (
                <div key={rdv.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div><p className="font-bold text-sm">{rdv.patients?.nom || 'Patient'}</p><p className="text-xs text-gray-500">{rdv.patients?.telephone || '—'}</p></div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      rdv.statut_prelevement === 'assigne' ? 'bg-blue-100 text-blue-700' :
                      rdv.statut_prelevement === 'termine' || rdv.statut_prelevement === 'resultat_saisi' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{rdv.statut_prelevement === 'assigne' ? '🚗 Assigné' : rdv.statut_prelevement === 'termine' ? '✓ Terminé' : rdv.statut_prelevement || '—'}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    <p>📅 {rdv.date || '—'} — {rdv.heure || '—'}</p>
                    <p>📍 {rdv.notes || 'Domicile'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
