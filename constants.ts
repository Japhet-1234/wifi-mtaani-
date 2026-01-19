
import { Package } from './types';

export const INITIAL_PKGS: Package[] = [
  { id: '1', name: 'Masaa 6', duration: '6 Hours', price: 500, desc: 'Internet ya kasi kwa mzunguko mmoja.' },
  { id: '2', name: 'Siku Nzima', duration: '24 Hours', price: 1000, desc: 'Bila kikomo kwa siku nzima.' },
  { id: '3', name: 'Wiki Nzima', duration: '7 Days', price: 6000, desc: 'Baki hewani wiki nzima.' }
];

export const ROUTER_LOGIN_TEMPLATE = `<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <title>WIFI MTAANI LOGIN</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center h-screen p-6">
    <div class="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center border">
        <h1 class="text-3xl font-black mb-6 text-[#4E342E]">WIFI MTAANI</h1>
        <p class="text-xs opacity-50 mb-8 uppercase font-bold tracking-widest">Weka Voucher Code Yako</p>
        <input type="text" id="code" placeholder="CODE HAPA..." class="w-full p-5 bg-gray-50 rounded-2xl text-center text-2xl font-black mb-6 outline-none border focus:ring-2 ring-[#F57C00]" />
        <button onclick="alert('Inaunganisha...')" class="w-full bg-[#4E342E] text-white py-5 rounded-2xl font-black tracking-widest shadow-xl">UNGANISHA</button>
        <div class="mt-10 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Malipo: 0779231924</div>
    </div>
</body>
</html>`;
