"use client";
import React from 'react';

export default function Footer({ lang }: { lang: 'en' | 'id' }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-slate-800 pt-10 pb-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <h4 className="text-white font-bold mb-4 italic text-lg">SAFE-ESCROW</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              {lang === 'en' 
                ? "The most trusted decentralized payment protocol on Polygon Network." 
                : "Protokol pembayaran terdesentralisasi paling terpercaya di Jaringan Polygon."}
            </p>
          </div>
          <div>
            <h5 className="text-slate-200 font-bold text-sm mb-4 uppercase tracking-widest">Links</h5>
            <ul className="text-slate-400 text-xs space-y-2">
              <li className="hover:text-brand-secondary cursor-pointer transition-colors">PolygonScan</li>
              <li className="hover:text-brand-secondary cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-brand-secondary cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>
          <div>
            <h5 className="text-slate-200 font-bold text-sm mb-4 uppercase tracking-widest">System Status</h5>
            <div className="flex items-center gap-2 text-xs text-brand-accent">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
              Mainnet Ready (v1.0)
            </div>
            <p className="text-slate-500 text-[10px] mt-2 italic">Audited Smart Contracts</p>
          </div>
        </div>
        <div className="text-center border-t border-slate-800/50 pt-8 text-slate-500 text-[10px]">
          © {year} SafeEscrow Protocol. Built with ❤️ for Web3 Security.
        </div>
      </div>
    </footer>
  );
}