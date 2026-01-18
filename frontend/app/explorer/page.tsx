"use client";

import React, { useState } from 'react';
import { Search, ShieldCheck, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { ethers, BrowserProvider, Contract, formatEther } from 'ethers';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EscrowABI from '../../constants/Escrow.json';
import { content } from '../../constants/languages';

// --- DEFINISI TIPE DATA (INTERFACES) ---
interface ContractStatusData {
    buyer: string;
    seller: string;
    amount: string;
    status: 'Completed' | 'Refunded' | 'Active';
}

interface EthersError {
    reason?: string;
    message?: string;
}

export default function CheckContract() {
    const [lang, setLang] = useState<'en' | 'id'>('id');
    const t = content[lang]; // Ambil data translasi sesuai bahasa yang aktif
    const [address, setAddress] = useState<string>("");
    const [contractData, setContractData] = useState<ContractStatusData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const fetchContractStatus = async () => {
        // Validasi dasar alamat blockchain
        if (!ethers.isAddress(address)) {
            setError("Alamat kontrak tidak valid!");
            setContractData(null);
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (!window.ethereum) {
                throw new Error("Provider tidak ditemukan. Instal MetaMask!");
            }

            const provider = new BrowserProvider(window.ethereum);
            const contract = new Contract(address, EscrowABI.abi, provider);

            // Ambil data dari Smart Contract secara paralel
            // Kita asumsikan fungsi-fungsi ini ada di EscrowABI Anda
            const [buyer, seller, balance, isCompleted, isRefunded] = await Promise.all([
                contract.buyer() as Promise<string>,
                contract.seller() as Promise<string>,
                provider.getBalance(address) as Promise<bigint>,
                contract.isCompleted() as Promise<boolean>,
                contract.isRefunded() as Promise<boolean>
            ]);

            setContractData({
                buyer,
                seller,
                amount: formatEther(balance),
                status: isCompleted ? "Completed" : isRefunded ? "Refunded" : "Active"
            });

        } catch (err) {
            const ethErr = err as EthersError;
            setError(ethErr.reason || ethErr.message || "Gagal memuat data kontrak.");
            setContractData(null);
            console.error("Error fetching contract:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white">
            {/* Pastikan komponen Header & Footer menerima props sesuai definisinya */}
            <Header
                lang={lang}
                setLang={setLang}
                t={t}
            />

            <main className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
                        <Search className="text-brand-primary" /> Escrow Explorer
                    </h1>
                    <p className="text-slate-400 text-sm">Verifikasi status keamanan dana di blockchain secara real-time.</p>
                </div>

                {/* Search Bar */}
                <div className="glass p-2 rounded-3xl border border-white/5 flex gap-2 mb-10 shadow-2xl">
                    <input
                        type="text"
                        placeholder="Masukkan Alamat Kontrak (0x...)"
                        value={address}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                        className="flex-grow bg-transparent border-none outline-none p-4 font-mono text-sm"
                    />
                    <button
                        onClick={fetchContractStatus}
                        disabled={loading}
                        className="bg-brand-primary hover:bg-brand-secondary px-8 rounded-2xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Cek Status"}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Result Display */}
                {contractData && (
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${contractData.status === 'Active' ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                                <span className="font-black uppercase tracking-widest text-sm">{contractData.status}</span>
                            </div>
                            <ShieldCheck className="text-brand-secondary" size={24} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoCard icon={<User size={16} />} label="Buyer (Pemilik Dana)" value={contractData.buyer} />
                            <InfoCard icon={<ArrowRight size={16} />} label="Seller (Penerima)" value={contractData.seller} />
                            <div className="md:col-span-2 bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Dana Terkunci</p>
                                <p className="text-4xl font-black text-brand-secondary">
                                    {contractData.amount} <span className="text-lg">POL</span>
                                </p>
                            </div>
                        </div>

                        {contractData.status === "Active" && (
                            <button
                                onClick={() => window.location.href = `/manage?addr=${address}`}
                                className="w-full mt-8 py-4 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded-2xl text-brand-primary text-sm font-bold transition-all"
                            >
                                Buka di Panel Manajemen ➔
                            </button>
                        )}
                    </div>
                )}
            </main>
            <Footer lang="id" />
        </div>
    );
}

// --- KOMPONEN PENDUKUNG ---
interface InfoCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                {icon} {label}
            </p>
            <p className="font-mono text-[11px] md:text-[12px] bg-black/30 p-3 rounded-xl border border-white/5 break-all">
                {value}
            </p>
        </div>
    );
}