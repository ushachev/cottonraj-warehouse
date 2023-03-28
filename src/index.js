import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';
import { createRoot } from 'react-dom/client';

import './assets/styles/application.scss';

import init from './app/init.jsx';

const app = init();
const container = document.getElementById('app');
const root = createRoot(container);

root.render(app);
