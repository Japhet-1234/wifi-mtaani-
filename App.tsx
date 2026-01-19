
import React, { useState } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { PaymentModal } from './components/PaymentModal';
import { SupportChat } from './components/SupportChat';
import { INITIAL_PKGS } from './constants';
import { Package } from './types';

export default function App() {
  const [view, setView] = useState<'home' | 'admin' | 'dashboard'>('home');
  const [selPkg, setSelPkg] = useState<Package | null>(null);
  const [vCode, setVCode] = useState('');
  const [phone, setPhone] = useState('');
  const [connected, setConnected] = useState(false);

  const activate = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = JSON.parse(localStorage.getItem('v_stock') || '[]');
    const v = stock.find((x: any) => x.code.toUpperCase() === vCode.trim().toUpperCase() && !x.used);
    if (v) {
      localStorage.setItem('v_stock', JSON.stringify(stock.map((x: any) => x.code === v.code ? {...x, used: true} : x)));
      setConnected(true);
    } else alert('Code imekosewa au tayari imeshatumika!');
  };

  const buy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selPkg) return;
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Nataka ${selPkg.name}. Namba: ${phone}`;
    setSelPkg(null);
    alert('Ombi lako limetumwa! Lipia sasa kupitia 0779231924.');
  };

  if (view === 'admin') return <AdminLogin onLogin={() => setView('dashboard')} onBack={() => setView('home')} />;
  if (view === 'dashboard') return <AdminDashboard onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <nav className="h-24 flex justify-between items-center px-8 md:px-16 border-b bg-white sticky top-0 z-50">
        <div className="font-black text-2xl tracking-tighter uppercase text-[#4E342E] flex items-center gap-3">
          <span className="w-10 h-10 bg-[#4E342E] text-white flex items-center justify-center rounded-2xl text-xs">W</span>
          WIFI MTAANI
        </div>
        <button onClick={() => setView('admin')} className="text-[10px] font-black uppercase text-[#4E342E]/30 hover:text-[#4E342E] tracking-[0.3em]">Portal Login</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-40 h-40 bg-green-500 text-white rounded-[3.5rem] flex items-center justify-center text-8xl mb-12 shadow-2xl animate-bounce">✓</div>
          <h1 className="text-6xl md:text-8xl font-black uppercase text-[#4E342E] mb-4">Uko Hewani!</h1>
          <button onClick={() => setConnected(false)} className="bg-[#4E342E] text-white px-20 py-6 rounded-[2.5rem] font-black uppercase tracking-widest">Rudi Home</button>
        </div>
      ) : (
        <main className="flex-1">
          <section className="bg-[#4E342E] text-white py-32 px-8 text-center">
            <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.8] mb-16">Internet<br/>Kwa Wote.</h1>
            <div className="max-w-xl mx-auto bg-white p-4 rounded-[4rem] shadow-2xl">
              <form onSubmit={activate} className="flex gap-3">
                <input className="flex-1 p-6 bg-transparent text-[#4E342E] font-black text-center uppercase outline-none text-2xl placeholder:text-gray-100" placeholder="WEKA CODE..." value={vCode} onChange={e => setVCode(e.target.value)} />
                <button className="bg-[#F57C00] text-white px-12 rounded-[3.5rem] font-black uppercase">GO</button>
              </form>
            </div>
          </section>

          <section className="py-32 px-8 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="group bg-white p-14 rounded-[5rem] border border-gray-100 shadow-2xl hover:scale-105 transition-all">
                  <h3 className="text-4xl font-black uppercase mb-6 text-[#4E342E]">{p.name}</h3>
                  <div className="flex items-baseline gap-2 mb-16">
                    <span className="text-8xl font-black text-[#4E342E]">{p.price}</span>
                    <span className="text-sm font-black opacity-10">TZS</span>
                  </div>
                  <button onClick={() => setSelPkg(p)} className="w-full bg-[#4E342E] text-white py-8 rounded-[3rem] font-black uppercase tracking-widest">NUNUA</button>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {selPkg && <PaymentModal pkg={selPkg} phone={phone} setPhone={setPhone} onBuy={buy} onClose={() => setSelPkg(null)} />}
      <SupportChat />
      <footer className="py-20 text-center border-t text-[10px] font-bold text-gray-300 uppercase tracking-widest">WIFI MTAANI • 2024</footer>
    </div>
  );
}
