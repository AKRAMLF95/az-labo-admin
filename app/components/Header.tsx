'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/':            'Dashboard',
  '/rdv':         'Rendez-vous',
  '/patients':    'Patients',
  '/resultats':   'Résultats',
  '/analyses':    'Analyses',
  '/conditions':  'Conditions',
  '/techniciens': 'Techniciens',
  '/promos':      'Promotions',
  '/roles':       'Rôles',
  '/finance':     'Finance',
};

function getTitle(pathname: string): string {
  if (pathname === '/') return PAGE_TITLES['/'];
  const match = Object.keys(PAGE_TITLES).filter(k => k !== '/').find(k => pathname.startsWith(k));
  return match ? PAGE_TITLES[match] : 'Panel Admin';
}

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-6">

      <div className="flex items-center gap-3">
        {/* Hamburger mobile */}
        <button onClick={onMenuToggle} className="md:hidden text-xl text-gray-700 hover:text-[#1565C0] p-1" aria-label="Menu">
          ☰
        </button>
        <h1 className="text-base md:text-lg font-bold text-[#111]">{title}</h1>
        <span className="hidden sm:inline-block text-xs font-semibold bg-[#E3F2FD] text-[#1565C0] px-2 py-0.5 rounded-full">
          👑 Super Admin
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <span className="text-lg md:text-xl">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1565C0] flex items-center justify-center">
            <span className="text-white text-xs font-black">DM</span>
          </div>
          <span className="text-sm font-medium text-[#111]">Dr. Meziane</span>
        </div>
      </div>
    </header>
  );
}
