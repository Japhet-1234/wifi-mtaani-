
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- DATA YA VIFURUSHI ---
const PACKAGES = [
  { id: '1', name: 'Muda mfupi', duration: 'Masaa 6', price: 500, desc: 'Internet ya kasi kwa muda wa masaa 6.' },
  { id: '2', name: 'Siku Nzima', duration: 'Masaa 24', price: 1000, desc: 'Bila kikomo kwa siku nzima (Masaa 24).' },
  { id: '3', name: 'Wiki Nzima', duration: 'Siku 7', price: 6000, desc: 'Baki hewani kwa wiki nzima bila kikomo.' }
];

// --- MFUMO WA AI ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getAIResponse = async (history, prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { 
          role: 'user', 
          parts: [{ 
            text: "Wewe ni msaidizi wa WIFI MTAANI. Jibu kwa Kiswahili fasaha. " +
                  "Elekeza watu kulipia 0779231924 (M-PESA/TIGO-PESA) na watatumiwa code kupitia SMS." 
          }] 
        },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });
    return response.text;
  } catch (e) {
    return "Pole, msaidizi anapata hitilafu. Pigia 0779231924 kwa msaada.";
  }
};

// --- COMPONENT: CHAT YA MSAADA ---
const Chat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'model', content: 'Habari! Mimi ni msaidizi wa WIFI MTAANI. Unahitaji msaada wowote leo?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scroll = useRef(null);

  useEffect(() => scroll.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input; setInput('');
    setMsgs(p => [...p, { role: 'user', content: userMsg }]);
    setLoading(true);
    const res = await getAIResponse(msgs, userMsg);
    setMsgs(p => [...p, { role: 'model', content: res }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {open ? (
        <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-mtaaniBrown/10 animate-in slide-in-from-bottom-10">
          <div className="bg-mtaaniBrown p-4 text-white flex justify-between items-center font-black">
            <span className="text-xs tracking-widest">WIFI MSAADA</span>
            <button onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 no-scrollbar">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-mtaaniBrown text-white rounded-br-none' : 'bg-white border shadow-sm rounded-bl-none'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] font-black animate-pulse uppercase">Anajibu...</div>}
            <div ref={scroll} />
          </div>
          <form onSubmit={onSend} className="p-3 bg-white border-t flex gap-2">
            <input className="flex-1 p-2 bg-gray-100 rounded-xl text-xs outline-none" value={input} onChange={e=>setInput(e.target.value)} placeholder="Andika hapa..." />
            <button className="bg-mtaaniBrown text-white p-2 rounded-xl">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)} className="w-14 h-14 bg-mtaaniBrown text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform">💬</button>
      )}
    </div>
  );
};

// --- COMPONENT: ADMIN SECTION ---
const Admin = ({ onBack }) => {
  const [vouchers, setVouchers] = useState(JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState(JSON.parse(localStorage.getItem('v_reqs') || '[]'));
  const [pass, setPass] = useState('');
  const [auth, setAuth] = useState(false);

  const login = (e) => { e.preventDefault(); if(pass.toLowerCase() === 'mtaani') setAuth(true); else alert('Siri imekosewa!'); };

  const generate = (pid) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nv = { code, pid, used: false };
    const updated = [nv, ...vouchers];
    setVouchers(updated);
    localStorage.setItem('v_stock', JSON.stringify(updated));
    alert('Voucher Imepata Code: ' + code);
  };

  const approve = (req) => {
    const unused = vouchers.find(v => v.pid === req.pid && !v.used);
    const code = unused ? unused.code : Math.random().toString(36).substr(2, 6).toUpperCase();
    const updatedR = requests.map(r => r.id === req.id ? {...r, status: 'DONE', code} : r);
    setRequests(updatedR);
    localStorage.setItem('v_reqs', JSON.stringify(updatedR));
    window.location.href = `sms:${req.phone}?body=WIFI MTAANI: Karibu! Code yako ni ${code}. Furahia Internet.`;
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mtaaniBrown">
        <form onSubmit={login} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
          <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter">Admin Login</h2>
          <input type="password" placeholder="PASSWORD" className="w-full p-5 bg-gray-50 rounded-2xl text-center text-3xl font-black mb-6 outline-none border-2 focus:border-mtaaniBrown" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="w-full bg-mtaaniBrown text-white py-4 rounded-2xl font-black uppercase shadow-xl">Ingia</button>
          <button type="button" onClick={onBack} className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Rudi Nyuma</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-mtaaniBrown p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Mtaani Admin</h1>
          <button onClick={onBack} className="bg-mtaaniGrey px-6 py-2 rounded-xl font-black text-xs">EXIT</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <h2 className="text-xl font-black uppercase">Maombi ya Wateja</h2>
            <div className="bg-mtaaniGrey rounded-3xl p-4 space-y-4">
              {requests.map((r, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-black">{r.phone}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{PACKAGES.find(p=>p.id===r.pid)?.name}</p>
                  </div>
                  {r.status === 'PENDING' ? (
                    <button onClick={()=>approve(r)} className="bg-mtaaniBrown text-white px-6 py-2 rounded-xl font-black text-[10px]">TUMA CODE</button>
                  ) : (
                    <span className="text-green-500 font-black text-[10px]">IMETUMWA</span>
                  )}
                </div>
              ))}
              {requests.length === 0 && <p className="text-center py-10 text-gray-400 font-bold uppercase text-xs">Hakuna maombi.</p>}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-xl font-black uppercase">Voucher Stock</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {PACKAGES.map(p => (
                <button key={p.id} onClick={()=>generate(p.id)} className="bg-mtaaniBrown text-white p-4 rounded-2xl text-[10px] font-black uppercase leading-none">
                  + {p.name}
                </button>
              ))}
            </div>
            <div className="bg-white border-2 border-mtaaniGrey rounded-3xl h-96 overflow-y-auto no-scrollbar">
               <table className="w-full text-left">
                 <thead className="bg-mtaaniGrey text-[10px] font-black uppercase"><tr className="border-b"><th className="p-4">CODE</th><th className="p-4">HALI</th></tr></thead>
                 <tbody className="divide-y">
                   {vouchers.map((v, i) => (
                     <tr key={i}><td className="p-4 font-mono font-black">{v.code}</td><td className="p-4 text-[10px] font-black">{v.used ? '❌' : '✅'}</td></tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
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
    const found = stock.find(v => v.code.toUpperCase() === vCode.toUpperCase() && !v.used);
    if (found) {
      const updated = stock.map(v => v.code.toUpperCase() === vCode.toUpperCase() ? {...v, used: true} : v);
      localStorage.setItem('v_stock', JSON.stringify(updated));
      setConnected(true);
    } else {
      alert('Code haipo au imeshatumika!');
    }
  };

  const buy = (e) => {
    e.preventDefault();
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Habari, nataka ${selPkg.name} ya TZS ${selPkg.price}. Namba yangu ya malipo ni ${phone}.`;
    setSelPkg(null);
    alert('Ombi lako limepokelewa. Lipa kupitia namba uliyopewa kisha subiri SMS.');
  };

  if (view === 'admin') return <Admin onBack={()=>setView('home')} />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="h-16 flex justify-between items-center px-6 md:px-12 bg-white sticky top-0 z-50">
        <div className="font-black text-xl tracking-tighter uppercase">WIFI MTAANI</div>
        <button onClick={()=>setView('admin')} className="text-[10px] font-black uppercase text-gray-400 hover:text-mtaaniBrown">Staff Only</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mb-8 animate-bounce">✓</div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Uko Hewani!</h1>
          <p className="text-xl font-bold text-gray-400 mb-10 max-w-sm">Hongera! Sasa unaweza kutumia internet ya kasi. Furahia!</p>
          <button onClick={()=>setConnected(false)} className="bg-mtaaniBrown text-white px-10 py-4 rounded-full font-black uppercase shadow-xl">Rudi Nyuma</button>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="bg-mtaaniBrown text-white py-20 px-6 md:px-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">Internet<br/>Mtaani Kwako</h1>
              
              <div className="max-w-md mx-auto bg-white/10 p-8 rounded-[3rem] border border-white/20 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">Weka Vocha Code Hapa</p>
                <form onSubmit={activate} className="flex gap-2">
                  <input className="flex-1 p-4 bg-white rounded-2xl text-mtaaniBrown font-black text-center uppercase outline-none" placeholder="CODE..." value={vCode} onChange={e=>setVCode(e.target.value)} />
                  <button className="bg-mtaaniAccent text-white px-6 rounded-2xl font-black uppercase">Ingia</button>
                </form>
              </div>
            </div>
          </section>

          {/* Packages */}
          <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <h2 className="text-center font-black text-4xl uppercase tracking-tighter mb-20">Vifurushi vya Leo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {PACKAGES.map(p => (
                <div key={p.id} className="bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-mtaaniBrown flex flex-col group">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">{p.duration}</p>
                    <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">{p.name}</h3>
                    <p className="text-sm text-gray-400 font-bold mb-10 leading-relaxed">{p.desc}</p>
                    <div className="text-5xl font-black text-mtaaniBrown mb-10">{p.price.toLocaleString()}<span className="text-sm opacity-30"> TZS</span></div>
                  </div>
                  <button onClick={()=>setSelPkg(p)} className="w-full bg-mtaaniBrown text-white py-5 rounded-3xl font-black uppercase shadow-lg group-hover:bg-mtaaniAccent transition-colors">NUNUA SASA</button>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="py-20 px-6 text-center border-t border-mtaaniBrown/5">
            <p className="text-6xl font-black uppercase text-mtaaniBrown/5 mb-8 select-none">WIFI MTAANI</p>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.3em]">© 2024 Hotspot Kitaa Services</p>
          </footer>
        </>
      )}

      {/* Payment Modal */}
      {selPkg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[2000] backdrop-blur-md">
          <form onSubmit={buy} className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Lipia {selPkg.name}</h2>
            <p className="text-orange-500 font-black text-3xl mb-8">{selPkg.price} TZS</p>
            
            <div className="bg-mtaaniGrey p-6 rounded-3xl mb-8">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Lipa Kwenda Namba:</p>
              <p className="text-2xl font-black">0779231924</p>
              <p className="text-[10px] font-bold text-mtaaniBrown/40 uppercase">WIFI MTAANI SERVICES</p>
            </div>

            <input required type="tel" placeholder="Namba Yako ya Simu" className="w-full p-4 bg-gray-50 rounded-2xl text-center font-black mb-6 border-2 focus:border-mtaaniBrown" value={phone} onChange={e=>setPhone(e.target.value)} />
            
            <button className="w-full bg-mtaaniBrown text-white py-5 rounded-3xl font-black uppercase shadow-xl mb-4">OMBA VOCHA (SMS)</button>
            <button type="button" onClick={()=>setSelPkg(null)} className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ghairi</button>
          </form>
        </div>
      )}

      <Chat />
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
