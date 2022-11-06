import React from 'react'
import { createRoot } from 'react-dom/client';

import '@/styles/style.css'
import './styles/box.scss'
import App from './components/app/App';




// import { createRoot } from 'react-dom/client';
const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App  />);