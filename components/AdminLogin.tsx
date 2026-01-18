
import React, { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'mtaani') {
      onLoginSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-6 bg-mtaaniGrey/30 min-h-full">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(93,64,55,0.1)] overflow-hidden p-12 text-center animate-in zoom-in-95 duration-500 border border-mtaaniBrown/5">
        <div className="w-24 h-24 bg-mtaaniBrown text-mtaaniGrey rounded-[2rem] flex items-center justify-center mx-auto mb-10 rotate-6 shadow-2xl">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h2 className="text-4xl font-black text-mtaaniBrown mb-3 tracking-tighter">Usimamizi</h2>
        <p className="text-gray-400 font-bold text-sm mb-12 uppercase tracking-widest">Jina la siri: mtaani</p>
        
        <form onSubmit={handleLogin} className="space-y-10">
          <div className="relative">
            <input 
              type="password" 
              placeholder="NENO LA SIRI"
              autoFocus
              className={`w-full text-center text-3xl font-black p-8 bg-gray-50 border-4 rounded-[2rem] outline-none transition-all tracking-[0.2em] ${error ? 'border-red-500 bg-red-50 animate-shake' : 'border-transparent focus:border-mtaaniBrown focus:bg-white'}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <p className="absolute -bottom-8 left-0 right-0 text-red-500 text-[10px] font-black uppercase tracking-widest">Neno la siri sio sahihi!</p>}
          </div>

          <button type="submit" className="w-full bg-mtaaniBrown text-mtaaniGrey py-6 rounded-[2rem] font-black text-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-2xl">
            INGIA DASHBOARD
          </button>
        </form>
        
        <button onClick={onBack} className="mt-12 text-xs font-black text-gray-400 hover:text-mtaaniBrown transition-colors uppercase tracking-[0.3em]">
          GHAIRI NA RUDI NYUMA
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
