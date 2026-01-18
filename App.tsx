
import React, { useState, useEffect } from 'react';
import { WIFI_PACKAGES } from './constants';
import { WiFiPackage, Voucher } from './types';
import SupportChat from './components/SupportChat';
import PaymentModal from './components/PaymentModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WiFiPackage | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleSelectPackage = (pkg: WiFiPackage) => {
    setSelectedPackage(pkg);
    setIsPaymentOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveTab('customer');
  };

  const handleActivateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const vouchers: Voucher[] = JSON.parse(localStorage.getItem('mtaani_vouchers') || '[]');
    const found = vouchers.find(v => v.code === voucherCode && !v.isUsed);

    if (found) {
      // Update "Database" with tracing info
      const updated = vouchers.map(v => 
        v.code === voucherCode 
          ? { ...v, isUsed: true, usedAt: new Date().toISOString() } 
          : v
      );
      localStorage.setItem('mtaani_vouchers', JSON.stringify(updated));
      
      setVoucherStatus({ type: 'success', msg: 'Hongera! Code imekubaliwa.' });
      setVoucherCode('');
      
      // Transition to connected state
      setTimeout(() => {
        setIsConnected(true);
      }, 800);
    } else {
      setVoucherStatus({ type: 'error', msg: 'Code hii haipo au imeshatumika.' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-white flex flex-col">
      {/* Unified Navigation Bar */}
      <nav className="bg-mtaaniBrown text-mtaaniGrey sticky top-0 z-[100] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-mtaaniGrey text-mtaaniBrown rounded-lg flex items-center justify-center font-black">W</div>
              <span className="font-black text-xl tracking-tighter uppercase">WIFI MTAANI</span>
            </div>
            
            <div className="flex bg-black/20 p-1 rounded-xl">
              <button 
                onClick={() => { setActiveTab('customer'); setIsConnected(false); }}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'customer' ? 'bg-mtaaniGrey text-mtaaniBrown shadow-lg' : 'hover:text-white'}`}
              >
                HUDUMA
              </button>
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'admin' ? 'bg-mtaaniGrey text-mtaaniBrown shadow-lg' : 'hover:text-white'}`}
              >
                ADMIN
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1">
        {activeTab === 'customer' ? (
          <div className="animate-in fade-in duration-500">
            {isConnected ? (
              <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 className="text-5xl font-black text-mtaaniBrown mb-4 tracking-tighter">UMEUNGANISHWA!</h2>
                <p className="text-xl font-bold text-gray-500 max-w-md">Hongera! Sasa unaweza kutumia internet kwa uhuru. Furahia huduma ya WIFI MTAANI.</p>
                <button 
                  onClick={() => setIsConnected(false)}
                  className="mt-12 px-10 py-4 bg-mtaaniBrown text-mtaaniGrey rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                >
                  Rudi Nyuma
                </button>
              </div>
            ) : (
              <>
                {/* Hero Section */}
                <section className="bg-mtaaniBrown text-mtaaniGrey py-20 px-6 text-center relative overflow-hidden">
                  <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-6xl font-extrabold mb-6 tracking-tight leading-none">Internet Popote</h1>
                    
                    {/* Voucher Input Box */}
                    <div className="max-w-md mx-auto bg-white/10 p-6 rounded-[2rem] border border-white/20 mb-10">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-4">Ingiza Code hapa</h3>
                      <form onSubmit={handleActivateVoucher} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Code..."
                          className="flex-1 px-6 py-3 rounded-full bg-white text-mtaaniBrown font-bold outline-none text-center tracking-[0.2em] uppercase"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                        />
                        <button type="submit" className="bg-mtaaniGrey text-mtaaniBrown px-6 py-3 rounded-full font-black hover:bg-white transition-all">
                          WEKA
                        </button>
                      </form>
                      {voucherStatus && (
                        <div className={`mt-4 text-xs font-bold p-3 rounded-xl ${voucherStatus.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {voucherStatus.msg}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-mtaaniGrey text-mtaaniBrown px-10 py-4 rounded-full font-black text-lg hover:bg-white transition-all transform hover:scale-105 shadow-2xl"
                    >
                      Jinsi ya Kununua
                    </button>
                  </div>
                </section>

                {/* Instruction Steps Section */}
                <section id="steps" className="py-16 px-6 bg-white">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                      <h2 className="text-sm font-black text-mtaaniBrown/40 uppercase tracking-[0.3em] mb-2">Hatua Rahisi</h2>
                      <h3 className="text-3xl font-black text-mtaaniBrown">Jinsi ya kuanza kutumia Wi-Fi</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-mtaaniGrey text-mtaaniBrown rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">1</div>
                        <h4 className="font-black text-xl mb-2">Chagua</h4>
                        <p className="text-gray-400 text-sm font-bold leading-relaxed">Chagua kifurushi unachotaka hapa chini.</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-mtaaniGrey text-mtaaniBrown rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">2</div>
                        <h4 className="font-black text-xl mb-2">Lipa & Tuma</h4>
                        <p className="text-gray-400 text-sm font-bold leading-relaxed">Lipa kiasi sahihi na utume ombi lako kwa SMS.</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-mtaaniGrey text-mtaaniBrown rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">3</div>
                        <h4 className="font-black text-xl mb-2">Unganisha</h4>
                        <p className="text-gray-400 text-sm font-bold leading-relaxed">Pokea vocha code, iingize juu na ufurahie internet!</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Packages Section */}
                <section id="packages" className="bg-mtaaniGrey/50 text-mtaaniBrown py-20 px-6">
                  <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">Vifurushi vya Wi-Fi</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {WIFI_PACKAGES.map((pkg) => (
                        <div 
                          key={pkg.id} 
                          className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all group flex flex-col border border-gray-100"
                        >
                          <div className="flex-1">
                            <div className="text-mtaaniBrown font-black text-xs uppercase tracking-widest mb-2 opacity-50">{pkg.duration}</div>
                            <h3 className="text-2xl font-black mb-6">{pkg.name}</h3>
                            <div className="text-5xl font-black mb-8 text-mtaaniBrown flex items-baseline gap-1">
                              {pkg.price.toLocaleString()} <span className="text-sm font-bold opacity-50 uppercase">TZS</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleSelectPackage(pkg)}
                            className="w-full bg-mtaaniBrown text-mtaaniGrey py-4 rounded-2xl font-black text-lg hover:brightness-125 transition-all shadow-lg active:scale-95"
                          >
                            NUNUA SASA
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <footer className="bg-mtaaniBrown text-mtaaniGrey/60 py-12 px-6 text-center">
                  <p className="font-bold text-mtaaniGrey">© 2024 WIFI MTAANI</p>
                </footer>
              </>
            )}
          </div>
        ) : (
          <div className="min-h-[calc(100vh-64px)] flex bg-mtaaniGrey animate-in fade-in duration-500">
            {!isAdminAuthenticated ? (
              <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} onBack={() => setActiveTab('customer')} />
            ) : (
              <AdminDashboard onLogout={handleAdminLogout} />
            )}
          </div>
        )}
      </main>

      {/* Overlays */}
      {isPaymentOpen && selectedPackage && (
        <PaymentModal 
          pkg={selectedPackage} 
          onClose={() => setIsPaymentOpen(false)} 
        />
      )}
      
      {activeTab === 'customer' && <SupportChat />}
    </div>
  );
};

export default App;
