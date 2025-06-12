import React from 'react';
import { createRoot } from 'react-dom/client'; // <-- Değişiklik burada
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // <-- Değişiklik burada

root.render( // <-- Değişiklik burada
  <React.StrictMode>
    <App />
  </React.StrictMode>
);