
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Constants
const INITIAL_PKGS = [
  { id: '1', name: 'Masaa 6', duration: '6 Hours', price: 500, desc: 'Internet ya kasi kwa mzunguko mmoja.' },
  { id: '2', name: 'Siku Nzima', duration: '24 Hours', price: 1000, desc: 'Bila kikomo kwa siku nzima.' },
  { id: '3', name: 'Wiki Nzima', duration: '7 Days', price: 6000, desc: 'Baki hewani wiki nzima.' }
];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// AI Assistant Logic
const askGemini = async (history, prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: "Wewe ni msaidizi wa WIFI MTAANI. Jibu kwa Kiswahili kifupi. Elekeza watu kulipia 0779231924 kupitia M-PESA." }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });
    return response.text;
  } catch (e) { return "Samahani, jaribu tena baadaye."; }
};

// --- ADMIN PANEL COMPONENT ---
const AdminPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  
  // Data State
  const [vouchers, setVouchers] = useState(() => JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('v_reqs') || '[]'));
  
  const login = (e) => {
    e.preventDefault();
    if (pass.toLowerCase() === 'mtaani') setAuth(true);
    else alert('Siri imekosewa!');
  };

  const genVoucher = (pid) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nv = { code, pid, used: false, date: new Date().toLocaleString() };
    const updated = [nv, ...vouchers];
    setVouchers(updated);
    localStorage.setItem('v_stock', JSON.stringify(updated));
  };

  const approve = (req) => {
    const v = vouchers.find(x => x.pid === req.pid && !x.used);
    const code = v ? v.code : Math.random().toString(36).substr(2, 6).toUpperCase();
    const updatedR = requests.map(r => r.id === req.id ? {...r, status: 'DONE', code} : r);
    setRequests(updatedR);
    localStorage.setItem('v_reqs', JSON.stringify(updatedR));
    window.location.href = `sms:${req.phone}?body=WIFI MTAANI: Code yako ni ${code}. Karibu!`;
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mtaaniBrown">
        <form onSubmit={login} className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">Staff Portal</h2>
          <input autoFocus type="password" placeholder="PASSWORD" className="w-full p-4 bg-gray-100 rounded-2xl text-center text-2xl font-black mb-6 outline-none" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="w-full bg-mtaaniBrown text-white py-4 rounded-2xl font-black uppercase">Ingia</button>
          <button type="button" onClick={onBack} className="mt-6 text-[10px] font-black opacity-30 uppercase">Rudi</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* SIDEBAR */}
      <nav className="w-20 md:w-64 bg-mtaaniBrown text-white flex flex-col sidebar-transition">
        <div className="p-6 font-black text-xl border-b border-white/5 hidden md:block uppercase tracking-tighter">WIFI Admin</div>
        <div className="p-6 font-black text-center border-b border-white/5 md:hidden">W</div>
        
        <div className="flex-1 p-3 space-y-2 mt-4">
          {[
            { id: 'vouchers', icon: '🎟️', label: 'Vouchers' },
            { id: 'history', icon: '📜', label: 'Kumbukumbu' },
            { id: 'router', icon: '📡', label: 'Router' },
            { id: 'config', icon: '⚙️', label: 'Config' }
          ].map(item => (
            <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-white text-mtaaniBrown shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:inline font-black uppercase text-[10px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onBack} className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 border-t border-white/5">Exit</button>
      </nav>

      {/* CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto no-scrollbar">
        {activeTab === 'vouchers' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Usimamizi wa Vocha</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-mtaaniGrey p-6 rounded-[2.5rem] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black opacity-30 uppercase">{p.name}</p>
                    <p className="text-2xl font-black">{vouchers.filter(v=>v.pid===p.id && !v.used).length}</p>
                  </div>
                  <button onClick={()=>genVoucher(p.id)} className="w-10 h-10 bg-mtaaniBrown text-white rounded-full font-black text-xl">+</button>
                </div>
              ))}
            </div>
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-mtaaniGrey text-[10px] font-black uppercase">
                  <tr><th className="p-4">CODE</th><th className="p-4">PAKETI</th><th className="p-4">HALI</th></tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {vouchers.slice(0, 10).map((v, i) => (
                    <tr key={i}><td className="p-4 font-mono font-black">{v.code}</td><td className="p-4 uppercase">{INITIAL_PKGS.find(p=>p.id===v.pid)?.name}</td><td className="p-4">{v.used ? '❌' : '✅'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Miamala ya Wateja</h1>
            <div className="space-y-4">
              {requests.map((r, i) => (
                <div key={i} className="bg-mtaaniGrey p-6 rounded-3xl flex justify-between items-center">
                  <div>
                    <p className="font-black">{r.phone}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{INITIAL_PKGS.find(p=>p.id===r.pid)?.name}</p>
                  </div>
                  {r.status === 'PENDING' ? (
                    <button onClick={()=>approve(r)} className="bg-mtaaniAccent text-white px-6 py-2 rounded-xl font-black text-[10px]">TUMA CODE</button>
                  ) : (
                    <span className="text-green-500 font-black text-[10px] uppercase">Done</span>
                  )}
                </div>
              ))}
              {requests.length === 0 && <p className="text-center py-20 text-gray-300 font-black uppercase text-xs tracking-widest">Hakuna miamala.</p>}
            </div>
          </div>
        )}

        {activeTab === 'router' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Hali ya Router</h1>
            <div className="bg-mtaaniBrown text-white p-10 rounded-[3rem] flex flex-col items-center text-center max-w-sm">
               <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mb-6 animate-pulse">📡</div>
               <p className="text-4xl font-black tracking-tighter">ONLINE</p>
               <p className="text-xs opacity-40 uppercase font-black mt-2 tracking-widest">Signal Strong (98%)</p>
               <div className="grid grid-cols-2 gap-4 w-full mt-10">
                 <div className="bg-white/5 p-4 rounded-2xl"><p className="text-lg font-black">12</p><p className="text-[8px] uppercase opacity-40">Connected</p></div>
                 <div className="bg-white/5 p-4 rounded-2xl"><p className="text-lg font-black">42 Mbps</p><p className="text-[8px] uppercase opacity-40">Speed</p></div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-in fade-in duration-300 max-w-sm">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Configurations</h1>
            <div className="space-y-6">
              <div className="p-6 bg-mtaaniGrey rounded-3xl">
                <p className="text-[10px] font-black uppercase opacity-30 mb-4">Pricing Control</p>
                {INITIAL_PKGS.map(p => (
                  <div key={p.id} className="flex justify-between items-center border-b border-white py-2">
                    <span className="text-xs font-black uppercase">{p.name}</span>
                    <span className="font-black text-sm">{p.price} TZS</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-red-100 text-red-500 rounded-2xl font-black uppercase text-[10px]" onClick={()=>localStorage.clear()}>Reset Database</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUPPORT CHAT ---
const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'model', content: 'Mambo! Karibu WIFI MTAANI. Una shida gani?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scroll = useRef(null);

  useEffect(() => scroll.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userText = input; setInput('');
    setMsgs(p => [...p, { role: 'user', content: userText }]);
    setLoading(true);
    const res = await askGemini(msgs, userText);
    setMsgs(p => [...p, { role: 'model', content: res }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {open ? (
        <div className="bg-white w-80 h-96 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border animate-in slide-in-from-bottom-5">
          <div className="bg-mtaaniBrown p-4 text-white flex justify-between items-center font-black text-xs uppercase tracking-widest">
            <span>Msaidizi AI</span>
            <button onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 no-scrollbar text-xs">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-mtaaniBrown text-white rounded-br-none' : 'bg-white shadow-sm rounded-bl-none'}`}>{m.content}</div>
              </div>
            ))}
            <div ref={scroll} />
          </div>
          <form onSubmit={send} className="p-3 bg-white border-t flex gap-2">
            <input className="flex-1 p-2 bg-gray-100 rounded-xl text-xs outline-none" placeholder="Uliza swali..." value={input} onChange={e=>setInput(e.target.value)} />
            <button className="bg-mtaaniBrown text-white px-4 rounded-xl font-black">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)} className="w-14 h-14 bg-mtaaniBrown text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform">💬</button>
      )}
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');
  const [selPkg, setSelPkg] = useState(null);
  const [vCode, setVCode] = useState('');
  const [phone, setPhone] = useState('');
  const [connected, setConnected] = useState(false);

  const activate = (e) => {
    e.preventDefault();
    const stock = JSON.parse(localStorage.getItem('v_stock') || '[]');
    const v = stock.find(x => x.code.toUpperCase() === vCode.toUpperCase() && !x.used);
    if (v) {
      localStorage.setItem('v_stock', JSON.stringify(stock.map(x => x.code === v.code ? {...x, used: true} : x)));
      setConnected(true);
    } else alert('Code batili!');
  };

  const buy = (e) => {
    e.preventDefault();
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Nataka ${selPkg.name}. Namba: ${phone}`;
    setSelPkg(null);
    alert('Ombi limetumwa! Lipia 0779231924 sasa.');
  };

  if (view === 'admin') return <AdminPanel onBack={()=>setView('home')} />;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <nav className="h-16 flex justify-between items-center px-6 md:px-12 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="font-black text-xl tracking-tighter uppercase text-mtaaniBrown">WIFI MTAANI</div>
        <button onClick={()=>setView('admin')} className="text-[10px] font-black uppercase opacity-30 hover:opacity-100">Admin</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mb-8 shadow-xl animate-bounce">✓</div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-mtaaniBrown mb-4">Uko Hewani!</h1>
          <p className="text-gray-400 font-bold mb-10 uppercase text-xs tracking-widest">Enjoy High Speed Internet</p>
          <button onClick={()=>setConnected(false)} className="bg-mtaaniBrown text-white px-10 py-4 rounded-full font-black uppercase shadow-lg">Rudi Nyuma</button>
        </div>
      ) : (
        <main className="flex-1">
          <section className="bg-mtaaniBrown text-white py-20 px-6 text-center">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">Internet<br/>Kwa Wote.</h1>
            <div className="max-w-md mx-auto bg-white p-2 rounded-[2rem] shadow-2xl">
              <form onSubmit={activate} className="flex gap-1">
                <input className="flex-1 p-4 bg-transparent text-mtaaniBrown font-black text-center uppercase outline-none text-xl" placeholder="WEKA CODE" value={vCode} onChange={e=>setVCode(e.target.value)} />
                <button className="bg-mtaaniBrown text-white px-8 rounded-[1.8rem] font-black uppercase tracking-tighter">GO</button>
              </form>
            </div>
          </section>

          <section className="py-20 px-6 max-w-6xl mx-auto">
            <h2 className="text-center font-black text-3xl uppercase tracking-tighter mb-16">Vifurushi vya Leo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-[10px] font-black uppercase opacity-30 mb-2">{p.duration}</p>
                  <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter">{p.name}</h3>
                  <p className="text-6xl font-black text-mtaaniBrown mb-10 tracking-tighter">{p.price}<span className="text-xs opacity-20 ml-1">TZS</span></p>
                  <button onClick={()=>setSelPkg(p)} className="w-full bg-mtaaniBrown text-white py-5 rounded-3xl font-black uppercase shadow-lg hover:bg-mtaaniAccent transition-colors">NUNUA</button>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="py-10 text-center text-gray-300 font-black text-[10px] uppercase tracking-widest">© 2024 Hotspot Kitaa</footer>

      {selPkg && (
        <div className="fixed inset-0 bg-mtaaniBrown/95 backdrop-blur-md flex items-center justify-center p-6 z-[2000] animate-in fade-in">
          <form onSubmit={buy} className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">Lipia {selPkg.name}</h2>
            <p className="text-4xl font-black text-mtaaniAccent mb-8">{selPkg.price} TZS</p>
            <div className="bg-mtaaniGrey p-6 rounded-3xl mb-8">
              <p className="text-[10px] font-black uppercase opacity-40 mb-1">TUMA MALIPO:</p>
              <p className="text-2xl font-black">0779231924</p>
            </div>
            <input required type="tel" placeholder="Namba ya Malipo" className="w-full p-4 bg-gray-50 rounded-2xl text-center font-black mb-6 outline-none border" value={phone} onChange={e=>setPhone(e.target.value)} />
            <button className="w-full bg-mtaaniBrown text-white py-5 rounded-2xl font-black uppercase">OMBA VOCHA</button>
            <button type="button" onClick={()=>setSelPkg(null)} className="mt-4 text-[10px] font-black opacity-30 uppercase">Ghairi</button>
          </form>
        </div>
      )}

      <SupportChat />
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
