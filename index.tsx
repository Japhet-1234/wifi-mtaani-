
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const INITIAL_PKGS = [
  { id: '1', name: 'Masaa 6', duration: '6 Hours', price: 500, desc: 'Internet ya kasi kwa mzunguko mmoja.' },
  { id: '2', name: 'Siku Nzima', duration: '24 Hours', price: 1000, desc: 'Bila kikomo kwa siku nzima.' },
  { id: '3', name: 'Wiki Nzima', duration: '7 Days', price: 6000, desc: 'Baki hewani wiki nzima.' }
];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

// --- ADMIN PANEL ---
const AdminPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  
  // Data State
  const [vouchers, setVouchers] = useState(() => JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('v_reqs') || '[]'));
  const [routers, setRouters] = useState(() => JSON.parse(localStorage.getItem('v_routers') || '[]'));
  
  // Form States for Router
  const [newRouter, setNewRouter] = useState({ name: '', ip: '', mac: '' });

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

  const addRouter = (e) => {
    e.preventDefault();
    if (!newRouter.name || !newRouter.ip) return;
    const r = { ...newRouter, id: Date.now(), status: 'ONLINE', speed: '42Mbps', clients: Math.floor(Math.random() * 20) };
    const updated = [r, ...routers];
    setRouters(updated);
    localStorage.setItem('v_routers', JSON.stringify(updated));
    setNewRouter({ name: '', ip: '', mac: '' });
  };

  const deleteRouter = (id) => {
    const updated = routers.filter(r => r.id !== id);
    setRouters(updated);
    localStorage.setItem('v_routers', JSON.stringify(updated));
  };

  const appSourceCode = `
<!-- COPY THIS TO YOUR ROUTER'S INDEX.HTML -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WIFI MTAANI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Add more styles and logic as needed -->
</head>
<body class="bg-gray-100">
    <div class="p-10 text-center">
        <h1 class="text-4xl font-black">WIFI MTAANI</h1>
        <p>Karibu kwenye mtandao wa kasi.</p>
    </div>
</body>
</html>
  `;

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-mtaaniBrown">
        <form onSubmit={login} className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">Staff Portal</h2>
          <input autoFocus type="password" placeholder="PASSWORD" className="w-full p-4 bg-gray-100 rounded-2xl text-center text-2xl font-black mb-6 outline-none" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="w-full bg-mtaaniBrown text-white py-4 rounded-2xl font-black uppercase">Ingia</button>
          <button type="button" onClick={onBack} className="mt-6 text-[10px] font-black opacity-30 uppercase">Rudi</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <nav className="w-20 md:w-64 bg-mtaaniBrown text-white flex flex-col sidebar-transition">
        <div className="p-6 font-black text-xl border-b border-white/5 hidden md:block uppercase tracking-tighter">WIFI Admin</div>
        <div className="p-6 font-black text-center border-b border-white/5 md:hidden">W</div>
        <div className="flex-1 p-3 space-y-2 mt-4">
          {[
            { id: 'vouchers', icon: '🎟️', label: 'Vouchers' },
            { id: 'history', icon: '📜', label: 'Kumbukumbu' },
            { id: 'router', icon: '📡', label: 'Usajili Router' },
            { id: 'config', icon: '⚙️', label: 'Config & Code' }
          ].map(item => (
            <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-white text-mtaaniBrown shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:inline font-black uppercase text-[10px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onBack} className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 border-t border-white/5">Exit</button>
      </nav>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto no-scrollbar bg-gray-50">
        {activeTab === 'vouchers' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Usimamizi wa Vocha</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex justify-between items-center border">
                  <div>
                    <p className="text-[10px] font-black opacity-30 uppercase">{p.name}</p>
                    <p className="text-2xl font-black">{vouchers.filter(v=>v.pid===p.id && !v.used).length}</p>
                  </div>
                  <button onClick={()=>genVoucher(p.id)} className="w-10 h-10 bg-mtaaniBrown text-white rounded-full font-black text-xl hover:scale-110 transition-all">+</button>
                </div>
              ))}
            </div>
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-mtaaniGrey text-[10px] font-black uppercase">
                  <tr><th className="p-4">CODE</th><th className="p-4">PAKETI</th><th className="p-4">HALI</th></tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {vouchers.slice(0, 20).map((v, i) => (
                    <tr key={i}><td className="p-4 font-mono font-black">{v.code}</td><td className="p-4 uppercase">{INITIAL_PKGS.find(p=>p.id===v.pid)?.name}</td><td className="p-4">{v.used ? '❌ Used' : '✅ Active'}</td></tr>
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
                <div key={i} className="bg-white p-6 rounded-3xl border flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-black text-mtaaniBrown">{r.phone}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{INITIAL_PKGS.find(p=>p.id===r.pid)?.name}</p>
                  </div>
                  {r.status === 'PENDING' ? (
                    <button onClick={()=>approve(r)} className="bg-mtaaniAccent text-white px-6 py-2 rounded-xl font-black text-[10px] shadow-lg">TUMA CODE</button>
                  ) : (
                    <span className="text-green-500 font-black text-[10px] uppercase">✓ Imekamilika (Code: {r.code})</span>
                  )}
                </div>
              ))}
              {requests.length === 0 && <p className="text-center py-20 text-gray-300 font-black uppercase text-xs tracking-widest">Hakuna miamala bado.</p>}
            </div>
          </div>
        )}

        {activeTab === 'router' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Usajili na Hali ya Router</h1>
            
            <form onSubmit={addRouter} className="bg-white p-8 rounded-[3rem] border shadow-sm mb-12 max-w-xl">
              <h2 className="text-sm font-black uppercase mb-6 opacity-40">Sajili Router Mpya</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Jina la Eneo (e.g. Sokoni)" className="p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:border-mtaaniBrown" value={newRouter.name} onChange={e=>setNewRouter({...newRouter, name:e.target.value})} />
                <input required placeholder="IP Address (e.g. 192.168.1.1)" className="p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:border-mtaaniBrown" value={newRouter.ip} onChange={e=>setNewRouter({...newRouter, ip:e.target.value})} />
                <input placeholder="MAC Address (Optional)" className="p-4 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:border-mtaaniBrown" value={newRouter.mac} onChange={e=>setNewRouter({...newRouter, mac:e.target.value})} />
                <button className="bg-mtaaniBrown text-white p-4 rounded-2xl font-black uppercase text-[10px]">Sajili Sasa</button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routers.map(r => (
                <div key={r.id} className="bg-mtaaniBrown text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black uppercase tracking-tighter">{r.name}</h3>
                      <span className="bg-green-500 px-3 py-1 rounded-full text-[8px] font-black">{r.status}</span>
                    </div>
                    <div className="space-y-2 text-[10px] font-bold opacity-60 mb-6">
                      <p>IP: {r.ip}</p>
                      <p>MAC: {r.mac || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div><p className="text-lg font-black">{r.clients}</p><p className="text-[8px] uppercase opacity-40">Wateja</p></div>
                      <div><p className="text-lg font-black">{r.speed}</p><p className="text-[8px] uppercase opacity-40">Kasi</p></div>
                    </div>
                    <button onClick={()=>deleteRouter(r.id)} className="absolute top-4 right-4 text-white/20 hover:text-red-400">✕</button>
                  </div>
                  <div className="absolute -bottom-6 -right-6 text-6xl opacity-5 group-hover:scale-110 transition-transform">📡</div>
                </div>
              ))}
              {routers.length === 0 && <p className="col-span-full text-center py-20 text-gray-300 font-black uppercase text-xs">Sajili router kuanza kufatilia hali yake.</p>}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Config & Source Code</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-8 bg-white border rounded-[2.5rem] shadow-sm">
                  <p className="text-[10px] font-black uppercase opacity-30 mb-6">Paketi & Bei</p>
                  {INITIAL_PKGS.map(p => (
                    <div key={p.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-black uppercase">{p.name} ({p.duration})</span>
                      <span className="font-black text-sm text-mtaaniBrown">{p.price} TZS</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all" onClick={()=>{if(confirm('Unafuta kila kitu?')) {localStorage.clear(); window.location.reload();}}}>Futa Database Yote</button>
              </div>

              <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm flex flex-col h-[600px]">
                <p className="text-[10px] font-black uppercase opacity-30 mb-4 tracking-widest">Copy Code kwa ajili ya Router</p>
                <textarea readOnly className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-[10px] rounded-2xl outline-none resize-none no-scrollbar" value={appSourceCode} />
                <button onClick={() => {navigator.clipboard.writeText(appSourceCode); alert('Code imekopiwa!');}} className="mt-4 bg-mtaaniBrown text-white py-4 rounded-xl font-black uppercase text-[10px]">Copy Code</button>
              </div>
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
        <div className="bg-white w-80 h-[450px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border animate-in slide-in-from-bottom-5">
          <div className="bg-mtaaniBrown p-5 text-white flex justify-between items-center font-black text-xs uppercase tracking-widest">
            <span>Msaidizi AI</span>
            <button onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 no-scrollbar text-xs">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] shadow-sm ${m.role === 'user' ? 'bg-mtaaniBrown text-white rounded-br-none' : 'bg-white rounded-bl-none'}`}>{m.content}</div>
              </div>
            ))}
            <div ref={scroll} />
          </div>
          <form onSubmit={send} className="p-4 bg-white border-t flex gap-2">
            <input className="flex-1 p-3 bg-gray-100 rounded-2xl text-[10px] outline-none font-bold" placeholder="Uliza swali..." value={input} onChange={e=>setInput(e.target.value)} />
            <button className="bg-mtaaniBrown text-white w-12 h-12 rounded-2xl font-black flex items-center justify-center">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)} className="w-16 h-16 bg-mtaaniBrown text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform border-4 border-white">💬</button>
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
    } else alert('Code haipo au imeshatumika!');
  };

  const buy = (e) => {
    e.preventDefault();
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Nataka ${selPkg.name}. Namba: ${phone}`;
    setSelPkg(null);
    alert('Ombi limetumwa! Lipia 0779231924 sasa kupitia M-PESA/TIGO.');
  };

  if (view === 'admin') return <AdminPanel onBack={()=>setView('home')} />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="h-20 flex justify-between items-center px-6 md:px-12 border-b bg-white sticky top-0 z-50">
        <div className="font-black text-2xl tracking-tighter uppercase text-mtaaniBrown">WIFI MTAANI</div>
        <button onClick={()=>setView('admin')} className="text-[10px] font-black uppercase text-mtaaniBrown/30 hover:text-mtaaniBrown">Admin Login</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
          <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center text-6xl mb-10 shadow-2xl animate-bounce">✓</div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-mtaaniBrown mb-4">Uko Hewani!</h1>
          <p className="text-gray-400 font-bold mb-12 uppercase text-xs tracking-[0.5em]">High Speed Connectivity Activated</p>
          <button onClick={()=>setConnected(false)} className="bg-mtaaniBrown text-white px-14 py-5 rounded-full font-black uppercase shadow-2xl hover:scale-105 transition-all">Rudi Nyuma</button>
        </div>
      ) : (
        <main className="flex-1">
          <section className="bg-mtaaniBrown text-white py-24 px-6 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none text-[20rem] font-black leading-none whitespace-nowrap overflow-hidden">WIFIMTAANIWIFIMTAANI</div>
             <div className="max-w-4xl mx-auto relative z-10">
                <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] mb-12">Internet<br/>Kwa Wote.</h1>
                <div className="max-w-md mx-auto bg-white p-3 rounded-[3rem] shadow-2xl border-4 border-white/20">
                  <form onSubmit={activate} className="flex gap-2">
                    <input className="flex-1 p-5 bg-transparent text-mtaaniBrown font-black text-center uppercase outline-none text-2xl" placeholder="WEKA CODE..." value={vCode} onChange={e=>setVCode(e.target.value)} />
                    <button className="bg-mtaaniBrown text-white px-10 rounded-[2.5rem] font-black uppercase shadow-xl hover:bg-mtaaniAccent transition-colors">GO</button>
                  </form>
                </div>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.8em] opacity-30">Pata internet bora mitaani kwako</p>
             </div>
          </section>

          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20">
              <h2 className="font-black text-5xl uppercase tracking-tighter text-mtaaniBrown">Vifurushi vya Leo</h2>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-4 md:mt-0">Bei nafuu kabisa kuanzia 500/-</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="group bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase opacity-30 mb-2 tracking-[0.3em]">{p.duration}</p>
                    <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">{p.name}</h3>
                    <p className="text-sm text-gray-400 font-bold mb-12 leading-relaxed">{p.desc}</p>
                    <p className="text-7xl font-black text-mtaaniBrown mb-12 tracking-tighter">{p.price}<span className="text-xs opacity-20 ml-1">TZS</span></p>
                    <button onClick={()=>setSelPkg(p)} className="w-full bg-mtaaniBrown text-white py-6 rounded-[2rem] font-black uppercase shadow-xl group-hover:bg-mtaaniAccent transition-all">NUNUA SASA</button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-gray-50 pointer-events-none group-hover:text-mtaaniBrown/5 transition-all">{p.id}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="py-20 text-center border-t">
        <div className="font-black text-mtaaniBrown text-xl tracking-tighter mb-4 uppercase">WIFI MTAANI</div>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em]">© 2024 Hotspot Kitaa • Powered by Gemini AI</p>
      </footer>

      {selPkg && (
        <div className="fixed inset-0 bg-mtaaniBrown/98 backdrop-blur-2xl flex items-center justify-center p-6 z-[2000] animate-in fade-in duration-300">
          <form onSubmit={buy} className="bg-white p-12 rounded-[4rem] w-full max-w-md text-center shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-mtaaniBrown">Lipia {selPkg.name}</h2>
            <p className="text-6xl font-black text-mtaaniAccent mb-10 tracking-tighter">{selPkg.price} TZS</p>
            <div className="bg-mtaaniGrey p-8 rounded-[2.5rem] mb-10 border-2 border-dashed border-mtaaniBrown/20">
              <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">Namba ya Malipo:</p>
              <p className="text-3xl font-black text-mtaaniBrown">0779231924</p>
              <p className="text-[10px] font-bold opacity-30 mt-2">WIFI MTAANI SERVICES</p>
            </div>
            <input required type="tel" placeholder="Namba Yako ya Simu" className="w-full p-5 bg-gray-50 rounded-[2rem] text-center font-black mb-8 outline-none border-2 focus:border-mtaaniBrown text-xl" value={phone} onChange={e=>setPhone(e.target.value)} />
            <button className="w-full bg-mtaaniBrown text-white py-6 rounded-[2rem] font-black uppercase shadow-2xl mb-6 hover:bg-mtaaniAccent transition-colors">TUMA OMBI LA VOCHA</button>
            <button type="button" onClick={()=>setSelPkg(null)} className="text-[10px] font-black opacity-30 uppercase tracking-widest hover:text-red-500">Ghairi Malipo</button>
          </form>
        </div>
      )}

      <SupportChat />
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
