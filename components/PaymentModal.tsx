
import React, { useState } from 'react';
import { WiFiPackage, Transaction } from '../types';

interface PaymentModalProps {
  pkg: WiFiPackage;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ pkg, onClose }) => {
  const [phone, setPhone] = useState('');
  const [requested, setRequested] = useState(false);

  const handleRequestVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: Transaction = {
      id: 'REQ' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      phone,
      packageId: pkg.id,
      amount: pkg.price,
      timestamp: new Date().toISOString(),
      status: 'pending_request'
    };
    
    const existing = JSON.parse(localStorage.getItem('mtaani_transactions') || '[]');
    localStorage.setItem('mtaani_transactions', JSON.stringify([newRequest, ...existing]));
    
    const message = `Habari WIFI MTAANI. Nimefanya malipo ya ${pkg.price} TZS kwa ajili ya ${pkg.name}. Namba yangu ya malipo ni ${phone}. Tafadhali nitumie vocha.`;
    const smsUrl = `sms:0779231924?body=${encodeURIComponent(message)}`;
    
    setRequested(true);
    window.location.href = smsUrl;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-mtaaniBrown/10">
        <div className="bg-mtaaniBrown p-8 text-mtaaniGrey flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">Malipo ya Vocha</h3>
            <p className="text-xs opacity-70 font-bold uppercase tracking-widest mt-1">{pkg.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-8">
          {!requested ? (
            <div className="space-y-6">
              <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl text-center">
                <p className="text-orange-800 font-black text-lg leading-tight uppercase">
                  Lipia kwanza kwa simu kwenye namba:
                  <span className="text-orange-600 block text-3xl mt-1 tracking-tighter">0779231924</span>
                </p>
                <p className="text-[10px] font-black text-orange-400 uppercase mt-2">Jina: WIFI MTAANI SERVICES</p>
              </div>

              <div className="bg-mtaaniGrey/20 p-6 rounded-3xl space-y-4">
                <div className="flex gap-4">
                  <span className="w-6 h-6 bg-mtaaniBrown text-mtaaniGrey rounded-full flex items-center justify-center text-xs font-black shrink-0">1</span>
                  <p className="text-sm font-bold text-gray-700">Tuma <b>TZS {pkg.price.toLocaleString()}</b> kwenda namba hiyo.</p>
                </div>
                
                <div className="flex gap-4">
                  <span className="w-6 h-6 bg-mtaaniBrown text-mtaaniGrey rounded-full flex items-center justify-center text-xs font-black shrink-0">2</span>
                  <p className="text-sm font-bold text-gray-700">Weka namba yako hapa chini na bonyeza kitufe:</p>
                </div>
              </div>

              <form onSubmit={handleRequestVoucher} className="space-y-4">
                <input 
                  type="tel" 
                  required
                  placeholder="07XXXXXXXX"
                  className="w-full p-5 text-center text-xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-mtaaniBrown outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <button 
                  type="submit"
                  className="w-full bg-mtaaniBrown text-mtaaniGrey py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl uppercase"
                >
                  Omba Vocha kwa SMS
                </button>
                <p className="text-[10px] text-center font-bold uppercase opacity-40">
                  Utapokea code mara baada ya malipo kuhakikiwa
                </p>
              </form>
            </div>
          ) : (
            <div className="text-center py-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h4 className="text-3xl font-black text-mtaaniBrown mb-4 uppercase tracking-tighter">Ombi Limetumwa!</h4>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">Admin amepokea ombi lako. Tafadhali hakikisha umetuma ujumbe wa SMS uliotokea kwenye simu yako ili upate vocha yako kwa haraka.</p>
              
              <button 
                onClick={onClose}
                className="w-full bg-mtaaniBrown text-mtaaniGrey py-4 rounded-2xl font-black text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                NIMEFAHAMU, SAWA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
