
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

const LOADING_MESSAGES = [
  "TUNATAYARISHA MTANDAO...",
  "KARIBU WIFI MTAANI...",
  "INTERNET YA KASI INAKUJA...",
  "UNANGANISHWA NA ULIMWENGU..."
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
        <div class="w-16 h-16 bg-[#F57C00] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black">W</div>
        <h1 class="text-3xl font-black mb-2 text-[#4E342E]">WIFI MTAANI</h1>
        <p class="text-xs opacity-80 mb-8 uppercase font-bold tracking-widest text-[#4E342E]">Unganisha Internet Sasa</p>
        <input type="text" id="code" placeholder="INGIZA CODE YAKO..." class="w-full p-5 bg-gray-50 rounded-2xl text-center text-2xl font-black mb-6 outline-none border-2 border-transparent focus:border-[#F57C00] transition-all" />
        <button onclick="alert('Inaung