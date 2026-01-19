
import React, { useState } from 'react';
import { INITIAL_PKGS, ROUTER_LOGIN_TEMPLATE } from '../constants';
import { Voucher, WifiRequest, RouterDevice } from '../types';

export const AdminDashboard = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [vouchers, setVouchers] = useState<Voucher[]>(() => JSON.parse(localStorage.getItem('v_stock') || '[]'));
  const [requests, setRequests] = useState<WifiRequest[]>(() => JSON.parse(localStorage.getItem('v_reqs') || '[]'));
  const [routers, setRouters] = useState<RouterDevice[]>(() => JSON.parse(localStorage.getItem('v_routers') || '[]'));
  const [newRouter, setNewRouter] = useState({ name: '', ip: '', mac: '' });

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
    // Katika maisha halisi hapa ingetuma SMS API
    alert(`Code ${code} imetengenezwa kwa ajili ya ${req.phone}`);
    window.location.href = `sms:${req.phone}?body=WIFI MTAANI: Code yako ni ${code}. Furahia internet ya kasi!`;
  };

  const addRouter = (e: React.FormEvent) => {
    e.preventDefault();
    const r: RouterDevice = { ...newRouter, id: Date.now(), status: 'ONLINE', speed: '50Mbps', clients: 0 };
    const updated = [r, ...routers];
    setRouters(updated);
    localStorage.setItem('v_routers', JSON.stringify(updated));
    setNewRouter({ name: '', ip: '', mac: '' });
  };

  const totalSales = requests.filter(r => r.status === 'DONE').reduce((acc, curr) => {
    const pkg = INITIAL_PKGS.find(p => p.id === curr.pid);
    return acc + (pkg?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen flex bg-gray-50 flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-mtaaniBrown text-white flex flex-col shrink-0">
        <div className="p-8 font-black text-xl border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-mtaaniBrown flex items-center justify-center rounded-lg text-xs">W</div>
          DASHBOARD
        </div>
        <div className="flex-1 p-4 mt-6 space-y-1">
          {[
            { id: 'vouchers', label: 'Vocha', icon: '🎟️' },
            { id: 'history', label: 'Miamala', icon: '📜' },
            { id: 'router', label: 'Routers', icon: '📡' },
            { id: 'config', label: 'Source Code', icon: '⚙️' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase text-left tracking-widest transition-all flex items-center gap-4 ${activeTab === tab.id ? 'bg-white text-mtaaniBrown shadow-xl' : 'opacity-40 hover:opacity-100 hover:bg-white/5'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={onBack} className="p-8 text-[10px] opacity-20 hover:opacity-100 uppercase font-black tracking-widest border-t border-white/5 text-center">Logout</button>
      </nav>

      {/* Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto no-scrollbar">
        {/* Quick Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-in fade-in duration-500">
           <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Jumla ya Mapato</p>
              <p className="text-2xl font-black text-mtaaniAccent">{totalSales} TZS</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Wateja Waliohudumiwa</p>
              <p className="text-2xl font-black text-mtaaniBrown">{requests.length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Vocha Zilizobaki</p>
              <p className="text-2xl font-black text-mtaaniBrown">{vouchers.filter(v => !v.used).length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Routers Hewani</p>
              <p className="text-2xl font-black text-green-500">{routers.length}</p>
           </div>
        </div>

        {activeTab === 'vouchers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Hifadhi ya Vocha</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex justify-between items-center group hover:border-mtaaniAccent transition-all">
                  <div>
                    <p className="text-[10px] opacity-30 font-black uppercase tracking-widest mb-1">{p.name}</p>
                    <p className="text-4xl font-black text-mtaaniBrown">{vouchers.filter(v=>v.pid===p.id && !v.used).length}</p>
                  </div>
                  <button onClick={() => genVoucher(p.id)} className="w-14 h-14 bg-mtaaniAccent text-white rounded-2xl font-black text-2xl shadow-lg active:scale-90 transition-transform">+</button>
                </div>
              ))}
            </div>
            
            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                  <tr><th className="p-6">Voucher Code</th><th className="p-6">Kifurushi</th><th className="p-6">Status</th><th className="p-6">Tarehe</th></tr>
                </thead>
                <tbody className="divide-y text-xs font-bold text-mtaaniBrown">
                  {vouchers.length > 0 ? vouchers.slice(0, 10).map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6 font-mono font-black">{v.code}</td>
                      <td className="p-6 uppercase opacity-50">{INITIAL_PKGS.find(p=>p.id===v.pid)?.name}</td>
                      <td className="p-6">{v.used ? <span className="text-red-400 uppercase text-[9px]">Imetumika</span> : <span className="text-green-500 uppercase text-[9px]">Inapatikana</span>}</td>
                      <td className="p-6 opacity-30">{v.date}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-12 text-center opacity-20 font-black uppercase tracking-[0.5em]">Hakuna vocha zilizoundwa</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'router' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Routers Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <form onSubmit={addRouter} className="bg-white p-10 rounded-[3rem] border shadow-sm h-fit">
                <h2 className="text-xs font-black uppercase mb-8 opacity-30 tracking-widest">Sajili Router Mpya</h2>
                <div className="space-y-4">
                  <input required placeholder="Eneo (Mfano: Soko la Kariakoo)" className="w-full p-5 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:border-mtaaniAccent" value={newRouter.name} onChange={e=>setNewRouter({...newRouter, name:e.target.value})} />
                  <input required placeholder="IP Address (192.168.x.x)" className="w-full p-5 bg-gray-50 rounded-2xl text-xs font-bold outline-none border focus:border-mtaaniAccent" value={newRouter.ip} onChange={e=>setNewRouter({...newRouter, ip:e.target.value})} />
                  <button className="w-full bg-mtaaniBrown text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">Sajili Router</button>
                </div>
              </form>

              <div className="space-y-6">
                 {routers.map(r => (
                   <div key={r.id} className="bg-mtaaniBrown text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                      <div className="relative z-10 flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">{r.name}</h3>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">IP: {r.ip} • STATUS: {r.status}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center text-xs animate-pulse">●</div>
                      </div>
                   </div>
                 ))}
                 {routers.length === 0 && <div className="p-20 border-2 border-dashed border-gray-200 rounded-[3rem] text-center opacity-20 font-black uppercase tracking-widest">Hakuna router hewani</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Router Config</h1>
            <div className="bg-white border rounded-[3.5rem] p-10 shadow-sm flex flex-col h-[650px]">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">Pachika hii kwenye Login Page ya Router</p>
                    <button 
                      onClick={() => {navigator.clipboard.writeText(ROUTER_LOGIN_TEMPLATE); alert('Zimekopishwa!');}} 
                      className="bg-mtaaniAccent text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                    >
                      Copy Code
                    </button>
                </div>
                <textarea 
                  readOnly 
                  className="flex-1 p-6 bg-gray-900 text-green-400 font-mono text-[10px] rounded-[2rem] outline-none resize-none no-scrollbar shadow-inner" 
                  value={ROUTER_LOGIN_TEMPLATE} 
                />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Miamala na Maombi</h1>
            <div className="space-y-4">
              {requests.length > 0 ? requests.map(r => (
                <div key={r.id} className="bg-white p-7 rounded-[2rem] border flex justify-between items-center shadow-sm hover:border-mtaaniAccent transition-all group">
                  <div>
                    <p className="font-black text-xl text-mtaaniBrown mb-1 group-hover:text-mtaaniAccent transition-colors">{r.phone}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-300 tracking-widest">{INITIAL_PKGS.find(p=>p.id===r.pid)?.name} • {new Date(r.id).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {r.status === 'PENDING' ? (
                      <button onClick={()=>approve(r)} className="bg-mtaaniAccent text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">APPROVE & SEND</button>
                    ) : (
                      <div className="text-right">
                        <span className="text-green-500 font-black text-[10px] uppercase tracking-widest block mb-1">✓ Imekamilika</span>
                        <span className="text-mtaaniBrown/30 font-mono text-xs">{r.code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-40 text-center opacity-10 font-black uppercase tracking-[1em] text-sm">Hakuna miamala mipya</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
