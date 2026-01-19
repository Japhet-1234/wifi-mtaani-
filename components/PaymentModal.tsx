
import React from 'react';
import { Package } from '../types';

export const PaymentModal = ({ pkg, phone, setPhone, onBuy, onClose }: { pkg: Package, phone: string, setPhone: (v: string) => void, onBuy: (e: React.FormEvent) => void, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-[#4E342E]/95 backdrop-blur-3xl flex items-center justify-center p-8 z-[4000] animate-in fade-in">
      <form onSubmit={onBuy} className="bg-white p-14 rounded-[5rem] w-full max-w-lg text-center shadow-2xl">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-10 text-[#4E342E]">Lipia {pkg.name}</h2>
        <div className="bg-gray-50 p-10 rounded-[4rem] mb-12 border-2 border-dashed border-[#4E342E]/10">
          <p className="text-[10px] font-black uppercase opacity-20 mb-3 tracking-widest">TUMA {pkg.price} TZS KWA:</p>
          <p className="text-4xl font-black text-[#4E342E] tracking-tighter">0779231924</p>
          <p className="text-[9px] font-black opacity-30 mt-3 uppercase tracking-widest">WIFI MTAANI SERVICES</p>
        </div>
        <input 
          required 
          type="tel" 
          placeholder="NAMBA YAKO YA SIMU" 
          className="w-full p-6 bg-gray-50 rounded-[2.5rem] text-center font-black outline-none border-2 focus:border-[#4E342E] text-2xl mb-10" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
        />
        <button className="w-full bg-[#4E342E] text-white py-8 rounded-[3rem] font-black uppercase shadow-2xl mb-8 tracking-widest hover:bg-black transition-all">PATA VOUCHER</button>
        <button type="button" onClick={onClose} className="text-[10px] font-black opacity-20 uppercase tracking-widest hover:text-red-500">Ghairi</button>
      </form>
    </div>
  );
};
