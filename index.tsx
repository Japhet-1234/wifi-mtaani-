
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- DATA YA VIFURUSHI (Hii inaweza kubadilishwa kwenye Config) ---
const INITIAL_PACKAGES = [
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
            text: "Wewe ni msaidizi wa WIFI MTAANI. Jibu kwa Kiswahili. " +
                  "Elekeza watu kulipia 0779231924 na watatumiwa code kupitia SMS." 
          }] 
        },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });
    return response.text;
  } catch (e) {
    return "Pole, msaidizi anapata hitilafu. Pigia 0779231924.";
  }
};

// --- COMPONENT: ADMIN DASHBOARD ---
const Admin = ({ onBack }) => {
  const [vouchers, setVouchers] = useState(JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState(JSON.parse(localStorage.getItem('v_reqs') || '[]'));
  const [packages, setPackages] = useState(JSON.parse(localStorage.getItem('v_pkgs') || JSON.stringify(INITIAL_PACKAGES)));
  const [activeTab, setActiveTab] = useState('vouchers');
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');

  const login = (e) => { e.preventDefault(); if(pass.toLowerCase() === 'mtaani') setAuth(true); else alert('Password sio sahihi!'); };

  const generateVoucher = (pid) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nv = { code, pid, used: false, createdAt: new Date().toLocaleString() };
    const updated = [nv, ...vouchers];
    setVouchers(updated);
    localStorage.setItem('v_stock', JSON.stringify(updated));
  };

  const approveRequest = (req) => {
    const unused = vouchers.find(v => v.pid === req.pid && !v.used);
    const code = unused ? unused.code : Math.random().toString(36).substr(2, 6).toUpperCase();
    const updatedR = requests.map(r => r.id === req.id ? {...r, status: 'DONE', code, completedAt: new Date().toLocaleString()} : r);
    setRequests(updatedR);
    localStorage.setItem('v_reqs', JSON.stringify(updatedR));
    window.location.href = `sms:${req.phone}?body=WIFI MTAANI: Karibu! Code yako ni ${code}.`;
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mtaaniBrown">
        <form onSubmit={login} className="glass p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
          <h2 className="text-3xl font-black mb-10 text-white uppercase tracking-tighter">Admin Portal</h2>
          <input type="password" placeholder="PASSWORD" className="w-full p-5 bg-white rounded-2xl text-center text-3xl font-black mb-6 outline-none shadow-inner" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="w-full bg-white text-mtaaniBrown py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-mtaaniAccent hover:text-white transition-all">Ingia</button>
          <button type="button" onClick={onBack} className="mt-8 text-xs font-bold text-white/50 uppercase tracking-widest">Rudi Nyuma</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-mtaaniGrey">
      {/* Sidebar ya Pembeni */}
      <aside className="w-20 md:w-64 bg-mtaaniBrown text-white flex flex-col transition-all">
        <div className="p-6 font-black text-xl tracking-tighter border-b border-white/10 hidden md:block">ADMIN DASHBOARD</div>
        <div className="p-6 font-black text-xl text-center border-b border-white/10 md:hidden">W</div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={()=>setActiveTab('vouchers')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab==='vouchers' ? 'bg-white text-mtaaniBrown shadow-xl' : 'hover:bg-white/10'}`}>
            <span className="text-xl">🎟️</span><span className="hidden md:inline font-black uppercase text-xs">Vouchers</span>
          </button>
          <button onClick={()=>setActiveTab('history')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab==='history' ? 'bg-white text-mtaaniBrown shadow-xl' : 'hover:bg-white/10'}`}>
            <span className="text-xl">📜</span><span className="hidden md:inline font-black uppercase text-xs">Kumbukumbu</span>
          </button>
          <button onClick={()=>setActiveTab('router')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab==='router' ? 'bg-white text-mtaaniBrown shadow-xl' : 'hover:bg-white/10'}`}>
            <span className="text-xl">📡</span><span className="hidden md:inline font-black uppercase text-xs">Router Status</span>
          </button>
          <button onClick={()=>setActiveTab('config')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab==='config' ? 'bg-white text-mtaaniBrown shadow-xl' : 'hover:bg-white/10'}`}>
            <span className="text-xl">⚙️</span><span className="hidden md:inline font-black uppercase text-xs">Config</span>
          </button>
        </nav>

        <button onClick={onBack} className="p-6 border-t border-white/10 hover:bg-red-500 transition-colors font-black text-xs uppercase tracking-widest">Exit</button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        {activeTab === 'vouchers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10">Usimamizi wa Vocha</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {packages.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-3xl shadow-lg border-b-4 border-mtaaniBrown flex justify-between items-center">
                  <div>
                    <h3 className="font-black uppercase text-xs opacity-40">{p.name}</h3>
                    <p className="text-2xl font-black">{vouchers.filter(v => v.pid === p.id && !v.used).length} <span className="text-xs opacity-30">STOKI</span></p>
                  </div>
                  <button onClick={()=>generateVoucher(p.id)} className="w-12 h-12 bg-mtaaniBrown text-white rounded-full font-black text-xl hover:scale-110 transition-transform">+</button>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-mtaaniBrown text-white text-[10px] font-black uppercase">
                  <tr><th className="p-6">Code</th><th className="p-6">Paketi</th><th className="p-6">Tarehe</th><th className="p-6">Hali</th></tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {vouchers.slice(0, 10).map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-6 font-mono font-black">{v.code}</td>
                      <td className="p-6 font-bold uppercase text-[10px]">{packages.find(p=>p.id===v.pid)?.name}</td>
                      <td className="p-6 text-gray-400">{v.createdAt}</td>
                      <td className="p-6">{v.used ? <span className="text-red-500 font-black text-xs">IMETUMIKA</span> : <span className="text-green-500 font-black text-xs">AVAILABLE</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10">Kumbukumbu ya Miamala</h1>
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-mtaaniBrown text-white text-[10px] font-black uppercase">
                  <tr><th className="p-6">Mteja</th><th className="p-6">Paketi</th><th className="p-6">Code</th><th className="p-6">Hali</th></tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {requests.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-6 font-black">{r.phone}</td>
                      <td className="p-6 font-bold text-gray-400">{packages.find(p=>p.id===r.pid)?.name}</td>
                      <td className="p-6 font-mono font-black">{r.code || '---'}</td>
                      <td className="p-6">
                        {r.status === 'PENDING' ? (
                          <button onClick={()=>approveRequest(r)} className="bg-mtaaniAccent text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Approve</button>
                        ) : (
                          <span className="text-green-500 font-black text-[10px] uppercase">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && <tr><td colSpan="4" className="p-20 text-center text-gray-300 font-black uppercase">Hakuna miamala bado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'router' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10">Hali ya Router</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl space-y-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Router #1 (Main)</h2>
                  <span className="px-4 py-1 bg-green-100 text-green-600 rounded-full font-black text-[10px]">ONLINE</span>
                </div>
                <div className="space-y-4 pt-6">
                  <div className="flex justify-between text-sm border-b pb-2"><span className="text-gray-400 font-bold uppercase">Signal:</span><span className="font-black text-green-500">Strong (98%)</span></div>
                  <div className="flex justify-between text-sm border-b pb-2"><span className="text-gray-400 font-bold uppercase">Active Clients:</span><span className="font-black">12 People</span></div>
                  <div className="flex justify-between text-sm border-b pb-2"><span className="text-gray-400 font-bold uppercase">Up-time:</span><span className="font-black">4 Days, 12 Hrs</span></div>
                </div>
              </div>
              <div className="bg-mtaaniBrown text-white p-10 rounded-[3rem] shadow-xl flex flex-col justify-center items-center text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">Data Usage Today</p>
                <p className="text-6xl font-black tracking-tighter mb-2">14.8 GB</p>
                <p className="text-xs font-bold opacity-30">PUMPING AT 50MBPS</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10">Mipangilio</h1>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl space-y-10">
              <div className="space-y-4">
                <h3 className="font-black uppercase text-xs text-gray-400 tracking-widest">Pricing Control</h3>
                {packages.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                    <span className="flex-1 font-black text-sm uppercase">{p.name}</span>
                    <input className="w-24 p-2 bg-white rounded-xl text-center font-black border" value={p.price} readOnly />
                    <span className="text-[10px] font-black opacity-30">TZS</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-10 border-t">
                <h3 className="font-black uppercase text-xs text-gray-400 tracking-widest">Admin Security</h3>
                <button className="w-full bg-mtaaniBrown text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-mtaaniAccent transition-colors">Badilisha Password</button>
                <button className="w-full bg-red-100 text-red-500 py-4 rounded-2xl font-black uppercase text-xs transition-colors" onClick={()=>{localStorage.clear(); window.location.reload();}}>Futa Kila Kitu (Reset)</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- COMPONENT: CHAT YA MSAADA (GEMINI) ---
const ChatWindow = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'model', content: 'Habari! Karibu WIFI MTAANI. Una swali lolote kuhusu vifurushi au malipo?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  const send = async (e) => {
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
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-mtaaniBrown/10 animate-in slide-in-from-bottom-10">
          <div className="bg-mtaaniBrown p-6 text-white flex justify-between items-center font-black">
            <span className="text-xs tracking-widest uppercase">Msaidizi wa Mtaani</span>
            <button onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 no-scrollbar">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-mtaaniBrown text-white rounded-br-none shadow-lg' : 'bg-white border shadow-sm rounded-bl-none'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] font-black animate-pulse uppercase opacity-30">Anajibu...</div>}
            <div ref={scrollRef} />
          </div>
          <form onSubmit={send} className="p-4 bg-white border-t flex gap-2">
            <input className="flex-1 p-3 bg-gray-100 rounded-2xl text-xs outline-none focus:ring-2 ring-mtaaniBrown/20" value={input} onChange={e=>setInput(e.target.value)} placeholder="Uliza chochote..." />
            <button className="bg-mtaaniBrown text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)} className="w-16 h-16 bg-mtaaniBrown text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-all border-4 border-white">💬</button>
      )}
    </div>
  );
};

// --- APP KUU ---
const App = () => {
  const [view, setView] = useState('home');
  const [selPkg, setSelPkg] = useState(null);
  const [vCode, setVCode] = useState('');
  const [phone, setPhone] = useState('');
  const [connected, setConnected] = useState(false);
  const [packages] = useState(JSON.parse(localStorage.getItem('v_pkgs') || JSON.stringify(INITIAL_PACKAGES)));

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
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING', timestamp: new Date().toLocaleString() };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Nataka ${selPkg.name} ya TZS ${selPkg.price}. Lipia kwa namba hii ${phone}.`;
    setSelPkg(null);
    alert('Ombi lako limetumwa. Subiri SMS yenye Code baada ya kulipia.');
  };

  if (view === 'admin') return <Admin onBack={()=>setView('home')} />;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="h-20 flex justify-between items-center px-6 md:px-12 bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="font-black text-2xl tracking-tighter uppercase text-mtaaniBrown">WIFI MTAANI</div>
        <button onClick={()=>setView('admin')} className="text-[10px] font-black uppercase bg-mtaaniBrown text-white px-4 py-2 rounded-full shadow-lg hover:bg-mtaaniAccent transition-colors">Admin Login</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-700">
          <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mb-10 shadow-2xl animate-bounce">✓</div>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 text-mtaaniBrown">Uko Hewani!</h1>
          <p className="text-xl font-bold text-gray-400 mb-12 max-w-sm">Hongera! Internet imewashwa kwenye kifaa chako. Furahia!</p>
          <button onClick={()=>setConnected(false)} className="bg-mtaaniBrown text-white px-12 py-5 rounded-full font-black uppercase shadow-2xl hover:scale-105 transition-transform">Rudi Nyuma</button>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="bg-mtaaniBrown text-white py-24 px-6 md:px-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none overflow-hidden text-[15rem] font-black leading-none break-all">WIFIMTAANIWIFIMTAANI</div>
            <div className="max-w-4xl mx-auto relative z-10">
              <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-12">Internet<br/>Kwa Wote.</h1>
              
              <div className="max-w-md mx-auto bg-white p-2 rounded-[2.5rem] shadow-2xl border-4 border-white/20">
                <form onSubmit={activate} className="flex gap-2">
                  <input className="flex-1 p-5 bg-transparent rounded-[2rem] text-mtaaniBrown font-black text-center uppercase outline-none text-xl" placeholder="WEKA CODE..." value={vCode} onChange={e=>setVCode(e.target.value)} />
                  <button className="bg-mtaaniBrown text-white px-8 rounded-[2rem] font-black uppercase shadow-xl hover:bg-mtaaniAccent transition-colors">GO</button>
                </form>
              </div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Weka code hapo juu kuanza kutumia</p>
            </div>
          </section>

          {/* Packages */}
          <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <h2 className="text-center font-black text-4xl uppercase tracking-tighter mb-20 text-mtaaniBrown">Chagua Kifurushi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {packages.map(p => (
                <div key={p.id} className="bg-white p-12 rounded-[4rem] shadow-2xl hover:shadow-mtaaniBrown/10 transition-all border border-gray-100 flex flex-col group relative overflow-hidden">
                  <div className="flex-1 relative z-10">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{p.duration}</p>
                    <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter text-mtaaniBrown">{p.name}</h3>
                    <p className="text-sm text-gray-400 font-bold mb-12 leading-relaxed">{p.desc}</p>
                    <div className="text-6xl font-black text-mtaaniBrown mb-12 tracking-tighter">{p.price.toLocaleString()}<span className="text-xs opacity-20 ml-1">TZS</span></div>
                  </div>
                  <button onClick={()=>setSelPkg(p)} className="w-full bg-mtaaniBrown text-white py-6 rounded-[2rem] font-black uppercase shadow-xl group-hover:bg-mtaaniAccent transition-all relative z-10">NUNUA SASA</button>
                  <div className="absolute -bottom-10 -right-10 text-[10rem] font-black text-gray-50 pointer-events-none group-hover:text-mtaaniBrown/5 transition-colors">{p.id}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="py-20 px-6 text-center border-t border-gray-100">
            <div className="font-black text-xs text-mtaaniBrown/30 uppercase tracking-[0.5em] mb-4">Mtaani Internet Services</div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">© 2024 Hotspot Kitaa • Powered by Gemini AI</p>
          </footer>
        </>
      )}

      {/* Payment Modal */}
      {selPkg && (
        <div className="fixed inset-0 bg-mtaaniBrown/90 flex items-center justify-center p-6 z-[2000] backdrop-blur-xl animate-in fade-in">
          <form onSubmit={buy} className="bg-white p-12 rounded-[4rem] w-full max-w-md text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-mtaaniBrown">Lipia {selPkg.name}</h2>
            <p className="text-mtaaniAccent font-black text-5xl mb-10 tracking-tighter">{selPkg.price.toLocaleString()} TZS</p>
            
            <div className="bg-mtaaniGrey p-8 rounded-[2.5rem] mb-10 border-2 border-dashed border-mtaaniBrown/20">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Namba ya Malipo (M-PESA/TIGO):</p>
              <p className="text-3xl font-black text-mtaaniBrown tracking-tighter">0779231924</p>
              <p className="text-[10px] font-bold text-mtaaniBrown/40 uppercase mt-1">WIFI MTAANI SERVICES</p>
            </div>

            <input required type="tel" placeholder="Namba Yako (07xx xxx xxx)" className="w-full p-5 bg-gray-100 rounded-[2rem] text-center font-black mb-6 border-2 border-transparent focus:border-mtaaniBrown outline-none text-xl" value={phone} onChange={e=>setPhone(e.target.value)} />
            
            <button className="w-full bg-mtaaniBrown text-white py-6 rounded-[2rem] font-black uppercase shadow-2xl mb-6 hover:bg-mtaaniAccent transition-colors">OMBA VOCHA (SMS)</button>
            <button type="button" onClick={()=>setSelPkg(null)} className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-mtaaniBrown transition-colors">Ghairi Malipo</button>
          </form>
        </div>
      )}

      <ChatWindow />
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
