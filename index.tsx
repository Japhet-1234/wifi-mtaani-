
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
interface Package { id: string; name: string; duration: string; price: number; desc: string; }
interface Voucher { code: string; pid: string; used: boolean; date: string; }
interface WifiRequest { id: number; phone: string; pid: string; status: 'PENDING' | 'DONE'; code?: string; }
interface RouterDevice { id: number; name: string; ip: string; status: string; }

// --- CONSTANTS ---
const INITIAL_PKGS: Package[] = [
  { id: '1', name: 'MASAA SITA (6) BILA KIKOMO', duration: '6 Hours', price: 500, desc: 'Internet ya kasi bila kikomo kwa masaa 6.' },
  { id: '2', name: 'MASAA 24 BILA KIKOMO', duration: '24 Hours', price: 1000, desc: 'Internet ya kasi bila kikomo kwa siku nzima.' },
  { id: '3', name: 'WIKI NZIMA BILA KIKOMO', duration: '7 Days', price: 5000, desc: 'Internet ya kasi bila kikomo kwa wiki nzima.' }
];

const ROUTER_LOGIN_TEMPLATE = `<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <title>WIFI MTAANI LOGIN</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#4E342E] flex items-center justify-center h-screen p-6 font-sans">
    <div class="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
        <h1 class="text-3xl font-black mb-2 text-[#4E342E]">WIFI MTAANI</h1>
        <p class="text-xs opacity-50 mb-8 uppercase font-bold">Weka Code Yako</p>
        <input type="text" placeholder="INGIZA CODE..." class="w-full p-5 bg-gray-50 rounded-2xl text-center text-2xl font-black mb-6 border-2 focus:border-[#F57C00]" />
        <button class="w-full bg-[#4E342E] text-white py-5 rounded-2xl font-black tracking-widest shadow-xl">UNGANISHA</button>
    </div>
</body>
</html>`;

// --- AI SERVICE ---
const callAI = async (history: any[], prompt: string) => {
  try {
    const key = (process.env.API_KEY) || '';
    if (!key) return "Msaidizi hayuko hewani kwa sasa.";
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: "Wewe ni msaidizi wa WIFI MTAANI. Saidia wateja masuala ya WiFi na intanet. Namba ya malipo: 0779231924 (M-PESA)." }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });
    return response.text || "Jaribu tena baadaye.";
  } catch { return "Hitilafu imetokea."; }
};

// --- COMPONENTS ---

const AdminLogin = ({ onLogin, onBack }: any) => {
  const [pass, setPass] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-mtaaniBrown p-6">
      <div className="bg-white p-12 rounded-[3rem] w-full max-w-sm text-center shadow-2xl">
        <h2 className="text-2xl font-black mb-8 uppercase text-mtaaniBrown">ADMIN LOGIN</h2>
        <input type="password" placeholder="PASSWORD" className="w-full p-5 bg-gray-50 rounded-2xl mb-6 text-center outline-none border border-gray-200 focus:border-mtaaniAccent font-bold" value={pass} onChange={e => setPass(e.target.value)} />
        <button onClick={() => pass.toLowerCase() === 'mtaani' ? onLogin() : alert('Neno la siri limekosewa!')} className="w-full bg-mtaaniBrown text-white py-5 rounded-2xl font-black uppercase shadow-lg hover:bg-black transition-all">INGIA</button>
        <button onClick={onBack} className="mt-8 text-[11px] font-black opacity-80 uppercase tracking-widest text-mtaaniBrown hover:opacity-100">Rudi Nyuma</button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onBack }: any) => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [vouchers, setVouchers] = useState<Voucher[]>(() => JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState<WifiRequest[]>(() => JSON.parse(localStorage.getItem('v_reqs') || '[]'));
  const [routers, setRouters] = useState<RouterDevice[]>(() => JSON.parse(localStorage.getItem('v_routers') || '[]'));
  const [newRouter, setNewRouter] = useState({ name: '', ip: '' });

  const genVoucher = (pid: string) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nv = { code, pid, used: false, date: new Date().toLocaleString() };
    const updated = [nv, ...vouchers];
    setVouchers(updated);
    localStorage.setItem('v_stock', JSON.stringify(updated));
  };

  const approve = (req: WifiRequest) => {
    const v = vouchers.find(x => x.pid === req.pid && !x.used);
    const code = v ? v.code : Math.random().toString(36).substr(2, 6).toUpperCase();
    const updatedR = requests.map(r => r.id === req.id ? {...r, status: 'DONE', code} : r) as WifiRequest[];
    setRequests(updatedR);
    localStorage.setItem('v_reqs', JSON.stringify(updatedR));
    alert(`Code: ${code} kwa ${req.phone}`);
    window.location.href = `sms:${req.phone}?body=WIFI MTAANI: Code yako ni ${code}`;
  };

  const addRouter = (e: React.FormEvent) => {
    e.preventDefault();
    const r: RouterDevice = { id: Date.now(), name: newRouter.name, ip: newRouter.ip, status: 'ONLINE' };
    const updated = [r, ...routers];
    setRouters(updated);
    localStorage.setItem('v_routers', JSON.stringify(updated));
    setNewRouter({ name: '', ip: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-mtaaniBrown text-white p-8 shrink-0">
        <h1 className="font-black text-xl mb-12">WIFI MTAANI</h1>
        <div className="space-y-2 mb-12">
          {['vouchers', 'requests', 'routers', 'config'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === t ? 'bg-white text-mtaaniBrown' : 'opacity-60 hover:opacity-100'}`}>{t}</button>
          ))}
        </div>
        <button onClick={onBack} className="text-[11px] font-black opacity-80 hover:opacity-100 uppercase tracking-widest bg-white/10 w-full py-4 rounded-xl">Logout</button>
      </div>
      
      <div className="flex-1 p-8 overflow-y-auto max-h-screen no-scrollbar">
        {activeTab === 'vouchers' && (
          <div>
            <h2 className="text-3xl font-black mb-10 text-mtaaniBrown uppercase">Stock ya Vocha</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black opacity-60 mb-2 uppercase text-mtaaniBrown">{p.name}</p>
                    <span className="text-3xl font-black text-mtaaniBrown">{vouchers.filter(v=>v.pid===p.id && !v.used).length}</span>
                  </div>
                  <button onClick={() => genVoucher(p.id)} className="bg-mtaaniAccent text-white px-5 py-3 rounded-xl text-xs font-black shadow-md">+</button>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-200">
              <h3 className="font-black mb-6 uppercase text-mtaaniBrown">List ya Vocha</h3>
              <div className="max-h-96 overflow-y-auto no-scrollbar">
                {vouchers.map((v, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-gray-50">
                    <span className="font-mono font-black">{v.code}</span>
                    <span className="text-[10px] font-black uppercase opacity-40">{INITIAL_PKGS.find(p=>p.id===v.pid)?.name}</span>
                    <span className={`text-[10px] font-black ${v.used ? 'text-red-500' : 'text-green-500'}`}>{v.used ? 'USED' : 'ACTIVE'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2 className="text-3xl font-black mb-10 text-mtaaniBrown uppercase">Miamala na Maombi</h2>
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <div className="space-y-4">
                {requests.length > 0 ? requests.map(r => (
                  <div key={r.id} className="flex justify-between items-center py-5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-black text-mtaaniBrown text-lg">{r.phone}</p>
                      <p className="text-[10px] opacity-60 uppercase font-bold text-mtaaniBrown">{INITIAL_PKGS.find(p=>p.id===r.pid)?.name}</p>
                    </div>
                    {r.status === 'PENDING' ? (
                      <button onClick={() => approve(r)} className="bg-mtaaniAccent text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-md">Approve</button>
                    ) : (
                      <div className="text-right">
                        <span className="text-[10px] font-black text-green-600 block mb-1">IMETUMIKA</span>
                        <span className="text-xs font-mono font-black text-mtaaniBrown bg-gray-100 px-3 py-1 rounded-lg">{r.code}</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="py-10 text-center opacity-30 font-black uppercase text-xs tracking-widest">Hakuna miamala mipya</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routers' && (
          <div>
            <h2 className="text-3xl font-black mb-10 text-mtaaniBrown uppercase">Routers Management</h2>
            <form onSubmit={addRouter} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm mb-10 max-w-md">
              <h3 className="text-xs font-black uppercase opacity-40 mb-6">Sajili Router</h3>
              <input required placeholder="Eneo (Mfano: Kariakoo)" className="w-full p-4 bg-gray-50 rounded-xl mb-4 text-xs font-bold outline-none border focus:border-mtaaniAccent" value={newRouter.name} onChange={e=>setNewRouter({...newRouter, name:e.target.value})} />
              <input required placeholder="IP Address (192.168.x.x)" className="w-full p-4 bg-gray-50 rounded-xl mb-6 text-xs font-bold outline-none border focus:border-mtaaniAccent" value={newRouter.ip} onChange={e=>setNewRouter({...newRouter, ip:e.target.value})} />
              <button className="w-full bg-mtaaniBrown text-white p-4 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-black">Sajili Sasa</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routers.map(r => (
                <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-black text-mtaaniBrown">{r.name}</p>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">{r.ip}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse uppercase">Online</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div>
            <h2 className="text-3xl font-black mb-10 text-mtaaniBrown uppercase">Router Configuration</h2>
            <div className="bg-white rounded-[3rem] p-10 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Pachika hii kwenye Login Page ya Router</p>
                <button 
                  onClick={() => {navigator.clipboard.writeText(ROUTER_LOGIN_TEMPLATE); alert('Kopishwa!');}} 
                  className="bg-mtaaniAccent text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all"
                >
                  Copy Code
                </button>
              </div>
              <textarea readOnly className="w-full h-[400px] p-6 bg-gray-900 text-green-400 font-mono text-[10px] rounded-[2rem] outline-none resize-none no-scrollbar shadow-inner" value={ROUTER_LOGIN_TEMPLATE} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentModal = ({ pkg, phone, setPhone, onBuy, onClose }: any) => (
  <div className="fixed inset-0 bg-mtaaniBrown/95 flex items-center justify-center p-8 z-[1000] backdrop-blur-sm">
    <div className="bg-white p-12 rounded-[4rem] w-full max-w-md text-center shadow-2xl animate-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-black uppercase mb-8 text-mtaaniBrown">Lipia {pkg.name}</h2>
      <div className="bg-gray-50 p-8 rounded-3xl mb-8 border-2 border-dashed border-mtaaniBrown/10">
        <p className="text-[10px] font-black opacity-60 mb-2 uppercase text-mtaaniBrown tracking-widest">LIPA TZS {pkg.price} KWA:</p>
        <p className="text-4xl font-black text-mtaaniBrown tracking-tighter">0779231924</p>
      </div>
      <input required placeholder="NAMBA YAKO YA SIMU" className="w-full p-5 bg-gray-50 rounded-2xl mb-8 text-center text-xl font-black outline-none border border-gray-200 focus:border-mtaaniAccent" value={phone} onChange={e => setPhone(e.target.value)} />
      <button onClick={onBuy} className="w-full bg-mtaaniBrown text-white py-6 rounded-3xl font-black uppercase mb-6 shadow-xl hover:bg-black transition-all">PATA VOCHA SASA</button>
      <button onClick={onClose} className="text-[11px] font-black opacity-80 hover:opacity-100 uppercase tracking-[0.2em] text-mtaaniBrown border-b border-mtaaniBrown/20">Ghairi Ombi</button>
    </div>
  </div>
);

const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'model', content: 'Habari! Karibu WIFI MTAANI. Una swali kuhusu vifurushi vyetu?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const txt = input; setInput('');
    setMsgs(p => [...p, { role: 'user', content: txt }]);
    setLoading(true);
    const res = await callAI(msgs, txt);
    setMsgs(p => [...p, { role: 'model', content: res }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[500]">
      {open ? (
        <div className="bg-white w-[320px] h-[450px] rounded-[2.5rem] shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          <div className="bg-mtaaniBrown p-5 text-white flex justify-between items-center font-black text-[11px] uppercase tracking-widest">
            <span>MSAIDIZI AI</span>
            <button onClick={() => setOpen(false)} className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 no-scrollbar text-[11px] font-bold">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-mtaaniBrown text-white' : 'bg-white border border-gray-100 text-mtaaniBrown'}`}>{m.content}</div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <form onSubmit={send} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input className="flex-1 p-3 bg-gray-100 rounded-xl text-[11px] outline-none font-bold" placeholder="Uliza swali..." value={input} onChange={e => setInput(e.target.value)} />
            <button className="bg-mtaaniBrown text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-16 h-16 bg-mtaaniBrown text-white rounded-full shadow-2xl text-3xl border-4 border-white flex items-center justify-center hover:scale-110 transition-transform">💬</button>
      )}
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState<'home' | 'admin' | 'dashboard'>('home');
  const [selPkg, setSelPkg] = useState<Package | null>(null);
  const [vCode, setVCode] = useState('');
  const [phone, setPhone] = useState('');
  const [connected, setConnected] = useState(false);

  const activate = (e: any) => {
    e.preventDefault();
    if (!vCode.trim()) return;
    const stock = JSON.parse(localStorage.getItem('v_stock') || '[]');
    const v = stock.find((x: any) => x.code.toUpperCase() === vCode.trim().toUpperCase() && !x.used);
    if (v) {
      localStorage.setItem('v_stock', JSON.stringify(stock.map((x: any) => x.code === v.code ? {...x, used: true} : x)));
      setConnected(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else { alert('Voucher code imekosewa au tayari imetumika!'); }
  };

  const buy = (e: any) => {
    e.preventDefault();
    if (!selPkg || !phone) return;
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Nahitaji ${selPkg.name}. Namba: ${phone}`;
    setSelPkg(null);
    alert('Ombi lako limepokelewa! Lipia kupitia 0779231924 kupata vocha sasa.');
  };

  if (view === 'admin') return <AdminLogin onLogin={() => setView('dashboard')} onBack={() => setView('home')} />;
  if (view === 'dashboard') return <AdminDashboard onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-mtaaniAccent selection:text-white">
      <nav className="h-20 flex justify-between items-center px-6 md:px-12 fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="font-black text-xl text-mtaaniBrown flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="w-9 h-9 bg-mtaaniBrown text-white flex items-center justify-center rounded-xl shadow-lg">W</div>
          <span className="tracking-tighter">WIFI MTAANI</span>
        </div>
        <button onClick={() => setView('admin')} className="text-[11px] font-black opacity-80 hover:opacity-100 uppercase tracking-widest text-mtaaniBrown border border-mtaaniBrown/20 px-5 py-2 rounded-lg transition-all">Admin Dashboard</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center animate-in zoom-in-95 duration-500">
          <div className="w-40 h-40 bg-green-500 rounded-[3rem] flex items-center justify-center text-5xl mb-8 animate-bounce text-white font-black shadow-2xl">📶</div>
          <h1 className="text-6xl md:text-8xl font-black text-mtaaniBrown mb-4 tracking-tighter uppercase leading-none">Uko Hewani</h1>
          <p className="text-gray-400 font-bold mb-12 uppercase text-xs tracking-[0.6em]">Vinjari Ulimwengu Bila Kikomo</p>
          <button onClick={() => setConnected(false)} className="bg-mtaaniBrown text-white px-16 py-6 rounded-[2rem] font-black uppercase text-sm shadow-2xl hover:scale-105 transition-all tracking-widest">ZIMA CONNECTION</button>
        </div>
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-48 pb-32 px-6 bg-mtaaniBrown text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-mtaaniAccent/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <h1 className="text-7xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.8] mb-12 animate-in slide-in-from-bottom-6 duration-700">
                WIFI <br /> <span className="text-mtaaniAccent">MTAANI</span>
              </h1>
              <div className="max-w-xl mx-auto bg-white p-3 rounded-[3rem] shadow-2xl animate-in fade-in duration-1000 delay-200">
                <form onSubmit={activate} className="flex flex-col md:flex-row gap-2">
                  <input className="flex-1 p-6 text-mtaaniBrown font-black text-center uppercase outline-none text-2xl placeholder:text-gray-200" placeholder="WEKA VOCHA HAPA" value={vCode} onChange={e => setVCode(e.target.value)} />
                  <button className="bg-mtaaniAccent text-white px-12 py-6 md:py-0 rounded-[2.5rem] font-black uppercase text-xl shadow-xl hover:bg-black transition-all tracking-widest">WASHA</button>
                </form>
              </div>
              <p className="mt-10 text-[11px] font-black uppercase opacity-60 tracking-[0.4em]">Ingiza code ya vocha kuanza kutumia internet ya kasi</p>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-32 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black uppercase text-mtaaniBrown tracking-tighter">VIFURUSHI VYA MTAA</h2>
              <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.5em] mt-4 text-mtaaniBrown">Internet ya kasi bila kikomo - hakuna limit ya MB</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="group bg-white p-12 rounded-[4rem] border border-gray-100 hover:border-mtaaniAccent transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2">
                  <p className="text-[11px] font-black opacity-60 mb-4 uppercase tracking-widest text-mtaaniBrown">{p.duration}</p>
                  <h3 className="text-2xl font-black mb-4 text-mtaaniBrown uppercase">{p.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 mb-10 uppercase tracking-widest">{p.desc}</p>
                  <div className="text-6xl font-black mb-12 text-mtaaniBrown tracking-tighter">
                    {p.price} <span className="text-sm font-black opacity-30">TZS</span>
                  </div>
                  <button onClick={() => setSelPkg(p)} className="w-full bg-mtaaniBrown text-white py-6 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl group-hover:bg-mtaaniAccent transition-all">NUNUA VOCHA</button>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {selPkg && <PaymentModal pkg={selPkg} phone={phone} setPhone={setPhone} onBuy={buy} onClose={() => setSelPkg(null)} />}
      <SupportChat />
      
      <footer className="py-24 bg-gray-50 text-center px-6">
        <div className="font-black text-mtaaniBrown opacity-40 text-2xl uppercase mb-4 tracking-tighter">WIFI MTAANI</div>
        <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.6em] mb-12">UNANGANISHWA NA ULIMWENGU • INTERNET BORA KWA WOTE</p>
        <div className="max-w-xs mx-auto border-t border-gray-200 pt-10">
          <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">&copy; 2024 WIFI MTAANI SERVICES. KILA KITU MTAANI.</p>
        </div>
      </footer>
    </div>
  );
};

// --- RENDER ---
const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
