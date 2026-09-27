import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js';

// Register all Chart.js elements and controllers globally
ChartJS.register(...registerables);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
