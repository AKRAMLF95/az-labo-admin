'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',            icon: '📊', label: 'Dashboard'   },
  { href: '/rdv',         icon: '📅', label: 'RDV'         },
  { href: '/patients',    icon: '👥', label: 'Patients'    },
  { href: '/resultats',   icon: '🧪', label: 'Résultats'  },
  { href: '/analyses',    icon: '🔬', label: 'Analyses'    },
  { href: '/conditions',  icon: '📋', label: 'Conditions'  },
  { href: '/techniciens', icon: '🚗', label: 'Techniciens' },
  { href: '/promos',      icon: '🎟️', label: 'Promos'      },
  { href: '/roles',       icon: '🔐', label: 'Rôles'       },
  { href: '/finance',     icon: '💰', label: 'Finance'     },
];

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-[#1565C0] flex flex-col z-50
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/20 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-2xl tracking-widest leading-none">AZ</p>
            <p className="text-[#90CAF9] text-[10px] font-bold tracking-[4px] uppercase mt-0.5">Laboratoires</p>
            <p className="text-white/50 text-[11px] mt-1">Panel Admin</p>
          </div>
          {/* Close button mobile */}
          <button onClick={onClose} className="md:hidden text-white/70 hover:text-white text-xl">✕</button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ href, icon, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link href={href} onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}>
                    <span className="text-base">{icon}</span>
                    <span className="flex-1">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Admin footer */}
        <div className="px-4 py-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
              <span className="text-[#1565C0] text-sm font-black">DM</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">Dr. Meziane</p>
              <span className="inline-block text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full mt-0.5">Super Admin</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
