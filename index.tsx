
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
interface Package { id: string; name: string; duration: string; price: number; desc: string; }
interface Voucher { code: string; pid: string; used: boolean; date: string; }
interface WifiRequest { id: number; phone: string; pid: string; status: 'PENDING' | 'DONE'; code?: string; }

// --- CONSTANTS ---
const INITIAL_PKGS: Package[] = [
  { id: '1', name: 'MASAA SITA (6)', duration: '6 Hours', price: 500, desc: 'Internet bila kikomo kwa masaa sita.' },
  { id: '2', name: 'SIKU NZIMA (24HRS)', duration: '24 Hours', price: 1000, desc: 'Internet bila kikomo kwa masaa 24.' },
  { id: '3', name: 'WIKI NZIMA', duration: '7 Days', price: 5000, desc: 'Internet bila kikomo kwa wiki nzima.' }
];

const ROUTER_CONFIG = `
<!-- PASTE IN ROUTER CAPTIVE PORTAL -->
<div id="mtaani-login">
  <h1>WIFI MTAANI</h1>
  <input type="text" id="vcode" placeholder="ENTER CODE">
  <button onclick="login()">CONNECT TO WWW</button>
</div>
`;

// --- AI SERVICE ---
const callAI = async (history: any[], prompt: string) => {
  try {
    const key = (process.env.API_KEY) || '';
    if (!key) return "Msaidizi hayuko hewani.";
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: "Wewe ni msaidizi wa WIFI MTAANI. Saidia wateja masuala ya WiFi na intanet. Namba ya malipo: 0779231924." }] },
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
      <div className="bg-white p-12 rounded-[3rem] w-full max-w-sm text-center">
        <h2 className="text-2xl font-black mb-8 uppercase text-mtaaniBrown">ADMIN LOGIN</h2>
        <input type="password" placeholder="PASSWORD" className="w-full p-5 bg-gray-50 rounded-2xl mb-6 text-center outline-none border" value={pass} onChange={e => setPass(e.target.value)} />
        <button onClick={() => pass.toLowerCase() === 'mtaani' ? onLogin() : alert('Error')} className="w-full bg-mtaaniBrown text-white py-5 rounded-2xl font-black uppercase">INGIA</button>
        <button onClick={onBack} className="mt-8 text-[10px] font-black opacity-30 uppercase">Rudi Nyuma</button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onBack }: any) => {
  const [vouchers, setVouchers] = useState<Voucher[]>(() => JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState<WifiRequest[]>(() => JSON.parse(localStorage.getItem('v_reqs') || '[]'));

  const genVoucher = (pid: string) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const nv = { code, pid, used: false, date: new Date().toLocaleString() };
    const updated = [nv, ...vouchers];
    setVouchers(updated);
    localStorage.setItem('v_stock', JSON.stringify(updated));
  };

  const approve = (req: WifiRequest) => {
    const v = vouchers.find(x => x.pid === req.pid && !x.used);
    const code = v ? v.code : "EMPTY-" + Math.random().toString(36).substr(2,4).toUpperCase();
    const updatedR = requests.map(r => r.id === req.id ? {...r, status: 'DONE', code} : r) as WifiRequest[];
    setRequests(updatedR);
    localStorage.setItem('v_reqs', JSON.stringify(updatedR));
    alert(`Code: ${code} kwa ${req.phone}`);
    window.location.href = `sms:${req.phone}?body=WIFI MTAANI: Code yako ni ${code}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-mtaaniBrown text-white p-8">
        <h1 className="font-black text-xl mb-12">WIFI MTAANI</h1>
        <button onClick={onBack} className="text-[10px] font-black opacity-40 uppercase">Logout</button>
      </div>
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-black mb-10">MTAANI DASHBOARD</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {INITIAL_PKGS.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-3xl border shadow-sm">
              <p className="text-[10px] font-black opacity-30 mb-2 uppercase">{p.name}</p>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-black">{vouchers.filter(v=>v.pid===p.id && !v.used).length}</span>
                <button onClick={() => genVoucher(p.id)} className="bg-mtaaniAccent text-white px-4 py-2 rounded-xl text-xs font-black">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-3xl p-8 border">
          <h3 className="font-black mb-6 uppercase">Maombi ya Vocha</h3>
          {requests.map(r => (
            <div key={r.id} className="flex justify-between items-center py-4 border-b">
              <div>
                <p className="font-black">{r.phone}</p>
                <p className="text-[10px] opacity-40 uppercase">{INITIAL_PKGS.find(p=>p.id===r.pid)?.name}</p>
              </div>
              {r.status === 'PENDING' ? (
                <button onClick={() => approve(r)} className="bg-mtaaniAccent text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Approve</button>
              ) : (
                <span className="text-[10px] font-black text-green-500">{r.code}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ pkg, phone, setPhone, onBuy, onClose }: any) => (
  <div className="fixed inset-0 bg-mtaaniBrown/95 flex items-center justify-center p-8 z-[1000]">
    <div className="bg-white p-12 rounded-[4rem] w-full max-w-md text-center">
      <h2 className="text-2xl font-black uppercase mb-8">Lipia {pkg.name}</h2>
      <div className="bg-gray-50 p-8 rounded-3xl mb-8 border-2 border-dashed">
        <p className="text-[10px] font-black opacity-20 mb-2">LIPA TZS {pkg.price} KWA:</p>
        <p className="text-3xl font-black">0779231924</p>
      </div>
      <input required placeholder="NAMBA YAKO" className="w-full p-5 bg-gray-50 rounded-2xl mb-8 text-center text-xl font-black outline-none border" value={phone} onChange={e => setPhone(e.target.value)} />
      <button onClick={onBuy} className="w-full bg-mtaaniBrown text-white py-6 rounded-3xl font-black uppercase mb-4">PATA VOCHA</button>
      <button onClick={onClose} className="text-[10px] font-black opacity-20 uppercase">Ghairi</button>
    </div>
  </div>
);

const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'model', content: 'Habari! Karibu WIFI MTAANI. Unahitaji msaada?' }]);
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
        <div className="bg-white w-[320px] h-[450px] rounded-[2.5rem] shadow-2xl flex flex-col border overflow-hidden">
          <div className="bg-mtaaniBrown p-5 text-white flex justify-between items-center font-black text-[10px] uppercase">
            <span>MSAIDIZI</span>
            <button onClick={() => setOpen(false)}>X</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50 no-scrollbar text-[11px] font-bold">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-mtaaniBrown text-white' : 'bg-white border'}`}>{m.content}</div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <form onSubmit={send} className="p-3 border-t flex gap-2">
            <input className="flex-1 p-3 bg-gray-100 rounded-xl text-[11px] outline-none" placeholder="Uliza..." value={input} onChange={e => setInput(e.target.value)} />
            <button className="bg-mtaaniBrown text-white px-4 rounded-xl">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-16 h-16 bg-mtaaniBrown text-white rounded-full shadow-2xl text-2xl">💬</button>
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
    } else { alert('Code imekosewa! Wasiliana na mawakala wetu.'); }
  };

  const buy = (e: any) => {
    e.preventDefault();
    if (!selPkg || !phone) return;
    const req = { id: Date.now(), phone, pid: selPkg.id, status: 'PENDING' };
    const reqs = JSON.parse(localStorage.getItem('v_reqs') || '[]');
    localStorage.setItem('v_reqs', JSON.stringify([req, ...reqs]));
    window.location.href = `sms:0779231924?body=Nahitaji ${selPkg.name}. Namba: ${phone}`;
    setSelPkg(null);
    alert('Ombi limetumwa! Lipia 0779231924 kupata vocha sasa.');
  };

  if (view === 'admin') return <AdminLogin onLogin={() => setView('dashboard')} onBack={() => setView('home')} />;
  if (view === 'dashboard') return <AdminDashboard onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="h-20 flex justify-between items-center px-6 md:px-12 fixed w-full z-50 bg-white/80 backdrop-blur-md">
        <div className="font-black text-xl text-mtaaniBrown flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0})}>
          <div className="w-8 h-8 bg-mtaaniBrown text-white flex items-center justify-center rounded-lg">W</div>
          WIFI MTAANI
        </div>
        <button onClick={() => setView('admin')} className="text-[10px] font-black opacity-20 uppercase">Admin</button>
      </nav>

      {connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
          <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-4xl mb-8 animate-pulse text-white font-black">WWW</div>
          <h1 className="text-6xl font-black text-mtaaniBrown mb-4">UKO HEWANI</h1>
          <p className="text-gray-400 font-bold mb-12 uppercase text-xs tracking-[0.5em]">Furahia Ulimwengu wa Intanet</p>
          <button onClick={() => setConnected(false)} className="bg-mtaaniBrown text-white px-12 py-5 rounded-2xl font-black uppercase text-sm">ONDOKA</button>
        </div>
      ) : (
        <main className="flex-1">
          <section className="pt-48 pb-32 px-6 bg-mtaaniBrown text-white text-center">
            <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] mb-12">
              WIFI <br /> <span className="text-mtaaniAccent">MTAANI</span>
            </h1>
            <div className="max-w-xl mx-auto bg-white p-3 rounded-[3rem] shadow-2xl">
              <form onSubmit={activate} className="flex flex-col md:flex-row gap-2">
                <input className="flex-1 p-5 text-mtaaniBrown font-black text-center uppercase outline-none text-2xl" placeholder="INGIZA VOCHA" value={vCode} onChange={e => setVCode(e.target.value)} />
                <button className="bg-mtaaniAccent text-white px-10 py-5 md:py-0 rounded-[2.5rem] font-black uppercase text-lg">WASHA</button>
              </form>
            </div>
            <p className="mt-8 text-[10px] font-black uppercase opacity-40 tracking-widest">Weka code uanze kuvinjari intanet sasa hivi</p>
          </section>

          <section className="py-24 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black uppercase text-mtaaniBrown">Vifurushi vya Intanet</h2>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mt-2">Lipia kwa urahisi mtaani kwako</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-white p-12 rounded-[3.5rem] border hover:border-mtaaniAccent transition-all shadow-xl">
                  <p className="text-[10px] font-black opacity-20 mb-4 uppercase">{p.duration}</p>
                  <h3 className="text-2xl font-black mb-4">{p.name}</h3>
                  <div className="text-5xl font-black mb-10 text-mtaaniBrown">{p.price} <span className="text-xs opacity-20">TZS</span></div>
                  <button onClick={() => setSelPkg(p)} className="w-full bg-mtaaniBrown text-white py-5 rounded-2xl font-black uppercase text-sm">NUNUA</button>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {selPkg && <PaymentModal pkg={selPkg} phone={phone} setPhone={setPhone} onBuy={buy} onClose={() => setSelPkg(null)} />}
      <SupportChat />
      
      <footer className="py-20 bg-gray-50 text-center">
        <div className="font-black text-mtaaniBrown opacity-20 text-xl uppercase mb-4">WIFI MTAANI</div>
        <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">&copy; 2024 WIFI MTAANI SERVICES. WWW FOR EVERYONE.</p>
      </footer>
    </div>
  );
};

// --- RENDER ---
const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
