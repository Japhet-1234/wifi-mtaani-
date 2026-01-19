
import React, { useState } from 'react';

export const AdminLogin = ({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) => {
  const [pass, setPass] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.toLowerCase() === 'mtaani') onLogin();
    else alert('Neno la siri limekosewa!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#4E342E]">
      <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-[#4E342E]/5 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">🔑</div>
        <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-[#4E342E]">Admin Access</h2>
        <input 
          autoFocus 
          type="password" 
          placeholder="PASSWORD" 
          className="w-full p-5 bg-gray-50 rounded-2xl text-center text-xl font-bold mb-6 outline-none border focus:ring-2 ring-[#F57C00]" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
        />
        <button className="w-full bg-[#4E342E] text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all">Ingia</button>
        <button type="button" onClick={onBack} className="mt-8 text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Rudi Nyuma</button>
      </form>
    </div>
  );
};
