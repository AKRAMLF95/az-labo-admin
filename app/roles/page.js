'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/* ─── Mock Data ──────────────────────────────────────────────────── */
const USERS_DATA = [
  { id: 1, nom: 'Dr. Meziane Kamel', email: 'admin@azlaboratoires.dz',  telephone: '+213 555 000 001', role: 'super_admin', actif: true, dernierConnexion: 'Auj. 09:15', dateCreation: '01/04/2026' },
  { id: 2, nom: 'Samia Hadj',        email: 'samia@azlaboratoires.dz',  telephone: '+213 555 000 002', role: 'biologiste',  actif: true, dernierConnexion: 'Auj. 08:30', dateCreation: '01/04/2026' },
  { id: 3, nom: 'Hamza Rahmani',     email: 'hamza@azlaboratoires.dz',  telephone: '+213 555 000 003', role: 'caissier',    actif: true, dernierConnexion: 'Auj. 07:45', dateCreation: '01/04/2026' },
  { id: 4, nom: 'Amine Merzougui',   email: 'amine@azlaboratoires.dz',  telephone: '+213 555 111 222', role: 'technicien',  actif: true, dernierConnexion: 'Auj. 08:00', dateCreation: '01/04/2026' },
  { id: 5, nom: 'Ryad Boukhalfa',    email: 'ryad@azlaboratoires.dz',   telephone: '+213 661 333 444', role: 'technicien',  actif: true, dernierConnexion: 'Hier 17:30', dateCreation: '01/04/2026' },
  { id: 6, nom: 'Lynda Kaci',        email: 'lynda@azlaboratoires.dz',  telephone: '+213 770 555 666', role: 'technicien',  actif: true, dernierConnexion: 'Auj. 07:55', dateCreation: '01/04/2026' },
  { id: 7, nom: 'Nadia Benali',      email: 'nadia@azlaboratoires.dz',  telephone: '+213 661 777 888', role: 'secretaire',  actif: true, dernierConnexion: 'Auj. 08:15', dateCreation: '05/04/2026' },
];

const ACTIVITE_DATA = [
  { id: 1, user: 'Samia Hadj',      action: 'Résultat validé — Karim Amrani',             date: 'Auj. 09:15', ip: '192.168.1.x' },
  { id: 2, user: 'Hamza Rahmani',   action: 'Code promo AZLAUNCH appliqué',                date: 'Auj. 08:45', ip: '192.168.1.x' },
  { id: 3, user: 'Amine Merzougui', action: 'RDV domicile marqué terminé',                 date: 'Auj. 08:30', ip: '192.168.2.x' },
  { id: 4, user: 'Dr. Meziane Kamel',action:'Nouveau utilisateur créé : Nadia Benali',    date: 'Hier 17:00', ip: '192.168.1.x' },
  { id: 5, user: 'Samia Hadj',      action: 'Résultats envoyés WhatsApp — Sara Bensalem', date: 'Hier 16:30', ip: '192.168.1.x' },
];

/* ─── Roles config ───────────────────────────────────────────────── */
const ROLES = {
  super_admin: { label: 'Super Admin',       icon: '👑', color: '#F57F17', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  biologiste:  { label: 'Biologiste',        icon: '👩‍⚕️', color: '#2E7D32', bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200'  },
  caissier:    { label: 'Caissier',          icon: '💰', color: '#E65100', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  technicien:  { label: 'Technicien terrain',icon: '🚗', color: '#1565C0', bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200'   },
  secretaire:  { label: 'Secrétaire',        icon: '📋', color: '#7B1FA2', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  manager:     { label: 'Manager',           icon: '📊', color: '#455A64', bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-200'  },
};

/* ─── Permissions matrix ─────────────────────────────────────────── */
const PERMISSIONS = [
  { id: 'voir_dashboard',        label: 'Voir dashboard',           group: 'Navigation' },
  { id: 'voir_rdv',              label: 'Voir RDV',                 group: 'RDV' },
  { id: 'creer_rdv',             label: 'Créer RDV',                group: 'RDV' },
  { id: 'modifier_rdv',          label: 'Modifier RDV',             group: 'RDV' },
  { id: 'annuler_rdv',           label: 'Annuler RDV',              group: 'RDV' },
  { id: 'voir_patients',         label: 'Voir patients',            group: 'Patients' },
  { id: 'modifier_patients',     label: 'Modifier patients',        group: 'Patients' },
  { id: 'saisir_resultats',      label: 'Saisir résultats',         group: 'Résultats' },
  { id: 'valider_resultats',     label: 'Valider résultats',        group: 'Résultats' },
  { id: 'envoyer_resultats',     label: 'Envoyer résultats',        group: 'Résultats' },
  { id: 'voir_resultats',        label: 'Voir résultats',           group: 'Résultats' },
  { id: 'gerer_paiements',       label: 'Gérer paiements',          group: 'Finance' },
  { id: 'gerer_promos',          label: 'Gérer promos',             group: 'Finance' },
  { id: 'voir_stats_finances',   label: 'Voir stats finances',      group: 'Finance' },
  { id: 'gerer_techniciens',     label: 'Gérer techniciens',        group: 'Terrain' },
  { id: 'assigner_rdv_domicile', label: 'Assigner RDV domicile',    group: 'Terrain' },
  { id: 'gerer_utilisateurs',    label: 'Gérer utilisateurs',       group: 'Admin' },
  { id: 'gerer_analyses_prix',   label: 'Gérer analyses/prix',      group: 'Admin' },
  { id: 'gerer_conditions',      label: 'Gérer conditions',         group: 'Admin' },
  { id: 'acces_parametres',      label: 'Accès paramètres',         group: 'Admin' },
];

const ROLE_PERMISSIONS = {
  super_admin: new Set(PERMISSIONS.map(p => p.id)),
  biologiste:  new Set(['voir_dashboard','voir_rdv','voir_patients','saisir_resultats','valider_resultats','envoyer_resultats','voir_resultats']),
  caissier:    new Set(['voir_dashboard','voir_rdv','gerer_paiements','gerer_promos']),
  technicien:  new Set(['voir_rdv','assigner_rdv_domicile','voir_patients']),
  secretaire:  new Set(['voir_dashboard','voir_rdv','creer_rdv','modifier_rdv','annuler_rdv','voir_patients','modifier_patients','voir_resultats']),
  manager:     new Set(['voir_dashboard','voir_rdv','voir_patients','voir_resultats','voir_stats_finances']),
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function getInitials(nom) {
  return nom.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-purple-100', text: 'text-purple-700'  },
  { bg: 'bg-green-100',  text: 'text-green-700'   },
  { bg: 'bg-orange-100', text: 'text-orange-700'  },
  { bg: 'bg-pink-100',   text: 'text-pink-700'    },
  { bg: 'bg-teal-100',   text: 'text-teal-700'    },
  { bg: 'bg-indigo-100', text: 'text-indigo-700'  },
];
function avatarColor(id) { return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length]; }

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function RoleBadge({ role }) {
  const cfg = ROLES[role];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
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

/* ─── Add User Modal ─────────────────────────────────────────────── */
function AddUserModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', role: '',
    motDePasse: '', autoPassword: true,
    envoyerPar: 'whatsapp',
  });
  const [errors, setErrors] = useState({});
  const [created, setCreated] = useState(false);
  const [generatedPass] = useState(generatePassword);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.nom.trim())    e.nom       = 'Requis';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email invalide';
    if (!form.telephone.trim()) e.telephone = 'Requis';
    if (!form.role)          e.role      = 'Requis';
    if (!form.autoPassword && !form.motDePasse.trim()) e.motDePasse = 'Requis';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const finalPass = form.autoPassword ? generatedPass : form.motDePasse;
    onSave({ nom: form.nom, email: form.email, telephone: form.telephone, role: form.role, motDePasse: finalPass });
    setCreated(true);
  }

  const SEND_OPTS = [
    { key: 'whatsapp', icon: '📱', label: 'WhatsApp' },
    { key: 'email',    icon: '📧', label: 'Email'    },
    { key: 'les_deux', icon: '📲', label: 'Les deux' },
  ];

  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Compte créé !</h3>
          <p className="text-sm text-gray-500 mb-4">
            Credentials envoyés à <span className="font-semibold text-gray-800">{form.nom}</span>{' '}
            via <span className="font-semibold text-gray-800">{SEND_OPTS.find(o => o.key === form.envoyerPar)?.label}</span>.
          </p>
          <div className="bg-gray-50 rounded-xl p-3 mb-5">
            <p className="text-xs text-gray-400 mb-1">Mot de passe temporaire</p>
            <p className="font-mono font-bold text-[#1565C0] tracking-widest">
              {form.autoPassword ? generatedPass : form.motDePasse}
            </p>
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ajouter un utilisateur</h2>
            <p className="text-xs text-gray-400 mt-0.5">Créer un nouveau compte avec accès au panel</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom complet <span className="text-red-500">*</span></label>
            <input className={inputCls(errors.nom)} placeholder="ex: Samia Hadj"
              value={form.nom} onChange={e => set('nom', e.target.value)} />
            {errors.nom && <p className="text-xs text-red-500 mt-0.5">{errors.nom}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email (login) <span className="text-red-500">*</span></label>
            <input type="email" className={inputCls(errors.email)} placeholder="prenom@azlaboratoires.dz"
              value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone <span className="text-red-500">*</span></label>
            <input className={inputCls(errors.telephone)} placeholder="+213 5xx xxx xxx"
              value={form.telephone} onChange={e => set('telephone', e.target.value)} />
            {errors.telephone && <p className="text-xs text-red-500 mt-0.5">{errors.telephone}</p>}
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rôle <span className="text-red-500">*</span></label>
            <select className={inputCls(errors.role)} value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="">Choisir un rôle…</option>
              {Object.entries(ROLES).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-0.5">{errors.role}</p>}
            {form.role && (
              <div className={`mt-2 px-3 py-2 rounded-xl text-xs ${ROLES[form.role].bg} ${ROLES[form.role].text}`}>
                <p className="font-semibold mb-0.5">{ROLES[form.role].icon} Permissions incluses :</p>
                <p className="opacity-80">
                  {[...ROLE_PERMISSIONS[form.role]].slice(0, 4).map(id => PERMISSIONS.find(p => p.id === id)?.label).join(' · ')}
                  {ROLE_PERMISSIONS[form.role].size > 4 && ` · +${ROLE_PERMISSIONS[form.role].size - 4} autres`}
                </p>
              </div>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600">Mot de passe temporaire</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Générer auto</span>
                <ToggleSwitch checked={form.autoPassword} onChange={v => set('autoPassword', v)} />
              </div>
            </div>
            {form.autoPassword ? (
              <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 font-mono text-sm font-bold text-[#1565C0] tracking-widest">
                {generatedPass}
                <span className="ml-2 text-xs font-normal text-blue-400">· généré automatiquement</span>
              </div>
            ) : (
              <input className={inputCls(errors.motDePasse)} placeholder="Minimum 8 caractères"
                value={form.motDePasse} onChange={e => set('motDePasse', e.target.value)} />
            )}
            {errors.motDePasse && <p className="text-xs text-red-500 mt-0.5">{errors.motDePasse}</p>}
          </div>

          {/* Envoyer par */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Envoyer les credentials par</label>
            <div className="flex gap-2">
              {SEND_OPTS.map(o => (
                <button key={o.key} type="button" onClick={() => set('envoyerPar', o.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.envoyerPar === o.key
                      ? 'bg-[#1565C0] text-white border-[#1565C0]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  <span>{o.icon}</span>{o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">Créer le compte</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Role Modal ────────────────────────────────────────────── */
function EditRoleModal({ user, onClose, onSave }) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [customPerms, setCustomPerms] = useState(new Set());
  const [removedPerms, setRemovedPerms] = useState(new Set());

  const basePerms = ROLE_PERMISSIONS[selectedRole] || new Set();

  function toggleCustom(id) {
    if (basePerms.has(id)) {
      // removing a base perm
      setRemovedPerms(prev => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
    } else {
      // adding an extra perm
      setCustomPerms(prev => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
    }
  }

  function effectivePerms() {
    const s = new Set([...basePerms, ...customPerms]);
    removedPerms.forEach(id => s.delete(id));
    return s;
  }

  const effective = effectivePerms();
  const color = avatarColor(user.id);
  const groups = [...new Set(PERMISSIONS.map(p => p.group))];

  function handleSave() {
    onSave(user.id, selectedRole);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className={`w-11 h-11 rounded-2xl ${color.bg} flex items-center justify-center shrink-0`}>
            <span className={`${color.text} text-sm font-black`}>{getInitials(user.nom)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{user.nom}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Rôle */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Rôle assigné</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLES).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => { setSelectedRole(key); setCustomPerms(new Set()); setRemovedPerms(new Set()); }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    selectedRole === key
                      ? `border-[${cfg.color}] ${cfg.bg} shadow-sm`
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  style={selectedRole === key ? { borderColor: cfg.color } : {}}>
                  <span className="text-lg">{cfg.icon}</span>
                  <span className={`text-xs font-semibold ${selectedRole === key ? cfg.text : 'text-gray-700'}`}>{cfg.label}</span>
                  {user.role === key && (
                    <span className="ml-auto text-[10px] font-bold text-gray-400">actuel</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom permissions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold text-gray-600">Permissions personnalisées</p>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {effective.size} actives · {customPerms.size} ajoutées · {removedPerms.size} retirées
              </span>
            </div>
            <div className="space-y-3">
              {groups.map(group => (
                <div key={group}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{group}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PERMISSIONS.filter(p => p.group === group).map(perm => {
                      const isBase    = basePerms.has(perm.id);
                      const isRemoved = removedPerms.has(perm.id);
                      const isAdded   = customPerms.has(perm.id);
                      const isOn      = effective.has(perm.id);
                      return (
                        <button key={perm.id} type="button" onClick={() => toggleCustom(perm.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                            isOn
                              ? isAdded
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-green-200 bg-green-50'
                              : isRemoved
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-100 bg-gray-50'
                          }`}>
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isOn    ? isAdded ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                    : isRemoved ? 'bg-red-300 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {isOn ? '✓' : '✗'}
                          </span>
                          <span className={`text-xs ${isOn ? isAdded ? 'text-blue-700 font-semibold' : 'text-green-700' : isRemoved ? 'text-red-500 line-through' : 'text-gray-400'}`}>
                            {perm.label}
                          </span>
                          {isAdded   && <span className="ml-auto text-[9px] font-bold text-blue-500">+custom</span>}
                          {isRemoved && <span className="ml-auto text-[9px] font-bold text-red-400">retiré</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-base shrink-0">⚠️</span>
            <p className="text-xs text-amber-700">Les modifications de rôle et de permissions prennent effet à la prochaine connexion de l'utilisateur.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#1565C0] hover:bg-[#0D47A1] transition-colors">Enregistrer les modifications</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Reset Password Modal ───────────────────────────────────────── */
function ResetPasswordModal({ user, onClose }) {
  const [newPass] = useState(generatePassword);
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4 text-3xl">🔑</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Réinitialiser le mot de passe</h3>
        <p className="text-sm text-gray-500 mb-4">
          Nouveau mot de passe temporaire pour <span className="font-semibold text-gray-800">{user.nom}</span> :
        </p>
        <div className="bg-[#E3F2FD] rounded-xl px-4 py-3 mb-5">
          <p className="font-mono font-bold text-[#1565C0] text-lg tracking-widest">{newPass}</p>
        </div>
        {sent ? (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-semibold mb-4">
            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black">✓</span>
            Envoyé à {user.telephone}
          </div>
        ) : (
          <button onClick={() => setSent(true)}
            className="w-full py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors mb-3">
            📱 Envoyer sur WhatsApp
          </button>
        )}
        <button onClick={onClose} className="w-full py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
          {sent ? 'Fermer' : 'Annuler'}
        </button>
      </div>
    </div>
  );
}

/* ─── Permissions Matrix ─────────────────────────────────────────── */
function PermissionsMatrix() {
  const roleKeys = Object.keys(ROLES);
  const groups = [...new Set(PERMISSIONS.map(p => p.group))];
  const GROUP_COLORS = {
    Navigation: 'bg-gray-100 text-gray-600',
    RDV:        'bg-blue-50 text-blue-700',
    Patients:   'bg-green-50 text-green-700',
    Résultats:  'bg-purple-50 text-purple-700',
    Finance:    'bg-orange-50 text-orange-700',
    Terrain:    'bg-teal-50 text-teal-700',
    Admin:      'bg-red-50 text-red-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Matrice des permissions</h2>
        <p className="text-xs text-gray-400 mt-0.5">Vue d'ensemble des droits d'accès par rôle</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 min-w-[220px]">Permission</th>
              {roleKeys.map(role => {
                const cfg = ROLES[role];
                return (
                  <th key={role} className="px-4 py-3 text-center min-w-[110px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{cfg.icon}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${cfg.bg} ${cfg.text}`}>{cfg.label.split(' ')[0]}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <>
                <tr key={`group-${group}`} className="bg-gray-50/70">
                  <td colSpan={roleKeys.length + 1} className="px-5 py-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${GROUP_COLORS[group] || 'bg-gray-100 text-gray-500'}`}>
                      {group}
                    </span>
                  </td>
                </tr>
                {PERMISSIONS.filter(p => p.group === group).map((perm, i) => (
                  <tr key={perm.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-2.5 text-sm text-gray-700">{perm.label}</td>
                    {roleKeys.map(role => {
                      const has = ROLE_PERMISSIONS[role]?.has(perm.id);
                      return (
                        <td key={role} className="px-4 py-2.5 text-center">
                          {has ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-black mx-auto">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-300 text-xs font-black mx-auto">✗</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Activity Log ───────────────────────────────────────────────── */
function ActivityLog({ activite }) {
  const ACTION_ICONS = {
    'Résultat validé':     { icon: '🧪', color: 'bg-purple-100 text-purple-700' },
    'Code promo':          { icon: '🎟️', color: 'bg-orange-100 text-orange-700' },
    'RDV domicile':        { icon: '🚗', color: 'bg-blue-100 text-blue-700'    },
    'Nouveau utilisateur': { icon: '👤', color: 'bg-green-100 text-green-700'  },
    'Résultats envoyés':   { icon: '📱', color: 'bg-teal-100 text-teal-700'    },
  };

  function getActionStyle(action) {
    for (const [key, style] of Object.entries(ACTION_ICONS)) {
      if (action.includes(key)) return style;
    }
    return { icon: '⚡', color: 'bg-gray-100 text-gray-600' };
  }

  const usersByRole = {};
  USERS_DATA.forEach(u => {
    const style = getActionStyle('');
    usersByRole[u.nom] = avatarColor(u.id);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900">Journal d'activité récent</h2>
          <p className="text-xs text-gray-400 mt-0.5">Actions effectuées par les utilisateurs</p>
        </div>
        <button className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600 transition-colors">
          Voir tout
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Utilisateur','Action','Date / Heure','IP'].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {activite.map(entry => {
            const user = USERS_DATA.find(u => u.nom === entry.user);
            const color = user ? avatarColor(user.id) : AVATAR_COLORS[0];
            const actionStyle = getActionStyle(entry.action);
            return (
              <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${color.bg} flex items-center justify-center shrink-0`}>
                      <span className={`${color.text} text-xs font-black`}>{getInitials(entry.user)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-xs">{entry.user}</p>
                      {user && <RoleBadge role={user.role} />}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${actionStyle.color}`}>
                      {actionStyle.icon}
                    </span>
                    <span className="text-gray-700 text-xs">{entry.action}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{entry.date}</td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{entry.ip}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function RolesPage() {
  const [users,    setUsers]    = useState([]);
  const [activite, setActivite] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('utilisateurs');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [disableConfirm, setDisableConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // ── Supabase ──
  useEffect(() => { chargerUsers(); chargerActivite(); }, []);

  const chargerUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .order('role_id');
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const chargerActivite = async () => {
    const { data } = await supabase
      .from('activite_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setActivite(data);
  };

  const ajouterUser = async (formData) => {
    await supabase.from('utilisateurs').insert(formData);
    chargerUsers();
  };

  const modifierRole = async (id, role_id) => {
    await supabase.from('utilisateurs').update({ role_id }).eq('id', id);
    chargerUsers();
  };

  /* Stats */
  const today = users.filter(u => u.dernierConnexion?.startsWith('Auj.'));
  const superAdmins = users.filter(u => u.role_id === 'super_admin');
  const techniciens = users.filter(u => u.role === 'technicien');

  function handleAddUser(data) {
    const newUser = {
      id: Date.now(), ...data, actif: true,
      dernierConnexion: 'Jamais', dateCreation: new Date().toLocaleDateString('fr-DZ'),
    };
    setUsers(prev => [...prev, newUser]);
    setActivite(prev => [{
      id: Date.now(), user: 'Dr. Meziane Kamel',
      action: `Nouveau utilisateur créé : ${data.nom}`,
      date: 'Auj.', ip: '192.168.1.x',
    }, ...prev]);
  }

  function handleEditRole(userId, newRole) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }

  function handleToggleActif(userId) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, actif: !u.actif } : u));
  }

  /* Filter */
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* Group by role */
  const grouped = Object.keys(ROLES).reduce((acc, role) => {
    const group = filtered.filter(u => u.role === role);
    if (group.length) acc[role] = group;
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">Chargement…</div>;

  return (
    <div className="p-6 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total utilisateurs',  value: users.length,       icon: '👥', color: 'text-[#1565C0]',  bg: 'bg-blue-50',   border: 'border-blue-100'   },
          { label: 'Actifs aujourd\'hui', value: today.length,        icon: '🟢', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100'  },
          { label: 'Super admins',         value: superAdmins.length, icon: '👑', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
          { label: 'Techniciens terrain',  value: techniciens.length, icon: '🚗', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
        ].map(({ label, value, icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="text-2xl mb-3">{icon}</div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + CTA */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: 'utilisateurs', label: '👥 Utilisateurs' },
            { key: 'permissions',  label: '🔒 Matrice permissions' },
            { key: 'activite',     label: '📋 Journal activité'    },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === t.key ? 'bg-white text-[#1565C0] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition-colors">
          + Ajouter utilisateur
        </button>
      </div>

      {/* ══ UTILISATEURS TAB ══ */}
      {activeTab === 'utilisateurs' && (
        <>
          {/* Search + filter */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 transition-colors" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#1565C0] transition-colors">
              <option value="">Tous les rôles</option>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>

          {/* Grouped cards */}
          <div className="space-y-6">
            {Object.entries(grouped).map(([role, roleUsers]) => {
              const cfg = ROLES[role];
              return (
                <div key={role}>
                  {/* Group header */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-3 ${cfg.bg} border ${cfg.border}`}>
                    <span className="text-lg">{cfg.icon}</span>
                    <span className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/60 ${cfg.text}`}>{roleUsers.length}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {roleUsers.map(user => {
                      const color = avatarColor(user.id);
                      return (
                        <div key={user.id} className={`bg-white border rounded-2xl p-4 flex items-center gap-4 ${user.actif ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                          {/* Avatar */}
                          <div className={`w-12 h-12 rounded-2xl ${color.bg} flex items-center justify-center shrink-0 relative`}>
                            <span className={`${color.text} text-sm font-black`}>{getInitials(user.nom)}</span>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${user.actif ? 'bg-green-400' : 'bg-gray-300'}`} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-sm">{user.nom}</p>
                              <RoleBadge role={user.role} />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.telephone}</p>
                          </div>

                          {/* Meta */}
                          <div className="text-right shrink-0 hidden sm:block">
                            <p className="text-xs text-gray-500">Dernière connexion</p>
                            <p className="text-xs font-semibold text-gray-700">{user.dernierConnexion}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Créé le {user.dateCreation}</p>
                          </div>

                          {/* Toggle */}
                          <div className="shrink-0 flex flex-col items-center gap-1">
                            <ToggleSwitch
                              checked={user.actif}
                              onChange={() => user.role !== 'super_admin' && setDisableConfirm(user)}
                              disabled={user.role === 'super_admin'}
                            />
                            <span className="text-[9px] text-gray-400 font-medium">{user.actif ? 'Actif' : 'Inactif'}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setEditUser(user)} title="Modifier rôle"
                              className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                              ✏️
                            </button>
                            <button onClick={() => setResetUser(user)} title="Réinitialiser mot de passe"
                              className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center transition-colors">
                              🔑
                            </button>
                            {user.role !== 'super_admin' && (
                              <button onClick={() => setDisableConfirm(user)} title="Désactiver compte"
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                  user.actif ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}>
                                {user.actif ? '🚫' : '✅'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {Object.keys(grouped).length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                Aucun utilisateur ne correspond à votre recherche.
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ PERMISSIONS TAB ══ */}
      {activeTab === 'permissions' && <PermissionsMatrix />}

      {/* ══ ACTIVITE TAB ══ */}
      {activeTab === 'activite' && <ActivityLog activite={activite} />}

      {/* Activity log always visible on users tab */}
      {activeTab === 'utilisateurs' && <ActivityLog activite={activite} />}

      {/* ── Modals ── */}
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onSave={handleAddUser} />}
      {editUser && <EditRoleModal user={editUser} onClose={() => setEditUser(null)} onSave={handleEditRole} />}
      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />}

      {disableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="text-3xl mb-3">{disableConfirm.actif ? '🚫' : '✅'}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {disableConfirm.actif ? 'Désactiver le compte' : 'Réactiver le compte'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {disableConfirm.actif
                ? <>L'utilisateur <span className="font-semibold text-gray-800">{disableConfirm.nom}</span> perdra tout accès au panel.</>
                : <>L'utilisateur <span className="font-semibold text-gray-800">{disableConfirm.nom}</span> retrouvera son accès au panel.</>
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDisableConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Annuler</button>
              <button onClick={() => { handleToggleActif(disableConfirm.id); setDisableConfirm(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${disableConfirm.actif ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
