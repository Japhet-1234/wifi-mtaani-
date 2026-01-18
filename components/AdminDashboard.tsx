
import React, { useState, useEffect } from 'react';
import { Transaction, RouterDevice, Voucher, WiFiPackage } from '../types';
import { WIFI_PACKAGES } from '../constants';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'records' | 'vouchers' | 'routers' | 'config'>('stats');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [routers, setRouters] = useState<RouterDevice[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedRouterId, setSelectedRouterId] = useState<string | null>(null);
  const [newRouter, setNewRouter] = useState({ name: '', location: '', mac: '' });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState<string | null>(null);
  
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

  const handleSendSMS = (tx: Transaction) => {
    const pkgVouchers = vouchers.filter(v => v.packageId === tx.packageId && !v.isUsed);
    let codeToSend = '';
    
    if (pkgVouchers.length > 0) {
      codeToSend = pkgVouchers[0].code;
    } else {
      codeToSend = handleGenerateVoucher(tx.packageId);
    }

    const message = `WIFI MTAANI: Vocha yako ya internet ni ${codeToSend}. Ingiza kwenye website yetu kuanza kutumia huduma. Ahsante!`;
    const smsUrl = `sms:${tx.phone}?body=${encodeURIComponent(message)}`;
    
    const updatedTx = transactions.map(t => t.id === tx.id ? { ...t, status: 'completed' as const, voucherCode: codeToSend } : t);
    setTransactions(updatedTx);
    localStorage.setItem('mtaani_transactions', JSON.stringify(updatedTx));
    
    window.location.href = smsUrl;
  };

  const exportData = () => {
    const data = { transactions, vouchers, routers, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wifi-mtaani-records.json`;
    a.click();
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <p className="text-[10px] font-black uppercase text-mtaaniBrown/40 tracking-[0.2em] mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-black text-mtaaniBrown text-sm">Mfumo upo Online</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon="📊" label="Dashibodi" />
          <SidebarButton active={activeTab === 'records'} onClick={() => setActiveTab('records')} icon="📒" label="Kumbukumbu" />
          <SidebarButton active={activeTab === 'vouchers'} onClick={() => setActiveTab('vouchers')} icon="🎫" label="Vocha" />
          <SidebarButton active={activeTab === 'routers'} onClick={() => setActiveTab('routers')} icon="📡" label="Routers" />
          <SidebarButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon="🛠️" label="Mipangilio" />
        </nav>
        
        <div className="p-6 border-t border-gray-50">
          <button onClick={onLogout} className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-2xl font-black text-xs hover:bg-red-100 border border-red-100 transition-colors">
            LOGOUT
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10">
        {activeTab === 'stats' && (
          <div className="space-y-8 max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-mtaaniBrown">Dashibodi</h2>
                <p className="text-gray-400 font-medium mt-1">Muhtasari wa miamala na mapato.</p>
              </div>
              <button onClick={exportData} className="bg-white border border-mtaaniBrown/20 text-mtaaniBrown px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-mtaaniBrown hover:text-white transition-all shadow-sm">
                Download Records
              </button>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Mapato Leo" value={`TZS ${totalRevenue.toLocaleString()}`} color="green" />
              <StatCard title="Pending SMS" value={transactions.filter(t => t.status === 'pending_request').length.toString()} color="orange" />
              <StatCard title="Vocha Salio" value={vouchers.filter(v => !v.isUsed).length.toString()} color="blue" />
              <StatCard title="Total Orders" value={transactions.length.toString()} color="brown" />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <h3 className="font-black text-xl text-mtaaniBrown uppercase">Maombi Mapya</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Phone Number</th>
                      <th className="px-8 py-5">Kifurushi</th>
                      <th className="px-8 py-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.filter(t => t.status === 'pending_request').map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors bg-orange-50/10">
                        <td className="px-8 py-6 font-black text-mtaaniBrown">{t.phone}</td>
                        <td className="px-8 py-6 font-medium text-gray-500">
                           {WIFI_PACKAGES.find(p => p.id === t.packageId)?.name}
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => handleSendSMS(t)}
                            className="bg-mtaaniBrown text-mtaaniGrey px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-md hover:scale-105 transition-all"
                          >
                            TUMA VOCHA KWA SMS
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.filter(t => t.status === 'pending_request').length === 0 && (
                      <tr><td colSpan={3} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest">Hakuna maombi yanayosubiri sasa hivi.</td></tr>
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
              <h2 className="text-4xl font-black text-mtaaniBrown uppercase tracking-tight">Trace Records</h2>
              <p className="text-gray-400 font-medium mt-1">Kumbukumbu kamili kwa ajili ya usimamizi wa biashara.</p>
            </header>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-lg text-mtaaniBrown uppercase">Miamala Yote</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Time</th>
                      <th className="px-8 py-5">Mteja</th>
                      <th className="px-8 py-5">Paketi</th>
                      <th className="px-8 py-5">Amount</th>
                      <th className="px-8 py-5">Voucher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-8 py-6 text-gray-400">{new Date(t.timestamp).toLocaleTimeString()}</td>
                        <td className="px-8 py-6 font-black">{t.phone}</td>
                        <td className="px-8 py-6 font-medium text-gray-500">{WIFI_PACKAGES.find(p => p.id === t.packageId)?.name}</td>
                        <td className="px-8 py-6 font-black text-mtaaniBrown">TZS {t.amount}</td>
                        <td className="px-8 py-6">
                           {t.voucherCode ? <span className="bg-mtaaniGrey px-3 py-1 rounded-lg font-mono font-black text-xs">{t.voucherCode}</span> : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs follow the same visual pattern... */}
        {activeTab === 'vouchers' && <div className="p-10 text-center font-bold text-gray-400">Voucher Management Section</div>}
        {activeTab === 'routers' && <div className="p-10 text-center font-bold text-gray-400">Router Management Section</div>}
        {activeTab === 'config' && <div className="p-10 text-center font-bold text-gray-400">System Configuration Section</div>}
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
