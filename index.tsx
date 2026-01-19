
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

try {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
} catch (e) {
  console.error("Critical Render Error:", e);
  document.body.innerHTML = "<div style='padding: 20px; font-family: sans-serif;'><h1>Hitilafu ya Mfumo</h1><p>Samahani, website inashindwa kupakia. Tafadhali refresh ukurasa.</p></div>";
}
