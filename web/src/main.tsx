import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css'; // 🔥 ESSA É A LINHA QUE LIGA O TAILWIND!

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);