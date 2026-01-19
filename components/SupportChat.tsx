
import React, { useState, useEffect, useRef } from 'react';
import { callAI } from '../services/geminiService';

export const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'model', content: 'Habari! Mimi ni msaidizi wako. Una swali kuhusu WIFI MTAANI?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => scroll.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userText = input; setInput('');
    setMsgs(p => [...p, { role: 'user', content: userText }]);
    setLoading(true);
    const res = await callAI(msgs, userText);
    setMsgs(p => [...p, { role: 'model', content: res }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[3000]">
      {open ? (
        <div className="bg-white w-[340px] h-[500px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border">
          <div className="bg-[#4E342E] p-6 text-white flex justify-between items-center font-black text-[10px] uppercase">
            <span>Msaidizi AI</span>
            <button onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 no-scrollbar text-[11px] font-bold">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] shadow-sm ${m.role === 'user' ? 'bg-[#4E342E] text-white' : 'bg-white text-[#4E342E] border'}`}>{m.content}</div>
              </div>
            ))}
            <div ref={scroll} />
          </div>
          <form onSubmit={send} className="p-4 bg-white border-t flex gap-2">
            <input className="flex-1 p-3 bg-gray-100 rounded-xl text-[11px] outline-none" placeholder="Uliza hapa..." value={input} onChange={e=>setInput(e.target.value)} />
            <button className="bg-[#4E342E] text-white w-10 h-10 rounded-xl font-black">➔</button>
          </form>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)} className="w-20 h-20 bg-[#4E342E] text-white rounded-[2rem] shadow-2xl text-4xl border-8 border-white">💬</button>
      )}
    </div>
  );
};
