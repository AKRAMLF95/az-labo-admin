'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-full">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen">
        <Header onMenuToggle={() => setMenuOpen(!menuOpen)} />
        <main className="flex-1 overflow-auto p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
