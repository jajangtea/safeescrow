"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TranslationType } from '../constants/languages';
import { Search, PlusCircle, Wallet, Globe } from 'lucide-react';

interface HeaderProps {
  lang: 'en' | 'id';
  setLang: (l: 'en' | 'id') => void;
  t: TranslationType;
}

export default function Header({ lang, setLang, t }: HeaderProps) {
  const pathname = usePathname();

  // Fungsi pembantu untuk mengecek apakah link sedang aktif
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="p-4 md:px-12 flex justify-between items-center sticky top-0 z-50 glass border-b border-white/5">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
        <div className="w-8 h-8 bg-brand-primary rounded-lg rotate-12 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-primary/40 group-hover:rotate-0 transition-all">
          S
        </div>
        <span className="text-xl font-bold tracking-tighter text-white">
          {t.navTitle}<span className="text-brand-primary">{t.navSubTitle}</span>
        </span>
      </Link>

      {/* Center Navigation - Desktop */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
        <Link 
          href="/" 
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isActive('/') ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle size={14} />
          {lang === 'id' ? 'Buat Escrow' : 'Create Escrow'}
        </Link>
        <Link 
          href="/explorer" 
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isActive('/explorer') ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search size={14} />
          Explorer
        </Link>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
              lang === 'en' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('id')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
              lang === 'id' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            ID
          </button>
        </div>

        {/* Connect Wallet Button */}
        <button className="bg-brand-primary hover:brightness-110 active:scale-95 text-white text-[11px] px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 uppercase tracking-wider">
          <Wallet size={14} />
          <span className="hidden sm:inline">{t.connectWallet}</span>
        </button>
      </div>
    </nav>
  );
}