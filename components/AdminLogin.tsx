
import React, { useState } from 'react';

export const AdminLogin = ({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) => {
  const [pass, setPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation ya haraka sana ya auth
    setTimeout(() => {
      if (pass.toLowerCase() === 'mtaani') {
        onLogin();
      } else {
        alert('Neno la siri limekosewa!');
        setIsSubmitting(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mtaaniBrown relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mtaaniAccent/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>

      <form onSubmit={handleSubmit} className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl w-full max-w-sm text-center relative z-10 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-mtaaniBrown/5 rounded-full flex items-center justify-center mx-auto mb-10 text-4xl shadow-inner">🔒</div>
        <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter text-mtaaniBrown leading-none">Admin <br/> Portal</h2>
        
        <div className="space-y-4 mb-10">
          <p className="text-[10px] font-black uppercase text-left ml-4 opacity-30 tracking-widest">Neno la Siri</p>
          <input 
            autoFocus 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full p-6 bg-gray-50 rounded-2xl text-center text-xl font-bold mb-2 outline-none border-2 border-transparent focus:border-mtaaniAccent transition-all shadow-inner" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
          />
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full bg-mtaaniBrown text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-black active:scale-95 transition-all tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? 'Inapakia...' : 'Ingia Dashibodi'}
        </button>

        <button type="button" onClick={onBack} className="mt-10 text-[10px] font-black opacity-20 uppercase tracking-[0.4em] hover:text-red-500 hover:opacity-100 transition-all">Rudi Nyuma</button>
      </form>
    </div>
  );
};
