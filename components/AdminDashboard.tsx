
import React, { useState, useEffect } from 'react';
import { Transaction, RouterDevice, Voucher, WiFiPackage } from '../types';
import { WIFI_PACKAGES } from '../constants';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'routers' | 'vouchers' | 'records' | 'config'>('stats');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [routers, setRouters] = useState<RouterDevice[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedRouterId, setSelectedRouterId] = useState<string | null>(null);
  const [newRouter, setNewRouter] = useState({ name: '', location: '', mac: '' });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState<string | null>(null);
  
  // Global Automation Config
  const [globalConfig, setGlobalConfig] = useState({
    ssid: 'WIFI_MTAANI_FREE',
    supportPhone: '0779231924',
    merchantName: 'WIFI MTAANI',
    primaryColor: '#5D4037'
  });

  useEffect(() => {
    const tx = JSON.parse(localStorage.getItem('mtaani_transactions') || '[]');
    const dev = JSON.parse(localStorage.getItem('mtaani_routers') || '[]');
    const vc = JSON.parse(localStorage.getItem('mtaani_vouchers') || '[]');
    const savedConfig = JSON.parse(localStorage.getItem('mtaani_global_config') || 'null');
    
    setTransactions(tx);
    setRouters(dev);
    setVouchers(vc);
    if (savedConfig) setGlobalConfig(savedConfig);
  }, []);

  useEffect(() => {
    localStorage.setItem('mtaani_global_config', JSON.stringify(globalConfig));
  }, [globalConfig]);

  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

  const handleGenerateVoucher = (packageId: string) => {
    const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const newVoucher: Voucher = {
      code: newCode,
      packageId,
      isUsed: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newVoucher, ...vouchers];
    setVouchers(updated);
    localStorage.setItem('mtaani_vouchers', JSON.stringify(updated));
    return newCode;
  };

  const copyVoucherToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucherCode(code);
    setTimeout(() => setCopiedVoucherCode(null), 2000);
  };

  const markRequestAsDone = (id: string, voucherCode?: string) => {
    const updated = transactions.map(t => t.id === id ? { ...t, status: 'completed' as const, voucherCode } : t);
    setTransactions(updated);
    localStorage.setItem('mtaani_transactions', JSON.stringify(updated));
  };

  const handleSendSMS = (tx: Transaction) => {
    // Find an unused voucher for this package, or generate one if none exists
    const pkgVouchers = vouchers.filter(v => v.packageId === tx.packageId && !v.isUsed);
    let codeToSend = '';
    
    if (pkgVouchers.length > 0) {
      codeToSend = pkgVouchers[0].code;
    } else {
      codeToSend = handleGenerateVoucher(tx.packageId);
    }

    const message = `WIFI MTAANI: Vocha yako ni ${codeToSend}. Ingiza code hii kwenye ukurasa wa login kuanza kutumia internet. Ahsante!`;
    const smsUrl = `sms:${tx.phone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
    
    // Trace the code sent to this user
    markRequestAsDone(tx.id, codeToSend);
  };

  const handleAddRouter = (e: React.FormEvent) => {
    e.preventDefault();
    const router: RouterDevice = {
      id: 'R' + Date.now(),
      name: newRouter.name,
      location: newRouter.location,
      macAddress: newRouter.mac,
      status: 'online',
      lastSeen: new Date().toISOString()
    };
    const updated = [...routers, router];
    setRouters(updated);
    localStorage.setItem('mtaani_routers', JSON.stringify(updated));
    setNewRouter({ name: '', location: '', mac: '' });
  };

  const toggleRouterDetails = (id: string) => {
    setSelectedRouterId(selectedRouterId === id ? null : id);
  };

  const exportBusinessData = () => {
    const data = {
      transactions,
      vouchers,
      routers,
      config: globalConfig,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wifi-mtaani-records-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getCaptivePortalHtml = () => `
<!DOCTYPE html>
<html>
<head>
    <title>${globalConfig.merchantName} - Login</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: sans-serif; margin: 0; background: #f4f4f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: white; width: 90%; max-width: 380px; padding: 40px 30px; border-radius: 40px; box-shadow: 0 15px 40px rgba(0,0,0,0.1); text-align: center; border: 1px solid #eee; }
        .logo { width: 60px; height: 60px; background: ${globalConfig.primaryColor}; color: white; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-weight: 900; font-size: 24px; }
        h1 { font-size: 22px; color: ${globalConfig.primaryColor}; margin: 0 0 10px; font-weight: 800; }
        p { color: #666; font-size: 14px; margin-bottom: 30px; line-height: 1.6; }
        .btn { display: block; background: ${globalConfig.primaryColor}; color: white; padding: 18px; border-radius: 50px; text-decoration: none; font-weight: 800; font-size: 16px; margin-bottom: 15px; transition: transform 0.2s; box-shadow: 0 8px 20px rgba(93, 64, 55, 0.2); }
        .btn:active { transform: scale(0.97); }
        .btn-outline { background: #E0E0E0; color: ${globalConfig.primaryColor}; box-shadow: none; border: 1px solid #ccc; }
        .help { font-size: 11px; color: #999; margin-top: 30px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">W</div>
        <h1>${globalConfig.merchantName}</h1>
        <p>Karibu! Ili uweze kutumia internet, unahitaji kununua kifurushi au kuingiza code ya voucher uliyonunua.</p>
        <a href="https://wifi-mtaani.app" class="btn">NUNUA KIFURUSHI</a>
        <a href="https://wifi-mtaani.app" class="btn btn-outline">INGIZA VOUCHER CODE</a>
        <div class="help">MSAADA: ${globalConfig.supportPhone} <br>&copy; 2024 ${globalConfig.merchantName}</div>
    </div>
</body>
</html>
`.trim();

  const copyConfigToClipboard = () => {
    navigator.clipboard.writeText(getCaptivePortalHtml());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <p className="text-[10px] font-black uppercase text-mtaaniBrown/40 tracking-[0.2em] mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-black text-mtaaniBrown">Admin Online</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon="📊" label="Dashboard" />
          <SidebarButton active={activeTab === 'records'} onClick={() => setActiveTab('records')} icon="📒" label="Trace Records" />
          <SidebarButton active={activeTab === 'vouchers'} onClick={() => setActiveTab('vouchers')} icon="🎫" label="Vouchers" />
          <SidebarButton active={activeTab === 'routers'} onClick={() => setActiveTab('routers')} icon="📡" label="Routers" />
          <SidebarButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon="🛠️" label="Config" />
        </nav>
        
        <div className="p-6 border-t border-gray-50">
          <button onClick={onLogout} className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-2xl font-black text-sm hover:bg-red-100 border border-red-100 transition-colors">
            LOGOUT
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10">
        {activeTab === 'stats' && (
          <div className="space-y-8 max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-mtaaniBrown">Muhtasari</h2>
                <p className="text-gray-400 font-medium mt-1">Hali ya biashara kwa sasa.</p>
              </div>
              <button onClick={exportBusinessData} className="bg-white border border-mtaaniBrown text-mtaaniBrown px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-mtaaniBrown hover:text-white transition-all">
                Export Database
              </button>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Mapato Leo" value={`TZS ${totalRevenue.toLocaleString()}`} color="green" />
              <StatCard title="Maombi Mapya" value={transactions.filter(t => t.status === 'pending_request').length.toString()} color="orange" />
              <StatCard title="Active Vouchers" value={vouchers.filter(v => !v.isUsed).length.toString()} color="blue" />
              <StatCard title="Total Requests" value={transactions.length.toString()} color="brown" />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-mtaaniBrown uppercase">Maombi Yanayosubiri</h3>
                <span className="px-4 py-1 bg-mtaaniGrey text-mtaaniBrown rounded-full text-[10px] font-black tracking-widest uppercase">REAL-TIME</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Namba ya Mteja</th>
                      <th className="px-8 py-5">Kifurushi</th>
                      <th className="px-8 py-5">Kiasi</th>
                      <th className="px-8 py-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.filter(t => t.status === 'pending_request').map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors bg-orange-50/20">
                        <td className="px-8 py-6 font-black text-mtaaniBrown flex items-center gap-3">
                          {t.phone}
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-500">
                           {WIFI_PACKAGES.find(p => p.id === t.packageId)?.name}
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-mtaaniBrown">TZS {t.amount.toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => handleSendSMS(t)}
                            className="bg-mtaaniBrown text-mtaaniGrey px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-md hover:scale-105 transition-all flex items-center gap-2"
                          >
                            TUMA VOCHA KWA SMS
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.filter(t => t.status === 'pending_request').length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest">Hakuna maombi yanayosubiri.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-8 max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-4xl font-black text-mtaaniBrown">Trace Records</h2>
              <p className="text-gray-400 font-medium mt-1">Kumbukumbu kamili za miamala na matumizi ya vocha.</p>
            </header>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-mtaaniBrown uppercase">Miamala Yote (Transactions)</h3>
                <button onClick={exportBusinessData} className="text-[10px] font-black text-mtaaniBrown/40 uppercase hover:text-mtaaniBrown underline">Download CSV (JSON)</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Customer</th>
                      <th className="px-8 py-5">Package</th>
                      <th className="px-8 py-5">Voucher Issued</th>
                      <th className="px-8 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-8 py-6 text-gray-400">{new Date(t.timestamp).toLocaleString()}</td>
                        <td className="px-8 py-6 font-black text-mtaaniBrown">{t.phone}</td>
                        <td className="px-8 py-6 font-medium">{WIFI_PACKAGES.find(p => p.id === t.packageId)?.name}</td>
                        <td className="px-8 py-6">
                           {t.voucherCode ? <span className="font-mono bg-mtaaniGrey/40 px-2 py-1 rounded text-xs">{t.voucherCode}</span> : '--'}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <h3 className="font-black text-xl text-mtaaniBrown uppercase">Voucher Usage (Tracing)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Code</th>
                      <th className="px-8 py-5">Used At</th>
                      <th className="px-8 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {vouchers.filter(v => v.isUsed).map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-8 py-6 font-black font-mono">{v.code}</td>
                        <td className="px-8 py-6 text-gray-400">{v.usedAt ? new Date(v.usedAt).toLocaleString() : '--'}</td>
                        <td className="px-8 py-6">
                           <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">ACTIVATED</span>
                        </td>
                      </tr>
                    ))}
                    {vouchers.filter(v => v.isUsed).length === 0 && (
                      <tr><td colSpan={3} className="px-8 py-10 text-center text-gray-300 font-bold uppercase tracking-widest">Hakuna vocha iliyotumika bado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="space-y-10 max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-4xl font-black text-mtaaniBrown">Tengeneza Vocha</h2>
              <p className="text-gray-400 font-medium mt-1">Bonyeza kifurushi hapa chini kutengeneza Code mpya.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {WIFI_PACKAGES.map(pkg => (
                 <button 
                  key={pkg.id} 
                  onClick={() => handleGenerateVoucher(pkg.id)}
                  className="bg-white p-10 rounded-[2.5rem] border-2 border-transparent shadow-xl hover:border-mtaaniBrown hover:-translate-y-2 transition-all text-center group relative overflow-hidden"
                >
                  <p className="text-[10px] font-black text-mtaaniBrown opacity-30 uppercase tracking-[0.2em] mb-2">{pkg.duration}</p>
                  <h4 className="font-black text-mtaaniBrown text-2xl mb-6">{pkg.name}</h4>
                  <div className="inline-block bg-mtaaniGrey/50 text-mtaaniBrown px-6 py-2 rounded-full font-black text-sm mb-4">
                    TZS {pkg.price}
                  </div>
                  <div className="w-12 h-12 bg-mtaaniBrown text-mtaaniGrey rounded-2xl mx-auto flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                    +
                  </div>
                </button>
               ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-black text-xl text-mtaaniBrown uppercase">Available Vouchers</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">READY FOR SALE</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Voucher Code</th>
                      <th className="px-8 py-5">Kifurushi</th>
                      <th className="px-8 py-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vouchers.filter(v => !v.isUsed).map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <span className="bg-mtaaniGrey/40 px-4 py-2 rounded-lg font-mono text-xl font-black text-mtaaniBrown tracking-[0.2em]">{v.code}</span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-500">
                          {WIFI_PACKAGES.find(p => p.id === v.packageId)?.name}
                        </td>
                        <td className="px-8 py-6">
                            <button 
                              onClick={() => copyVoucherToClipboard(v.code)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md flex items-center gap-2 ${copiedVoucherCode === v.code ? 'bg-green-500 text-white' : 'bg-mtaaniBrown text-mtaaniGrey'}`}
                            >
                              {copiedVoucherCode === v.code ? 'COPIED!' : 'COPY CODE'}
                            </button>
                        </td>
                      </tr>
                    ))}
                    {vouchers.filter(v => !v.isUsed).length === 0 && (
                      <tr><td colSpan={3} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest">Hakuna vocha zilizobaki.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routers' && (
          <div className="space-y-10 max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-4xl font-black text-mtaaniBrown">Router Management</h2>
              <p className="text-gray-400 font-medium mt-1">Usimamizi na ufuatiliaji wa vituo vyako vya Wi-Fi.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
                <h3 className="font-black text-xl mb-8 text-mtaaniBrown">Ongeza Kituo Kipya</h3>
                <form onSubmit={handleAddRouter} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Jina la Kituo</label>
                    <input type="text" required placeholder="Router 01" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold" value={newRouter.name} onChange={e => setNewRouter({...newRouter, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Eneo / Location</label>
                    <input type="text" required placeholder="Soko la Kariakoo" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold" value={newRouter.location} onChange={e => setNewRouter({...newRouter, location: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">MAC Address</label>
                    <input type="text" required placeholder="00:00:00:00:00:00" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-sm" value={newRouter.mac} onChange={e => setNewRouter({...newRouter, mac: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-mtaaniBrown text-mtaaniGrey py-4 rounded-2xl font-black text-lg shadow-lg uppercase">USAJILI KITUO</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-black text-xl mb-4 text-mtaaniBrown px-2">Vituo Vilivyopo ({routers.length})</h3>
                {routers.map(r => (
                  <div key={r.id} onClick={() => toggleRouterDetails(r.id)} className={`bg-white rounded-[2rem] border transition-all cursor-pointer overflow-hidden ${selectedRouterId === r.id ? 'border-mtaaniBrown shadow-xl' : 'border-gray-100 shadow-sm hover:border-mtaaniBrown/30'}`}>
                    <div className="p-6 flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className={`w-3 h-3 rounded-full ${r.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`}></div>
                        <h4 className="font-black text-lg text-mtaaniBrown uppercase leading-none">{r.name}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
           <div className="space-y-10 max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
             <header>
               <h2 className="text-4xl font-black text-mtaaniBrown">Mfumo Settings</h2>
               <p className="text-gray-400 font-medium mt-1">Badilisha mipangilio ya msingi.</p>
             </header>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
                  <h3 className="font-black text-xl mb-8 text-mtaaniBrown">Global Info</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">WIFI SSID</label>
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none" value={globalConfig.ssid} onChange={e => setGlobalConfig({...globalConfig, ssid: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Msaada Phone</label>
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none" value={globalConfig.supportPhone} onChange={e => setGlobalConfig({...globalConfig, supportPhone: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-mtaaniBrown p-10 rounded-[2.5rem] text-mtaaniGrey">
                     <h3 className="font-black text-xl mb-4">Database Backup</h3>
                     <p className="text-sm opacity-70 mb-8 leading-relaxed">
                       Hifadhi kumbukumbu zako zote nje ya browser kwa ajili ya usalama wa biashara.
                     </p>
                     <button 
                        onClick={exportBusinessData}
                        className="w-full py-4 bg-mtaaniGrey text-mtaaniBrown rounded-2xl font-black text-sm uppercase transition-all shadow-xl hover:bg-white"
                      >
                        DOWNLOAD BUSINESS RECORDS
                      </button>
                  </div>
                </div>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

const SidebarButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-4 rounded-3xl font-black text-sm transition-all ${active ? 'bg-mtaaniBrown text-mtaaniGrey shadow-2xl scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
  >
    <span className="text-2xl">{icon}</span> {label}
  </button>
);

const StatCard = ({ title, value, color }: { title: string, value: string, color: string }) => {
  const colorMap: any = {
    brown: 'text-mtaaniBrown border-mtaaniBrown/10 bg-white',
    blue: 'text-blue-600 border-blue-100 bg-white',
    orange: 'text-orange-600 border-orange-100 bg-white',
    green: 'text-green-600 border-green-100 bg-white'
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-transform hover:-translate-y-1 ${colorMap[color]}`}>
      <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em] mb-2">{title}</p>
      <h3 className="text-2xl font-black tracking-tighter">{value}</h3>
    </div>
  );
};

export default AdminDashboard;
