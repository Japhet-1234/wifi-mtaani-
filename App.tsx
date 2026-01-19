
import React, { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim()) return;
    const stock = JSON.parse(localStorage.getItem('v_stock') || '[]');
    const v = stock.find((x: any) => x.code.toUpperCase() === vCode.trim().toUpperCase() && !x.used);
    if (v) {
      localStorage.setItem('v_stock', JSON.stringify(stock.map((x: any) => x.code === v.code ? {...x, used: true} : x)));
      setConnected(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Code haipo! Nunua vocha mpya kwa 0779231924.');
    }
  };

  const buy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selPkg || !phone) return;
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    
    const message = `Habari WIFI MTAANI, nahitaji ${selPkg.name}. Namba yangu: ${phone}`;
    window.location.href = `sms:0779231924?body=${encodeURIComponent(message)}`;
    
    setSelPkg(null);
    alert('Ombi lako limepokelewa! Lipia kupitia M-PESA kwenda 0779231924 upate code yako sasa.');
  };

  if (view === 'admin') return <AdminLogin onLogin={() => setView('dashboard')} onBack={() => setView('home')} />;
  if (view === 'dashboard') return <AdminDashboard onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-mtaaniAccent selection:text-white">
      {/* Navigation */}
      <nav className={`h-20 flex justify-between items-center px-6 md:px-16 fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md h-16' : 'bg-transparent'}`}>
        <div className="font-black text-xl md:text-2xl tracking-tighter uppercase text-mtaaniBrown flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-mtaaniBrown text-white flex items-center justify-center rounded-xl text-xs shadow-lg">W</div>
          <span>WIFI MTAANI</span>
        </div>
        <button onClick={() => setView('admin')} className="text-[10px] font-black uppercase text-mtaaniBrown/30 hover:text-mtaaniAccent tracking-widest">Admin</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-700 bg-white">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-green-500 text-white rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl animate-bounce">📶</div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-mtaaniBrown mt-8 mb-4 leading-none">Uko Hewani!</h1>
          <p className="text-gray-400 font-bold mb-12 uppercase text-xs tracking-[0.5em]">Furahia Internet ya Kasi Mtaani Kwako</p>
          <button onClick={() => setConnected(false)} className="bg-mtaaniBrown text-white px-12 py-5 rounded-2xl font-black uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all tracking-widest text-sm">Zima Connection</button>
        </div>
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-40 pb-32 md:pt-64 md:pb-48 px-6 bg-mtaaniBrown text-white overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="inline-block px-4 py-1 rounded-full bg-mtaaniAccent text-[10px] font-black uppercase tracking-widest mb-8 shadow-lg">
                📍 Mtaani Kwako
              </div>
              <h1 className="text-6xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.85] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                Internet <br /> Ya <span className="text-mtaaniAccent">Mtaa.</span>
              </h1>
              
              <div className="max-w-2xl bg-white p-3 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <form onSubmit={activate} className="flex flex-col md:flex-row gap-2">
                  <input 
                    className="flex-1 p-5 bg-transparent text-mtaaniBrown font-black text-center md:text-left uppercase outline-none text-2xl md:text-3xl placeholder:text-gray-200" 
                    placeholder="WEKA CODE HAPA..." 
                    value={vCode} 
                    onChange={e => setVCode(e.target.value)} 
                  />
                  <button className="bg-mtaaniAccent text-white px-10 py-5 md:py-0 rounded-[2rem] font-black uppercase shadow-xl hover:bg-black transition-all text-xl tracking-widest">Washa</button>
                </form>
              </div>
              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 ml-4">Ingiza code ya vocha yako kuanza kutumia internet</p>
            </div>
            {/* Background elements */}
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-mtaaniAccent/20 rounded-full blur-[120px]"></div>
          </section>

          {/* Pricing Section */}
          <section className="py-32 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-mtaaniBrown">Vifurushi Vya Mtaa</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.5em] mt-4">Pata vocha yako sasa kwa bei nafuu</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {INITIAL_PKGS.map(p => (
                  <div key={p.id} className="group bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:translate-y-[-10px] transition-all duration-500">
                    <div className="bg-mtaaniGrey w-fit px-4 py-1 rounded-full mb-8">
                      <p className="text-[9px] font-black uppercase text-mtaaniBrown/40 tracking-widest">{p.duration}</p>
                    </div>
                    <h3 className="text-3xl font-black uppercase mb-4 text-mtaaniBrown tracking-tighter">{p.name}</h3>
                    <p className="text-[11px] text-gray-400 font-bold mb-12 uppercase tracking-widest">{p.desc}</p>
                    <div className="flex items-baseline gap-2 mb-12">
                      <span className="text-7xl font-black text-mtaaniBrown tracking-tighter">{p.price}</span>
                      <span className="text-sm font-black opacity-10">TZS</span>
                    </div>
                    <button 
                      onClick={() => setSelPkg(p)} 
                      className="w-full bg-mtaaniBrown text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-mtaaniAccent transition-all"
                    >
                      Nunua Vocha
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Payment Modal */}
      {selPkg && <PaymentModal pkg={selPkg} phone={phone} setPhone={setPhone} onBuy={buy} onClose={() => setSelPkg(null)} />}
      
      {/* AI Support Chat */}
      <SupportChat />

      {/* Footer */}
      <footer className="py-20 bg-mtaaniBrown text-white/30 text-center px-6">
        <div className="font-black text-white text-2xl tracking-tighter mb-4 uppercase">WIFI MTAANI</div>
        <p className="text-[9px] font-bold uppercase tracking-[0.6em] mb-12">Unganishwa na Internet Bora Mtaani Kwako</p>
        <p className="text-[8px] font-bold uppercase opacity-30">&copy; 2024 WIFI MTAANI • Huduma ya Internet Mitaani.</p>
      </footer>
    </div>
  );
}
