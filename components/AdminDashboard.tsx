
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
    window.location.href = `sms:${req.phone}?body=WIFI MTAANI: Code yako ni ${code}. Karibu!`;
  };

  const addRouter = (e: React.FormEvent) => {
    e.preventDefault();
    const r: RouterDevice = { ...newRouter, id: Date.now(), status: 'ONLINE', speed: '50Mbps', clients: 0 };
    const updated = [r, ...routers];
    setRouters(updated);
    localStorage.setItem('v_routers', JSON.stringify(updated));
    setNewRouter({ name: '', ip: '', mac: '' });
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      <nav className="w-20 md:w-64 bg-[#4E342E] text-white flex flex-col shrink-0">
        <div className="p-8 font-black text-xl border-b border-white/5 hidden md:block">DASHBOARD</div>
        <div className="flex-1 p-4 mt-6 space-y-2">
          {['vouchers', 'history', 'router', 'config'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase text-left tracking-widest ${activeTab === tab ? 'bg-white text-[#4E342E]' : 'opacity-40'}`}>
              {tab}
            </button>
          ))}
        </div>
        <button onClick={onBack} className="p-8 text-[10px] opacity-20 hover:opacity-100 uppercase font-black">Logout</button>
      </nav>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {activeTab === 'vouchers' && (
          <div>
            <h1 className="text-3xl font-black mb-8">Stoki ya Vocha</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {INITIAL_PKGS.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border flex justify-between items-center">
                  <div><p className="text-[10px] opacity-30 font-black uppercase">{p.name}</p><p className="text-2xl font-black">{vouchers.filter(v=>v.pid===p.id && !v.used).length}</p></div>
                  <button onClick={() => genVoucher(p.id)} className="w-10 h-10 bg-[#F57C00] text-white rounded-xl">+</button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'router' && (
          <div>
            <h1 className="text-3xl font-black mb-8">Routers</h1>
            <form onSubmit={addRouter} className="bg-white p-8 rounded-3xl border mb-10 max-w-lg">
              <input required placeholder="Eneo" className="w-full p-4 bg-gray-50 rounded-xl mb-4 text-xs font-bold" value={newRouter.name} onChange={e=>setNewRouter({...newRouter, name:e.target.value})} />
              <input required placeholder="IP Address" className="w-full p-4 bg-gray-50 rounded-xl mb-4 text-xs font-bold" value={newRouter.ip} onChange={e=>setNewRouter({...newRouter, ip:e.target.value})} />
              <button className="w-full bg-[#4E342E] text-white p-4 rounded-xl font-black text-xs">SAJILI</button>
            </form>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-white p-8 rounded-3xl border">
            <h2 className="text-xl font-black mb-4">Source Code kwa Router</h2>
            <textarea readOnly className="w-full h-80 p-4 bg-gray-900 text-green-400 font-mono text-[10px] rounded-2xl" value={ROUTER_LOGIN_TEMPLATE} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center">
                <span className="font-bold">{r.phone}</span>
                {r.status === 'PENDING' ? <button onClick={()=>approve(r)} className="bg-[#F57C00] text-white px-4 py-2 rounded-lg text-xs font-black">SEND CODE</button> : <span className="text-green-500 font-black text-xs">DONE</span>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
