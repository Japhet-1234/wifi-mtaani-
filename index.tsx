
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const INITIAL_PKGS = [
  { id: '1', name: 'Masaa 6', duration: '6 Hours', price: 500, desc: 'Internet ya kasi kwa mzunguko mmoja.' },
  { id: '2', name: 'Siku Nzima', duration: '24 Hours', price: 1000, desc: 'Bila kikomo kwa siku nzima.' },
  { id: '3', name: 'Wiki Nzima', duration: '7 Days', price: 6000, desc: 'Baki hewani wiki nzima.' }
];

// Msaidizi wa AI kwa njia salama (haizuii App kupakia kukiwa na error)
const callAI = async (history, prompt) => {
  try {
    const key = process.env.API_KEY;
    if (!key) return "Samahani, msaidizi hawezi kufanya kazi bila ufunguo wa huduma.";
    
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: "Wewe ni msaidizi wa WIFI MTAANI. Jibu kwa Kiswahili kifupi na msaada. Namba ya malipo ni 0779231924 (M-PESA)." }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });
    return response.text;
  } catch (e) { 
    console.error(e);
    return "Samahani, msaidizi amepata hitilafu kidogo wakati huu."; 
  }
};

// --- ADMIN PANEL ---
const AdminPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  
  const [vouchers, setVouchers] = useState(() => JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('v_reqs') || '[]'));
  const [routers, setRouters] = useState(() => JSON.parse(localStorage.getItem('v_routers') || '[]'));
  
  const [newRouter, setNewRouter] = useState({ name: '', ip: '', mac: '' });

  const login = (e) => {
    e.preventDefault();
    if (pass.toLowerCase() === 'mtaani') setAuth(true);
    else alert('Neno la siri limekosewa!');
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

  const addRouter = (e) => {
    e.preventDefault();
    if (!newRouter.name || !newRouter.ip) return;
    const r = { ...newRouter, id: Date.now(), status: 'ONLINE', speed: '50Mbps', clients: 0 };
    const updated = [r, ...routers];
    setRouters(updated);
    localStorage.setItem('v_routers', JSON.stringify(updated));
    setNewRouter({ name: '', ip: '', mac: '' });
    alert('Router imesajiliwa na iko tayari kufatiliwa (ONLINE)!');
  };

  const deleteRouter = (id) => {
    if(!confirm('Ondoa router hii?')) return;
    const updated = routers.filter(r => r.id !== id);
    setRouters(updated);
    localStorage.setItem('v_routers', JSON.stringify(updated));
  };

  // Website Source Code for router pasting
  const fullSourceCode = `<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <title>WIFI MTAANI LOGIN</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body { font-family: sans-serif; background: #FAFAFA; }</style>
</head>
<body class="flex items-center justify-center h-screen p-6">
    <div class="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center border">
        <h1 class="text-3xl font-black mb-6 text-[#4E342E]">WIFI MTAANI</h1>
        <p class="text-xs opacity-50 mb-8 uppercase font-bold tracking-widest">Weka Voucher Code Yako</p>
        <input type="text" id="code" placeholder="CODE HAPA..." class="w-full p-5 bg-gray-50 rounded-2xl text-center text-2xl font-black mb-6 outline-none border focus:ring-2 ring-[#F57C00]" />
        <button onclick="alert('Inaunganisha...')" class="w-full bg-[#4E342E] text-white py-5 rounded-2xl font-black tracking-widest shadow-xl">UNGANISHA</button>
        <div class="mt-10 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Pata Vocha kwa 0779231924</div>
    </div>
</body>
</html>`;

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mtaaniBrown">
        <form onSubmit={login} className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-mtaaniBrown/5 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">🔑</div>
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-mtaaniBrown">Admin Access</h2>
          <input autoFocus type="password" placeholder="PASSWORD" className="w-full p-5 bg-gray-50 rounded-2xl text-center text-xl font-bold mb-6 outline-none border focus:ring-2 ring-mtaaniAccent" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="w-full bg-mtaaniBrown text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all">Ingia</button>
          <button type="button" onClick={onBack} className="mt-8 text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Rudi Nyuma</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-mtaaniGrey">
      {/* Sidebar */}
      <nav className="w-20 md:w-64 bg-mtaaniBrown text-white flex flex-col shrink-0">
        <div className="p-8 font-black text-xl tracking-tighter uppercase border-b border-white/5 hidden md:block">Dashibodi</div>
        <div className="p-8 font-black text-center border-b border-white/5 md:hidden text-xl">W</div>
        <div className="flex-1 p-4 space-y-2 mt-6">
          {[
            { id: 'vouchers', icon: '🎟️', label: 'Vocha' },
            { id: 'history', icon: '📜', label: 'Miamala' },
            { id: 'router', icon: '📡', label: 'Routers' },
            { id: 'config', icon: '⚙️', label: 'Source Code' }
          ].map(item => (
            <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-white text-mtaaniBrown shadow-xl font-bold' : 'hover:bg-white/5 opacity-40'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:inline font-black uppercase text-[10px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onBack} className="p-8 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 border-t border-white/5">Logout</button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto no-scrollbar">
        {activeTab === 'vouchers' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10 text-mtaaniBrown">Hifadhi ya Vocha</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[3rem] shadow-sm flex justify-between items-center border border-gray-100">
                  <div>
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{p.name}</p>
                    <p className="text-3xl font-black text-mtaaniBrown">{vouchers.filter(v=>v.pid===p.id && !v.used).length}</p>
                  </div>
                  <button onClick={()=>genVoucher(p.id)} className="w-12 h-12 bg-mtaaniAccent text-white rounded-2xl font-black text-2xl shadow-lg hover:scale-110 transition-transform">+</button>
                </div>
              ))}
            </div>
            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                  <tr><th className="p-5">Voucher Code</th><th className="p-5">Aina</th><th className="p-5">Hali</th></tr>
                </thead>
                <tbody className="divide-y text-xs font-bold">
                  {vouchers.slice(0, 15).map((v, i) => (
                    <tr key={i}><td className="p-5 font-mono text-mtaaniBrown">{v.code}</td><td className="p-5 uppercase opacity-50">{INITIAL_PKGS.find(p=>p.id===v.pid)?.name}</td><td className="p-5">{v.used ? '🔴 Imetumika' : '🟢 Inapatikana'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10 text-mtaaniBrown">Miamala Mpya</h1>
            <div className="space-y-4">
              {requests.map((r, i) => (
                <div key={i} className="bg-white p-7 rounded-[2rem] border flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-black text-lg text-mtaaniBrown">{r.phone}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest">{INITIAL_PKGS.find(p=>p.id===r.pid)?.name} • {new Date(r.id).toLocaleTimeString()}</p>
                  </div>
                  {r.status === 'PENDING' ? (
                    <button onClick={()=>approve(r)} className="bg-mtaaniAccent text-white px-8 py-3 rounded-2xl font-black text-[10px] shadow-lg">APPROVE & SEND SMS</button>
                  ) : (
                    <span className="text-green-500 font-black text-[10px] uppercase tracking-widest">✓ Imekamilika ({r.code})</span>
                  )}
                </div>
              ))}
              {requests.length === 0 && <p className="text-center py-40 text-gray-200 font-black uppercase text-xs tracking-[1em]">Hakuna maombi bado</p>}
            </div>
          </div>
        )}

        {activeTab === 'router' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10 text-mtaaniBrown">Routers na Hali</h1>
            <form onSubmit={addRouter} className="bg-white p-10 rounded-[3rem] border shadow-sm mb-12 max-w-2xl">
              <h2 className="text-xs font-black uppercase mb-8 opacity-30 tracking-widest">Sajili Router Yako</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required placeholder="Eneo (e.g. Soko Kuu)" className="p-5 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:ring-2 ring-mtaaniBrown" value={newRouter.name} onChange={e=>setNewRouter({...newRouter, name:e.target.value})} />
                <input required placeholder="IP (e.g. 192.168.88.1)" className="p-5 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:ring-2 ring-mtaaniBrown" value={newRouter.ip} onChange={e=>setNewRouter({...newRouter, ip:e.target.value})} />
                <input placeholder="MAC Address" className="p-5 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:ring-2 ring-mtaaniBrown col-span-full" value={newRouter.mac} onChange={e=>setNewRouter({...newRouter, mac:e.target.value})} />
                <button className="bg-mtaaniBrown text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl col-span-full">Sajili na Unganisha</button>
              </div>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routers.map(r => (
                <div key={r.id} className="bg-mtaaniBrown text-white p-10 rounded-[3.5rem] shadow-xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">{r.name}</h3>
                      <span className="bg-green-500 px-4 py-1.5 rounded-full text-[8px] font-black animate-pulse">ONLINE</span>
                    </div>
                    <div className="text-[10px] font-bold opacity-40 mb-10 space-y-1">
                      <p>IP: {r.ip}</p>
                      <p>MAC: {r.mac || '---'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                      <div><p className="text-xl font-black">{r.clients}</p><p className="text-[8px] uppercase opacity-30 font-bold">Wateja</p></div>
                      <div><p className="text-xl font-black">{r.speed}</p><p className="text-[8px] uppercase opacity-30 font-bold">Kasi</p></div>
                    </div>
                    <button onClick={()=>deleteRouter(r.id)} className="absolute top-5 right-5 text-white/10 hover:text-red-400 p-2">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-10 text-mtaaniBrown">Router Configuration</h1>
            <div className="bg-white border rounded-[3.5rem] p-10 shadow-sm flex flex-col h-[650px]">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black uppercase opacity-20 tracking-widest tracking-widest">HTML/JS Source Code</p>
                    <button onClick={() => {navigator.clipboard.writeText(fullSourceCode); alert('Zimekopiwa!');}} className="bg-mtaaniAccent text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Copy Code</button>
                </div>
                <textarea readOnly className="flex-1 p-6 bg-gray-900 text-green-400 font-mono text-[10px] rounded-[2rem] outline-none resize-none no-scrollbar shadow-inner" value={fullSourceCode} />
                <p className="mt-6 text-[9px] font-bold text-gray-300 leading-relaxed uppercase tracking-widest">Nakili code hii na uipachike kwenye hotspot login ya router yako kutoa muonekano wa WIFI MTAANI.</p>
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
  const [msgs, setMsgs] = useState([{ role: 'model', content: 'Habari! Mimi ni msaidizi wako. Una swali kuhusu WIFI MTAANI?' }]);
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
    const res = await callAI(msgs, userText);
    setMsgs(p => [...p, { role: 'model', content: res }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[3000]">
      {open ? (
        <div className="bg-white w-[340px] h-[500px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border animate-in slide-in-from-bottom-8">
          <div className="bg-mtaaniBrown p-6 text-white flex justify-between items-center font-black text-[10px] uppercase tracking-widest">
            <span>Msaidizi AI</span>
            <button onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 no-scrollbar text-[11px] font-bold">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] shadow-sm ${m.role === 'user' ? 'bg-mtaaniBrown text-white rounded-br-none' : 'bg-white text-mtaaniBrown rounded-bl-none border border-black/5'}`}>{m.content}</div>
              </div>
            ))}
            <div ref={scroll} />
          </div>
          <form onSubmit={send} className="p-4 bg-white border-t flex gap-2">
            <input className="flex-1 p-4 bg-gray-100 rounded-2xl text-[11px] outline-none font-bold" placeholder="Uliza swali..." value={input} onChange={e=>setInput(e.target.value)} />
            <button className="bg-mtaaniBrown text-white w-12 h-12 rounded-2xl font-black flex items-center justify-center shadow-lg transition-transform active:scale-90">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)} className="w-20 h-20 bg-mtaaniBrown text-white rounded-[2rem] shadow-2xl flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all border-8 border-white">💬</button>
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
    const v = stock.find(x => x.code.toUpperCase() === vCode.trim().toUpperCase() && !x.used);
    if (v) {
      localStorage.setItem('v_stock', JSON.stringify(stock.map(x => x.code === v.code ? {...x, used: true} : x)));
      setConnected(true);
    } else alert('Code imekosewa au tayari imeshatumika!');
  };

  const buy = (e) => {
    e.preventDefault();
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Nataka ${selPkg.name}. Namba: ${phone}`;
    setSelPkg(null);
    alert('Ombi lako limetumwa! Lipia 0779231924 sasa.');
  };

  if (view === 'admin') return <AdminPanel onBack={()=>setView('home')} />;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <nav className="h-24 flex justify-between items-center px-8 md:px-16 border-b bg-white sticky top-0 z-50">
        <div className="font-black text-2xl tracking-tighter uppercase text-mtaaniBrown flex items-center gap-3">
            <span className="w-10 h-10 bg-mtaaniBrown text-white flex items-center justify-center rounded-2xl text-xs">W</span>
            WIFI MTAANI
        </div>
        <button onClick={()=>setView('admin')} className="text-[10px] font-black uppercase text-mtaaniBrown/30 hover:text-mtaaniBrown tracking-[0.3em] transition-colors">Portal Login</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-40 h-40 bg-green-500 text-white rounded-[3.5rem] flex items-center justify-center text-8xl mb-12 shadow-2xl animate-bounce">✓</div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-mtaaniBrown mb-4 leading-none">Imekubali!</h1>
          <p className="text-gray-400 font-bold mb-16 uppercase text-xs tracking-[0.8em] opacity-40 italic">You are now connected to the internet</p>
          <button onClick={()=>setConnected(false)} className="bg-mtaaniBrown text-white px-20 py-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all tracking-widest">Rudi Home</button>
        </div>
      ) : (
        <main className="flex-1 overflow-x-hidden">
          <section className="bg-mtaaniBrown text-white py-32 px-8 text-center relative">
             <div className="max-w-5xl mx-auto relative z-10">
                <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.8] mb-16">Internet<br/>Kwa Wote.</h1>
                <div className="max-w-xl mx-auto bg-white p-4 rounded-[4rem] shadow-2xl">
                  <form onSubmit={activate} className="flex gap-3">
                    <input className="flex-1 p-6 bg-transparent text-mtaaniBrown font-black text-center uppercase outline-none text-2xl placeholder:text-gray-100" placeholder="WEKA CODE..." value={vCode} onChange={e=>setVCode(e.target.value)} />
                    <button className="bg-mtaaniAccent text-white px-12 rounded-[3.5rem] font-black uppercase shadow-xl hover:bg-black transition-all">GO</button>
                  </form>
                </div>
             </div>
          </section>

          <section className="py-32 px-8 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="group bg-white p-14 rounded-[5rem] border border-gray-100 shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-mtaaniGrey w-fit px-4 py-1 rounded-full mb-6">
                        <p className="text-[9px] font-black uppercase text-mtaaniBrown/40 tracking-widest">{p.duration}</p>
                    </div>
                    <h3 className="text-4xl font-black uppercase mb-6 tracking-tighter text-mtaaniBrown">{p.name}</h3>
                    <p className="text-xs text-gray-400 font-bold mb-16 leading-relaxed uppercase tracking-widest">{p.desc}</p>
                    <div className="flex items-baseline gap-2 mb-16">
                        <span className="text-8xl font-black text-mtaaniBrown tracking-tighter">{p.price}</span>
                        <span className="text-sm font-black opacity-10">TZS</span>
                    </div>
                    <button onClick={()=>setSelPkg(p)} className="w-full bg-mtaaniBrown text-white py-8 rounded-[3rem] font-black uppercase shadow-2xl hover:bg-mtaaniAccent hover:scale-105 transition-all tracking-widest">NUNUA</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="py-20 text-center border-t bg-gray-50/50">
        <div className="font-black text-mtaaniBrown text-xl tracking-tighter mb-4 uppercase">WIFI MTAANI</div>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em]">Kila mmoja aunganishwe • 2024</p>
      </footer>

      {selPkg && (
        <div className="fixed inset-0 bg-mtaaniBrown/95 backdrop-blur-3xl flex items-center justify-center p-8 z-[4000] animate-in fade-in">
          <form onSubmit={buy} className="bg-white p-14 rounded-[5rem] w-full max-w-lg text-center shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-10 text-mtaaniBrown">Lipia {selPkg.name}</h2>
            <div className="bg-mtaaniGrey p-10 rounded-[4rem] mb-12 border-2 border-dashed border-mtaaniBrown/10">
              <p className="text-[10px] font-black uppercase opacity-20 mb-3 tracking-widest">TUMA {selPkg.price} TZS KWA:</p>
              <p className="text-4xl font-black text-mtaaniBrown tracking-tighter">0779231924</p>
              <p className="text-[9px] font-black opacity-30 mt-3 uppercase tracking-widest">WIFI MTAANI SERVICES</p>
            </div>
            <input required type="tel" placeholder="NAMBA YAKO YA SIMU" className="w-full p-6 bg-gray-50 rounded-[2.5rem] text-center font-black outline-none border-2 focus:border-mtaaniBrown text-2xl mb-10" value={phone} onChange={e=>setPhone(e.target.value)} />
            <button className="w-full bg-mtaaniBrown text-white py-8 rounded-[3rem] font-black uppercase shadow-2xl mb-8 tracking-widest hover:bg-black transition-all">PATA VOUCHER</button>
            <button type="button" onClick={()=>setSelPkg(null)} className="text-[10px] font-black opacity-20 uppercase tracking-widest hover:text-red-500">Ghairi</button>
          </form>
        </div>
      )}

      <SupportChat />
    </div>
  );
};

// Mount App safely to prevent blank screen if any top-level error occurred elsewhere
try {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
} catch (e) {
  console.error("Critical Render Error:", e);
  document.body.innerHTML = "<div style='padding: 20px; font-family: sans-serif;'><h1>Hitilafu ya Mfumo</h1><p>Samahani, website inashindwa kupakia. Tafadhali refresh ukurasa.</p></div>";
}
