"use client";

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { content } from '../constants/languages'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Copy, ScanLine, Check, ClipboardPaste, Loader2, 
  ShieldCheck, Lock, ExternalLink, History, Info, 
  HelpCircle, ChevronDown, MessageCircle, Github 
} from 'lucide-react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { ethers, parseEther, isAddress, BrowserProvider, ContractFactory } from 'ethers';
import EscrowABI from '../constants/Escrow.json';

const MySwal = withReactContent(Swal);

// --- TYPES ---
interface EscrowHistory {
  address: string;
  seller: string;
  amount: string;
  date: string;
}

interface EthersError {
  code?: string | number;
  message?: string;
  reason?: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (params: unknown) => void) => void;
      removeListener: (event: string, callback: (params: unknown) => void) => void;
    };
  }
}

const HARGA_POL_SEKARANG = 11200;
const DEVELOPER_ADDRESS = "0x0000000000000000000000000000000000000000"; 

export default function Home() {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const t = content[lang];
  
  const [sellerAddress, setSellerAddress] = useState("");
  const [polAmount, setPolAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<EscrowHistory[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load History & Stats
  useEffect(() => {
    const savedHistory = localStorage.getItem('escrow_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // --- LOGIC: HELPER FUNCTIONS ---
  const handleCopy = (): void => {
    if (!sellerAddress) return;
    navigator.clipboard.writeText(sellerAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanText = text.trim();
      if (isAddress(cleanText)) {
        setSellerAddress(cleanText);
      } else {
        MySwal.fire({ icon: 'info', text: lang === 'id' ? 'Alamat tidak valid' : 'Invalid address', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      }
    } catch (err) { console.error("Paste failed", err); }
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { fps: 20, qrbox: 250 }, false);
      scanner.render((text) => {
        const clean = text.includes(':') ? text.split(':')[1] : text;
        setSellerAddress(clean.trim());
        setShowScanner(false);
        scanner?.clear();
      }, () => {});
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [showScanner]);

  // --- LOGIC: CREATE ESCROW ---
  const createEscrow = async () => {  
    if (!sellerAddress || !polAmount) return MySwal.fire({ icon: 'warning', title: t.incompleteData });
    if (!isAddress(sellerAddress)) return MySwal.fire({ icon: 'error', title: 'Invalid Seller Address' });

    setIsLoading(true);
    MySwal.fire({
      title: lang === 'id' ? 'Langkah 1: Konfirmasi' : 'Step 1: Confirm',
      html: `<p class="text-sm text-slate-400 italic">${lang === 'id' ? 'Silakan setujui di MetaMask Anda...' : 'Please approve in your MetaMask...'}</p>`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const provider = new BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const factory = new ContractFactory(EscrowABI.abi, EscrowABI.bytecode, signer);
      
      const contract = await factory.deploy(sellerAddress, DEVELOPER_ADDRESS, {
        value: parseEther(polAmount)
      });

      MySwal.fire({
        title: lang === 'id' ? 'Langkah 2: Deploying' : 'Step 2: Deploying',
        html: `<p class="text-sm text-slate-400">${lang === 'id' ? 'Mengunci dana di Blockchain Polygon...' : 'Securing funds on Polygon...'}</p>`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      await contract.waitForDeployment();
      const deployedAddress = await contract.getAddress();

      // Save to local history
      const newEntry = { address: deployedAddress, seller: sellerAddress, amount: polAmount, date: new Date().toLocaleString() };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('escrow_history', JSON.stringify(updatedHistory));

      MySwal.fire({ icon: 'success', title: lang === 'id' ? 'Berhasil!' : 'Success!', text: `Contract: ${deployedAddress.slice(0,10)}...` });
      setSellerAddress(""); setPolAmount("");
    } catch (err) {
      const e = err as EthersError;
      MySwal.fire({ icon: 'error', title: 'Error', text: e.reason || e.message });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans">
      <Header lang={lang} setLang={setLang} t={t} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* --- STATS BAR (Social Proof) --- */}
        <div className="flex justify-center mb-12 opacity-80">
          <div className="flex flex-wrap items-center gap-6 px-6 py-3 glass rounded-2xl border border-white/5">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-400"/> <span className="text-[10px] uppercase font-bold tracking-widest">Verified Contract</span></div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2"><Lock size={16} className="text-blue-400"/> <span className="text-[10px] uppercase font-bold tracking-widest">Non-Custodial</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT: FORM --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 bg-brand-primary/10 w-40 h-40 rounded-full blur-[80px]"></div>
                
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <span className="p-3 bg-brand-primary/20 text-brand-primary rounded-2xl"><Lock size={20} /></span>
                  {t.formTitle}
                </h2>

                <div className="space-y-6">
                  {/* Seller Input with QR & Paste */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.labelSeller}</label>
                    <div className="relative mt-1">
                      <input 
                        type="text" value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)}
                        placeholder="0x..." className="w-full bg-brand-dark/50 border border-slate-700 rounded-2xl p-4 pr-28 focus:border-brand-primary outline-none text-sm font-mono transition-all"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button onClick={handlePaste} className="p-2 text-slate-400 hover:text-brand-secondary"><ClipboardPaste size={18} /></button>
                        <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-brand-secondary">{copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}</button>
                        <button onClick={() => setShowScanner(!showScanner)} className="p-2 text-slate-400 hover:text-brand-primary border-l border-slate-700 ml-1"><ScanLine size={18} /></button>
                      </div>
                    </div>
                    {showScanner && (
                      <div className="mt-4 p-2 bg-black rounded-2xl border border-brand-primary/30 overflow-hidden">
                        <div id="reader"></div>
                        <button onClick={() => setShowScanner(false)} className="w-full py-2 text-[10px] text-red-400 font-bold uppercase">Close Camera</button>
                      </div>
                    )}
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.labelAmount}</label>
                    <div className="relative mt-1">
                      <input 
                        type="number" value={polAmount} onChange={(e) => setPolAmount(e.target.value)}
                        placeholder="0.00" className="w-full bg-brand-dark/50 border border-slate-700 rounded-2xl p-4 text-3xl font-black outline-none focus:border-brand-primary transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-600">
                        <span className="text-sm font-black text-brand-secondary">POL</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 italic px-1">≈ Rp {(Number(polAmount) * HARGA_POL_SEKARANG).toLocaleString('id-ID')}</p>
                  </div>

                  <button 
                    onClick={createEscrow} disabled={isLoading}
                    className="w-full py-5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl font-black text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                    {isLoading ? (lang === 'id' ? "Memproses..." : "Processing...") : t.btnCreate}
                  </button>
                </div>
            </div>

            {/* --- LOCAL HISTORY TABLE --- */}
            {history.length > 0 && (
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <History size={20} className="text-brand-secondary" />
                  {lang === 'id' ? 'Transaksi Terakhir' : 'Recent Transactions'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b border-white/5">
                        <th className="pb-4 font-medium">Contract Address</th>
                        <th className="pb-4 text-right">Amount</th>
                        <th className="pb-4 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history.slice(0, 5).map((item, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <p className="font-mono text-[10px] text-slate-400">{item.address.slice(0,18)}...</p>
                            <p className="text-[10px] text-slate-600">{item.date}</p>
                          </td>
                          <td className="py-4 text-right font-bold text-brand-secondary">{item.amount} POL</td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => window.location.href = `/manage?addr=${item.address}`}
                              className="p-2 bg-white/5 rounded-lg hover:bg-brand-primary/20 transition-all text-slate-400 hover:text-white"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* --- RIGHT: INFO & FAQ --- */}
          <div className="lg:col-span-5 space-y-6">
            {/* Steps */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
               <h3 className="text-brand-secondary font-black uppercase text-xs tracking-widest mb-6">How it Works</h3>
               <div className="space-y-8">
                  <StepItem num="1" title={t.step1T} desc={t.step1D} />
                  <StepItem num="2" title={t.step2T} desc={t.step2D} />
                  <StepItem num="3" title={t.step3T} desc={t.step3D} />
               </div>
            </div>

            {/* FAQ Section */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <HelpCircle size={20} className="text-brand-primary" /> FAQ
                </h3>
                <div className="space-y-4">
                    {[
                        { 
                            q: lang === 'id' ? "Amankah uang saya?" : "Is my money safe?", 
                            a: lang === 'id' ? "Uang dikunci di Smart Contract Polygon yang open-source. Kami tidak memiliki akses manual ke dana Anda." : "Money is locked in an open-source Polygon Smart Contract. We have no manual access to your funds."
                        },
                        { 
                            q: lang === 'id' ? "Bagaimana cara refund?" : "How to refund?", 
                            a: lang === 'id' ? "Jika seller menyetujui atau melewati batas waktu tertentu, dana dapat ditarik kembali melalui menu Manage." : "If the seller agrees or after a specific timeout, funds can be reclaimed via the Manage menu."
                        }
                    ].map((faq, i) => (
                        <div key={i} className="border-b border-white/5 pb-4">
                            <button 
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex justify-between items-center text-left text-sm font-bold hover:text-brand-secondary transition-colors"
                            >
                                {faq.q} <ChevronDown size={14} className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq === i && <p className="text-xs text-slate-500 mt-2 leading-relaxed animate-in fade-in slide-in-from-top-1">{faq.a}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Links */}
            <div className="grid grid-cols-2 gap-4">
                <a href="#" className="glass p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-2 hover:bg-brand-primary/5 transition-all group">
                    <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary group-hover:scale-110 transition-transform"><MessageCircle size={20} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telegram</span>
                </a>
                <a href="#" className="glass p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-2 hover:bg-white/5 transition-all group">
                    <div className="p-3 bg-white/5 rounded-full text-white group-hover:scale-110 transition-transform"><Github size={20} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Source Code</span>
                </a>
            </div>
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}

function StepItem({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-10 h-10 rounded-2xl bg-brand-dark border border-white/10 flex items-center justify-center font-black group-hover:border-brand-primary transition-all shrink-0">
        {num}
      </div>
      <div>
        <h4 className="text-sm font-bold mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}