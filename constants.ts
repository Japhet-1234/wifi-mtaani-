
import { Package } from './types';

export const INITIAL_PKGS: Package[] = [
  { id: '1', name: 'Kifurushi cha Soko', duration: 'Masaa 4', price: 300, desc: 'Maalum kwa wafanyabiashara wadogo na wateja wa sokoni.' },
  { id: '2', name: 'Kifurushi cha Stand', duration: 'Siku 1', price: 1000, desc: 'Kwa ajili ya wasafiri na madereva wanaoshinda stand.' },
  { id: '3', name: 'Kifurushi cha Mtaa', duration: 'Wiki 1', price: 5000, desc: 'Internet ya kasi bila kikomo kwa vijiwe vyote vya mtaani.' }
];

export const ROUTER_LOGIN_TEMPLATE = `<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <title>WIFI MTAANI LOGIN</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#4E342E] flex items-center justify-center h-screen p-6 font-sans">
    <div class="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
        <div class="w-16 h-16 bg-[#F57C00] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black">W</div>
        <h1 class="text-3xl font-black mb-2 text-[#4E342E]">WIFI MTAANI</h1>
        <p class="text-xs opacity-50 mb-8 uppercase font-bold tracking-widest">Unganisha Internet Sasa</p>
        <input type="text" id="code" placeholder="INGIZA CODE YAKO..." class="w-full p-5 bg-gray-50 rounded-2xl text-center text-2xl font-black mb-6 outline-none border-2 border-transparent focus:border-[#F57C00] transition-all" />
        <button onclick="alert('Inaunganisha...')" class="w-full bg-[#4E342E] text-white py-5 rounded-2xl font-black tracking-widest shadow-xl hover:bg-black transition-all">UNGANISHA</button>
        <div class="mt-8 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Pata Vocha kwa: 0779231924</div>
    </div>
</body>
</html>`;
